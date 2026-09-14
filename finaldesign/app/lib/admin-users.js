import crypto from "crypto";
import getPool from "@/lib/db";
import {
  createSession,
  deleteAllUserSessions,
  ensureAuthSchema,
  hashPassword,
} from "@/lib/auth";
import { ensureAirdropSchema } from "@/lib/airdrop";
import { ensureMiningSchema } from "@/lib/mining";
import { ensurePresaleSchema } from "@/lib/presale";

const PAGE_SIZE = 20;

function num(value) {
  return Number(value || 0);
}

function stamp(value) {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function shortWallet(address) {
  const value = String(address || "");
  if (value.length < 10) {
    return value || "";
  }
  return `${value.slice(0, 4)}…${value.slice(-4)}`;
}

function mapUser(row) {
  return {
    id: Number(row.id),
    fullName: row.full_name || "",
    email: row.email || "",
    role: row.role === "admin" ? "admin" : "user",
    status: row.status === "blocked" ? "blocked" : "active",
    blockedAt: stamp(row.blocked_at),
    blockedReason: row.blocked_reason || "",
    createdAt: stamp(row.created_at),
    referralCode: row.referral_code || "",
    wallet: row.phantom_wallet || "",
    walletShort: shortWallet(row.phantom_wallet),
    presaleUsd: num(row.presale_usd),
    presaleWlt: num(row.presale_wlt),
    wltBalance: num(row.wlt_balance),
    commission: num(row.commission_available),
    airdropSol: num(row.airdrop_sol_available),
    sessions: Number(row.sessions || 0),
  };
}

async function columnExists(db, table, column) {
  const [rows] = await db.query(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  return rows.length > 0;
}

async function safeDelete(db, sql, params) {
  try {
    await db.query(sql, params);
  } catch {
    // table or column may not exist yet
  }
}

export async function ensureAdminUserSchema() {
  await ensureAuthSchema();
  await ensurePresaleSchema();
  await ensureMiningSchema();
  await ensureAirdropSchema();
}

async function getUserRow(db, userId) {
  const [rows] = await db.query(
    `SELECT u.*,
      (SELECT COUNT(*) FROM sessions s WHERE s.user_id = u.id AND s.expires_at > NOW()) AS sessions
     FROM users u
     WHERE u.id = ?
     LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
}

export async function listAdminUsers({ q = "", status = "all", role = "all", page = 1 } = {}) {
  await ensureAdminUserSchema();
  const db = getPool();
  const filters = [];
  const params = [];
  const query = String(q || "").trim();

  if (query) {
    filters.push("(u.full_name LIKE ? OR u.email LIKE ? OR u.referral_code LIKE ?)");
    const like = `%${query}%`;
    params.push(like, like, like);
  }
  if (status === "active" || status === "blocked") {
    filters.push("u.status = ?");
    params.push(status);
  }
  if (role === "admin" || role === "user") {
    filters.push("u.role = ?");
    params.push(role);
  }

  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const size = PAGE_SIZE;
  const current = Math.max(1, Number(page) || 1);
  const offset = (current - 1) * size;

  const [[countRow]] = await db.query(`SELECT COUNT(*) AS total FROM users u ${where}`, params);
  const [rows] = await db.query(
    `SELECT u.id, u.full_name, u.email, u.role, u.status, u.blocked_at, u.blocked_reason, u.created_at,
            u.referral_code, u.phantom_wallet, u.presale_usd, u.presale_wlt, u.wlt_balance,
            u.commission_available, u.airdrop_sol_available,
            (SELECT COUNT(*) FROM sessions s WHERE s.user_id = u.id AND s.expires_at > NOW()) AS sessions
     FROM users u
     ${where}
     ORDER BY u.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, size, offset]
  );

  const [[stats]] = await db.query(
    `SELECT
       COUNT(*) AS total,
       SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) AS admins,
       SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) AS blocked,
       SUM(CASE WHEN status <> 'blocked' THEN 1 ELSE 0 END) AS active
     FROM users`
  );

  return {
    ok: true,
    page: current,
    pageSize: size,
    total: Number(countRow?.total || 0),
    pages: Math.max(1, Math.ceil(Number(countRow?.total || 0) / size)),
    stats: {
      total: Number(stats?.total || 0),
      admins: Number(stats?.admins || 0),
      blocked: Number(stats?.blocked || 0),
      active: Number(stats?.active || 0),
    },
    users: rows.map(mapUser),
  };
}

function guardTarget(target, adminId, { allowAdmin = false } = {}) {
  if (!target) {
    return { ok: false, code: 404, message: "User not found." };
  }
  if (Number(target.id) === Number(adminId)) {
    return { ok: false, code: 400, message: "You cannot run this action on your own admin account." };
  }
  if (!allowAdmin && target.role === "admin") {
    return { ok: false, code: 400, message: "Admin accounts are protected from this action." };
  }
  return { ok: true };
}

export async function blockUser(adminId, userId, reason = "") {
  await ensureAdminUserSchema();
  const db = getPool();
  const target = await getUserRow(db, userId);
  const guard = guardTarget(target, adminId);
  if (!guard.ok) {
    return guard;
  }

  await db.query(
    "UPDATE users SET status = 'blocked', blocked_at = NOW(), blocked_reason = ? WHERE id = ?",
    [String(reason || "Blocked by admin").slice(0, 191), userId]
  );
  await deleteAllUserSessions(userId);
  return { ok: true, message: "User blocked and signed out." };
}

export async function unblockUser(adminId, userId) {
  await ensureAdminUserSchema();
  const db = getPool();
  const target = await getUserRow(db, userId);
  const guard = guardTarget(target, adminId);
  if (!guard.ok) {
    return guard;
  }

  await db.query(
    "UPDATE users SET status = 'active', blocked_at = NULL, blocked_reason = NULL WHERE id = ?",
    [userId]
  );
  return { ok: true, message: "User unblocked." };
}

export async function resetUserPassword(adminId, userId, nextPassword = "") {
  await ensureAdminUserSchema();
  const db = getPool();
  const target = await getUserRow(db, userId);
  const guard = guardTarget(target, adminId, { allowAdmin: true });
  if (!guard.ok) {
    return guard;
  }

  const password = String(nextPassword || "").trim() || `WLT-${crypto.randomBytes(5).toString("hex")}`;
  if (password.length < 8) {
    return { ok: false, code: 400, message: "Password must be at least 8 characters." };
  }

  await db.query("UPDATE users SET password_hash = ? WHERE id = ?", [await hashPassword(password), userId]);
  await deleteAllUserSessions(userId);
  return { ok: true, message: "Password reset. Share it once, then ask the user to change it.", password };
}

export async function revokeUserSessions(adminId, userId) {
  await ensureAdminUserSchema();
  const db = getPool();
  const target = await getUserRow(db, userId);
  const guard = guardTarget(target, adminId, { allowAdmin: true });
  if (!guard.ok) {
    return guard;
  }
  await deleteAllUserSessions(userId);
  return { ok: true, message: "All sessions revoked." };
}

export async function setUserRole(adminId, userId, role) {
  await ensureAdminUserSchema();
  const next = role === "admin" ? "admin" : "user";
  const db = getPool();
  const target = await getUserRow(db, userId);
  const guard = guardTarget(target, adminId, { allowAdmin: true });
  if (!guard.ok) {
    return guard;
  }
  await db.query("UPDATE users SET role = ? WHERE id = ?", [next, userId]);
  await deleteAllUserSessions(userId);
  return { ok: true, message: next === "admin" ? "User promoted to admin." : "Admin demoted to user." };
}

export async function resetUserAccount(adminId, userId) {
  await ensureAdminUserSchema();
  const db = getPool();
  const target = await getUserRow(db, userId);
  const guard = guardTarget(target, adminId);
  if (!guard.ok) {
    return guard;
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await safeDelete(conn, "DELETE FROM mining_sessions WHERE user_id = ?", [userId]);
    await safeDelete(conn, "DELETE FROM scratch_plays WHERE user_id = ?", [userId]);
    await safeDelete(conn, "DELETE FROM airdrop_withdrawals WHERE user_id = ?", [userId]);
    await safeDelete(conn, "DELETE FROM airdrop_payouts WHERE user_id = ?", [userId]);
    await safeDelete(conn, "DELETE FROM commission_withdrawals WHERE user_id = ?", [userId]);
    await safeDelete(conn, "DELETE FROM presale_commissions WHERE sponsor_id = ? OR buyer_id = ?", [userId, userId]);
    await safeDelete(conn, "DELETE FROM presale_purchases WHERE user_id = ?", [userId]);
    await safeDelete(conn, "DELETE FROM referral_rewards WHERE sponsor_id = ? OR miner_id = ?", [userId, userId]);
    await safeDelete(conn, "DELETE FROM referral_tiers WHERE user_id = ?", [userId]);
    await safeDelete(conn, "DELETE FROM user_badges WHERE user_id = ?", [userId]);
    await safeDelete(conn, "DELETE FROM user_settings WHERE user_id = ?", [userId]);
    await safeDelete(conn, "DELETE FROM sessions WHERE user_id = ?", [userId]);

    const updates = [
      "wlt_balance = 0",
      "phantom_wallet = NULL",
    ];
    if (await columnExists(conn, "users", "presale_usd")) {
      updates.push("presale_usd = 0", "presale_wlt = 0");
    }
    if (await columnExists(conn, "users", "commission_earned")) {
      updates.push(
        "commission_earned = 0",
        "commission_available = 0",
        "commission_withdrawn = 0",
        "commission_pending = 0"
      );
    }
    if (await columnExists(conn, "users", "airdrop_sol_earned")) {
      updates.push(
        "airdrop_sol_earned = 0",
        "airdrop_sol_available = 0",
        "airdrop_sol_withdrawn = 0"
      );
    }
    await conn.query(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, [userId]);
    await conn.commit();
  } catch (error) {
    await conn.rollback();
    return { ok: false, code: 500, message: error.message || "Could not reset account." };
  } finally {
    conn.release();
  }

  return { ok: true, message: "Account balances and module history were reset. Login stays active." };
}

export async function deleteUserAccount(adminId, userId) {
  await ensureAdminUserSchema();
  const db = getPool();
  const target = await getUserRow(db, userId);
  const guard = guardTarget(target, adminId);
  if (!guard.ok) {
    return guard;
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    if (await columnExists(conn, "users", "referred_by")) {
      await conn.query("UPDATE users SET referred_by = NULL WHERE referred_by = ?", [userId]);
    }
    await safeDelete(conn, "DELETE FROM support_replies WHERE user_id = ?", [userId]);
    await safeDelete(conn, "DELETE FROM support_tickets WHERE user_id = ?", [userId]);
    await safeDelete(conn, "DELETE FROM mining_sessions WHERE user_id = ?", [userId]);
    await safeDelete(conn, "DELETE FROM scratch_plays WHERE user_id = ?", [userId]);
    await safeDelete(conn, "DELETE FROM airdrop_withdrawals WHERE user_id = ?", [userId]);
    await safeDelete(conn, "DELETE FROM airdrop_payouts WHERE user_id = ?", [userId]);
    await safeDelete(conn, "DELETE FROM commission_withdrawals WHERE user_id = ?", [userId]);
    await safeDelete(conn, "DELETE FROM presale_commissions WHERE sponsor_id = ? OR buyer_id = ?", [userId, userId]);
    await safeDelete(conn, "DELETE FROM presale_purchases WHERE user_id = ?", [userId]);
    await safeDelete(conn, "DELETE FROM referral_rewards WHERE sponsor_id = ? OR miner_id = ?", [userId, userId]);
    await safeDelete(conn, "DELETE FROM referral_tiers WHERE user_id = ?", [userId]);
    await safeDelete(conn, "DELETE FROM user_badges WHERE user_id = ?", [userId]);
    await safeDelete(conn, "DELETE FROM user_settings WHERE user_id = ?", [userId]);
    await safeDelete(conn, "DELETE FROM sessions WHERE user_id = ?", [userId]);
    await conn.query("DELETE FROM users WHERE id = ?", [userId]);
    await conn.commit();
  } catch (error) {
    await conn.rollback();
    return { ok: false, code: 500, message: error.message || "Could not delete user." };
  } finally {
    conn.release();
  }

  return { ok: true, message: "User deleted." };
}

export async function startImpersonation(adminId, userId) {
  await ensureAdminUserSchema();
  const db = getPool();
  const target = await getUserRow(db, userId);
  const guard = guardTarget(target, adminId);
  if (!guard.ok) {
    return guard;
  }
  if (target.status === "blocked") {
    return { ok: false, code: 400, message: "Unblock this user before impersonating." };
  }
  const session = await createSession(userId, false);
  return {
    ok: true,
    message: `Now viewing ${target.full_name}.`,
    session,
    redirectTo: "/user",
    target: mapUser(target),
  };
}

export function cookieOptions(maxAge) {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}
