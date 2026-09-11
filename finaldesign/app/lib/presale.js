import crypto from "crypto";
import getPool from "@/lib/db";
import { ensureReferralSchema } from "@/lib/referral";

export const TOKEN_SYMBOL = "WLT";
export const WLT_PRICE_USD = 0.5;
export const QUALIFY_USD = 1000;
export const QUALIFY_WLT = QUALIFY_USD / WLT_PRICE_USD;
export const PRESALE_COMMISSION_RATE = 0.05;
export const PRESALE_STAGE = "Presale Stage 1";
export const SETTLEMENT_ASSET = "SOL";
export const STABLECOIN = SETTLEMENT_ASSET;
export const NETWORK_FEE_USD = 0;

export const CLASS = {
  MINING_USER: "MINING_USER",
  PRESALE_PARTICIPANT: "PRESALE_PARTICIPANT",
  QUALIFIED_PRESALE_INVESTOR: "QUALIFIED_PRESALE_INVESTOR",
};

function roundToken(value) {
  return Number(Number(value || 0).toFixed(7));
}

function roundUsd(value) {
  return Number(Number(value || 0).toFixed(2));
}

function shortWallet(address) {
  const value = String(address || "");
  if (value.length < 10) {
    return value || "";
  }
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
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

export function classifyInvestor(presaleUsd) {
  const spent = roundUsd(presaleUsd);
  if (spent >= QUALIFY_USD) {
    return {
      code: CLASS.QUALIFIED_PRESALE_INVESTOR,
      label: "Qualified Presale Investor",
      eligiblePresaleReferral: true,
      eligibleMiningReferral: true,
    };
  }
  if (spent > 0) {
    return {
      code: CLASS.PRESALE_PARTICIPANT,
      label: "Presale Participant",
      eligiblePresaleReferral: false,
      eligibleMiningReferral: true,
    };
  }
  return {
    code: CLASS.MINING_USER,
    label: "Mining User",
    eligiblePresaleReferral: false,
    eligibleMiningReferral: true,
  };
}

export function quotePurchase(usdAmount) {
  const usd = roundUsd(usdAmount);
  const wlt = roundToken(usd / WLT_PRICE_USD);
  const fee = roundUsd(NETWORK_FEE_USD);
  return {
    usd,
    price: WLT_PRICE_USD,
    wlt,
    fee,
    total: roundUsd(usd + fee),
    stage: PRESALE_STAGE,
    token: TOKEN_SYMBOL,
  };
}

export async function ensurePresaleSchema() {
  await ensureReferralSchema();
  const db = getPool();

  await addColumn(db, "users", "phantom_wallet", "phantom_wallet VARCHAR(64) NULL");
  await addColumn(db, "users", "presale_usd", "presale_usd DECIMAL(18,2) NOT NULL DEFAULT 0");
  await addColumn(db, "users", "presale_wlt", "presale_wlt DECIMAL(18,7) NOT NULL DEFAULT 0");
  await addColumn(
    db,
    "users",
    "commission_earned",
    "commission_earned DECIMAL(18,2) NOT NULL DEFAULT 0"
  );
  await addColumn(
    db,
    "users",
    "commission_available",
    "commission_available DECIMAL(18,2) NOT NULL DEFAULT 0"
  );
  await addColumn(
    db,
    "users",
    "commission_withdrawn",
    "commission_withdrawn DECIMAL(18,2) NOT NULL DEFAULT 0"
  );
  await addColumn(
    db,
    "users",
    "commission_pending",
    "commission_pending DECIMAL(18,2) NOT NULL DEFAULT 0"
  );

  await db.query(`
    CREATE TABLE IF NOT EXISTS presale_purchases (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT UNSIGNED NOT NULL,
      usd_amount DECIMAL(18,2) NOT NULL,
      wlt_amount DECIMAL(18,7) NOT NULL,
      price DECIMAL(18,4) NOT NULL DEFAULT 0.5000,
      wallet_address VARCHAR(64) NOT NULL,
      tx_hash VARCHAR(128) NOT NULL,
      signature VARCHAR(256) NULL,
      status ENUM('confirmed', 'pending') NOT NULL DEFAULT 'confirmed',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_presale_user (user_id, created_at),
      UNIQUE KEY uniq_presale_tx (tx_hash),
      CONSTRAINT fk_presale_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS presale_commissions (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      sponsor_id BIGINT UNSIGNED NOT NULL,
      buyer_id BIGINT UNSIGNED NOT NULL,
      purchase_id BIGINT UNSIGNED NOT NULL,
      purchase_usd DECIMAL(18,2) NOT NULL,
      rate DECIMAL(6,4) NOT NULL DEFAULT 0.0500,
      commission_usd DECIMAL(18,2) NOT NULL,
      status ENUM('available', 'pending', 'withdrawn') NOT NULL DEFAULT 'available',
      tx_hash VARCHAR(128) NULL,
      label VARCHAR(80) NOT NULL DEFAULT 'Presale Referral Commission',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_presale_purchase (purchase_id),
      INDEX idx_presale_sponsor (sponsor_id, created_at),
      CONSTRAINT fk_pcomm_sponsor FOREIGN KEY (sponsor_id)
        REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_pcomm_buyer FOREIGN KEY (buyer_id)
        REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_pcomm_purchase FOREIGN KEY (purchase_id)
        REFERENCES presale_purchases(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS commission_withdrawals (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT UNSIGNED NOT NULL,
      amount DECIMAL(18,2) NOT NULL,
      wallet_address VARCHAR(64) NOT NULL,
      asset VARCHAR(16) NOT NULL DEFAULT 'SOL',
      tx_hash VARCHAR(128) NOT NULL,
      status ENUM('completed', 'pending') NOT NULL DEFAULT 'completed',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_withdraw_user (user_id, created_at),
      CONSTRAINT fk_withdraw_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await db.query("UPDATE commission_withdrawals SET asset = 'SOL' WHERE UPPER(asset) = 'USDC'");
  await db.query("ALTER TABLE commission_withdrawals MODIFY asset VARCHAR(16) NOT NULL DEFAULT 'SOL'");

  await db.query(`
    CREATE TABLE IF NOT EXISTS referral_tiers (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT UNSIGNED NOT NULL,
      level INT NOT NULL,
      usd_spent DECIMAL(18,2) NOT NULL DEFAULT 0,
      wlt_earned DECIMAL(18,7) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_referral_tier (user_id, level),
      CONSTRAINT fk_referral_tier_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

export async function connectPhantomWallet(userId, address) {
  await ensurePresaleSchema();
  const wallet = String(address || "").trim();
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(wallet)) {
    return { ok: false, code: 400, message: "Connect a valid Phantom wallet address." };
  }

  const db = getPool();
  const [taken] = await db.query(
    "SELECT id FROM users WHERE phantom_wallet = ? AND id <> ? LIMIT 1",
    [wallet, userId]
  );
  if (taken.length) {
    return { ok: false, code: 409, message: "That Phantom wallet is already linked to another account." };
  }

  await db.query("UPDATE users SET phantom_wallet = ? WHERE id = ?", [wallet, userId]);
  return { ok: true, ...(await getPresaleStatus(userId)) };
}

async function creditDirectCommission(db, { sponsorCheckUsd, buyerId, purchaseId, usdAmount, txHash }) {
  const [buyerRows] = await db.query("SELECT referred_by FROM users WHERE id = ? LIMIT 1", [buyerId]);
  const sponsorId = buyerRows[0]?.referred_by ? Number(buyerRows[0].referred_by) : null;
  if (!sponsorId) {
    return null;
  }

  const [sponsorRows] = await db.query(
    "SELECT presale_usd FROM users WHERE id = ? LIMIT 1",
    [sponsorId]
  );
  const sponsorUsd = roundUsd(sponsorCheckUsd ?? sponsorRows[0]?.presale_usd);
  if (sponsorUsd < QUALIFY_USD) {
    return null;
  }

  const commission = roundUsd(usdAmount * PRESALE_COMMISSION_RATE);
  const [insert] = await db.query(
    `INSERT IGNORE INTO presale_commissions
      (sponsor_id, buyer_id, purchase_id, purchase_usd, rate, commission_usd, status, tx_hash, label)
     VALUES (?, ?, ?, ?, ?, ?, 'available', ?, 'Presale Referral Commission')`,
    [sponsorId, buyerId, purchaseId, roundUsd(usdAmount), PRESALE_COMMISSION_RATE, commission, txHash]
  );

  if (!insert.affectedRows) {
    return null;
  }

  await db.query(
    `UPDATE users
     SET commission_earned = commission_earned + ?,
         commission_available = commission_available + ?
     WHERE id = ?`,
    [commission, commission, sponsorId]
  );

  return { sponsorId, commission };
}

export async function recordPresalePurchase(userId, { usdAmount, walletAddress, signature }) {
  await ensurePresaleSchema();
  const quote = quotePurchase(usdAmount);
  if (quote.usd < 1) {
    return { ok: false, code: 400, message: "Enter a purchase amount of at least $1." };
  }

  const wallet = String(walletAddress || "").trim();
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(wallet)) {
    return { ok: false, code: 400, message: "Connect Phantom Wallet before buying WLT." };
  }

  const db = getPool();
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();
    const [userRows] = await conn.query(
      "SELECT id, phantom_wallet, presale_usd FROM users WHERE id = ? LIMIT 1 FOR UPDATE",
      [userId]
    );
    const user = userRows[0];
    if (!user) {
      await conn.rollback();
      return { ok: false, code: 404, message: "Account not found." };
    }

    if (user.phantom_wallet && user.phantom_wallet !== wallet) {
      await conn.rollback();
      return { ok: false, code: 409, message: "Purchase must use your connected Phantom wallet." };
    }

    if (!user.phantom_wallet) {
      await conn.query("UPDATE users SET phantom_wallet = ? WHERE id = ?", [wallet, userId]);
    }

    const txHash =
      String(signature || "").replace(/[^1-9A-HJ-NP-Za-km-z]/g, "").slice(0, 88) ||
      `WLT${crypto.randomBytes(32).toString("hex")}`.slice(0, 88);

    const [result] = await conn.query(
      `INSERT INTO presale_purchases
        (user_id, usd_amount, wlt_amount, price, wallet_address, tx_hash, signature, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed')`,
      [userId, quote.usd, quote.wlt, quote.price, wallet, txHash, signature || null]
    );

    await conn.query(
      `UPDATE users
       SET presale_usd = presale_usd + ?,
           presale_wlt = presale_wlt + ?
       WHERE id = ?`,
      [quote.usd, quote.wlt, userId]
    );

    await creditDirectCommission(conn, {
      buyerId: userId,
      purchaseId: result.insertId,
      usdAmount: quote.usd,
      txHash,
    });

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    if (String(error.message || "").includes("uniq_presale_tx")) {
      return { ok: false, code: 409, message: "This transaction was already recorded." };
    }
    throw error;
  } finally {
    conn.release();
  }

  return { ok: true, quote, ...(await getPresaleStatus(userId)) };
}

export async function withdrawCommission(userId, { amount, walletAddress, signature }) {
  await ensurePresaleSchema();
  const usd = roundUsd(amount);
  const wallet = String(walletAddress || "").trim();

  if (usd < 1) {
    return { ok: false, code: 400, message: "Enter at least $1.00 to withdraw." };
  }
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(wallet)) {
    return { ok: false, code: 400, message: "Connect Phantom Wallet to withdraw commission." };
  }

  const db = getPool();
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();
    const [rows] = await conn.query(
      `SELECT phantom_wallet, commission_available
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
    if (roundUsd(user.commission_available) < usd) {
      await conn.rollback();
      return { ok: false, code: 400, message: "Not enough available referral commission." };
    }

    const txHash =
      String(signature || "").replace(/[^1-9A-HJ-NP-Za-km-z]/g, "").slice(0, 88) ||
      `WD${crypto.randomBytes(32).toString("hex")}`.slice(0, 88);

    await conn.query(
      `INSERT INTO commission_withdrawals
        (user_id, amount, wallet_address, asset, tx_hash, status)
       VALUES (?, ?, ?, ?, ?, 'completed')`,
      [userId, usd, wallet, STABLECOIN, txHash]
    );
    await conn.query(
      `UPDATE users
       SET commission_available = commission_available - ?,
           commission_withdrawn = commission_withdrawn + ?
       WHERE id = ?`,
      [usd, usd, userId]
    );
    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }

  return { ok: true, ...(await getPresaleStatus(userId)) };
}

export async function getPresaleStatus(userId) {
  await ensurePresaleSchema();
  const db = getPool();
  const [userRows] = await db.query(
    `SELECT phantom_wallet, presale_usd, presale_wlt,
            commission_earned, commission_available, commission_withdrawn, commission_pending
     FROM users WHERE id = ? LIMIT 1`,
    [userId]
  );
  const user = userRows[0] || {};
  const spent = roundUsd(user.presale_usd);
  const investor = classifyInvestor(spent);
  const remaining = roundUsd(Math.max(0, QUALIFY_USD - spent));
  const progress = Math.min(100, Math.round((spent / QUALIFY_USD) * 100));

  const [l1Rows] = await db.query(
    `SELECT id, full_name, created_at, presale_usd, presale_wlt
     FROM users WHERE referred_by = ? ORDER BY id DESC`,
    [userId]
  );
  const l1Ids = l1Rows.map((row) => Number(row.id));

  let deeper = [];
  if (l1Ids.length) {
    const [l2Rows] = await db.query(
      `SELECT id, presale_usd FROM users WHERE referred_by IN (?)`,
      [l1Ids]
    );
    deeper = deeper.concat(l2Rows);
    const l2Ids = l2Rows.map((row) => Number(row.id));
    if (l2Ids.length) {
      const [l3Rows] = await db.query(
        `SELECT id, presale_usd FROM users WHERE referred_by IN (?)`,
        [l2Ids]
      );
      deeper = deeper.concat(l3Rows);
    }
  }

  const tree = [
    ...l1Rows.map((row) => ({ presale_usd: row.presale_usd })),
    ...deeper,
  ];
  const presaleBuyers = tree.filter((row) => roundUsd(row.presale_usd) > 0).length;
  const miningMembers = tree.length - presaleBuyers;
  const qualifiedDirect = l1Rows.filter((row) => roundUsd(row.presale_usd) > 0).length;

  const [purchaseRows] = await db.query(
    `SELECT id, usd_amount, wlt_amount, price, wallet_address, tx_hash, status, created_at
     FROM presale_purchases WHERE user_id = ? ORDER BY id DESC LIMIT 20`,
    [userId]
  );

  const [commissionRows] = await db.query(
    `SELECT c.id, c.purchase_usd, c.rate, c.commission_usd, c.status, c.tx_hash, c.label, c.created_at,
            u.full_name AS buyer_name
     FROM presale_commissions c
     INNER JOIN users u ON u.id = c.buyer_id
     WHERE c.sponsor_id = ?
     ORDER BY c.id DESC
     LIMIT 40`,
    [userId]
  );

  const [withdrawRows] = await db.query(
    `SELECT id, amount, wallet_address, asset, tx_hash, status, created_at
     FROM commission_withdrawals WHERE user_id = ? ORDER BY id DESC LIMIT 20`,
    [userId]
  );

  return {
    token: TOKEN_SYMBOL,
    settlement: SETTLEMENT_ASSET,
    stablecoin: SETTLEMENT_ASSET,
    stage: PRESALE_STAGE,
    price: WLT_PRICE_USD,
    qualifyUsd: QUALIFY_USD,
    qualifyWlt: QUALIFY_WLT,
    commissionRate: PRESALE_COMMISSION_RATE,
    wallet: {
      connected: Boolean(user.phantom_wallet),
      address: user.phantom_wallet || "",
      short: shortWallet(user.phantom_wallet),
      provider: "Phantom",
    },
    allocation: {
      usd: spent,
      wlt: roundToken(user.presale_wlt),
    },
    investor,
    qualify: {
      current: spent,
      target: QUALIFY_USD,
      remaining,
      progress,
      unlocked: investor.eligiblePresaleReferral,
    },
    commission: {
      earned: roundUsd(user.commission_earned),
      available: roundUsd(user.commission_available),
      withdrawn: roundUsd(user.commission_withdrawn),
      pending: roundUsd(user.commission_pending),
    },
    network: {
      total: tree.length,
      mining: miningMembers,
      presale: presaleBuyers,
      qualifiedDirect,
    },
    directBuyers: l1Rows.map((row) => ({
      id: Number(row.id),
      name: row.full_name,
      joinedAt: row.created_at,
      usd: roundUsd(row.presale_usd),
      wlt: roundToken(row.presale_wlt),
      purchased: roundUsd(row.presale_usd) > 0,
    })),
    purchases: purchaseRows.map((row) => ({
      id: Number(row.id),
      usd: roundUsd(row.usd_amount),
      wlt: roundToken(row.wlt_amount),
      price: Number(row.price),
      wallet: shortWallet(row.wallet_address),
      txHash: row.tx_hash,
      status: row.status,
      createdAt: row.created_at,
    })),
    commissions: commissionRows.map((row) => ({
      id: Number(row.id),
      label: row.label,
      level: "Direct",
      purchaseUsd: roundUsd(row.purchase_usd),
      rate: Number(row.rate),
      commission: roundUsd(row.commission_usd),
      status: row.status,
      buyerName: row.buyer_name,
      txHash: row.tx_hash,
      createdAt: row.created_at,
    })),
    withdrawals: withdrawRows.map((row) => ({
      id: Number(row.id),
      amount: roundUsd(row.amount),
      wallet: shortWallet(row.wallet_address),
      asset: row.asset,
      txHash: row.tx_hash,
      status: row.status,
      createdAt: row.created_at,
    })),
  };
}

export async function getAdminPresaleOverview() {
  await ensurePresaleSchema();
  const db = getPool();
  const [[sales]] = await db.query(
    `SELECT
       COALESCE(SUM(usd_amount), 0) AS usd,
       COALESCE(SUM(wlt_amount), 0) AS wlt,
       COUNT(*) AS orders
     FROM presale_purchases`
  );
  const [[pool]] = await db.query(
    `SELECT
       COALESCE(SUM(commission_usd), 0) AS paid,
       COUNT(*) AS payouts
     FROM presale_commissions`
  );
  const [[investors]] = await db.query(
    `SELECT
       SUM(CASE WHEN presale_usd >= ? THEN 1 ELSE 0 END) AS qualified,
       SUM(CASE WHEN presale_usd > 0 THEN 1 ELSE 0 END) AS buyers
     FROM users`,
    [QUALIFY_USD]
  );

  return {
    usd: roundUsd(sales.usd),
    wlt: roundToken(sales.wlt),
    orders: Number(sales.orders || 0),
    commissionPaid: roundUsd(pool.paid),
    commissionPayouts: Number(pool.payouts || 0),
    qualifiedInvestors: Number(investors.qualified || 0),
    buyers: Number(investors.buyers || 0),
  };
}
