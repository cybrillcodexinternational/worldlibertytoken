import crypto from "crypto";
import bcrypt from "bcryptjs";
import getPool from "@/lib/db";

export const SESSION_COOKIE = "wlt_session";

export async function ensureAuthSchema() {
  const db = getPool();

  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(191) NOT NULL,
      email VARCHAR(191) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT UNSIGNED NOT NULL,
      token_hash CHAR(64) NOT NULL UNIQUE,
      expires_at DATETIME NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_sessions_user_id (user_id),
      INDEX idx_sessions_expires_at (expires_at),
      CONSTRAINT fk_sessions_user FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function hashSessionToken(token) {
  return hashToken(token);
}

export async function createSession(userId, remember = true) {
  const db = getPool();
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiryDays = remember ? 30 : 1;

  await db.query(
    "INSERT INTO sessions (user_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? DAY))",
    [userId, tokenHash, expiryDays]
  );

  return { token, maxAge: expiryDays * 24 * 60 * 60 };
}

export async function getUserByEmail(email) {
  const db = getPool();
  const [rows] = await db.query(
    "SELECT id, full_name, email, password_hash, role FROM users WHERE email = ? LIMIT 1",
    [email]
  );
  return rows[0] || null;
}

export async function createUser({ fullName, email, passwordHash, role = "user" }) {
  const db = getPool();
  const [result] = await db.query(
    "INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)",
    [fullName, email, passwordHash, role]
  );
  return result.insertId;
}

export async function getUserBySessionToken(token) {
  const db = getPool();
  const tokenHash = hashToken(token);
  const [rows] = await db.query(
    `SELECT u.id, u.full_name, u.email, u.role
     FROM sessions s
     INNER JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ? AND s.expires_at > NOW()
     LIMIT 1`,
    [tokenHash]
  );
  return rows[0] || null;
}

export async function deleteSessionByToken(token) {
  const db = getPool();
  const tokenHash = hashToken(token);
  await db.query("DELETE FROM sessions WHERE token_hash = ?", [tokenHash]);
}

export async function listUserSessions(userId, currentToken) {
  const db = getPool();
  const currentHash = currentToken ? hashToken(currentToken) : "";
  const [rows] = await db.query(
    `SELECT id, created_at, expires_at, token_hash
     FROM sessions
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [userId]
  );
  return rows.map((row) => ({
    id: Number(row.id),
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    current: row.token_hash === currentHash,
  }));
}

export async function deleteSessionById(userId, sessionId) {
  const db = getPool();
  await db.query("DELETE FROM sessions WHERE id = ? AND user_id = ?", [Number(sessionId), userId]);
}

export async function deleteOtherSessions(userId, currentToken) {
  const db = getPool();
  const currentHash = hashToken(currentToken);
  await db.query("DELETE FROM sessions WHERE user_id = ? AND token_hash <> ?", [userId, currentHash]);
}
