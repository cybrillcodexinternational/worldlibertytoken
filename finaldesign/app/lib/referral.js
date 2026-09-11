import crypto from "crypto";
import getPool from "@/lib/db";
import { ensureAuthSchema } from "@/lib/auth";

export const REF_COOKIE = "wlt_ref";

export const REFERRAL_LEVELS = [
  { level: 1, rate: 0.1, label: "Level 1 Mining Referral Reward" },
  { level: 2, rate: 0.05, label: "Level 2 Mining Referral Reward" },
  { level: 3, rate: 0.03, label: "Level 3 Mining Referral Reward" },
];

function roundToken(value) {
  return Number(Number(value || 0).toFixed(7));
}

function makeCode() {
  return `WLT${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

function normalizeCode(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 24);
}

async function columnExists(db, table, column) {
  const [rows] = await db.query(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  return rows.length > 0;
}

async function assignReferralCode(db, userId) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = makeCode();
    try {
      await db.query(
        `UPDATE users
         SET referral_code = ?
         WHERE id = ? AND (referral_code IS NULL OR referral_code = '')`,
        [code, userId]
      );
      const [rows] = await db.query(
        "SELECT referral_code FROM users WHERE id = ? LIMIT 1",
        [userId]
      );
      if (rows[0]?.referral_code) {
        return rows[0].referral_code;
      }
    } catch {
      // unique collision — retry
    }
  }

  const fallback = `WLT${String(userId).padStart(8, "0")}`.slice(0, 24);
  await db.query("UPDATE users SET referral_code = ? WHERE id = ?", [fallback, userId]);
  return fallback;
}

export async function ensureReferralSchema() {
  await ensureAuthSchema();
  const db = getPool();

  if (!(await columnExists(db, "users", "referral_code"))) {
    await db.query("ALTER TABLE users ADD COLUMN referral_code VARCHAR(24) NULL UNIQUE");
  }

  if (!(await columnExists(db, "users", "referred_by"))) {
    await db.query("ALTER TABLE users ADD COLUMN referred_by BIGINT UNSIGNED NULL");
    await db.query("ALTER TABLE users ADD INDEX idx_users_referred_by (referred_by)");
  }

  await db.query(`
    CREATE TABLE IF NOT EXISTS referral_rewards (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      sponsor_id BIGINT UNSIGNED NOT NULL,
      miner_id BIGINT UNSIGNED NOT NULL,
      mining_session_id BIGINT UNSIGNED NOT NULL,
      level TINYINT UNSIGNED NOT NULL,
      mined_amount DECIMAL(18,7) NOT NULL,
      rate DECIMAL(6,4) NOT NULL,
      reward DECIMAL(18,7) NOT NULL,
      label VARCHAR(80) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_session_level (mining_session_id, level),
      INDEX idx_ref_sponsor_created (sponsor_id, created_at),
      INDEX idx_ref_miner (miner_id),
      CONSTRAINT fk_ref_sponsor FOREIGN KEY (sponsor_id)
        REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_ref_miner FOREIGN KEY (miner_id)
        REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  const [missing] = await db.query(
    "SELECT id FROM users WHERE referral_code IS NULL OR referral_code = ''"
  );
  for (const row of missing) {
    await assignReferralCode(db, row.id);
  }
}

export async function ensureUserReferralCode(userId) {
  await ensureReferralSchema();
  const db = getPool();
  const [rows] = await db.query(
    "SELECT referral_code FROM users WHERE id = ? LIMIT 1",
    [userId]
  );
  if (rows[0]?.referral_code) {
    return rows[0].referral_code;
  }
  return assignReferralCode(db, userId);
}

export async function getUserByReferralCode(code) {
  const normalized = normalizeCode(code);
  if (!normalized) {
    return null;
  }

  await ensureReferralSchema();
  const db = getPool();
  const [rows] = await db.query(
    "SELECT id, full_name, email, referral_code FROM users WHERE referral_code = ? LIMIT 1",
    [normalized]
  );
  return rows[0] || null;
}

export async function bindReferrer(userId, referralCode) {
  const sponsor = await getUserByReferralCode(referralCode);
  if (!sponsor || Number(sponsor.id) === Number(userId)) {
    return null;
  }

  const db = getPool();
  const [result] = await db.query(
    "UPDATE users SET referred_by = ? WHERE id = ? AND referred_by IS NULL",
    [sponsor.id, userId]
  );
  return result.affectedRows ? sponsor.id : null;
}

export async function creditMiningReferralRewards(connection, { minerId, sessionId, minedAmount }) {
  const db = connection;
  const mined = roundToken(minedAmount);
  if (!db || !minerId || !sessionId || mined <= 0) {
    return;
  }

  const seen = new Set([Number(minerId)]);
  let currentId = minerId;

  for (const { level, rate, label } of REFERRAL_LEVELS) {
    const [rows] = await db.query(
      "SELECT referred_by FROM users WHERE id = ? LIMIT 1",
      [currentId]
    );
    const sponsorId = rows[0]?.referred_by ? Number(rows[0].referred_by) : null;
    if (!sponsorId || seen.has(sponsorId)) {
      break;
    }
    seen.add(sponsorId);

    const reward = roundToken(mined * rate);
    const [insert] = await db.query(
      `INSERT IGNORE INTO referral_rewards
        (sponsor_id, miner_id, mining_session_id, level, mined_amount, rate, reward, label)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [sponsorId, minerId, sessionId, level, mined, rate, reward, label]
    );

    if (insert.affectedRows) {
      await db.query("UPDATE users SET wlt_balance = wlt_balance + ? WHERE id = ?", [
        reward,
        sponsorId,
      ]);
    }

    currentId = sponsorId;
  }
}

function mapMember(row, level) {
  return {
    id: Number(row.id),
    name: row.full_name,
    joinedAt: row.created_at,
    level,
  };
}

export async function getReferralStatus(userId) {
  await ensureReferralSchema();
  const db = getPool();
  const code = await ensureUserReferralCode(userId);

  const [l1Rows] = await db.query(
    `SELECT id, full_name, created_at
     FROM users
     WHERE referred_by = ?
     ORDER BY id DESC`,
    [userId]
  );
  const l1 = l1Rows.map((row) => mapMember(row, 1));
  const l1Ids = l1.map((row) => row.id);

  let l2Rows = [];
  if (l1Ids.length) {
    const [rows] = await db.query(
      `SELECT id, full_name, created_at
       FROM users
       WHERE referred_by IN (?)
       ORDER BY id DESC`,
      [l1Ids]
    );
    l2Rows = rows;
  }
  const l2 = l2Rows.map((row) => mapMember(row, 2));
  const l2Ids = l2.map((row) => row.id);

  let l3Rows = [];
  if (l2Ids.length) {
    const [rows] = await db.query(
      `SELECT id, full_name, created_at
       FROM users
       WHERE referred_by IN (?)
       ORDER BY id DESC`,
      [l2Ids]
    );
    l3Rows = rows;
  }
  const l3 = l3Rows.map((row) => mapMember(row, 3));

  const [[earnings]] = await db.query(
    `SELECT
       COALESCE(SUM(reward), 0) AS total,
       COALESCE(SUM(CASE WHEN DATE(created_at) = UTC_DATE() THEN reward ELSE 0 END), 0) AS today,
       COUNT(*) AS payouts
     FROM referral_rewards
     WHERE sponsor_id = ?`,
    [userId]
  );

  const [byLevelRows] = await db.query(
    `SELECT level, COALESCE(SUM(reward), 0) AS total, COUNT(*) AS payouts
     FROM referral_rewards
     WHERE sponsor_id = ?
     GROUP BY level`,
    [userId]
  );

  const byLevel = REFERRAL_LEVELS.map((tier) => {
    const match = byLevelRows.find((row) => Number(row.level) === tier.level);
    return {
      ...tier,
      total: roundToken(match?.total || 0),
      payouts: Number(match?.payouts || 0),
    };
  });

  const [txRows] = await db.query(
    `SELECT r.id, r.level, r.mined_amount, r.rate, r.reward, r.label, r.created_at,
            r.mining_session_id, u.full_name AS miner_name
     FROM referral_rewards r
     INNER JOIN users u ON u.id = r.miner_id
     WHERE r.sponsor_id = ?
     ORDER BY r.id DESC
     LIMIT 40`,
    [userId]
  );

  return {
    code,
    token: "WLT",
    poolNote:
      "Referral rewards are paid from the Referral Reward Pool on credited mined WLT only. Miners keep 100% of their mine.",
    levels: REFERRAL_LEVELS,
    counts: {
      level1: l1.length,
      level2: l2.length,
      level3: l3.length,
      total: l1.length + l2.length + l3.length,
    },
    earnings: {
      total: roundToken(earnings.total),
      today: roundToken(earnings.today),
      payouts: Number(earnings.payouts || 0),
      byLevel,
    },
    network: { level1: l1, level2: l2, level3: l3 },
    transactions: txRows.map((row) => ({
      id: Number(row.id),
      level: Number(row.level),
      minedAmount: roundToken(row.mined_amount),
      rate: Number(row.rate),
      reward: roundToken(row.reward),
      label: row.label,
      minerName: row.miner_name,
      sessionId: Number(row.mining_session_id),
      createdAt: row.created_at,
    })),
  };
}

export async function getAdminReferralOverview() {
  await ensureReferralSchema();
  const db = getPool();

  const [[pool]] = await db.query(
    `SELECT
       COALESCE(SUM(reward), 0) AS paid,
       COUNT(*) AS payouts,
       COUNT(DISTINCT sponsor_id) AS sponsors,
       COUNT(DISTINCT miner_id) AS miners
     FROM referral_rewards`
  );

  const [[network]] = await db.query(
    `SELECT COUNT(*) AS referred
     FROM users
     WHERE referred_by IS NOT NULL`
  );

  const [byLevelRows] = await db.query(
    `SELECT level, COALESCE(SUM(reward), 0) AS total, COUNT(*) AS payouts
     FROM referral_rewards
     GROUP BY level`
  );

  const [txRows] = await db.query(
    `SELECT r.id, r.level, r.mined_amount, r.rate, r.reward, r.label, r.created_at,
            r.mining_session_id, miner.full_name AS miner_name, sponsor.full_name AS sponsor_name
     FROM referral_rewards r
     INNER JOIN users miner ON miner.id = r.miner_id
     INNER JOIN users sponsor ON sponsor.id = r.sponsor_id
     ORDER BY r.id DESC
     LIMIT 50`
  );

  return {
    poolPaid: roundToken(pool.paid),
    payouts: Number(pool.payouts || 0),
    sponsors: Number(pool.sponsors || 0),
    miners: Number(pool.miners || 0),
    referredUsers: Number(network.referred || 0),
    byLevel: REFERRAL_LEVELS.map((tier) => {
      const match = byLevelRows.find((row) => Number(row.level) === tier.level);
      return {
        ...tier,
        total: roundToken(match?.total || 0),
        payouts: Number(match?.payouts || 0),
      };
    }),
    recent: txRows.map((row) => ({
      id: Number(row.id),
      level: Number(row.level),
      minedAmount: roundToken(row.mined_amount),
      rate: Number(row.rate),
      reward: roundToken(row.reward),
      label: row.label,
      minerName: row.miner_name,
      sponsorName: row.sponsor_name,
      sessionId: Number(row.mining_session_id),
      createdAt: row.created_at,
    })),
  };
}
