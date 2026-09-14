"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Ban,
  ChevronLeft,
  ChevronRight,
  KeyRound,
  RotateCcw,
  Search,
  Shield,
  ShieldOff,
  Trash2,
  UserRound,
  Users,
  WandSparkles,
} from "lucide-react";
import styles from "./users.module.css";

const EMPTY = {
  users: [],
  stats: { total: 0, admins: 0, blocked: 0, active: 0 },
  page: 1,
  pages: 1,
  total: 0,
};

function stamp(value) {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

function money(value) {
  return `$${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function UsersStudio() {
  const router = useRouter();
  const [data, setData] = useState(EMPTY);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [role, setRole] = useState("all");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState("");
  const [selectedId, setSelectedId] = useState(0);
  const [tempPassword, setTempPassword] = useState("");
  const [confirm, setConfirm] = useState(null);

  async function load(nextPage = page) {
    const params = new URLSearchParams({
      q,
      status,
      role,
      page: String(nextPage),
    });
    const response = await fetch(`/api/admin/users?${params}`, { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.message || "Could not load users.");
      return;
    }
    setError("");
    setData(payload);
    setPage(payload.page || 1);
    if (payload.users?.length) {
      setSelectedId((current) =>
        payload.users.some((row) => row.id === current) ? current : payload.users[0].id
      );
    }
  }

  useEffect(() => {
    load(1).catch(() => setError("Could not load users."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, role]);

  const selected = useMemo(
    () => data.users.find((row) => row.id === selectedId) || data.users[0] || null,
    [data.users, selectedId]
  );

  async function run(action, extra = {}) {
    if (!selected) {
      return;
    }
    setBusy(action);
    setError("");
    setNote("");
    setTempPassword("");
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, userId: selected.id, ...extra }),
      });
      const payload = await response.json();
      if (!response.ok || payload.ok === false) {
        setError(payload.message || "Action failed.");
        return;
      }
      if (action === "impersonate") {
        router.push(payload.redirectTo || "/user");
        router.refresh();
        return;
      }
      setNote(payload.message || "Done.");
      if (payload.password) {
        setTempPassword(payload.password);
      }
      await load(page);
    } catch {
      setError("Action failed.");
    } finally {
      setBusy("");
      setConfirm(null);
    }
  }

  function ask(action, title, copy) {
    setConfirm({ action, title, copy });
  }

  return (
    <div className={styles.studio}>
      <section className={styles.hero}>
        <div>
          <p className={styles.kicker}>
            <Users size={12} />
            Admin control
          </p>
          <h1>Registered users</h1>
          <p className={styles.lead}>
            Search accounts, impersonate a member, block access, reset passwords, wipe balances, or delete.
          </p>
        </div>
      </section>

      <section className={styles.kpis}>
        <article>
          <small>Total</small>
          <b>{data.stats.total}</b>
        </article>
        <article>
          <small>Active</small>
          <b>{data.stats.active}</b>
        </article>
        <article>
          <small>Blocked</small>
          <b>{data.stats.blocked}</b>
        </article>
        <article>
          <small>Admins</small>
          <b>{data.stats.admins}</b>
        </article>
      </section>

      {error ? <p className={styles.error}>{error}</p> : null}
      {note ? <p className={styles.note}>{note}</p> : null}
      {tempPassword ? (
        <p className={styles.password}>
          Temporary password: <b>{tempPassword}</b>
        </p>
      ) : null}

      <div className={styles.split}>
        <section className={styles.board}>
          <div className={styles.boardHead}>
            <label className={styles.search}>
              <Search size={14} />
              <input
                value={q}
                onChange={(event) => setQ(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    load(1);
                  }
                }}
                placeholder="Name, email, referral"
              />
            </label>
            <select className={styles.filter} value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
            <select className={styles.filter} value={role} onChange={(event) => setRole(event.target.value)}>
              <option value="all">All roles</option>
              <option value="user">Users</option>
              <option value="admin">Admins</option>
            </select>
            <button className={styles.ghost} type="button" onClick={() => load(1)}>
              Search
            </button>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Presale</th>
                  <th>WLT</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((row) => (
                  <tr
                    key={row.id}
                    className={row.id === selected?.id ? styles.rowOn : styles.row}
                    onClick={() => setSelectedId(row.id)}
                  >
                    <td>
                      <span className={styles.asset}>
                        <i>{(row.fullName || "U").charAt(0).toUpperCase()}</i>
                        <span>
                          <b>{row.fullName}</b>
                          <small>{row.email}</small>
                        </span>
                      </span>
                    </td>
                    <td>{row.role}</td>
                    <td className={row.status === "blocked" ? styles.down : styles.up}>{row.status}</td>
                    <td>{money(row.presaleUsd)}</td>
                    <td>{Number(row.wltBalance || 0).toFixed(4)}</td>
                    <td>{stamp(row.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.pager}>
            <button type="button" disabled={page <= 1} onClick={() => load(page - 1)}>
              <ChevronLeft size={14} />
            </button>
            <span>
              {page} / {data.pages}
            </span>
            <button type="button" disabled={page >= data.pages} onClick={() => load(page + 1)}>
              <ChevronRight size={14} />
            </button>
          </div>
        </section>

        <section className={styles.detail}>
          {selected ? (
            <>
              <div className={styles.pair}>
                <i>{selected.fullName.charAt(0).toUpperCase()}</i>
                <div>
                  <p className={styles.kicker}>
                    <UserRound size={12} />
                    Account #{selected.id}
                  </p>
                  <h2>{selected.fullName}</h2>
                  <small>{selected.email}</small>
                </div>
              </div>

              <ul className={styles.stats}>
                <li>
                  <small>Role</small>
                  <b>{selected.role}</b>
                </li>
                <li>
                  <small>Status</small>
                  <b className={selected.status === "blocked" ? styles.down : styles.up}>{selected.status}</b>
                </li>
                <li>
                  <small>Sessions</small>
                  <b>{selected.sessions}</b>
                </li>
                <li>
                  <small>Referral</small>
                  <b>{selected.referralCode || "—"}</b>
                </li>
                <li>
                  <small>Wallet</small>
                  <b>{selected.walletShort || "Not linked"}</b>
                </li>
                <li>
                  <small>Commission</small>
                  <b>{money(selected.commission)}</b>
                </li>
              </ul>

              {selected.blockedReason ? <p className={styles.reason}>{selected.blockedReason}</p> : null}

              <div className={styles.actions}>
                {selected.role !== "admin" ? (
                  <button type="button" disabled={Boolean(busy)} onClick={() => run("impersonate")}>
                    <WandSparkles size={14} />
                    Impersonate
                  </button>
                ) : null}
                {selected.role !== "admin" && selected.status === "blocked" ? (
                  <button type="button" disabled={Boolean(busy)} onClick={() => run("unblock")}>
                    <Shield size={14} />
                    Unblock
                  </button>
                ) : null}
                {selected.role !== "admin" && selected.status !== "blocked" ? (
                  <button
                    type="button"
                    disabled={Boolean(busy)}
                    onClick={() => ask("block", "Block user", "They will be signed out and cannot log in.")}
                  >
                    <Ban size={14} />
                    Block
                  </button>
                ) : null}
                <button type="button" disabled={Boolean(busy)} onClick={() => run("resetPassword")}>
                  <KeyRound size={14} />
                  Reset password
                </button>
                <button type="button" disabled={Boolean(busy)} onClick={() => run("revokeSessions")}>
                  <ShieldOff size={14} />
                  Force logout
                </button>
                {selected.role !== "admin" ? (
                  <button
                    type="button"
                    disabled={Boolean(busy)}
                    onClick={() =>
                      ask("resetAccount", "Reset account", "Balances, wallet, mining, airdrop, and presale history will be cleared. Login stays.")
                    }
                  >
                    <RotateCcw size={14} />
                    Reset account
                  </button>
                ) : null}
                {selected.role !== "admin" ? (
                  <button
                    type="button"
                    className={styles.danger}
                    disabled={Boolean(busy)}
                    onClick={() => ask("delete", "Delete user", "This permanently removes the account.")}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={Boolean(busy)}
                  onClick={() => run("setRole", { role: selected.role === "admin" ? "user" : "admin" })}
                >
                  {selected.role === "admin" ? "Demote to user" : "Promote to admin"}
                </button>
              </div>
            </>
          ) : (
            <p className={styles.empty}>No users match this filter.</p>
          )}
        </section>
      </div>

      {confirm ? (
        <div className={styles.modal}>
          <div className={styles.modalCard}>
            <h3>{confirm.title}</h3>
            <p>{confirm.copy}</p>
            <div className={styles.modalRow}>
              <button type="button" onClick={() => setConfirm(null)}>
                Cancel
              </button>
              <button type="button" className={styles.danger} onClick={() => run(confirm.action)}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
