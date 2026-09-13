import crypto from "crypto";
import getPool from "@/lib/db";
import { ensurePresaleSchema } from "@/lib/presale";
import { TOKEN_LOCK } from "@/lib/token-lock";
import { getSolUsdRate, usdToSol } from "@/lib/sol-price";

export const AIRDROPS_PER_CYCLE = 4;
export const SATURDAY = 6;
export const DEFAULT_SATURDAY_HOUR = 21;
export const DEFAULT_SOL_USD = 140;

const DEFAULT_TIERS = [
  { name: "$300", minUsd: 300, maxUsd: 399.99, monthlyPct: 2.0, weeklyPct: 0.5 },
  { name: "$400", minUsd: 400, maxUsd: 499.99, monthlyPct: 2.09, weeklyPct: 0.5225 },
  { name: "$500", minUsd: 500, maxUsd: 599.99, monthlyPct: 2.17, weeklyPct: 0.5425 },
  { name: "$600", minUsd: 600, maxUsd: 699.99, monthlyPct: 2.26, weeklyPct: 0.565 },
  { name: "$700", minUsd: 700, maxUsd: 799.99, monthlyPct: 2.34, weeklyPct: 0.585 },
  { name: "$800", minUsd: 800, maxUsd: 899.99, monthlyPct: 2.43, weeklyPct: 0.6075 },
  { name: "$900", minUsd: 900, maxUsd: 999.99, monthlyPct: 2.51, weeklyPct: 0.6275 },
  { name: "$1,000", minUsd: 1000, maxUsd: 2499.99, monthlyPct: 2.6, weeklyPct: 0.65 },
  { name: "$2,500", minUsd: 2500, maxUsd: 4999.99, monthlyPct: 2.75, weeklyPct: 0.6875 },
  { name: "$5,000", minUsd: 5000, maxUsd: 9999.99, monthlyPct: 3.0, weeklyPct: 0.75 },
  { name: "$10,000", minUsd: 10000, maxUsd: 24999.99, monthlyPct: 3.25, weeklyPct: 0.8125 },
  { name: "$25,000", minUsd: 25000, maxUsd: 49999.99, monthlyPct: 3.5, weeklyPct: 0.875 },
  { name: "$50,000", minUsd: 50000, maxUsd: 74999.99, monthlyPct: 3.75, weeklyPct: 0.9375 },
  { name: "$75,000", minUsd: 75000, maxUsd: 99999.99, monthlyPct: 3.9, weeklyPct: 0.975 },
  { name: "$100,000", minUsd: 100000, maxUsd: 249999.99, monthlyPct: 4.0, weeklyPct: 1.0 },
  { name: "$250,000", minUsd: 250000, maxUsd: 499999.99, monthlyPct: 4.25, weeklyPct: 1.0625 },
  { name: "$500,000", minUsd: 500000, maxUsd: 999999.99, monthlyPct: 4.5, weeklyPct: 1.125 },
  { name: "$1,000,000+", minUsd: 1000000, maxUsd: null, monthlyPct: 5.0, weeklyPct: 1.25 },
];

function roundUsd(value) {
  return Number(Number(value || 0).toFixed(2));
}

function roundSol(value) {
  return Number(Number(value || 0).toFixed(8));
}

function roundToken(value) {
  return Number(Number(value || 0).toFixed(7));
}

function shortWallet(address) {
  const value = String(address || "");
  if (value.length < 10) {
    return value || "";
  }
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function cycleKeyFromDate(date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function saturdaysOfMonth(year, monthIndex) {
  const dates = [];
  const last = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  for (let day = 1; day <= last; day += 1) {
    const stamp = new Date(Date.UTC(year, monthIndex, day));
    if (stamp.getUTCDay() === SATURDAY) {
      dates.push(stamp);
    }
  }
  return dates.slice(0, AIRDROPS_PER_CYCLE);
}

function withHour(date, hour) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), Number(hour) || 0, 0, 0)
  );
}

