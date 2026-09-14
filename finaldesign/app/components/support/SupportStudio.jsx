"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CircleDot,
  Clock3,
  Headphones,
  LifeBuoy,
  Lock,
  MessageSquarePlus,
  Search,
  SendHorizontal,
  ShieldCheck,
  Ticket,
  Unlock,
} from "lucide-react";
import styles from "./support.module.css";

const EMPTY = {
  admin: false,
  categories: [],
  priorities: [],
  statuses: [],
  counts: { all: 0, open: 0, pending: 0, answered: 0, closed: 0 },
  categoryBars: [],
  tickets: [],
  selected: null,
};

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "pending", label: "Waiting" },
  { key: "answered", label: "Answered" },
  { key: "closed", label: "Closed" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

function stamp(value) {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}

function Ring({ value, size = 156, label, sub }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, Number(value) || 0));
  return (
    <div className={styles.ringWrap} style={{ width: size, height: size }}>
      <svg className={styles.ringSvg} viewBox="0 0 120 120" aria-hidden="true">
        <circle className={styles.ringTrack} cx="60" cy="60" r={r} strokeWidth={10} />
        <motion.circle
          className={styles.ringFill}
          cx="60"
          cy="60"
          r={r}
          strokeWidth={10}
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (c * pct) / 100 }}
          transition={{ duration: 1.15, ease: "easeOut" }}
        />
      </svg>
      <div className={styles.ringCore}>
        <b>{pct.toFixed(0)}%</b>
        <small>{label}</small>
        {sub ? <em>{sub}</em> : null}
      </div>
    </div>
  );
}

