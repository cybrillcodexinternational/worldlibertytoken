"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowDownToLine,
  ArrowRight,
  BadgeCheck,
  Banknote,
  ChevronRight,
  Clock3,
  Coins,
  Gift,
  Info,
  LayoutDashboard,
  Lock,
  Pickaxe,
  Receipt,
  ShieldCheck,
  ShoppingBag,
  Users,
  Vault,
  Wallet,
} from "lucide-react";
import styles from "./wallet.module.css";

const EMPTY = {
  lock: { minedLocked: true, tokensLocked: true, presaleLocked: true, message: "WLT is locked until trade opens." },
  wallet: { connected: false, address: "", short: "" },
  investor: { label: "Mining User", eligiblePresaleReferral: false },
  balances: {
    totalWlt: 0,
    ledger: 0,
    lockedWlt: 0,
    mined: 0,
    scratch: 0,
    miningReferral: 0,
    presale: 0,
    presaleUsd: 0,
    usdcAvailable: 0,
  },
  mining: { cycles: 0, live: false, session: null },
  rewards: { plays: 0, lifetime: 0 },
  referral: {
    code: "",
    counts: { total: 0 },
    earnings: { total: 0, today: 0, byLevel: [] },
    levels: [],
  },
  presale: {
    stage: "Presale Stage 1",
    price: 0.5,
    qualify: { current: 0, target: 1000, remaining: 1000, progress: 0, unlocked: false },
    commission: { earned: 0, available: 0, withdrawn: 0, pending: 0 },
    stablecoin: "SOL",
  },
  activity: [],
};

function getPhantom() {
  if (typeof window === "undefined") {
    return null;
  }
  const provider = window.phantom?.solana || window.solana;
  return provider?.isPhantom ? provider : null;
}

function toBase64(bytes) {
  const raw = bytes instanceof Uint8Array ? bytes : Uint8Array.from(bytes || []);
  let binary = "";
  raw.forEach((value) => {
    binary += String.fromCharCode(value);
  });
  return btoa(binary);
}

async function connectAndSign(message) {
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
  let signature = "";
  if (provider.signMessage) {
    const encoded = new TextEncoder().encode(message);
    const signed = await provider.signMessage(encoded, "utf8");
    signature = toBase64(signed.signature || signed);
  }
  return { address, signature };
}

function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function tokens(value) {
  return `${Number(value || 0).toFixed(7)} WLT`;
}

function when(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}