async function columnExists(db, table, column) {
  const [rows] = await db.query(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  return rows.length > 0;
}

async function addColumn(db, table, column, ddl) {
  if (!(await columnExists(db, table, column))) {
    await db.query(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
  }
}

export async function ensureAirdropSchema() {
  await ensurePresaleSchema();
  const db = getPool();

  await addColumn(db, "users", "airdrop_sol_earned", "airdrop_sol_earned DECIMAL(18,8) NOT NULL DEFAULT 0");
  await addColumn(db, "users", "airdrop_sol_available", "airdrop_sol_available DECIMAL(18,8) NOT NULL DEFAULT 0");
  await addColumn(db, "users", "airdrop_sol_withdrawn", "airdrop_sol_withdrawn DECIMAL(18,8) NOT NULL DEFAULT 0");

  await db.query(`
    CREATE TABLE IF NOT EXISTS airdrop_settings (
      id TINYINT UNSIGNED PRIMARY KEY,
      sol_usd_rate DECIMAL(18,4) NOT NULL DEFAULT 140.0000,
      saturday_hour TINYINT UNSIGNED NOT NULL DEFAULT 21,
      auto_release TINYINT(1) NOT NULL DEFAULT 0,
      ledger_reset TINYINT(1) NOT NULL DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await addColumn(db, "airdrop_settings", "ledger_reset", "ledger_reset TINYINT(1) NOT NULL DEFAULT 0");

  await db.query(
    `INSERT IGNORE INTO airdrop_settings (id, sol_usd_rate, saturday_hour, auto_release, ledger_reset)
     VALUES (1, ?, ?, 0, 0)`,
    [DEFAULT_SOL_USD, DEFAULT_SATURDAY_HOUR]
  );
  await db.query("UPDATE airdrop_settings SET auto_release = 0 WHERE id = 1 AND auto_release = 1 AND ledger_reset = 0");

  await db.query(`
    CREATE TABLE IF NOT EXISTS airdrop_tiers (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(80) NOT NULL,
      min_usd DECIMAL(18,2) NOT NULL DEFAULT 0,
      max_usd DECIMAL(18,2) NULL,
      sol_per_thousand DECIMAL(18,8) NOT NULL DEFAULT 0,
      monthly_rate DECIMAL(12,8) NOT NULL DEFAULT 0,
      weekly_rate DECIMAL(12,8) NOT NULL DEFAULT 0,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await addColumn(db, "airdrop_tiers", "monthly_rate", "monthly_rate DECIMAL(12,8) NOT NULL DEFAULT 0");
  await addColumn(db, "airdrop_tiers", "weekly_rate", "weekly_rate DECIMAL(12,8) NOT NULL DEFAULT 0");

  const [[tierCount]] = await db.query("SELECT COUNT(*) AS total FROM airdrop_tiers");
  const [[rateCount]] = await db.query(
    "SELECT COUNT(*) AS total FROM airdrop_tiers WHERE weekly_rate > 0"
  );
  if (!Number(tierCount.total) || !Number(rateCount.total)) {
    await db.query("DELETE FROM airdrop_tiers");
    for (const [index, tier] of DEFAULT_TIERS.entries()) {
      await db.query(
        `INSERT INTO airdrop_tiers (name, min_usd, max_usd, monthly_rate, weekly_rate, sort_order)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          tier.name,
          tier.minUsd,
          tier.maxUsd,
          Number((tier.monthlyPct / 100).toFixed(8)),
          Number((tier.weeklyPct / 100).toFixed(8)),
          index + 1,
        ]
      );
    }
  }

  await db.query(`
    CREATE TABLE IF NOT EXISTS airdrop_events (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      cycle_key CHAR(7) NOT NULL,
      slot TINYINT UNSIGNED NOT NULL,
      scheduled_at DATETIME NOT NULL,
      released_at DATETIME NULL,
      status ENUM('scheduled', 'released') NOT NULL DEFAULT 'scheduled',
      payout_count INT NOT NULL DEFAULT 0,
      sol_total DECIMAL(18,8) NOT NULL DEFAULT 0,
      UNIQUE KEY uniq_airdrop_slot (cycle_key, slot),
      INDEX idx_airdrop_scheduled (scheduled_at, status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS airdrop_payouts (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      event_id BIGINT UNSIGNED NOT NULL,
      user_id BIGINT UNSIGNED NOT NULL,
      cycle_key CHAR(7) NOT NULL,
      slot TINYINT UNSIGNED NOT NULL,
      qualifying_usd DECIMAL(18,2) NOT NULL DEFAULT 0,
      qualifying_wlt DECIMAL(18,7) NOT NULL DEFAULT 0,
      sol_amount DECIMAL(18,8) NOT NULL DEFAULT 0,
      usd_equivalent DECIMAL(18,2) NOT NULL DEFAULT 0,
      status ENUM('completed') NOT NULL DEFAULT 'completed',
      tx_hash VARCHAR(128) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_airdrop_user_event (event_id, user_id),
      INDEX idx_airdrop_user (user_id, created_at),
      CONSTRAINT fk_apayout_event FOREIGN KEY (event_id)
        REFERENCES airdrop_events(id) ON DELETE CASCADE,
      CONSTRAINT fk_apayout_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS airdrop_withdrawals (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT UNSIGNED NOT NULL,
      amount DECIMAL(18,8) NOT NULL,
      wallet_address VARCHAR(64) NOT NULL,
      asset VARCHAR(16) NOT NULL DEFAULT 'SOL',
      tx_hash VARCHAR(128) NOT NULL,
      status ENUM('completed', 'pending') NOT NULL DEFAULT 'completed',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_airdrop_wd_user (user_id, created_at),
      CONSTRAINT fk_airdrop_wd_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await voidBootstrapAirdropCredits(db);
}

async function voidBootstrapAirdropCredits(db) {
  const [result] = await db.query(
    "UPDATE airdrop_settings SET auto_release = 0, ledger_reset = 1 WHERE id = 1 AND ledger_reset = 0"
  );
  if (!result.affectedRows) {
    return;
  }

  await db.query("DELETE FROM airdrop_payouts");
  await db.query("DELETE FROM airdrop_events");
  await db.query(
    `UPDATE users
     SET airdrop_sol_earned = 0,
         airdrop_sol_available = 0`
  );
}

async function getSettings(db = getPool()) {
  const [rows] = await db.query(
    "SELECT sol_usd_rate, saturday_hour, auto_release FROM airdrop_settings WHERE id = 1 LIMIT 1"
  );
  const row = rows[0] || {};
  return {
    solUsdRate: Number(row.sol_usd_rate || DEFAULT_SOL_USD),
    saturdayHour: Number(row.saturday_hour || DEFAULT_SATURDAY_HOUR),
    autoRelease: Boolean(Number(row.auto_release ?? 0)),
  };
}

export async function ensureCycleEvents(fromDate = new Date()) {
  await ensureAirdropSchema();
  const db = getPool();
  const settings = await getSettings(db);
  const now = fromDate.getTime();
  const months = [
    new Date(Date.UTC(fromDate.getUTCFullYear(), fromDate.getUTCMonth(), 1)),
    new Date(Date.UTC(fromDate.getUTCFullYear(), fromDate.getUTCMonth() + 1, 1)),
  ];

  for (const monthDate of months) {
    const year = monthDate.getUTCFullYear();
    const monthIndex = monthDate.getUTCMonth();
    const key = cycleKeyFromDate(monthDate);
    const saturdays = saturdaysOfMonth(year, monthIndex);
    for (const [index, saturday] of saturdays.entries()) {
      const scheduled = withHour(saturday, settings.saturdayHour);
      if (scheduled.getTime() <= now) {
        continue;
      }
      await db.query(
        `INSERT IGNORE INTO airdrop_events (cycle_key, slot, scheduled_at, status)
         VALUES (?, ?, ?, 'scheduled')`,
        [key, index + 1, scheduled]
      );
    }
  }

  return settings;
}

function matchTier(tiers, usd) {
  const amount = roundUsd(usd);
  return (
    [...tiers]
      .sort((a, b) => roundUsd(a.min_usd) - roundUsd(b.min_usd))
      .filter((tier) => {
        const min = roundUsd(tier.min_usd);
        const max = tier.max_usd == null ? Infinity : roundUsd(tier.max_usd);
        return amount >= min && amount <= max;
      })
      .pop() || null
  );
}

function weeklyUsdForQualifying(tiers, usd) {
  const amount = roundUsd(usd);
  if (amount <= 0) {
    return 0;
  }
  const tier = matchTier(tiers, amount);
  if (!tier) {
    return 0;
  }
  return roundUsd(amount * Number(tier.weekly_rate || 0));
}

async function distributeEvent(eventId) {
  const db = getPool();
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();
    const [eventRows] = await conn.query(
      "SELECT * FROM airdrop_events WHERE id = ? LIMIT 1 FOR UPDATE",
      [eventId]
    );
    const event = eventRows[0];
    if (!event) {
      await conn.rollback();
      return { ok: false, code: 404, message: "Airdrop event not found." };
    }
    if (event.status === "released") {
      await conn.commit();
      return { ok: true, already: true, eventId };
    }

    const settings = await getSettings(conn);
    const liveRate = await getSolUsdRate();
    const solUsdRate = liveRate > 0 ? liveRate : settings.solUsdRate;
    const [tiers] = await conn.query(
      `SELECT id, name, min_usd, max_usd, monthly_rate, weekly_rate, sort_order
     FROM airdrop_tiers
     ORDER BY sort_order ASC, min_usd ASC`
    );
    const [investors] = await conn.query(
      `SELECT id, presale_usd, presale_wlt
       FROM users
       WHERE presale_usd > 0`
    );

    let payoutCount = 0;
    let solTotal = 0;

    for (const investor of investors) {
      const qualifyingUsd = roundUsd(investor.presale_usd);
      const qualifyingWlt = roundToken(investor.presale_wlt);
      const usdAirdrop = weeklyUsdForQualifying(tiers, qualifyingUsd);
      const solAmount = usdToSol(usdAirdrop, solUsdRate);
      if (usdAirdrop <= 0 || solAmount <= 0) {
        continue;
      }

      const txHash = `AD${crypto.randomBytes(24).toString("hex")}`.slice(0, 88);
      const [insert] = await conn.query(
        `INSERT IGNORE INTO airdrop_payouts
          (event_id, user_id, cycle_key, slot, qualifying_usd, qualifying_wlt, sol_amount, usd_equivalent, tx_hash, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed')`,
        [
          event.id,
          investor.id,
          event.cycle_key,
          event.slot,
          qualifyingUsd,
          qualifyingWlt,
          solAmount,
          usdAirdrop,
          txHash,
        ]
      );

      if (!insert.affectedRows) {
        continue;
      }

      await conn.query(
        `UPDATE users
         SET airdrop_sol_earned = airdrop_sol_earned + ?,
             airdrop_sol_available = airdrop_sol_available + ?
         WHERE id = ?`,
        [solAmount, solAmount, investor.id]
      );
      payoutCount += 1;
      solTotal = roundSol(solTotal + solAmount);
    }

    await conn.query(
      `UPDATE airdrop_events
       SET status = 'released', released_at = UTC_TIMESTAMP(), payout_count = ?, sol_total = ?
       WHERE id = ?`,
      [payoutCount, solTotal, event.id]
    );
    await conn.commit();
    return { ok: true, eventId, payoutCount, solTotal, solUsdRate };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

export async function releaseDueEvents(now = new Date()) {
  await ensureAirdropSchema();
  const db = getPool();
  const [due] = await db.query(
    `SELECT id FROM airdrop_events
     WHERE status = 'scheduled' AND scheduled_at <= ?
     ORDER BY scheduled_at ASC, slot ASC`,
    [now]
  );
  const results = [];
  for (const row of due) {
    results.push(await distributeEvent(row.id));
  }
  return results;
}

export async function releaseAirdropNow(eventId) {
  await ensureCycleEvents();
  if (eventId) {
    return distributeEvent(Number(eventId));
  }
  const db = getPool();
  const [rows] = await db.query(
    `SELECT id FROM airdrop_events
     WHERE status = 'scheduled'
     ORDER BY scheduled_at ASC, slot ASC
     LIMIT 1`
  );
  if (!rows[0]) {
    return { ok: false, code: 404, message: "No scheduled airdrop remains in the current window." };
  }
  return distributeEvent(rows[0].id);
}

export async function updateAirdropSettings({ solUsdRate, saturdayHour, autoRelease }) {
  await ensureAirdropSchema();
  const db = getPool();
  await db.query(
    `UPDATE airdrop_settings
     SET sol_usd_rate = ?, saturday_hour = ?, auto_release = ?
     WHERE id = 1`,
    [
      Number(solUsdRate || DEFAULT_SOL_USD),
      Math.min(23, Math.max(0, Number(saturdayHour ?? DEFAULT_SATURDAY_HOUR))),
      autoRelease ? 1 : 0,
    ]
  );
  return getSettings(db);
}

export async function saveAirdropTiers(tiers) {
  await ensureAirdropSchema();
  const list = Array.isArray(tiers) ? tiers : [];
  if (!list.length) {
    return { ok: false, code: 400, message: "Add at least one private airdrop tier." };
  }

  const db = getPool();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query("DELETE FROM airdrop_tiers");
    for (const [index, tier] of list.entries()) {
      const minUsd = roundUsd(tier.minUsd ?? tier.min_usd);
      const maxRaw = tier.maxUsd ?? tier.max_usd;
      const maxUsd = maxRaw === "" || maxRaw == null ? null : roundUsd(maxRaw);
      await conn.query(
        `INSERT INTO airdrop_tiers (name, min_usd, max_usd, monthly_rate, weekly_rate, sort_order)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          String(tier.name || `Tier ${index + 1}`).slice(0, 80),
          minUsd,
          maxUsd,
          Number(((Number(tier.monthlyPct ?? (Number(tier.monthly_rate || 0) * 100))) / 100).toFixed(8)),
          Number(((Number(tier.weeklyPct ?? (Number(tier.weekly_rate || 0) * 100))) / 100).toFixed(8)),
          index + 1,
        ]
      );
    }
    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }

  return { ok: true, ...(await getAdminAirdropOverview()) };
}

function publicPayout(row) {
  return {
    id: Number(row.id),
    at: row.created_at,
    slot: Number(row.slot),
    of: AIRDROPS_PER_CYCLE,
    label: `${Number(row.slot)} of ${AIRDROPS_PER_CYCLE}`,
    sol: roundSol(row.sol_amount),
    usd: roundUsd(row.usd_equivalent),
    status: row.status || "completed",
    txHash: row.tx_hash,
  };
}

export async function getAirdropStatus(userId) {
  const settings = await ensureCycleEvents();
  const db = getPool();
  const now = new Date();

  const [userRows] = await db.query(
    `SELECT phantom_wallet, presale_usd, presale_wlt,
            airdrop_sol_earned, airdrop_sol_available, airdrop_sol_withdrawn
     FROM users WHERE id = ? LIMIT 1`,
    [userId]
  );
  const user = userRows[0] || {};
  const qualifyingUsd = roundUsd(user.presale_usd);
  const qualifyingWlt = roundToken(user.presale_wlt);
  const eligible = qualifyingUsd > 0;

  const currentKey = cycleKeyFromDate(now);
  const [cycleEvents] = await db.query(
    `SELECT id, cycle_key, slot, scheduled_at, released_at, status
     FROM airdrop_events
     WHERE cycle_key = ?
     ORDER BY slot ASC`,
    [currentKey]
  );

  const completedThisCycle = cycleEvents.filter((row) => row.status === "released").length;
  const progress = Array.from({ length: AIRDROPS_PER_CYCLE }, (_, index) => {
    const event = cycleEvents.find((row) => Number(row.slot) === index + 1);
    if (!event) {
      return { slot: index + 1, state: "upcoming" };
    }
    if (event.status === "released") {
      return { slot: index + 1, state: "completed", at: event.released_at };
    }
    if (new Date(event.scheduled_at).getTime() <= now.getTime()) {
      return { slot: index + 1, state: "preparing", at: event.scheduled_at };
    }
    return { slot: index + 1, state: "upcoming", at: event.scheduled_at };
  });

  const [upcomingRows] = await db.query(
    `SELECT id, cycle_key, slot, scheduled_at, status
     FROM airdrop_events
     WHERE status = 'scheduled'
     ORDER BY scheduled_at ASC, slot ASC
     LIMIT 1`
  );
  const upcoming = upcomingRows[0] || null;
  const preparing = progress.find((item) => item.state === "preparing");

  let nextState = "countdown";
  if (!eligible) {
    nextState = "ineligible";
  } else if (preparing) {
    nextState = "preparing";
  } else if (!upcoming) {
    nextState = "complete";
  }

  const [payoutRows] = await db.query(
    `SELECT id, slot, sol_amount, usd_equivalent, status, tx_hash, created_at
     FROM airdrop_payouts
     WHERE user_id = ?
     ORDER BY id DESC
     LIMIT 40`,
    [userId]
  );

  const [withdrawRows] = await db.query(
    `SELECT id, amount, wallet_address, asset, tx_hash, status, created_at
     FROM airdrop_withdrawals
     WHERE user_id = ?
     ORDER BY id DESC
     LIMIT 12`,
    [userId]
  );

  return {
    lock: TOKEN_LOCK,
    eligible,
    qualifying: {
      usd: qualifyingUsd,
      wlt: qualifyingWlt,
      status: "Locked",
      source: "Confirmed presale purchases only",
    },
    wallet: {
      connected: Boolean(user.phantom_wallet),
      address: user.phantom_wallet || "",
      short: shortWallet(user.phantom_wallet),
    },
    balance: {
      earned: roundSol(user.airdrop_sol_earned),
      available: roundSol(user.airdrop_sol_available),
      withdrawn: roundSol(user.airdrop_sol_withdrawn),
      asset: "SOL",
    },
    cycle: {
      key: currentKey,
      completed: completedThisCycle,
      total: AIRDROPS_PER_CYCLE,
      progress,
    },
    next: {
      label: "Saturday Night",
      at: upcoming ? new Date(upcoming.scheduled_at).toISOString() : null,
      slot: upcoming ? Number(upcoming.slot) : preparing ? Number(preparing.slot) : null,
      of: AIRDROPS_PER_CYCLE,
      state: nextState,
      hourUtc: settings.saturdayHour,
    },
    history: payoutRows.map(publicPayout),
    withdrawals: withdrawRows.map((row) => ({
      id: Number(row.id),
      amount: roundSol(row.amount),
      wallet: shortWallet(row.wallet_address),
      asset: row.asset,
      txHash: row.tx_hash,
      status: row.status,
      createdAt: row.created_at,
    })),
  };
}

export async function withdrawAirdropSol(userId, { amount, walletAddress, signature }) {
  await ensureAirdropSchema();
  const sol = roundSol(amount);
  const wallet = String(walletAddress || "").trim();

  if (sol < 0.0001) {
    return { ok: false, code: 400, message: "Enter at least 0.0001 SOL to withdraw." };
  }
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(wallet)) {
    return { ok: false, code: 400, message: "Connect Phantom Wallet to withdraw airdrop SOL." };
  }

  const db = getPool();
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();
    const [rows] = await conn.query(
      `SELECT phantom_wallet, airdrop_sol_available
       FROM users WHERE id = ? LIMIT 1 FOR UPDATE`,
      [userId]
    );
    const user = rows[0];
    if (!user) {
      await conn.rollback();
      return { ok: false, code: 404, message: "Account not found." };
    }
    if (user.phantom_wallet && user.phantom_wallet !== wallet) {
      await conn.rollback();
      return { ok: false, code: 409, message: "Withdraw to your connected Phantom wallet." };
    }
    if (roundSol(user.airdrop_sol_available) < sol) {
      await conn.rollback();
      return { ok: false, code: 400, message: "Not enough available airdrop SOL." };
    }

    const txHash =
      String(signature || "").replace(/[^1-9A-HJ-NP-Za-km-z]/g, "").slice(0, 88) ||
      `AS${crypto.randomBytes(32).toString("hex")}`.slice(0, 88);

    if (!user.phantom_wallet) {
      await conn.query("UPDATE users SET phantom_wallet = ? WHERE id = ?", [wallet, userId]);
    }

    await conn.query(
      `INSERT INTO airdrop_withdrawals (user_id, amount, wallet_address, asset, tx_hash, status)
       VALUES (?, ?, ?, 'SOL', ?, 'completed')`,
      [userId, sol, wallet, txHash]
    );
    await conn.query(
      `UPDATE users
       SET airdrop_sol_available = airdrop_sol_available - ?,
           airdrop_sol_withdrawn = airdrop_sol_withdrawn + ?
       WHERE id = ?`,
      [sol, sol, userId]
    );
    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }

  return { ok: true, ...(await getAirdropStatus(userId)) };
}

export async function getAdminAirdropOverview() {
  const settings = await ensureCycleEvents();
  const db = getPool();
  const [tiers] = await db.query(
    `SELECT id, name, min_usd, max_usd, monthly_rate, weekly_rate, sort_order
     FROM airdrop_tiers
     ORDER BY sort_order ASC, min_usd ASC`
  );
  const [events] = await db.query(
    `SELECT id, cycle_key, slot, scheduled_at, released_at, status, payout_count, sol_total
     FROM airdrop_events
     ORDER BY scheduled_at DESC
     LIMIT 12`
  );
  const [payouts] = await db.query(
    `SELECT p.id, p.cycle_key, p.slot, p.qualifying_usd, p.sol_amount, p.usd_equivalent,
            p.status, p.tx_hash, p.created_at, u.full_name, u.email
     FROM airdrop_payouts p
     INNER JOIN users u ON u.id = p.user_id
     ORDER BY p.id DESC
     LIMIT 40`
  );
  const [[stats]] = await db.query(
    `SELECT
       COALESCE(SUM(sol_amount), 0) AS sol,
       COUNT(*) AS payouts,
       COUNT(DISTINCT user_id) AS recipients
     FROM airdrop_payouts`
  );

  return {
    settings,
    stats: {
      sol: roundSol(stats.sol),
      payouts: Number(stats.payouts || 0),
      recipients: Number(stats.recipients || 0),
    },
    tiers: tiers.map((tier) => ({
      id: Number(tier.id),
      name: tier.name,
      minUsd: roundUsd(tier.min_usd),
      maxUsd: tier.max_usd == null ? "" : roundUsd(tier.max_usd),
      monthlyPct: Number((Number(tier.monthly_rate || 0) * 100).toFixed(4)),
      weeklyPct: Number((Number(tier.weekly_rate || 0) * 100).toFixed(4)),
    })),
    events: events.map((row) => ({
      id: Number(row.id),
      cycleKey: row.cycle_key,
      slot: Number(row.slot),
      scheduledAt: row.scheduled_at,
      releasedAt: row.released_at,
      status: row.status,
      payoutCount: Number(row.payout_count || 0),
      solTotal: roundSol(row.sol_total),
    })),
    payouts: payouts.map((row) => ({
      id: Number(row.id),
      name: row.full_name,
      email: row.email,
      cycleKey: row.cycle_key,
      slot: Number(row.slot),
      qualifyingUsd: roundUsd(row.qualifying_usd),
      sol: roundSol(row.sol_amount),
      usd: roundUsd(row.usd_equivalent),
      status: row.status,
      txHash: row.tx_hash,
      createdAt: row.created_at,
    })),
  };
}