export default function SupportStudio({ panel = "user" }) {
  const isAdmin = panel === "admin";
  const endpoint = isAdmin ? "/api/support/admin" : "/api/support";
  const listUrl = isAdmin ? "/api/support/admin" : "/api/support/status";

  const [data, setData] = useState(EMPTY);
  const [tab, setTab] = useState("all");
  const [mode, setMode] = useState("list");
  const [selectedId, setSelectedId] = useState(0);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [form, setForm] = useState({
    category: "account",
    priority: "normal",
    subject: "",
    message: "",
  });
  const [reply, setReply] = useState("");

  function apply(payload) {
    setData({ ...EMPTY, ...payload });
    if (payload.selected?.id) {
      setSelectedId(payload.selected.id);
      setMode("thread");
    }
  }

  async function load({ status = tab, id = selectedId, q = query } = {}) {
    const params = new URLSearchParams();
    if (status && status !== "all") {
      params.set("status", status);
    }
    if (id) {
      params.set("id", String(id));
    }
    if (q) {
      params.set("q", q);
    }
    const response = await fetch(`${listUrl}?${params.toString()}`, { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.message || "Could not load support.");
    }
    apply(payload);
    return payload;
  }

  useEffect(() => {
    load({ status: "all", id: 0, q: "" }).catch((err) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function post(body) {
    setError("");
    setNote("");
    setBusy(body.action || "save");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || "Request failed.");
      }
      apply(payload);
      setNote(payload.message || "Saved.");
      if (body.action === "create") {
        setForm({ category: "account", priority: "normal", subject: "", message: "" });
      }
      if (body.action === "reply") {
        setReply("");
      }
    } catch (err) {
      setError(err.message || "Request failed.");
    } finally {
      setBusy("");
    }
  }

  async function openTicket(id) {
    setError("");
    setNote("");
    setSelectedId(id);
    setMode("thread");
    try {
      await load({ id, status: tab, q: query });
    } catch (err) {
      setError(err.message);
    }
  }

  async function changeTab(next) {
    setTab(next);
    setMode("list");
    setSelectedId(0);
    setError("");
    setNote("");
    try {
      await load({ status: next, id: 0, q: query });
    } catch (err) {
      setError(err.message);
    }
  }

  async function searchTickets(event) {
    event.preventDefault();
    try {
      await load({ status: tab, id: 0, q: query });
      setMode("list");
    } catch (err) {
      setError(err.message);
    }
  }

  const counts = data.counts || EMPTY.counts;
  const tickets = Array.isArray(data.tickets) ? data.tickets : [];
  const selected = data.selected;
  const openShare = counts.all ? Math.round(((counts.open + counts.pending) / counts.all) * 100) : 0;
  const categories = data.categories.length
    ? data.categories
    : [
        { key: "account", label: "Account" },
        { key: "wallet", label: "Wallet" },
        { key: "presale", label: "Presale" },
        { key: "other", label: "Other" },
      ];
  const priorities = data.priorities.length
    ? data.priorities
    : [
        { key: "low", label: "Low" },
        { key: "normal", label: "Normal" },
        { key: "high", label: "High" },
        { key: "urgent", label: "Urgent" },
      ];

  const kpis = useMemo(
    () => [
      { label: "Open", value: counts.open, unit: "new requests", Icon: CircleDot },
      { label: "Waiting", value: counts.pending, unit: isAdmin ? "need a reply" : "with support", Icon: Clock3 },
      { label: "Answered", value: counts.answered, unit: "staff replied", Icon: ShieldCheck },
      { label: "Closed", value: counts.closed, unit: "resolved", Icon: Lock },
    ],
    [counts, isAdmin]
  );

  return (
    <div className={styles.studio}>
      <motion.header className={styles.hero} initial="hidden" animate="show" variants={fadeUp}>
        <div className={styles.scanlines} />
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>
            <Headphones size={12} /> Support desk
          </p>
          <h1>{isAdmin ? "Member tickets" : "Need a hand?"}</h1>
          <p className={styles.lead}>
            {isAdmin
              ? "Triage open cases, reply in-thread, and close when resolved. Waiting tickets need a staff answer."
              : "Open a ticket for wallet, presale, mining, airdrops, or account help. Support replies here — keep Phantom and withdrawals in Wallet."}
          </p>
          <div className={styles.heroActions}>
            {isAdmin ? null : (
              <button
                type="button"
                className={styles.primary}
                onClick={() => {
                  setMode("compose");
                  setSelectedId(0);
                  setError("");
                  setNote("");
                }}
              >
                <MessageSquarePlus size={16} /> New ticket
              </button>
            )}
            <button type="button" className={styles.ghost} onClick={() => changeTab("all")}>
              View all tickets
            </button>
          </div>
        </div>
        <div className={styles.seal}>
          <span className={styles.orbitA} />
          <span className={styles.orbitB} />
          <Ring value={openShare} label="active" sub={`${counts.open + counts.pending} open`} />
        </div>
      </motion.header>

      <section className={styles.kpis}>
        {kpis.map((item) => (
          <article key={item.label}>
            <span className={styles.iconTile}>
              <item.Icon size={16} />
            </span>
            <small>{item.label}</small>
            <b>{item.value}</b>
            <em>{item.unit}</em>
          </article>
        ))}
      </section>

      <nav className={styles.tabs} aria-label="Ticket status">
        {STATUS_TABS.map((item) => {
          const on = tab === item.key;
          const count = item.key === "all" ? counts.all : counts[item.key] || 0;
          return (
            <button
              key={item.key}
              type="button"
              className={on ? styles.tabOn : styles.tab}
              onClick={() => changeTab(item.key)}
            >
              <strong>{item.label}</strong>
              <small>{count}</small>
            </button>
          );
        })}
      </nav>

      {error ? <p className={styles.error}>{error}</p> : null}
      {note ? <p className={styles.ok}>{note}</p> : null}

      <section className={styles.board}>
        <article className={styles.listCard}>
          <form className={styles.search} onSubmit={searchTickets}>
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={isAdmin ? "Search name, email, or WLT-000001" : "Search your tickets"}
            />
            <button type="submit" className={styles.chip}>
              Search
            </button>
          </form>

          <div className={styles.chart}>
            {(data.categoryBars || []).map((row) => (
              <div key={row.key} className={styles.chartRow}>
                <small>{row.label}</small>
                <div className={styles.chartTrack}>
                  <motion.i
                    initial={{ width: 0 }}
                    animate={{ width: `${row.pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                <b>{row.total}</b>
              </div>
            ))}
          </div>

          <ul className={styles.ticketList}>
            {tickets.length ? (
              tickets.map((ticket) => (
                <li key={ticket.id}>
                  <button
                    type="button"
                    className={ticket.id === selectedId ? styles.ticketOn : styles.ticket}
                    onClick={() => openTicket(ticket.id)}
                  >
                    <div className={styles.ticketTop}>
                      <b>{ticket.number}</b>
                      <em className={styles[`st_${ticket.status}`] || styles.st_open}>{ticket.statusLabel}</em>
                    </div>
                    <strong>{ticket.subject}</strong>
                    <p>
                      {ticket.categoryLabel}
                      {isAdmin ? ` · ${ticket.userName}` : ""}
                      {` · ${ticket.priorityLabel}`}
                    </p>
                    <small>{stamp(ticket.lastReplyAt)}</small>
                  </button>
                </li>
              ))
            ) : (
              <li className={styles.empty}>No tickets in this view.</li>
            )}
          </ul>
        </article>

        {mode === "compose" && !isAdmin ? (
          <article className={styles.panel}>
            <div className={styles.cardHead}>
              <div>
                <p className={styles.kicker}>New case</p>
                <h2>Open a ticket</h2>
              </div>
              <Ticket size={18} />
            </div>
            <form
              className={styles.form}
              onSubmit={(event) => {
                event.preventDefault();
                post({ action: "create", ...form });
              }}
            >
              <label>
                <span>Module</span>
                <select
                  value={form.category}
                  onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                >
                  {categories.map((item) => (
                    <option key={item.key} value={item.key}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Priority</span>
                <select
                  value={form.priority}
                  onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
                >
                  {priorities.map((item) => (
                    <option key={item.key} value={item.key}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.span2}>
                <span>Subject</span>
                <input
                  value={form.subject}
                  onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
                  minLength={4}
                  maxLength={160}
                  required
                  placeholder="Short summary"
                />
              </label>
              <label className={styles.span2}>
                <span>Details</span>
                <textarea
                  value={form.message}
                  onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                  minLength={10}
                  maxLength={4000}
                  required
                  rows={8}
                  placeholder="What happened, wallet short address if relevant, and what you already tried."
                />
              </label>
              <div className={styles.actions}>
                <button className={styles.primary} type="submit" disabled={Boolean(busy)}>
                  {busy === "create" ? "Opening..." : "Submit ticket"}
                </button>
              </div>
            </form>
          </article>
        ) : selected ? (
          <article className={styles.panel}>
            <div className={styles.cardHead}>
              <div>
                <p className={styles.kicker}>{selected.number}</p>
                <h2>{selected.subject}</h2>
              </div>
              <LifeBuoy size={18} />
            </div>
            <div className={styles.metaRow}>
              <span>{selected.categoryLabel}</span>
              <span className={styles[`st_${selected.status}`] || styles.st_open}>{selected.statusLabel}</span>
              {isAdmin ? (
                <>
                  <select
                    value={selected.status}
                    disabled={Boolean(busy)}
                    onChange={(event) =>
                      post({ action: "status", ticketId: selected.id, status: event.target.value })
                    }
                  >
                    {(data.statuses.length ? data.statuses : STATUS_TABS.filter((item) => item.key !== "all")).map(
                      (item) => (
                        <option key={item.key} value={item.key}>
                          {item.label}
                        </option>
                      )
                    )}
                  </select>
                  <select
                    value={selected.priority}
                    disabled={Boolean(busy)}
                    onChange={(event) =>
                      post({ action: "priority", ticketId: selected.id, priority: event.target.value })
                    }
                  >
                    {priorities.map((item) => (
                      <option key={item.key} value={item.key}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </>
              ) : (
                <span>{selected.priorityLabel}</span>
              )}
              {isAdmin ? <span>{selected.userName} · {selected.userEmail}</span> : null}
            </div>

            <ol className={styles.thread}>
              {(selected.messages || []).map((item) => (
                <li key={item.id} className={item.author === "admin" ? styles.msgStaff : styles.msgUser}>
                  <div>
                    <b>{item.author === "admin" ? "Support" : item.name}</b>
                    <small>{stamp(item.createdAt)}</small>
                  </div>
                  <p>{item.message}</p>
                </li>
              ))}
            </ol>

            {selected.status === "closed" && !isAdmin ? (
              <button
                type="button"
                className={styles.ghostWide}
                disabled={Boolean(busy)}
                onClick={() => post({ action: "reopen", ticketId: selected.id })}
              >
                <Unlock size={14} /> Reopen ticket
              </button>
            ) : (
              <form
                className={styles.reply}
                onSubmit={(event) => {
                  event.preventDefault();
                  post({ action: "reply", ticketId: selected.id, message: reply });
                }}
              >
                <textarea
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  rows={4}
                  required
                  minLength={2}
                  maxLength={4000}
                  placeholder={isAdmin ? "Reply as support..." : "Add more detail..."}
                />
                <div className={styles.replyBar}>
                  {!isAdmin && selected.status !== "closed" ? (
                    <button
                      type="button"
                      className={styles.ghost}
                      disabled={Boolean(busy)}
                      onClick={() => post({ action: "close", ticketId: selected.id })}
                    >
                      <Lock size={14} /> Close
                    </button>
                  ) : (
                    <span />
                  )}
                  <button className={styles.primary} type="submit" disabled={Boolean(busy) || !reply.trim()}>
                    <SendHorizontal size={14} />
                    {busy === "reply" ? "Sending..." : "Send reply"}
                  </button>
                </div>
              </form>
            )}
          </article>
        ) : (
          <article className={styles.panel}>
            <div className={styles.cardHead}>
              <div>
                <p className={styles.kicker}>Inbox</p>
                <h2>{isAdmin ? "Select a ticket" : "Your cases"}</h2>
              </div>
              <Headphones size={18} />
            </div>
            <p className={styles.lead}>
              {isAdmin
                ? "Pick a case on the left to read the thread and reply."
                : "Choose a ticket to continue the conversation, or open a new one."}
            </p>
            {isAdmin ? null : (
              <button type="button" className={styles.primary} onClick={() => setMode("compose")}>
                <MessageSquarePlus size={16} /> New ticket
              </button>
            )}
          </article>
        )}
      </section>
    </div>
  );
}
