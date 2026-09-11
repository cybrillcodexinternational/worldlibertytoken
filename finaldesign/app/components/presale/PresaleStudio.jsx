"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  CheckCircle2,
  Coins,
  Lock,
  ShieldCheck,
  ShoppingBag,
  Trophy,
  Wallet,
} from "lucide-react";
import styles from "./presale.module.css";
import { TOKEN_LOCK } from "@/lib/token-lock";

const EMPTY = {
  price: 0.5,
  stage: "Presale Stage 1",
  qualifyUsd: 1000,
  commissionRate: 0.05,
  stablecoin: "SOL",
  wallet: { connected: false, address: "", short: "" },
  allocation: { usd: 0, wlt: 0 },
  investor: { code: "MINING_USER", label: "Mining User", eligiblePresaleReferral: false },
  qualify: { current: 0, target: 1000, remaining: 1000, progress: 0, unlocked: false },
  commission: { earned: 0, available: 0, withdrawn: 0, pending: 0 },
  purchases: [],
  commissions: [],
  withdrawals: [],
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

export default function PresaleStudio({ panel = "user" }) {
  const [data, setData] = useState(EMPTY);
  const [usd, setUsd] = useState("1000");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  async function load() {
    const response = await fetch("/api/presale/status", { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.message || "Could not load presale.");
    }
    setData({ ...EMPTY, ...payload });
    return payload;
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  const quote = useMemo(() => {
    const amount = Math.max(0, Number(usd) || 0);
    const wlt = amount / Number(data.price || 0.5);
    return { amount, wlt, total: amount };
  }, [usd, data.price]);

  const walletHref = panel === "admin" ? "/admin/wallet" : "/user/wallet";
  const qualified = Boolean(data.qualify?.unlocked);
  const rate = Math.round((data.commissionRate || 0.05) * 100);
  const progress = Math.min(100, Math.max(0, Number(data.qualify?.progress || 0)));

  async function connectWallet() {
    setError("");
    setNote("");
    setBusy("wallet");
    try {
      const signed = await connectAndSign("Connect Phantom to World Liberty Token presale.");
      const response = await fetch("/api/presale/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: signed.address }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || "Wallet connect failed.");
      }
      setData({ ...EMPTY, ...payload });
      setNote("Phantom wallet connected.");
    } catch (err) {
      setError(err.message || "Wallet connect failed.");
    } finally {
      setBusy("");
    }
  }

  async function buyWlt() {
    setError("");
    setNote("");
    setBusy("buy");
    try {
      const signed = await connectAndSign(
        `WLT Presale: pay $${quote.amount.toFixed(2)} in SOL for ${quote.wlt.toFixed(7)} WLT at $0.50.`
      );
      const response = await fetch("/api/presale/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usdAmount: quote.amount,
          walletAddress: signed.address,
          signature: signed.signature,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || "Purchase failed.");
      }
      setData({ ...EMPTY, ...payload });
      setNote(`Confirmed. ${tokens(payload.quote?.wlt || quote.wlt)} allocated to your dashboard.`);
    } catch (err) {
      setError(err.message || "Purchase failed.");
    } finally {
      setBusy("");
    }
  }

  const kpis = [
    { label: "You receive", value: quote.wlt.toFixed(7), unit: "WLT", Icon: Coins },
    { label: "Allocated", value: Number(data.allocation.wlt || 0).toFixed(7), unit: "WLT", Icon: ShoppingBag },
    { label: "Capital deployed", value: money(data.allocation.usd), unit: "USD", Icon: Banknote },
    { label: "Qualify", value: `${money(data.qualify.current)} / $1,000`, unit: qualified ? "Unlocked" : "Locked", Icon: Trophy },
  ];

  return (
    <div className={styles.studio}>
      <motion.header
        className={styles.top}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div>
          <p className={styles.kicker}>{data.stage || "Presale Stage 1"}</p>
          <h1>Buy WLT</h1>
          <p className={styles.lead}>
            Fixed $0.50 allocation. Enter USD, sign in Phantom, and pay in SOL.
            Purchased tokens stay locked until trade opens. SOL referral income is managed on Wallet.
          </p>
        </div>
        <div className={styles.priceCard}>
          <span>Live price</span>
          <strong>$0.50</strong>
          <small>per WLT · no network fee</small>
        </div>
      </motion.header>

      <section className={styles.toolbar}>
        <div className={styles.walletStrip}>
          <span className={styles.iconTile}>
            <Wallet size={16} />
          </span>
          <div>
            <small>Settlement wallet</small>
            <b>{data.wallet.connected ? data.wallet.short : "Connect in Wallet"}</b>
          </div>
        </div>
        <div className={styles.walletStrip}>
          <span className={styles.iconTile}>
            {qualified ? <BadgeCheck size={16} /> : <ShieldCheck size={16} />}
          </span>
          <div>
            <small>Investor class</small>
            <b>{data.investor?.label || "Mining User"}</b>
          </div>
        </div>
        <div className={styles.toolbarActions}>
          {data.wallet.connected ? null : (
            <button className={styles.primary} type="button" onClick={connectWallet} disabled={Boolean(busy)}>
              {busy === "wallet" ? "Connecting..." : "Connect Phantom"}
            </button>
          )}
          <Link className={styles.ghost} href={walletHref}>
            Open wallet <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {error ? <p className={styles.error}>{error}</p> : null}
      {note ? <p className={styles.ok}>{note}</p> : null}

      <section className={styles.stats}>
        {kpis.map((item) => (
          <article key={item.label} className={styles.stat}>
            <span className={styles.iconTile}>
              <item.Icon size={16} />
            </span>
            <small>{item.label}</small>
            <b>{item.value}</b>
            <em>{item.unit}</em>
          </article>
        ))}
      </section>

      {TOKEN_LOCK.presaleLocked ? (
        <p className={styles.copy}>
          <Lock size={14} /> Purchased WLT is credited to your vault and locked until trade opens. Withdraw and send stay closed.
        </p>
      ) : null}

      <section className={styles.desk}>
        <article className={styles.ticket}>
          <div className={styles.cardHead}>
            <div>
              <p className={styles.kicker}>Order ticket</p>
              <h2>Purchase</h2>
            </div>
            <span className={styles.pill}>Fixed $0.50</span>
          </div>

          <label className={styles.field} htmlFor="usd">
            <span>Investment amount (USD)</span>
            <div className={styles.inputWrap}>
              <b>$</b>
              <input
                id="usd"
                type="number"
                min="1"
                step="1"
                value={usd}
                onChange={(event) => setUsd(event.target.value)}
              />
            </div>
          </label>

          <div className={styles.presets}>
            {["250", "500", "1000", "2500"].map((amount) => (
              <button
                key={amount}
                type="button"
                className={usd === amount ? styles.presetOn : styles.preset}
                onClick={() => setUsd(amount)}
              >
                ${amount}
              </button>
            ))}
          </div>

          <dl className={styles.quote}>
            <div>
              <dt>Price</dt>
              <dd>$0.50 / WLT</dd>
            </div>
            <div>
              <dt>You receive</dt>
              <dd className={styles.accent}>{quote.wlt.toFixed(7)} WLT</dd>
            </div>
            <div>
              <dt>Network fee</dt>
              <dd>$0.00</dd>
            </div>
            <div>
              <dt>Wallet</dt>
              <dd>{data.wallet.short || "Phantom required"}</dd>
            </div>
            <div className={styles.total}>
              <dt>Total due</dt>
              <dd>{money(quote.total)}</dd>
            </div>
          </dl>

          <button
            className={styles.primaryWide}
            type="button"
            onClick={buyWlt}
            disabled={Boolean(busy) || quote.amount < 1}
          >
            {busy === "buy" ? "Confirming with Phantom..." : "Confirm purchase"}
          </button>
        </article>

        <article className={styles.side}>
          <div className={styles.qualify}>
            <div className={styles.cardHead}>
              <div>
                <p className={styles.kicker}>Purchase progress</p>
                <h2>{qualified ? "Qualified" : "Toward $1,000"}</h2>
              </div>
              {qualified ? <Trophy size={18} /> : <ShieldCheck size={18} />}
            </div>
            <p className={styles.progressLabel}>
              {money(data.qualify.current)} of {money(data.qualify.target)}
            </p>
            <div className={styles.bar}>
              <motion.span
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.7 }}
              />
            </div>
            <p className={styles.copy}>
              {qualified
                ? `${rate}% SOL commission is managed in Wallet after a referred buyer purchases.`
                : `Buy another ${money(data.qualify.remaining)} to qualify. SOL withdrawals stay in Wallet.`}
            </p>
            <Link className={styles.ghost} href={walletHref} style={{ marginTop: 16 }}>
              Manage tokens in Wallet
            </Link>
          </div>
        </article>
      </section>

      {panel === "admin" && data.admin ? (
        <section className={styles.admin}>
          <div className={styles.cardHead}>
            <div>
              <p className={styles.kicker}>Control room</p>
              <h2>Live allocation</h2>
            </div>
            <ShieldCheck size={18} />
          </div>
          <div className={styles.stats}>
            <article className={styles.stat}>
              <span className={styles.iconTile}>
                <Banknote size={16} />
              </span>
              <small>Raised</small>
              <b>{money(data.admin.usd)}</b>
              <em>USD</em>
            </article>
            <article className={styles.stat}>
              <span className={styles.iconTile}>
                <Coins size={16} />
              </span>
              <small>WLT sold</small>
              <b>{tokens(data.admin.wlt)}</b>
              <em>WLT</em>
            </article>
            <article className={styles.stat}>
              <span className={styles.iconTile}>
                <Trophy size={16} />
              </span>
              <small>Qualified</small>
              <b>{data.admin.qualifiedInvestors}</b>
              <em>investors</em>
            </article>
            <article className={styles.stat}>
              <span className={styles.iconTile}>
                <CheckCircle2 size={16} />
              </span>
              <small>Commission paid</small>
              <b>{money(data.admin.commissionPaid)}</b>
              <em>SOL</em>
            </article>
          </div>
        </section>
      ) : null}
    </div>
  );
}
