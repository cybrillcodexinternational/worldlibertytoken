import getPool from "@/lib/db";
import {
  deleteOtherSessions,
  deleteSessionById,
  ensureAuthSchema,
  hashPassword,
  listUserSessions,
  verifyPassword,
} from "@/lib/auth";
import { ensurePresaleSchema, connectPhantomWallet } from "@/lib/presale";
import { ensureReferralSchema, ensureUserReferralCode } from "@/lib/referral";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LANGUAGES = ["en", "es", "fr", "de", "ar"];
const CURRENCIES = ["USD", "EUR", "GBP"];
const TIMEZONES = ["UTC", "America/New_York", "Europe/London", "Asia/Dubai", "Asia/Karachi"];

const DEFAULT_PREFS = {
  language: "en",
  currency: "USD",
  timezone: "UTC",
  notifyEmail: true,
  notifyMining: true,
  notifyAirdrop: true,
  notifyPresale: true,
  notifyReferral: true,
  notifyRewards: true,
  marketing: false,
};

function shortWallet(address) {
  const value = String(address || "");
  if (value.length < 10) {
    return value || "Not connected";
  }
  return `${value.slice(0, 4)}…${value.slice(-4)}`;
}

function asBool(value, fallback = true) {
  if (value === undefined || value === null) {
    return fallback;
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (value === "true" || value === 1 || value === "1") {
    return true;
  }
  if (value === "false" || value === 0 || value === "0" || value === "") {
    return false;
  }
  return Boolean(value);
}

function pick(value, allowed, fallback) {
  const next = String(value || "").trim();
  return allowed.includes(next) ? next : fallback;
}

export async function ensureSettingsSchema() {
  await ensureAuthSchema();
  await ensureReferralSchema();
  await ensurePresaleSchema();
  const db = getPool();
  await db.query(`
    CREATE TABLE IF NOT EXISTS user_settings (
      user_id BIGINT UNSIGNED PRIMARY KEY,
      language VARCHAR(8) NOT NULL DEFAULT 'en',
      currency VARCHAR(8) NOT NULL DEFAULT 'USD',
      timezone VARCHAR(64) NOT NULL DEFAULT 'UTC',
      notify_email TINYINT(1) NOT NULL DEFAULT 1,
      notify_mining TINYINT(1) NOT NULL DEFAULT 1,
      notify_airdrop TINYINT(1) NOT NULL DEFAULT 1,
      notify_presale TINYINT(1) NOT NULL DEFAULT 1,
      notify_referral TINYINT(1) NOT NULL DEFAULT 1,
      notify_rewards TINYINT(1) NOT NULL DEFAULT 1,
      marketing TINYINT(1) NOT NULL DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_user_settings_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

async function loadPrefs(userId) {
  const db = getPool();
  const [rows] = await db.query("SELECT * FROM user_settings WHERE user_id = ? LIMIT 1", [userId]);
  const row = rows[0];
  if (!row) {
    return { ...DEFAULT_PREFS };
  }
  return {
    language: pick(row.language, LANGUAGES, "en"),
    currency: pick(row.currency, CURRENCIES, "USD"),
    timezone: pick(row.timezone, TIMEZONES, "UTC"),
    notifyEmail: asBool(row.notify_email, true),
    notifyMining: asBool(row.notify_mining, true),
    notifyAirdrop: asBool(row.notify_airdrop, true),
    notifyPresale: asBool(row.notify_presale, true),
    notifyReferral: asBool(row.notify_referral, true),
    notifyRewards: asBool(row.notify_rewards, true),
    marketing: asBool(row.marketing, false),
  };
}

async function upsertPrefs(userId, prefs) {
  const db = getPool();
  await db.query(
    `INSERT INTO user_settings (
      user_id, language, currency, timezone,
      notify_email, notify_mining, notify_airdrop, notify_presale,
      notify_referral, notify_rewards, marketing
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      language = VALUES(language),
      currency = VALUES(currency),
      timezone = VALUES(timezone),
      notify_email = VALUES(notify_email),
      notify_mining = VALUES(notify_mining),
      notify_airdrop = VALUES(notify_airdrop),
      notify_presale = VALUES(notify_presale),
      notify_referral = VALUES(notify_referral),
      notify_rewards = VALUES(notify_rewards),
      marketing = VALUES(marketing)`,
    [
      userId,
      prefs.language,
      prefs.currency,
      prefs.timezone,
      prefs.notifyEmail ? 1 : 0,
      prefs.notifyMining ? 1 : 0,
      prefs.notifyAirdrop ? 1 : 0,
      prefs.notifyPresale ? 1 : 0,
      prefs.notifyReferral ? 1 : 0,
      prefs.notifyRewards ? 1 : 0,
      prefs.marketing ? 1 : 0,
    ]
  );
}

export async function getSettingsStatus(userId, currentToken) {
  await ensureSettingsSchema();
  const db = getPool();
  const [rows] = await db.query(
    `SELECT id, full_name, email, role, created_at, phantom_wallet, referral_code, presale_usd
     FROM users WHERE id = ? LIMIT 1`,
    [userId]
  );
  const user = rows[0];
  if (!user) {
    return { ok: false, code: 404, message: "Account not found." };
  }

  const referralCode = user.referral_code || (await ensureUserReferralCode(userId));
  const prefs = await loadPrefs(userId);
  const sessions = await listUserSessions(userId, currentToken);

  return {
    ok: true,
    languages: LANGUAGES,
    currencies: CURRENCIES,
    timezones: TIMEZONES,
    profile: {
      fullName: user.full_name || "",
      email: user.email || "",
      role: user.role || "user",
      createdAt: user.created_at,
      initial: String(user.full_name || "U").trim().charAt(0).toUpperCase() || "U",
    },
    wallet: {
      connected: Boolean(user.phantom_wallet),
      address: user.phantom_wallet || "",
      short: shortWallet(user.phantom_wallet),
    },
    referral: {
      code: referralCode,
      path: `/register?ref=${encodeURIComponent(referralCode)}`,
    },
    notifications: {
      email: prefs.notifyEmail,
      mining: prefs.notifyMining,
      airdrop: prefs.notifyAirdrop,
      presale: prefs.notifyPresale,
      referral: prefs.notifyReferral,
      rewards: prefs.notifyRewards,
      marketing: prefs.marketing,
    },
    preferences: {
      language: prefs.language,
      currency: prefs.currency,
      timezone: prefs.timezone,
    },
    sessions,
    account: {
      role: user.role || "user",
      memberSince: user.created_at,
      presaleUsd: Number(user.presale_usd || 0),
    },
  };
}

export async function updateSettings(userId, currentToken, body = {}) {
  await ensureSettingsSchema();
  const action = String(body.action || "").trim();

  if (action === "profile") {
    const fullName = String(body.fullName || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    if (fullName.length < 2) {
      return { ok: false, code: 400, message: "Enter your full name." };
    }
    if (!EMAIL_RE.test(email)) {
      return { ok: false, code: 400, message: "Enter a valid email address." };
    }
    const db = getPool();
    const [taken] = await db.query(
      "SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1",
      [email, userId]
    );
    if (taken.length) {
      return { ok: false, code: 409, message: "That email is already in use." };
    }
    await db.query("UPDATE users SET full_name = ?, email = ? WHERE id = ?", [fullName, email, userId]);
    return { ok: true, message: "Profile updated.", ...(await getSettingsStatus(userId, currentToken)) };
  }

  if (action === "password") {
    const currentPassword = String(body.currentPassword || "");
    const nextPassword = String(body.nextPassword || "");
    if (nextPassword.length < 8) {
      return { ok: false, code: 400, message: "New password must be at least 8 characters." };
    }
    const db = getPool();
    const [rows] = await db.query("SELECT password_hash FROM users WHERE id = ? LIMIT 1", [userId]);
    const hash = rows[0]?.password_hash;
    if (!hash || !(await verifyPassword(currentPassword, hash))) {
      return { ok: false, code: 400, message: "Current password is incorrect." };
    }
    await db.query("UPDATE users SET password_hash = ? WHERE id = ?", [await hashPassword(nextPassword), userId]);
    return { ok: true, message: "Password changed.", ...(await getSettingsStatus(userId, currentToken)) };
  }

  if (action === "preferences") {
    const current = await loadPrefs(userId);
    const prefs = {
      ...current,
      language: pick(body.language, LANGUAGES, current.language),
      currency: pick(body.currency, CURRENCIES, current.currency),
      timezone: pick(body.timezone, TIMEZONES, current.timezone),
    };
    await upsertPrefs(userId, prefs);
    return { ok: true, message: "Preferences saved.", ...(await getSettingsStatus(userId, currentToken)) };
  }

  if (action === "notifications") {
    const current = await loadPrefs(userId);
    const prefs = {
      ...current,
      notifyEmail: asBool(body.email, current.notifyEmail),
      notifyMining: asBool(body.mining, current.notifyMining),
      notifyAirdrop: asBool(body.airdrop, current.notifyAirdrop),
      notifyPresale: asBool(body.presale, current.notifyPresale),
      notifyReferral: asBool(body.referral, current.notifyReferral),
      notifyRewards: asBool(body.rewards, current.notifyRewards),
      marketing: asBool(body.marketing, current.marketing),
    };
    await upsertPrefs(userId, prefs);
    return { ok: true, message: "Notification preferences saved.", ...(await getSettingsStatus(userId, currentToken)) };
  }

  if (action === "wallet") {
    const result = await connectPhantomWallet(userId, body.address);
    if (!result.ok) {
      return result;
    }
    return { ok: true, message: "Phantom wallet connected.", ...(await getSettingsStatus(userId, currentToken)) };
  }

  if (action === "revoke-session") {
    const sessionId = Number(body.sessionId);
    const sessions = await listUserSessions(userId, currentToken);
    const target = sessions.find((row) => row.id === sessionId);
    if (!target) {
      return { ok: false, code: 404, message: "Session not found." };
    }
    if (target.current) {
      return { ok: false, code: 400, message: "Sign out to leave the current session." };
    }
    await deleteSessionById(userId, sessionId);
    return { ok: true, message: "Session revoked.", ...(await getSettingsStatus(userId, currentToken)) };
  }

  if (action === "revoke-others") {
    await deleteOtherSessions(userId, currentToken);
    return { ok: true, message: "Other sessions signed out.", ...(await getSettingsStatus(userId, currentToken)) };
  }

  return { ok: false, code: 400, message: "Unknown settings action." };
}
