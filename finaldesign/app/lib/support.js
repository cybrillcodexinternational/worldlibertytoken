import getPool from "@/lib/db";
import { ensureAuthSchema } from "@/lib/auth";

export const TICKET_CATEGORIES = [
  { key: "account", label: "Account" },
  { key: "wallet", label: "Wallet" },
  { key: "presale", label: "Presale" },
  { key: "mining", label: "Mining" },
  { key: "airdrop", label: "Airdrops" },
  { key: "referral", label: "Referral" },
  { key: "rewards", label: "Scratch & Win" },
  { key: "other", label: "Other" },
];

export const TICKET_PRIORITIES = [
  { key: "low", label: "Low" },
  { key: "normal", label: "Normal" },
  { key: "high", label: "High" },
  { key: "urgent", label: "Urgent" },
];

export const TICKET_STATUSES = [
  { key: "open", label: "Open" },
  { key: "pending", label: "Waiting on you" },
  { key: "answered", label: "Answered" },
  { key: "closed", label: "Closed" },
];

const CATEGORY_KEYS = TICKET_CATEGORIES.map((item) => item.key);
const PRIORITY_KEYS = TICKET_PRIORITIES.map((item) => item.key);
const STATUS_KEYS = TICKET_STATUSES.map((item) => item.key);

function pick(value, allowed, fallback) {
  const next = String(value || "").trim();
  return allowed.includes(next) ? next : fallback;
}

function stamp(value) {
  return value || null;
}

function ticketNo(id) {
  return `WLT-${String(id).padStart(6, "0")}`;
}

function mapTicket(row) {
  return {
    id: Number(row.id),
    number: row.ticket_no || ticketNo(row.id),
    userId: Number(row.user_id),
    userName: row.full_name || "User",
    userEmail: row.email || "",
    category: row.category,
    categoryLabel: TICKET_CATEGORIES.find((item) => item.key === row.category)?.label || row.category,
    priority: row.priority,
    priorityLabel: TICKET_PRIORITIES.find((item) => item.key === row.priority)?.label || row.priority,
    status: row.status,
    statusLabel: TICKET_STATUSES.find((item) => item.key === row.status)?.label || row.status,
    subject: row.subject,
    lastReplyBy: row.last_reply_by,
    lastReplyAt: stamp(row.last_reply_at),
    createdAt: stamp(row.created_at),
    updatedAt: stamp(row.updated_at),
    closedAt: stamp(row.closed_at),
    replies: Number(row.reply_count || 0),
  };
}

function mapMessage(row) {
  return {
    id: Number(row.id),
    author: row.author_role,
    name: row.full_name || (row.author_role === "admin" ? "Support" : "User"),
    message: row.message,
    createdAt: stamp(row.created_at),
  };
}