export default function WalletStudio({ panel = "user", defaultTab = "overview" }) {
  const [data, setData] = useState(EMPTY);
  const [tab, setTab] = useState(defaultTab);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  const presaleHref = panel === "admin" ? "/admin/presale" : "/user/presale";
  const referralHref = panel === "admin" ? "/admin/referral" : "/user/referral";
  const miningHref = panel === "admin" ? "/admin/mining" : "/user/mining";

  async function load() {
    const response = await fetch("/api/wallet/status", { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.message || "Could not load wallet.");
    }
    setData({ ...EMPTY, ...payload, balances: { ...EMPTY.balances, ...(payload.balances || {}) } });
    return payload;
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  const locked = Boolean(data.lock?.tokensLocked ?? data.lock?.minedLocked);
  const qualified = Boolean(data.presale?.qualify?.unlocked);
  const totalWlt = Number(data.balances.totalWlt || 0);
  const lockedShare = totalWlt > 0 ? Math.round((Number(data.balances.lockedWlt || 0) / totalWlt) * 100) : 0;
  const openShare = 100 - lockedShare;
  const usdValue = locked
    ? Number(data.balances.presaleUsd || 0)
    : totalWlt * Number(data.presale.price || 0.5);

  const holdings = useMemo(() => {
    const rows = [
      {
        key: "mined",
        label: "Mined WLT",
        value: Number(data.balances.mined || 0),
        note: locked ? "Locked until trade opens" : "Available",
        Icon: Pickaxe,
        lock: locked,
        tone: "#c9f53a",
      },
      {
        key: "presale",
        label: "Presale WLT",
        value: Number(data.balances.presale || 0),
        note: locked ? `Locked until trade · ${money(data.balances.presaleUsd)} at $0.50` : `${money(data.balances.presaleUsd)} at $0.50`,
        Icon: ShoppingBag,
        lock: locked,
        tone: "#8fa53a",
      },
      {
        key: "referral",
        label: "Mining referral",
        value: Number(data.balances.miningReferral || 0),
        note: "Pool-funded 10 / 5 / 3",
        Icon: Users,
        lock: locked,
        tone: "#d7ff5c",
      },
      {
        key: "scratch",
        label: "Scratch & Win",
        value: Number(data.balances.scratch || 0),
        note: `${data.rewards?.plays || 0} plays`,
        Icon: Gift,
        lock: locked,
        tone: "#6d7a2a",
      },
    ];
    const sum = rows.reduce((acc, row) => acc + row.value, 0) || 1;
    return rows.map((row) => ({ ...row, pct: Math.max(2, Math.round((row.value / sum) * 100)) }));
  }, [data, locked]);

  async function connectWallet() {
    setError("");
    setNote("");
    setBusy("wallet");
    try {
      const signed = await connectAndSign("Connect Phantom to World Liberty Token wallet.");
      const response = await fetch("/api/presale/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: signed.address }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || "Wallet connect failed.");
      }
      await load();
      setNote("Phantom wallet connected.");
    } catch (err) {
      setError(err.message || "Wallet connect failed.");
    } finally {
      setBusy("");
    }
  }

  async function withdraw() {
    setError("");
    setNote("");
    setBusy("withdraw");
    try {
      const amount = Number(withdrawAmount || data.presale.commission.available);
      const signed = await connectAndSign(
        `Withdraw ${money(amount)} WLT referral commission as SOL to Phantom.`
      );
      const response = await fetch("/api/presale/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          walletAddress: signed.address,
          signature: signed.signature,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || "Withdrawal failed.");
      }
      setWithdrawAmount("");
      await load();
      setNote("Commission sent to your Phantom wallet as SOL.");
    } catch (err) {
      setError(err.message || "Withdrawal failed.");
    } finally {
      setBusy("");
    }
  }

  const tabs = [
    { id: "overview", label: "Overview", Icon: LayoutDashboard },
    { id: "income", label: "Income", Icon: Banknote },
    { id: "activity", label: "Transactions", Icon: Receipt },
  ];

  return (
    <div className={styles.studio}>
      <motion.section className={styles.hero} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className={styles.globe} aria-hidden="true" />
        <aside className={`${styles.totalCard} ${styles.heroTotalCard}`}>
          <small>
            Total WLT <Info size={12} />
          </small>
          <strong>{totalWlt.toFixed(7)}</strong>
          <em>≈ {money(usdValue)} USD</em>
          <span>Ledger: {Number(data.balances.ledger || 0).toFixed(7)}</span>
          <div className={styles.usdcRow}>
            <span className={styles.coin} />
            <b>{money(data.presale.commission.available)}</b>
            <i>SOL available</i>
          </div>
        </aside>

        <div className={styles.heroMain}>
          <div className={styles.vaultCol}>
            <div className={styles.reactor}>
              <div className={`${styles.ring} ${styles.ringA}`} />
              <div className={`${styles.ring} ${styles.ringB}`} />
              <div className={`${styles.ring} ${styles.ringC}`} />
              <div className={styles.beam} />
              <div className={styles.core}>
                <Vault size={28} strokeWidth={1.6} />
              </div>
              <div className={styles.pickOrbit}>
                <i />
              </div>
            </div>
            <div className={styles.lockMeter}>
              <span style={{ width: `${Math.max(8, lockedShare)}%` }} />
            </div>
            <div className={styles.meterLabels}>
              <small>
                <Lock size={11} /> {lockedShare}% locked
              </small>
              <small>{openShare}% tradable</small>
            </div>
          </div>

          <div className={styles.heroCopy}>
            <p className={styles.kicker}>
              <ShieldCheck size={12} /> Custody desk
            </p>
            <h1>Your WLT Vault</h1>
            <p className={styles.lead}>
              Phantom settles purchases and withdrawals in SOL. Mined, scratch, mining-referral, and
              presale WLT stay locked until trade opens. Only SOL commission can leave the vault.
            </p>

            <div className={styles.statusGrid}>
              <button className={`${styles.statusCard} ${styles.statusCardInvestor}`} type="button" onClick={connectWallet}>
                <span className={styles.iconTile}>
                  <Wallet size={16} />
                </span>
                <div>
                  <small>Phantom</small>
                  <b>{data.wallet.connected ? data.wallet.short : "Not connected"}</b>
                </div>
                <ChevronRight size={14} />
              </button>
              <article className={`${styles.statusCard} ${styles.statusCardPhantom}`}>
                <span className={styles.iconTile}>
                  {qualified ? <BadgeCheck size={16} /> : <ShieldCheck size={16} />}
                </span>
                <div>
                  <small>Investor class</small>
                  <b>{data.investor?.label || "Mining User"}</b>
                </div>
              </article>
              <article className={styles.statusCard}>
                <span className={styles.iconTile}>
                  <Lock size={16} />
                </span>
                <div>
                  <small>Trade window</small>
                  <b>{locked ? "Closed" : "Open"}</b>
                </div>
              </article>
            </div>

            <div className={styles.actions}>
              <button className={styles.connectPhantomButton} type="button" onClick={connectWallet} disabled={Boolean(busy)}>
                <Wallet size={16} />
                {busy === "wallet"
                  ? "Connecting..."
                  : data.wallet.connected
                    ? "Reconnect Phantom"
                    : "Connect Phantom Wallet"}
              </button>
              <Link className={styles.referralStyleButton} href={presaleHref}>
                <ShoppingBag size={15} />
                <span>Buy Presale</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>

      </motion.section>

      {error ? <p className={styles.error}>{error}</p> : null}
      {note ? <p className={styles.ok}>{note}</p> : null}

      <nav className={styles.tabs}>
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            className={tab === item.id ? styles.tabOn : styles.tab}
            onClick={() => setTab(item.id)}
          >
            <item.Icon size={15} />
            {item.label}
          </button>
        ))}
      </nav>

      {tab === "overview" ? (
        <section className={styles.mixCard}>
          <div className={styles.cardHead}>
            <div>
              <p className={styles.kicker}>
                <Coins size={12} /> Token mix
              </p>
              <h2>How this vault is built</h2>
              <p className={styles.lead}>
                Your WLT comes from multiple sources. Each serves a different purpose and unlocks at the right time.
              </p>
            </div>
            <p className={styles.sideNote}>
              Same people.
              <span>Bigger tomorrow.</span>
            </p>
          </div>

          <div className={styles.mixTrack}>
            <div className={styles.mixBar}>
              {holdings.map((item) => (
                <span key={item.key} style={{ width: `${item.pct}%`, background: item.tone }} title={item.label} />
              ))}
            </div>
            <button type="button" className={styles.viewLink} onClick={() => setTab("activity")}>
              View details <ArrowRight size={14} />
            </button>
          </div>

          <div className={styles.holdings}>
            {holdings.map((item) => (
              <article key={item.key} className={styles.holding}>
                <div className={styles.holdingHead}>
                  <span className={styles.iconTile}>
                    <item.Icon size={16} />
                  </span>
                  {item.lock ? (
                    <span className={styles.lockPill}>
                      <Lock size={11} /> Locked
                    </span>
                  ) : (
                    <span className={styles.openPill}>
                      <ShoppingBag size={11} /> Available
                    </span>
                  )}
                </div>
                <small>{item.label}</small>
                <b>{item.value.toFixed(7)}</b>
                <em>WLT</em>
                <p>{item.note}</p>
              </article>
            ))}
          </div>

          <div className={styles.flow}>
            <Link className={styles.flowItem} href={miningHref}>
              <span className={styles.iconTile}>
                <Clock3 size={16} />
              </span>
              <div>
                <b>Mine 24h</b>
                <small>Locked</small>
              </div>
              <strong>2.8756990 WLT</strong>
              <ChevronRight size={16} />
            </Link>
            <Link className={styles.flowItem} href={presaleHref}>
              <span className={styles.iconTile}>
                <ShoppingBag size={16} />
              </span>
              <div>
                <b>Buy presale</b>
                <small>{locked ? "Locked until trade" : "Allocation"}</small>
              </div>
              <strong>$0.50</strong>
              <ChevronRight size={16} />
            </Link>
            <Link className={styles.flowItem} href={referralHref}>
              <span className={styles.iconTile}>
                <Users size={16} />
              </span>
              <div>
                <b>Refer miners</b>
                <small>Pool funded</small>
              </div>
              <strong>10 / 5 / 3 WLT</strong>
              <ChevronRight size={16} />
            </Link>
            <button type="button" className={styles.flowItem} onClick={() => setTab("income")}>
              <span className={styles.iconTile}>
                <Banknote size={16} />
              </span>
              <div>
                <b>Earn SOL</b>
                <small>After $1,000</small>
              </div>
              <strong>5%</strong>
              <ChevronRight size={16} />
            </button>
          </div>

          <section className={styles.noteRow}>
            <p>
              <Lock size={14} /> {data.lock?.message || "WLT is locked. Withdraw and send stay closed until trade opens."}
            </p>
            <div className={styles.actions}>
              <Link className={styles.noteActionPrimary} href={miningHref}>
                <Coins size={14} /> Open mining <ArrowRight size={14} />
              </Link>
              <Link className={styles.noteActionSecondary} href={referralHref}>
                <Users size={14} /> Referral network <ArrowRight size={14} />
              </Link>
            </div>
          </section>
        </section>
      ) : null}

      {tab === "income" ? (
        <section className={styles.desk}>
          <article className={styles.card}>
            <div className={styles.cardHead}>
              <div>
                <p className={styles.kicker}>
                  <Pickaxe size={12} /> Mining economy
                </p>
                <h2>WLT referral income</h2>
              </div>
              <Lock size={16} />
            </div>
            <p className={styles.copy}>
              10% / 5% / 3% from completed mines, paid from the referral pool. Miner keeps 100%.
              These tokens stay locked with mined WLT.
            </p>
            <ul className={styles.levelList}>
              {(data.referral.earnings?.byLevel || []).map((tier) => (
                <li key={tier.level}>
                  <span>Level {tier.level}</span>
                  <b>{tokens(tier.total)}</b>
                </li>
              ))}
            </ul>
            <dl className={styles.quote}>
              <div>
                <dt>Lifetime</dt>
                <dd>{tokens(data.referral.earnings?.total)}</dd>
              </div>
              <div>
                <dt>Today</dt>
                <dd>{tokens(data.referral.earnings?.today)}</dd>
              </div>
              <div>
                <dt>Network</dt>
                <dd>{data.referral.counts?.total || 0} members</dd>
              </div>
            </dl>
          </article>

          <article className={styles.card}>
            <div className={styles.cardHead}>
              <div>
                <p className={styles.kicker}>
                  <Banknote size={12} /> Presale economy
                </p>
                <h2>SOL commission</h2>
              </div>
              <Wallet size={16} />
            </div>
            <p className={styles.copy}>
              {qualified
                ? "Qualified. Direct referred buys pay 5% in SOL to Phantom."
                : `Buy ${money(data.presale.qualify?.remaining)} more in presale to unlock 5% SOL.`}
            </p>
            <ul className={styles.miniStats}>
              <li>
                <span>Earned</span>
                <b>{money(data.presale.commission.earned)}</b>
              </li>
              <li>
                <span>Available</span>
                <b>{money(data.presale.commission.available)}</b>
              </li>
              <li>
                <span>Withdrawn</span>
                <b>{money(data.presale.commission.withdrawn)}</b>
              </li>
            </ul>
            <label className={styles.field} htmlFor="wd">
              <span>Withdraw SOL to Phantom</span>
              <div className={styles.inputWrap}>
                <b>$</b>
                <input
                  id="wd"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder={Number(data.presale.commission.available || 0).toFixed(2)}
                  value={withdrawAmount}
                  onChange={(event) => setWithdrawAmount(event.target.value)}
                />
              </div>
            </label>
            <button
              className={styles.primaryWide}
              type="button"
              onClick={withdraw}
              disabled={Boolean(busy) || data.presale.commission.available < 1}
            >
              <ArrowDownToLine size={15} />
              {busy === "withdraw" ? "Sending..." : "Withdraw SOL to Phantom"}
            </button>
          </article>
        </section>
      ) : null}

      {tab === "activity" ? (
        <article className={styles.card}>
          <div className={styles.cardHead}>
            <div>
              <p className={styles.kicker}>
                <Receipt size={12} /> Ledger
              </p>
              <h2>How these tokens arrived</h2>
            </div>
            <Coins size={16} />
          </div>
          {data.activity.length ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Detail</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {data.activity.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{row.source}</strong>
                      {row.lock ? (
                        <small>
                          <Lock size={10} /> Locked WLT
                        </small>
                      ) : null}
                    </td>
                    <td>
                      <strong>{row.title}</strong>
                      <small>{row.detail}</small>
                    </td>
                    <td className={styles.accent}>{row.amount}</td>
                    <td>
                      <span className={styles.status}>{row.status}</span>
                    </td>
                    <td>{when(row.at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className={styles.empty}>No credits yet. Mine, scratch, or buy presale to open the ledger.</p>
          )}
        </article>
      ) : null}
    </div>
  );
}
