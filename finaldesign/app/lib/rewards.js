import { randomInt } from "crypto";
import getPool from "@/lib/db";
import { ensureMiningSchema, getMiningStatus } from "@/lib/mining";

export const TOKEN_SYMBOL = "WLT";

export const PRIZE_TIERS = [
  { amount: 0.025, label: "Spark", weight: 320 },
  { amount: 0.05, label: "Pulse", weight: 280 },
  { amount: 0.08, label: "Charge", weight: 180 },
  { amount: 0.12, label: "Boost", weight: 120 },
  { amount: 0.25, label: "Strike", weight: 70 },
  { amount: 0.5, label: "Vault", weight: 25 },
  { amount: 1, label: "Liberty", weight: 5 },
];

const WEIGHT_TOTAL = PRIZE_TIERS.reduce((sum, tier) => sum + tier.weight, 0);

function roundToken(value) {
  return Number(Number(value || 0).toFixed(7));
}

export function utcDay(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function nextUtcMidnight(date = new Date()) {
  const next = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1));
  return next.toISOString();
}

function asDay(value) {
  if (!value) {
    return null;
  }
  if (typeof value === "string") {
    return value.slice(0, 10);
  }
  return utcDay(value);
}

function pickPrize() {
  let roll = randomInt(0, WEIGHT_TOTAL);
  for (const tier of PRIZE_TIERS) {
    roll -= tier.weight;
    if (roll < 0) {
      return tier;
    }
  }
  return PRIZE_TIERS[0];
}

function shuffle(list) {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i + 1);
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function buildGrid(prize) {
  const cells = Array(9).fill(null);
  const winSlots = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8]).slice(0, 3);
  winSlots.forEach((slot) => {
    cells[slot] = prize.amount;
  });

  const decoys = PRIZE_TIERS.filter((tier) => tier.amount !== prize.amount);
  const leftovers = [];
  while (leftovers.length < 6) {
    const batch = shuffle(decoys).slice(0, 2).map((tier) => tier.amount);
    leftovers.push(...batch);
  }

  cells.forEach((value, index) => {
    if (value === null) {
      cells[index] = leftovers.shift();
    }
  });

  return cells.map((amount) => roundToken(amount));
}

export async function ensureRewardsSchema() {
  await ensureMiningSchema();
  const db = getPool();

  await db.query(`
    CREATE TABLE IF NOT EXISTS scratch_plays (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT UNSIGNED NOT NULL,
      play_day DATE NOT NULL,
      prize DECIMAL(18,7) NOT NULL,
      prize_label VARCHAR(32) NOT NULL,
      grid_json JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_scratch_user_day (user_id, play_day),
      INDEX idx_scratch_user_day (user_id, play_day),
      CONSTRAINT fk_scratch_user FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

async function creditBalance(db, userId, amount) {
  await db.query("UPDATE users SET wlt_balance = wlt_balance + ? WHERE id = ?", [amount, userId]);
}

function parseGrid(value) {
  if (Array.isArray(value)) {
    return value.map((amount) => roundToken(amount));
  }
  if (typeof value === "string") {
    try {
      return JSON.parse(value).map((amount) => roundToken(amount));
    } catch {
      return [];
    }
  }
  return [];
}

function serializePlay(row) {
  if (!row) {
    return null;
  }
  return {
    day: asDay(row.play_day),
    prize: roundToken(row.prize),
    label: row.prize_label,
    grid: parseGrid(row.grid_json),
    playedAt: row.created_at ? new Date(row.created_at).toISOString() : null,
  };
}

export async function getRewardsStatus(userId) {
  await ensureRewardsSchema();
  const db = getPool();
  const day = utcDay();
  const mining = await getMiningStatus(userId);

  const [todayRows] = await db.query(
    `SELECT prize, prize_label, grid_json, created_at, DATE_FORMAT(play_day, '%Y-%m-%d') AS play_day
     FROM scratch_plays
     WHERE user_id = ? AND play_day = ?
     LIMIT 1`,
    [userId, day]
  );

  const [[lifetime]] = await db.query(
    `SELECT COALESCE(SUM(prize), 0) AS total, COUNT(*) AS plays
     FROM scratch_plays
     WHERE user_id = ?`,
    [userId]
  );

  const [[best]] = await db.query(
    `SELECT COALESCE(MAX(prize), 0) AS best
     FROM scratch_plays
     WHERE user_id = ?`,
    [userId]
  );

  const [historyRows] = await db.query(
    `SELECT DATE_FORMAT(play_day, '%Y-%m-%d') AS play_day, prize, prize_label, created_at
     FROM scratch_plays
     WHERE user_id = ?
     ORDER BY play_day DESC
     LIMIT 7`,
    [userId]
  );

  const today = serializePlay(todayRows[0]);

  return {
    token: TOKEN_SYMBOL,
    day,
    resetsAt: nextUtcMidnight(),
    balance: mining.balance,
    canPlay: !today,
    today,
    todayPrize: today?.prize || 0,
    lifetimeEarned: roundToken(lifetime.total),
    plays: Number(lifetime.plays || 0),
    bestWin: roundToken(best.best),
    maxPrize: 1,
    odds: PRIZE_TIERS.map((tier) => ({
      amount: roundToken(tier.amount),
      label: tier.label,
      chance: `${(tier.weight / 10).toFixed(1)}%`,
    })),
    history: historyRows.map((row) => ({
      day: asDay(row.play_day),
      prize: roundToken(row.prize),
      label: row.prize_label,
    })),
    serverNow: new Date().toISOString(),
  };
}

export async function playScratchCard(userId) {
  await ensureRewardsSchema();
  const db = getPool();
  const conn = await db.getConnection();
  const day = utcDay();
  const prize = pickPrize();
  const grid = buildGrid(prize);

  try {
    await conn.beginTransaction();

    const [existing] = await conn.query(
      `SELECT prize, prize_label, grid_json, created_at, DATE_FORMAT(play_day, '%Y-%m-%d') AS play_day
       FROM scratch_plays
       WHERE user_id = ? AND play_day = ?
       LIMIT 1
       FOR UPDATE`,
      [userId, day]
    );

    if (existing.length) {
      await conn.rollback();
      return {
        ok: false,
        code: 409,
        message: "Today’s scratch card is already used. Come back after UTC midnight.",
        ...(await getRewardsStatus(userId)),
      };
    }

    await conn.query(
      `INSERT INTO scratch_plays (user_id, play_day, prize, prize_label, grid_json)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, day, prize.amount, prize.label, JSON.stringify(grid)]
    );
    await creditBalance(conn, userId, prize.amount);
    await conn.commit();
  } catch (error) {
    try {
      await conn.rollback();
    } catch {
      // Transaction may already be closed.
    }
    throw error;
  } finally {
    conn.release();
  }

  return {
    ok: true,
    message: `You matched 3 × ${prize.label}. ${roundToken(prize.amount).toFixed(7)} WLT credited.`,
    ...(await getRewardsStatus(userId)),
  };
}