export async function ensureSupportSchema() {
  await ensureAuthSchema();
  const db = getPool();

  await db.query(`
    CREATE TABLE IF NOT EXISTS support_tickets (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      ticket_no VARCHAR(20) NULL UNIQUE,
      user_id BIGINT UNSIGNED NOT NULL,
      category ENUM('account','wallet','presale','mining','airdrop','referral','rewards','other')
        NOT NULL DEFAULT 'other',
      priority ENUM('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
      subject VARCHAR(160) NOT NULL,
      status ENUM('open','pending','answered','closed') NOT NULL DEFAULT 'open',
      last_reply_by ENUM('user','admin') NOT NULL DEFAULT 'user',
      last_reply_at DATETIME NOT NULL,
      closed_at DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_support_user (user_id, created_at),
      INDEX idx_support_status (status, last_reply_at),
      CONSTRAINT fk_support_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS support_replies (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      ticket_id BIGINT UNSIGNED NOT NULL,
      user_id BIGINT UNSIGNED NOT NULL,
      author_role ENUM('user','admin') NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_support_replies_ticket (ticket_id, created_at),
      CONSTRAINT fk_support_reply_ticket FOREIGN KEY (ticket_id)
        REFERENCES support_tickets(id) ON DELETE CASCADE,
      CONSTRAINT fk_support_reply_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

function emptyCounts() {
  return { all: 0, open: 0, pending: 0, answered: 0, closed: 0 };
}

async function countTickets(db, whereSql, params) {
  const [rows] = await db.query(
    `SELECT status, COUNT(*) AS total
     FROM support_tickets
     ${whereSql}
     GROUP BY status`,
    params
  );
  const counts = emptyCounts();
  for (const row of rows) {
    counts[row.status] = Number(row.total || 0);
    counts.all += Number(row.total || 0);
  }
  return counts;
}

async function categoryBars(db, whereSql, params) {
  const [rows] = await db.query(
    `SELECT category, COUNT(*) AS total
     FROM support_tickets
     ${whereSql}
     GROUP BY category`,
    params
  );
  const map = Object.fromEntries(rows.map((row) => [row.category, Number(row.total || 0)]));
  const max = Math.max(1, ...Object.values(map), 1);
  return TICKET_CATEGORIES.map((item) => ({
    key: item.key,
    label: item.label,
    total: map[item.key] || 0,
    pct: Math.round(((map[item.key] || 0) / max) * 100),
  }));
}

async function loadTickets(db, { userId, admin, status, search }) {
  const where = [];
  const params = [];
  if (!admin) {
    where.push("t.user_id = ?");
    params.push(userId);
  }
  if (status && STATUS_KEYS.includes(status) && status !== "all") {
    where.push("t.status = ?");
    params.push(status);
  }
  if (search) {
    where.push("(t.ticket_no LIKE ? OR t.subject LIKE ? OR u.email LIKE ? OR u.full_name LIKE ?)");
    const like = `%${search}%`;
    params.push(like, like, like, like);
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const [rows] = await db.query(
    `SELECT t.*, u.full_name, u.email,
            (SELECT COUNT(*) FROM support_replies r WHERE r.ticket_id = t.id) AS reply_count
     FROM support_tickets t
     INNER JOIN users u ON u.id = t.user_id
     ${whereSql}
     ORDER BY
       FIELD(t.status, 'open', 'pending', 'answered', 'closed'),
       t.last_reply_at DESC
     LIMIT 200`,
    params
  );
  return rows.map(mapTicket);
}

async function loadTicket(db, ticketId, { userId, admin }) {
  const params = [ticketId];
  let extra = "";
  if (!admin) {
    extra = " AND t.user_id = ?";
    params.push(userId);
  }
  const [rows] = await db.query(
    `SELECT t.*, u.full_name, u.email,
            (SELECT COUNT(*) FROM support_replies r WHERE r.ticket_id = t.id) AS reply_count
     FROM support_tickets t
     INNER JOIN users u ON u.id = t.user_id
     WHERE t.id = ?${extra}
     LIMIT 1`,
    params
  );
  const ticket = rows[0];
  if (!ticket) {
    return null;
  }
  const [messages] = await db.query(
    `SELECT r.id, r.author_role, r.message, r.created_at, u.full_name
     FROM support_replies r
     INNER JOIN users u ON u.id = r.user_id
     WHERE r.ticket_id = ?
     ORDER BY r.created_at ASC, r.id ASC`,
    [ticketId]
  );
  return { ...mapTicket(ticket), messages: messages.map(mapMessage) };
}

export async function getSupportDesk(userId, { admin = false, ticketId, status, search } = {}) {
  await ensureSupportSchema();
  const db = getPool();
  const scopeSql = admin ? "" : "WHERE user_id = ?";
  const scopeParams = admin ? [] : [userId];
  const counts = await countTickets(db, scopeSql, scopeParams);
  const categories = await categoryBars(db, scopeSql, scopeParams);
  const tickets = await loadTickets(db, {
    userId,
    admin,
    status: status === "all" ? "" : status,
    search: String(search || "").trim().slice(0, 80),
  });
  const selectedId = Number(ticketId || 0);
  const selected = selectedId ? await loadTicket(db, selectedId, { userId, admin }) : null;

  return {
    ok: true,
    admin: Boolean(admin),
    categories: TICKET_CATEGORIES,
    priorities: TICKET_PRIORITIES,
    statuses: TICKET_STATUSES,
    counts,
    categoryBars: categories,
    tickets,
    selected,
  };
}

export async function createSupportTicket(userId, body = {}) {
  await ensureSupportSchema();
  const subject = String(body.subject || "").trim();
  const message = String(body.message || "").trim();
  const category = pick(body.category, CATEGORY_KEYS, "other");
  const priority = pick(body.priority, PRIORITY_KEYS, "normal");

  if (subject.length < 4 || subject.length > 160) {
    return { ok: false, code: 400, message: "Subject must be 4–160 characters." };
  }
  if (message.length < 10 || message.length > 4000) {
    return { ok: false, code: 400, message: "Message must be 10–4000 characters." };
  }

  const db = getPool();
  const [result] = await db.query(
    `INSERT INTO support_tickets
      (user_id, category, priority, subject, status, last_reply_by, last_reply_at)
     VALUES (?, ?, ?, ?, 'open', 'user', UTC_TIMESTAMP())`,
    [userId, category, priority, subject]
  );
  const id = Number(result.insertId);
  const number = ticketNo(id);
  await db.query("UPDATE support_tickets SET ticket_no = ? WHERE id = ?", [number, id]);
  await db.query(
    `INSERT INTO support_replies (ticket_id, user_id, author_role, message)
     VALUES (?, ?, 'user', ?)`,
    [id, userId, message]
  );

  return {
    ok: true,
    message: `Ticket ${number} opened.`,
    ...(await getSupportDesk(userId, { ticketId: id })),
  };
}

async function assertTicket(db, ticketId, { userId, admin }) {
  const params = [ticketId];
  let extra = "";
  if (!admin) {
    extra = " AND user_id = ?";
    params.push(userId);
  }
  const [rows] = await db.query(
    `SELECT id, user_id, status FROM support_tickets WHERE id = ?${extra} LIMIT 1`,
    params
  );
  return rows[0] || null;
}

export async function replySupportTicket(userId, body = {}, { admin = false } = {}) {
  await ensureSupportSchema();
  const ticketId = Number(body.ticketId || body.id);
  const message = String(body.message || "").trim();
  if (!ticketId) {
    return { ok: false, code: 400, message: "Ticket is required." };
  }
  if (message.length < 2 || message.length > 4000) {
    return { ok: false, code: 400, message: "Reply must be 2–4000 characters." };
  }

  const db = getPool();
  const ticket = await assertTicket(db, ticketId, { userId, admin });
  if (!ticket) {
    return { ok: false, code: 404, message: "Ticket not found." };
  }
  if (ticket.status === "closed" && !admin) {
    return { ok: false, code: 400, message: "This ticket is closed. Reopen it to reply." };
  }

  const role = admin ? "admin" : "user";
  const nextStatus = admin ? "answered" : "pending";
  await db.query(
    `INSERT INTO support_replies (ticket_id, user_id, author_role, message)
     VALUES (?, ?, ?, ?)`,
    [ticketId, userId, role, message]
  );
  await db.query(
    `UPDATE support_tickets
     SET status = ?, last_reply_by = ?, last_reply_at = UTC_TIMESTAMP(), closed_at = NULL
     WHERE id = ?`,
    [nextStatus, role, ticketId]
  );

  return {
    ok: true,
    message: admin ? "Reply sent to the member." : "Reply sent to support.",
    ...(await getSupportDesk(userId, { admin, ticketId })),
  };
}

export async function setSupportTicketStatus(userId, body = {}, { admin = false } = {}) {
  await ensureSupportSchema();
  const ticketId = Number(body.ticketId || body.id);
  const status = pick(body.status, STATUS_KEYS, "");
  if (!ticketId || !status) {
    return { ok: false, code: 400, message: "Ticket and status are required." };
  }
  if (!admin && status !== "closed" && status !== "open") {
    return { ok: false, code: 403, message: "You can only close or reopen your ticket." };
  }

  const db = getPool();
  const ticket = await assertTicket(db, ticketId, { userId, admin });
  if (!ticket) {
    return { ok: false, code: 404, message: "Ticket not found." };
  }

  await db.query(
    `UPDATE support_tickets
     SET status = ?, closed_at = ${status === "closed" ? "UTC_TIMESTAMP()" : "NULL"}
     WHERE id = ?`,
    [status, ticketId]
  );

  return {
    ok: true,
    message: status === "closed" ? "Ticket closed." : `Ticket marked ${status}.`,
    ...(await getSupportDesk(userId, { admin, ticketId })),
  };
}

export async function setSupportTicketPriority(userId, body = {}) {
  await ensureSupportSchema();
  const ticketId = Number(body.ticketId || body.id);
  const priority = pick(body.priority, PRIORITY_KEYS, "");
  if (!ticketId || !priority) {
    return { ok: false, code: 400, message: "Ticket and priority are required." };
  }
  const db = getPool();
  const ticket = await assertTicket(db, ticketId, { userId, admin: true });
  if (!ticket) {
    return { ok: false, code: 404, message: "Ticket not found." };
  }
  await db.query("UPDATE support_tickets SET priority = ? WHERE id = ?", [priority, ticketId]);
  return {
    ok: true,
    message: "Priority updated.",
    ...(await getSupportDesk(userId, { admin: true, ticketId })),
  };
}
