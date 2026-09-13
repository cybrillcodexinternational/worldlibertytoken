"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bell,
  Copy,
  Gift,
  Globe,
  KeyRound,
  Languages,
  Lock,
  LogOut,
  Monitor,
  Pickaxe,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import LogoutButton from "../auth/LogoutButton";
import styles from "./settings.module.css";

const TABS = [
  { key: "profile", label: "Profile", hint: "Name & email", Icon: UserRound },
  { key: "security", label: "Security", hint: "Password & sessions", Icon: ShieldCheck },
  { key: "wallet", label: "Wallet", hint: "Phantom link", Icon: Wallet },
  { key: "notifications", label: "Alerts", hint: "Email modules", Icon: Bell },
  { key: "preferences", label: "Display", hint: "Language & region", Icon: Languages },
  { key: "referral", label: "Referral", hint: "Your invite code", Icon: Users },
  { key: "account", label: "Account", hint: "Role & sign out", Icon: Settings },
];

const EMPTY = {
  languages: ["en"],
  currencies: ["USD"],
  timezones: ["UTC"],
  profile: { fullName: "", email: "", role: "user", createdAt: null, initial: "U" },
  wallet: { connected: false, address: "", short: "Not connected" },
  referral: { code: "", path: "/register" },
  notifications: {
    email: true,
    mining: true,
    airdrop: true,
    presale: true,
    referral: true,
    rewards: true,
    marketing: false,
  },
  preferences: { language: "en", currency: "USD", timezone: "UTC" },
  sessions: [],
  account: { role: "user", memberSince: null, presaleUsd: 0 },
};

const NOTIFY = [
  { key: "email", label: "Account email", copy: "Security and profile notices.", Icon: UserRound },
  { key: "mining", label: "Mining cycles", copy: "Start and completion alerts.", Icon: Pickaxe },
  { key: "airdrop", label: "Saturday airdrops", copy: "When a drop is released to Wallet.", Icon: Sparkles },
  { key: "presale", label: "Presale desk", copy: "Purchase confirmations and qualify updates.", Icon: ShoppingBag },
  { key: "referral", label: "Network", copy: "New members and USD commission credits.", Icon: Users },
  { key: "rewards", label: "Scratch & Win", copy: "Daily ticket reminders.", Icon: Gift },
  { key: "marketing", label: "Product news", copy: "Occasional WLT announcements.", Icon: Bell },
];

const LANG_LABEL = { en: "English", es: "Español", fr: "Français", de: "Deutsch", ar: "العربية" };

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

function getPhantom() {
  if (typeof window === "undefined") {
    return null;
  }
  const provider = window.phantom?.solana || window.solana;
  return provider?.isPhantom ? provider : null;
}

async function connectPhantom() {
  const provider = getPhantom();
  if (!provider) {
    window.open("https://phantom.app/download", "_blank", "noopener,noreferrer");
    throw new Error("Install Phantom Wallet, then connect to continue.");
  }
  const session = await provider.connect();
  const address = session.publicKey?.toString?.() || provider.publicKey?.toString?.();
  if (!address) {
    throw new Error("Phantom did not return a wallet address.");
  }
  return address;
}

function stamp(value) {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}

