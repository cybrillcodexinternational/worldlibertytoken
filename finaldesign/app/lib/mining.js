import getPool from "@/lib/db";
import { ensureAuthSchema } from "@/lib/auth";
import { TRADE_OPEN } from "@/lib/token-lock";
import { creditMiningReferralRewards, ensureReferralSchema } from "@/lib/referral";

export const MINING_REWARD = 2.8756990;
export const MINING_DURATION_HOURS = 24;
export const MINING_DURATION_MS = MINING_DURATION_HOURS * 60 * 60 * 1000;
export const TOKEN_SYMBOL = "WLT";
export { TRADE_OPEN };

export async function ensureMiningSchema() {
  await ensureAuthSchema();
  await ensureReferralSchema();
  const db = getPool();

  const [balanceCol] = await db.query(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'wlt_balance'`
  );

  if (!balanceCol.length) {
    await db.query(
      "ALTER TABLE users ADD COLUMN wlt_balance DECIMAL(18,7) NOT NULL DEFAULT 0"
    );
  }

  await db.query(`
    CREATE TABLE IF NOT EXISTS mining_sessions (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT UNSIGNED NOT NULL,
      started_at DATETIME NOT NULL,
      ends_at DATETIME NOT NULL,
      reward DECIMAL(18,7) NOT NULL DEFAULT 2.8756990,
      mined_amount DECIMAL(18,7) NOT NULL DEFAULT 0,
      credited TINYINT(1) NOT NULL DEFAULT 0,
      status ENUM('active', 'completed') NOT NULL DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_mining_user_status (user_id, status),
      INDEX idx_mining_user_started (user_id, started_at),
      CONSTRAINT fk_mining_user FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

function toMs(value) {
  return new Date(value).getTime();
}

function roundToken(value) {
  return Number(Number(value).toFixed(7));
}

export function buildSessionView(row, now = Date.now()) {
  if (!row) {
    return null;
  }

  const startedAt = toMs(row.started_at);
  const endsAt = toMs(row.ends_at);
  const reward = roundToken(row.reward);
  const duration = Math.max(1, endsAt - startedAt);
  const elapsed = Math.max(0, now - startedAt);
  const remainingMs = Math.max(0, endsAt - now);
  const progress = Math.min(1, elapsed / duration);
  const active = row.status === "active" && remainingMs > 0;
  const mined = active ? roundToken(reward * progress) : reward;

  return {
    id: row.id,
    status: active ? "active" : "completed",
    reward,
    mined,
    progress,
    startedAt: new Date(startedAt).toISOString(),
    endsAt: new Date(endsAt).toISOString(),
    remainingMs,
    elapsedMs: Math.min(elapsed, duration),
    durationMs: duration,
  };
}

async function getBalance(db, userId) {
  const [rows] = await db.query("SELECT wlt_balance FROM users WHERE id = ? LIMIT 1", [userId]);
  return roundToken(rows[0]?.wlt_balance || 0);
}

export async function settleExpiredSessions(userId, connection) {
  const db = connection || getPool();
  const [rows] = await db.query(
    `SELECT * FROM mining_sessions
     WHERE user_id = ? AND status = 'active'
     ORDER BY id DESC`,
    [userId]
  );

  const now = Date.now();
  let last = null;

  for (const row of rows) {
    if (now < toMs(row.ends_at)) {
      last = row;
      continue;
    }

    if (!row.credited) {
      const [updated] = await db.query(
        `UPDATE mining_sessions
         SET status = 'completed', mined_amount = reward, credited = 1
         WHERE id = ? AND credited = 0`,
        [row.id]
      );
      if (updated.affectedRows) {
        await db.query("UPDATE users SET wlt_balance = wlt_balance + ? WHERE id = ?", [
          row.reward,
          userId,
        ]);
        await creditMiningReferralRewards(db, {
          minerId: userId,
          sessionId: row.id,
          minedAmount: row.reward,
        });
      }
    } else {
      await db.query(
        `UPDATE mining_sessions
         SET status = 'completed', mined_amount = reward
         WHERE id = ?`,
        [row.id]
      );
    }

    last = {
      ...row,
      status: "completed",
      credited: 1,
      mined_amount: row.reward,
    };
  }

  return last;
}

export async function getMiningStatus(userId) {
  await ensureMiningSchema();
  const db = getPool();
  const latest = await settleExpiredSessions(userId);
  const now = Date.now();
  const current = buildSessionView(latest, now);

  const [[lifetime]] = await db.query(
    `SELECT
       COALESCE(SUM(CASE WHEN status = 'completed' THEN mined_amount ELSE 0 END), 0) AS total_mined,
       COUNT(*) AS cycles
     FROM mining_sessions
     WHERE user_id = ?`,
    [userId]
  );

  const [historyRows] = await db.query(
    `SELECT id, started_at, ends_at, reward, mined_amount, status
     FROM mining_sessions
     WHERE user_id = ?
     ORDER BY id DESC
     LIMIT 8`,
    [userId]
  );

  const liveMined = current?.status === "active" ? current.mined : 0;
  const completedTotal = roundToken(lifetime.total_mined);

  return {
    reward: MINING_REWARD,
    durationMs: MINING_DURATION_MS,
    token: TOKEN_SYMBOL,
    balance: roundToken((await getBalance(db, userId)) + liveMined),
    lifetimeMined: roundToken(completedTotal + liveMined),
    cycles: Number(lifetime.cycles || 0),
    canStart: !current || current.status !== "active",
    session: current,
    history: historyRows.map((row) => buildSessionView(row, now)),
    serverNow: new Date(now).toISOString(),
  };
}

export async function startMiningSession(userId) {
  await ensureMiningSchema();
  const db = getPool();
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();
    await settleExpiredSessions(userId, conn);

    const [activeRows] = await conn.query(
      `SELECT id, ends_at FROM mining_sessions
       WHERE user_id = ? AND status = 'active'
       ORDER BY id DESC
       LIMIT 1
       FOR UPDATE`,
      [userId]
    );

    const active = activeRows[0];
    if (active && Date.now() < toMs(active.ends_at)) {
      await conn.rollback();
      return { ok: false, code: 409, message: "Mining is already running for this 24-hour cycle." };
    }

    const startedAt = new Date();
    const endsAt = new Date(startedAt.getTime() + MINING_DURATION_MS);

    await conn.query(
      `INSERT INTO mining_sessions (user_id, started_at, ends_at, reward, mined_amount, status)
       VALUES (?, ?, ?, ?, 0, 'active')`,
      [userId, startedAt, endsAt, MINING_REWARD]
    );

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }

  return { ok: true, ...(await getMiningStatus(userId)) };
}
