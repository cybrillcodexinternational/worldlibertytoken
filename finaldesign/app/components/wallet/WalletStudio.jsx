"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  ChevronRight,
  Coins,
  Gift,
  Info,
  LayoutDashboard,
  Lock,
  Pickaxe,
  Receipt,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Users,
  Vault,
  Wallet,
} from "lucide-react";
import WithdrawModal from "./WithdrawModal";
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
    commissionEarned: 0,
    commissionWithdrawn: 0,
    airdropSol: 0,
    airdropSolAvailable: 0,
    airdropSolWithdrawn: 0,
  },
  withdrawable: { commissionUsd: 0, airdropSol: 0 },
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
  return `$${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function wlt(value) {
  return Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 7,
    maximumFractionDigits: 7,
  });
}

function solAmt(value) {
  return Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 8,
  });
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
  const [modalOpen, setModalOpen] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  const presaleHref = panel === "admin" ? "/admin/presale" : "/user/presale";
  const referralHref = panel === "admin" ? "/admin/referral" : "/user/referral";
  const miningHref = panel === "admin" ? "/admin/mining" : "/user/mining";
  const airdropHref = panel === "admin" ? "/admin/airdrops" : "/user/airdrops";

  async function load() {
    const response = await fetch("/api/wallet/status", { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.message || "Could not load wallet.");
    }
    setData({
      ...EMPTY,
      ...payload,
      balances: { ...EMPTY.balances, ...(payload.balances || {}) },
      withdrawable: { ...EMPTY.withdrawable, ...(payload.withdrawable || {}) },
    });
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

  const commissionEarned = Number(data.balances.commissionEarned || data.presale.commission.earned || 0);
  const commissionAvailable = Number(data.withdrawable?.commissionUsd ?? data.presale.commission.available ?? 0);
  const commissionAvailableSol = Number(data.presale.commission?.availableSol || 0);
  const airdropEarned = Number(data.balances.airdropSol || 0);
  const airdropAvailable = Number(data.withdrawable?.airdropSol ?? data.balances.airdropSolAvailable ?? 0);
  const canWithdraw = commissionAvailable >= 1 || airdropAvailable >= 0.0001;

  const statement = [
    {
      key: "presale",
      label: "Purchased in presale",
      amount: wlt(data.balances.presale),
      unit: "WLT",
      note: `Paid ${money(data.balances.presaleUsd)} at $0.50`,
      state: locked ? "Locked" : "Held",
    },
    {
      key: "mined",
      label: "Mined tokens",
      amount: wlt(data.balances.mined),
      unit: "WLT",
      note: `${data.mining?.cycles || 0} completed cycles`,
      state: locked ? "Locked" : "Held",
    },
    {
      key: "commission",
      label: "Direct referral commission",
      amount: money(commissionEarned),
      unit: "USD earned",
      note: `${money(commissionAvailable)} available (${solAmt(commissionAvailableSol)} SOL est.)`,
      state: "Paid in SOL",
    },
    {
      key: "airdrop",
      label: "Airdrop earned",
      amount: solAmt(airdropEarned),
      unit: "SOL",
      note: `${solAmt(airdropAvailable)} available to withdraw`,
      state: "SOL",
    },
  ];

  const sources = useMemo(
    () => [
      {
        key: "commission",
        label: "Direct referral",
        unit: "USD",
        prefix: "$",
        available: commissionAvailable,
        min: 1,
        step: "0.01",
        format: (value) => Number(value || 0).toFixed(2),
      },
      {
        key: "airdrop",
        label: "Presale airdrop",
        unit: "SOL",
        prefix: "",
        available: airdropAvailable,
        min: 0.0001,
        step: "0.0001",
        format: (value) => Number(value || 0).toFixed(4),
      },
    ],
    [commissionAvailable, airdropAvailable]
  );

  const holdings = useMemo(
    () => [
      {
        key: "mined",
        label: "Mined tokens",
        amount: wlt(data.balances.mined),
        unit: "WLT",
        note: locked ? "Locked until trade opens" : "Held in vault",
        Icon: Pickaxe,
        lock: locked,
      },
      {
        key: "presale",
        label: "Purchased tokens",
        amount: wlt(data.balances.presale),
        unit: "WLT",
        note: `Paid ${money(data.balances.presaleUsd)} at $0.50`,
        Icon: ShoppingBag,
        lock: locked,
      },
      {
        key: "referral",
        label: "Mining referral",
        amount: wlt(data.balances.miningReferral),
        unit: "WLT",
        note: "Pool-funded 10 / 5 / 3",
        Icon: Users,
        lock: locked,
      },
      {
        key: "scratch",
        label: "Scratch & Win",
        amount: wlt(data.balances.scratch),
        unit: "WLT",
        note: `${data.rewards?.plays || 0} plays`,
        Icon: Gift,
        lock: locked,
      },
      {
        key: "commission",
        label: "Direct referral commission",
        amount: money(commissionEarned),
        unit: "earned",
        note: `${money(commissionAvailable)} available`,
        Icon: Banknote,
        lock: false,
      },
      {
        key: "airdrop",
        label: "Airdrop received",
        amount: solAmt(airdropEarned),
        unit: "SOL",
        note: `${solAmt(airdropAvailable)} available`,
        Icon: Sparkles,
        lock: false,
      },
    ],
    [data, locked, commissionEarned, commissionAvailable, airdropEarned, airdropAvailable]
  );

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

  async function confirmWithdraw(sourceKey, amount) {
    setError("");
    setNote("");
    setBusy("withdraw");
    try {
      const isAirdrop = sourceKey === "airdrop";
      const signed = await connectAndSign(
        isAirdrop
          ? `WLT Wallet: withdraw ${Number(amount).toFixed(8)} SOL airdrop to Phantom.`
          : `WLT Wallet: withdraw ${money(amount)} direct referral commission (USD ledger, SOL payout) to Phantom.`
      );
      const response = await fetch(isAirdrop ? "/api/airdrop/withdraw" : "/api/presale/withdraw", {
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
      await load();
      setModalOpen(false);
      if (isAirdrop) {
        setNote("Airdrop SOL sent to Phantom.");
      } else {
        const solOut = Number(payload.withdrawal?.solAmount || 0);
        const rate = Number(payload.withdrawal?.solUsdRate || 0);
        setNote(
          solOut > 0 && rate > 0
            ? `Referral withdrawal sent: ${money(amount)} -> ${solAmt(solOut)} SOL at $${rate.toFixed(2)}.`
            : "Referral commission sent to Phantom."
        );
      }
    } catch (err) {
      setError(err.message || "Withdrawal failed.");
    } finally {
      setBusy("");
    }
  }

  const tabs = [
    { id: "overview", label: "Overview", Icon: LayoutDashboard },
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
          <strong>{wlt(totalWlt)}</strong>
          <em>≈ {money(usdValue)} USD</em>
          <span>Locked WLT: {wlt(data.balances.lockedWlt)}</span>
          <div className={styles.usdcRow}>
            <span className={styles.coin} />
            <b>{money(commissionAvailable)}</b>
            <i>Referral available</i>
          </div>
          <div className={styles.usdcRow}>
            <span className={styles.coin} />
            <b>{solAmt(airdropAvailable)} SOL</b>
            <i>Airdrop available</i>
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
              All balances live here. WLT from mining, purchases, scratch, and mining referrals stays locked until trade
              opens. Direct referral commission and released airdrop SOL withdraw from this page only.
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

      {error && !modalOpen ? <p className={styles.error}>{error}</p> : null}
      {note ? <p className={styles.ok}>{note}</p> : null}

      <section className={styles.statement}>
        <div className={styles.statementHead}>
          <p className={styles.kicker}>Token statement</p>
          <h2>Your balances, in numbers</h2>
        </div>
        <div className={styles.statementGrid}>
          {statement.map((item) => (
            <article key={item.key} className={styles.statementCard}>
              <small>{item.label}</small>
              <b>{item.amount}</b>
              <em>{item.unit}</em>
              <p>{item.note}</p>
              <span>{item.state}</span>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.cashDesk}>
        <div>
          <p className={styles.kicker}>Withdrawable</p>
          <h2>Ready to send</h2>
          <p className={styles.copy}>
            Only released airdrop SOL and qualified direct-referral commission can leave the vault. Enter the amount in
            the popup after you tap Withdraw.
          </p>
        </div>
        <ul className={styles.cashStats}>
          <li>
            <small>Direct referral available</small>
            <b>{money(commissionAvailable)}</b>
            <em>
              of {money(commissionEarned)} earned · {solAmt(commissionAvailableSol)} SOL est.
            </em>
          </li>
          <li>
            <small>Airdrop available</small>
            <b>{solAmt(airdropAvailable)} SOL</b>
            <em>of {solAmt(airdropEarned)} SOL earned</em>
          </li>
          <li>
            <small>Locked WLT</small>
            <b>{wlt(data.balances.lockedWlt)}</b>
            <em>WLT · {locked ? "until trade" : "held"}</em>
          </li>
        </ul>
        <button
          className={styles.withdrawCta}
          type="button"
          disabled={!canWithdraw || Boolean(busy)}
          onClick={() => {
            setError("");
            setModalOpen(true);
          }}
        >
          Withdraw
        </button>
      </section>

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
                <Coins size={12} /> Current balances
              </p>
              <h2>Everything in this vault</h2>
              <p className={styles.lead}>
                Mined, purchased, mining-referral, and scratch WLT stay locked. Commission and airdrop SOL are withdrawable from the button above.
              </p>
            </div>
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
                    <span className={styles.openPill}>Withdrawable</span>
                  )}
                </div>
                <small>{item.label}</small>
                <b>{item.amount}</b>
                <em>{item.unit}</em>
                <p>{item.note}</p>
              </article>
            ))}
          </div>

          <div className={styles.flow}>
            <Link className={styles.flowItem} href={miningHref}>
              <span className={styles.iconTile}>
                <Pickaxe size={16} />
              </span>
              <div>
                <b>Mining</b>
                <small>Mined WLT</small>
              </div>
              <strong>{wlt(data.balances.mined)}</strong>
              <ChevronRight size={16} />
            </Link>
            <Link className={styles.flowItem} href={presaleHref}>
              <span className={styles.iconTile}>
                <ShoppingBag size={16} />
              </span>
              <div>
                <b>Presale</b>
                <small>Purchased WLT</small>
              </div>
              <strong>{wlt(data.balances.presale)}</strong>
              <ChevronRight size={16} />
            </Link>
            <Link className={styles.flowItem} href={referralHref}>
              <span className={styles.iconTile}>
                <Users size={16} />
              </span>
              <div>
                <b>Referral</b>
                <small>Commission earned</small>
              </div>
              <strong>{money(commissionEarned)}</strong>
              <ChevronRight size={16} />
            </Link>
            <Link className={styles.flowItem} href={airdropHref}>
              <span className={styles.iconTile}>
                <Sparkles size={16} />
              </span>
              <div>
                <b>Airdrops</b>
                <small>SOL earned</small>
              </div>
              <strong>{solAmt(airdropEarned)}</strong>
              <ChevronRight size={16} />
            </Link>
          </div>

          <section className={styles.noteRow}>
            <p>
              <Lock size={14} /> {data.lock?.message || "WLT is locked. Withdraw and send stay closed until trade opens."}
            </p>
          </section>
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

      <WithdrawModal
        open={modalOpen}
        sources={sources}
        connected={Boolean(data.wallet.connected)}
        walletShort={data.wallet.short}
        busy={busy === "withdraw"}
        error={modalOpen ? error : ""}
        onClose={() => {
          if (!busy) {
            setModalOpen(false);
            setError("");
          }
        }}
        onConfirm={confirmWithdraw}
      />
    </div>
  );
}