function money(value) {
  return `$${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function SettingsStudio({ panel = "user" }) {
  const router = useRouter();
  const [tab, setTab] = useState("profile");
  const [data, setData] = useState(EMPTY);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);

  function applyStatus(payload) {
    setData({ ...EMPTY, ...payload });
    setFullName(payload.profile?.fullName || "");
    setEmail(payload.profile?.email || "");
  }

  async function load() {
    const response = await fetch("/api/settings/status", { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.message || "Could not load settings.");
    }
    applyStatus(payload);
    return payload;
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  async function post(action, extra = {}) {
    setError("");
    setNote("");
    setBusy(action);
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || "Update failed.");
      }
      applyStatus(payload);
      setNote(payload.message || "Saved.");
      if (action === "profile") {
        router.refresh();
      }
      if (action === "password") {
        setCurrentPassword("");
        setNextPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setError(err.message || "Update failed.");
    } finally {
      setBusy("");
    }
  }

  async function saveProfile(event) {
    event.preventDefault();
    await post("profile", { fullName, email });
  }

  async function savePassword(event) {
    event.preventDefault();
    if (nextPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    await post("password", { currentPassword, nextPassword });
  }

  async function connectWallet() {
    setError("");
    setNote("");
    setBusy("wallet");
    try {
      const address = await connectPhantom();
      await post("wallet", { address });
    } catch (err) {
      setError(err.message || "Wallet connect failed.");
      setBusy("");
    }
  }

  async function copyReferral() {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}${data.referral.path || "/register"}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setError("Could not copy referral link.");
    }
  }

  const walletHref = panel === "admin" ? "/admin/wallet" : "/user/wallet";
  const referralHref = panel === "admin" ? "/admin/referral" : "/user/referral";
  const active = TABS.find((item) => item.key === tab) || TABS[0];
  const sessions = Array.isArray(data.sessions) ? data.sessions : [];
  const referralUrl = useMemo(() => data.referral.path || "/register", [data.referral.path]);

  return (
    <div className={styles.studio}>
      <motion.header className={styles.hero} initial="hidden" animate="show" variants={fadeUp}>
        <div className={styles.scanlines} />
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>
            <Settings size={12} /> Control room
          </p>
          <h1>Your account settings</h1>
          <p className={styles.lead}>
            Profile, security, Phantom, alerts, and display live in one desk. Wallet withdrawals stay in Wallet.
            Tokens remain locked until trade.
          </p>
        </div>
        <div className={styles.identity}>
          <span>{data.profile.initial}</span>
          <div>
            <b>{data.profile.fullName || "User"}</b>
            <small>{data.profile.email || "—"}</small>
            <em>{data.profile.role === "admin" ? "Administrator" : "Verified user"}</em>
          </div>
        </div>
      </motion.header>

      <nav className={styles.tabs} aria-label="Settings modules">
        {TABS.map((item) => {
          const on = tab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              className={on ? styles.tabOn : styles.tab}
              onClick={() => {
                setTab(item.key);
                setError("");
                setNote("");
              }}
            >
              <item.Icon size={16} />
              <strong>{item.label}</strong>
              <small>{item.hint}</small>
            </button>
          );
        })}
      </nav>

      {error ? <p className={styles.error}>{error}</p> : null}
      {note ? <p className={styles.ok}>{note}</p> : null}

      {tab === "profile" ? (
        <section className={styles.panel}>
          <div className={styles.cardHead}>
            <div>
              <p className={styles.kicker}>Profile</p>
              <h2>Name & contact</h2>
            </div>
            <active.Icon size={18} />
          </div>
          <form className={styles.form} onSubmit={saveProfile}>
            <label>
              <span>Full name</span>
              <input value={fullName} onChange={(event) => setFullName(event.target.value)} required />
            </label>
            <label>
              <span>Email</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
            <div className={styles.actions}>
              <button className={styles.primary} type="submit" disabled={Boolean(busy)}>
                {busy === "profile" ? "Saving..." : "Save profile"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {tab === "security" ? (
        <section className={styles.split}>
          <article className={styles.panel}>
            <div className={styles.cardHead}>
              <div>
                <p className={styles.kicker}>Password</p>
                <h2>Change password</h2>
              </div>
              <KeyRound size={18} />
            </div>
            <form className={styles.formCol} onSubmit={savePassword}>
              <label>
                <span>Current password</span>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  required
                />
              </label>
              <label>
                <span>New password</span>
                <input
                  type="password"
                  minLength={8}
                  value={nextPassword}
                  onChange={(event) => setNextPassword(event.target.value)}
                  required
                />
              </label>
              <label>
                <span>Confirm new password</span>
                <input
                  type="password"
                  minLength={8}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </label>
              <button className={styles.primary} type="submit" disabled={Boolean(busy)}>
                {busy === "password" ? "Updating..." : "Update password"}
              </button>
            </form>
          </article>
          <article className={styles.panel}>
            <div className={styles.cardHead}>
              <div>
                <p className={styles.kicker}>Sessions</p>
                <h2>Signed-in devices</h2>
              </div>
              <Monitor size={18} />
            </div>
            <ul className={styles.sessionList}>
              {sessions.map((row) => (
                <li key={row.id}>
                  <div>
                    <b>{row.current ? "This browser" : "Other session"}</b>
                    <small>Started {stamp(row.createdAt)}</small>
                    <small>Expires {stamp(row.expiresAt)}</small>
                  </div>
                  {row.current ? (
                    <em>Active</em>
                  ) : (
                    <button
                      type="button"
                      className={styles.ghost}
                      disabled={Boolean(busy)}
                      onClick={() => post("revoke-session", { sessionId: row.id })}
                    >
                      Revoke
                    </button>
                  )}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className={styles.ghostWide}
              disabled={Boolean(busy) || sessions.length < 2}
              onClick={() => post("revoke-others")}
            >
              Sign out other sessions
            </button>
          </article>
        </section>
      ) : null}

      {tab === "wallet" ? (
        <section className={styles.panel}>
          <div className={styles.cardHead}>
            <div>
              <p className={styles.kicker}>Settlement wallet</p>
              <h2>Phantom</h2>
            </div>
            <Wallet size={18} />
          </div>
          <div className={styles.walletBox}>
            <span className={styles.iconTile}>
              <Wallet size={16} />
            </span>
            <div>
              <small>Linked address</small>
              <b>{data.wallet.connected ? data.wallet.short : "Not connected"}</b>
              {data.wallet.connected ? <em>{data.wallet.address}</em> : null}
            </div>
            <button className={styles.primary} type="button" onClick={connectWallet} disabled={Boolean(busy)}>
              {busy === "wallet" ? "Connecting..." : data.wallet.connected ? "Reconnect" : "Connect Phantom"}
            </button>
          </div>
          <p className={styles.note}>
            One Phantom per account. Presale, airdrop, and USD commission withdraw from Wallet using this address.
          </p>
          <Link className={styles.ghost} href={walletHref}>
            Open Wallet desk
          </Link>
        </section>
      ) : null}

      {tab === "notifications" ? (
        <section className={styles.panel}>
          <div className={styles.cardHead}>
            <div>
              <p className={styles.kicker}>Alerts</p>
              <h2>Module notifications</h2>
            </div>
            <Bell size={18} />
          </div>
          <ul className={styles.toggleList}>
            {NOTIFY.map((item) => {
              const on = Boolean(data.notifications[item.key]);
              return (
                <li key={item.key}>
                  <span className={styles.iconSoft}>
                    <item.Icon size={16} />
                  </span>
                  <div>
                    <b>{item.label}</b>
                    <small>{item.copy}</small>
                  </div>
                  <button
                    type="button"
                    className={on ? styles.switchOn : styles.switch}
                    aria-pressed={on}
                    disabled={Boolean(busy)}
                    onClick={() =>
                      post("notifications", {
                        ...data.notifications,
                        [item.key]: !on,
                      })
                    }
                  >
                    <i />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {tab === "preferences" ? (
        <section className={styles.panel}>
          <div className={styles.cardHead}>
            <div>
              <p className={styles.kicker}>Display</p>
              <h2>Language & region</h2>
            </div>
            <Globe size={18} />
          </div>
          <form
            className={styles.form}
            onSubmit={(event) => {
              event.preventDefault();
              post("preferences", data.preferences);
            }}
          >
            <label>
              <span>Language</span>
              <select
                value={data.preferences.language}
                onChange={(event) =>
                  setData((current) => ({
                    ...current,
                    preferences: { ...current.preferences, language: event.target.value },
                  }))
                }
              >
                {(data.languages || ["en"]).map((code) => (
                  <option key={code} value={code}>
                    {LANG_LABEL[code] || code}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Display currency</span>
              <select
                value={data.preferences.currency}
                onChange={(event) =>
                  setData((current) => ({
                    ...current,
                    preferences: { ...current.preferences, currency: event.target.value },
                  }))
                }
              >
                {(data.currencies || ["USD"]).map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.span2}>
              <span>Timezone</span>
              <select
                value={data.preferences.timezone}
                onChange={(event) =>
                  setData((current) => ({
                    ...current,
                    preferences: { ...current.preferences, timezone: event.target.value },
                  }))
                }
              >
                {(data.timezones || ["UTC"]).map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </select>
            </label>
            <div className={styles.actions}>
              <button className={styles.primary} type="submit" disabled={Boolean(busy)}>
                {busy === "preferences" ? "Saving..." : "Save display"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {tab === "referral" ? (
        <section className={styles.panel}>
          <div className={styles.cardHead}>
            <div>
              <p className={styles.kicker}>Invite identity</p>
              <h2>Your referral code</h2>
            </div>
            <Users size={18} />
          </div>
          <div className={styles.codeBox}>
            <small>Code</small>
            <b>{data.referral.code || "—"}</b>
            <button type="button" className={styles.ghost} onClick={copyReferral}>
              <Copy size={14} /> {copied ? "Copied" : "Copy link"}
            </button>
          </div>
          <p className={styles.note}>
            Share {referralUrl}. Mining pays 10/5/3 WLT locked. Qualified $1,000 presale unlocks 5% USD commission.
          </p>
          <Link className={styles.ghost} href={referralHref}>
            Open referral desk
          </Link>
        </section>
      ) : null}

      {tab === "account" ? (
        <section className={styles.panel}>
          <div className={styles.cardHead}>
            <div>
              <p className={styles.kicker}>Account</p>
              <h2>Status & sign out</h2>
            </div>
            <Lock size={18} />
          </div>
          <ul className={styles.meta}>
            <li>
              <small>Role</small>
              <b>{data.account.role === "admin" ? "Administrator" : "User"}</b>
            </li>
            <li>
              <small>Member since</small>
              <b>{stamp(data.account.memberSince)}</b>
            </li>
            <li>
              <small>Confirmed presale</small>
              <b>{money(data.account.presaleUsd)}</b>
            </li>
          </ul>
          <div className={styles.signOut}>
            <LogOut size={16} />
            <div>
              <b>Leave this session</b>
              <small>Returns you to the login screen.</small>
            </div>
            <LogoutButton className={styles.primary} />
          </div>
        </section>
      ) : null}
    </div>
  );
}
