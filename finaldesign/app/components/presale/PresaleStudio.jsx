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
  Fingerprint,
  Lock,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trophy,
  Vault,
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

const FLOW = [
  { n: "01", title: "Connect", copy: "Link Phantom once. Settlement stays on Solana." },
  { n: "02", title: "Quote", copy: "Enter USD. WLT is always priced at $0.50." },
  { n: "03", title: "Sign", copy: "Confirm in Phantom and pay the matching SOL." },
  { n: "04", title: "Vault", copy: "Tokens credit instantly and stay locked until trade." },
];

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

function tokens(value) {
  return `${Number(value || 0).toFixed(7)} WLT`;
}

function stamp(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }
  return date.toLocaleString();
}

function Ring({ value, size = 148, stroke = 10, label, sub }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, Number(value) || 0));
  return (
    <div className={styles.ringWrap} style={{ width: size, height: size }}>
      <svg className={styles.ringSvg} viewBox="0 0 120 120" aria-hidden="true">
        <circle className={styles.ringTrack} cx="60" cy="60" r={r} strokeWidth={stroke} />
        <motion.circle
          className={styles.ringFill}
          cx="60"
          cy="60"
          r={r}
          strokeWidth={stroke}
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
  const walletOn = Boolean(data.wallet.connected);
  const allocated = Number(data.allocation.wlt || 0) > 0;
  const purchases = Array.isArray(data.purchases) ? data.purchases : [];
  const qualifyCurrent = Math.min(1000, Math.max(0, Number(data.qualify.current || 0)));
  const activeStep = !walletOn ? 0 : quote.amount < 1 ? 1 : allocated ? 3 : 2;
  const capital = Number(data.allocation.usd || 0);
  const vaultWlt = Number(data.allocation.wlt || 0);
  const earned = Number(data.commission?.earned || 0);
  const available = Number(data.commission?.available || 0);
  const withdrawn = Number(data.commission?.withdrawn || 0);
  const maxBar = Math.max(1000, capital, quote.amount, 1);
  const chartBars = [
    { label: "This ticket", value: quote.amount, max: maxBar, tone: "lime" },
    { label: "Vaulted USD", value: capital, max: maxBar, tone: "mid" },
    { label: "Qualify $1k", value: Math.min(1000, capital), max: 1000, tone: "dim" },
  ];
  const split = [
    { label: "Available", value: available, color: "#c9f53a" },
    { label: "Withdrawn", value: withdrawn, color: "#6d8a16" },
    { label: "Pending", value: Number(data.commission?.pending || 0), color: "#2b3320" },
  ];
  const splitTotal = split.reduce((sum, item) => sum + item.value, 0) || 1;

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
    { label: "This ticket", value: quote.wlt.toFixed(4), unit: "WLT you receive", Icon: Sparkles },
    { label: "Vaulted", value: vaultWlt.toFixed(4), unit: "Locked WLT", Icon: Vault },
    { label: "Deployed", value: money(capital), unit: "USD capital", Icon: Banknote },
    { label: "Qualify", value: money(data.qualify.current), unit: qualified ? "Unlocked" : "of $1,000", Icon: Trophy },
  ];

  return (
    <div className={styles.studio}>
      <div className={styles.heroRow}>
        <motion.article
          className={`${styles.vaultCard} ${walletOn ? styles.vaultLive : ""}`}
          initial="hidden"
          animate="show"
          variants={fadeUp}
        >
          <div className={styles.scanlines} />
          <div className={styles.heroHead}>
            <div>
              <p className={styles.kicker}>{data.stage || "Presale Stage 1"}</p>
              <h1>Allocation engine</h1>
              <p className={styles.lead}>
                Fixed $0.50 WLT. Pay in SOL through Phantom. Purchased tokens credit to your vault and stay locked until
                trade opens.
              </p>
            </div>
            <span className={walletOn ? styles.statusLive : styles.statusIdle}>
              <i />
              {walletOn ? "Wallet linked" : "Awaiting Phantom"}
            </span>
          </div>

          <div className={styles.heroBody}>
            <div className={styles.gaugeCol}>
              <Ring value={progress} size={176} stroke={11} label="qualify" sub="to $1,000" />
              <ul className={styles.gaugeLegend}>
                <li>
                  <Banknote size={12} /> $0.50 / WLT
                </li>
                <li>
                  <Coins size={12} /> Pay in SOL
                </li>
                <li>
                  <Lock size={12} /> {TOKEN_LOCK.presaleLocked ? "Locked vault" : "Tradable"}
                </li>
                <li>
                  <Trophy size={12} /> {qualified ? "Qualified" : `${progress.toFixed(0)}% to $1k`}
                </li>
              </ul>
            </div>

            <div className={styles.heroFacts}>
              <div className={styles.formula}>
                <span>
                  <small>USD in</small>
                  <b>{money(quote.amount)}</b>
                </span>
                <em>÷</em>
                <span>
                  <small>Fixed price</small>
                  <b>$0.50</b>
                </span>
                <em>=</em>
                <span className={styles.formulaOut}>
                  <small>WLT out</small>
                  <b>{quote.wlt.toFixed(4)}</b>
                </span>
              </div>

              <div className={styles.spark}>
                {chartBars.map((bar) => (
                  <div key={bar.label} className={styles.sparkRow}>
                    <small>{bar.label}</small>
                    <div className={styles.sparkTrack}>
                      <motion.i
                        className={styles[bar.tone] || styles.lime}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (bar.value / bar.max) * 100)}%` }}
                        transition={{ duration: 0.9, ease: "easeOut" }}
                      />
                    </div>
                    <b>{money(bar.value)}</b>
                  </div>
                ))}
              </div>

              <ul className={styles.factGrid}>
                <li>
                  <Lock size={15} />
                  <div>
                    <b>Token lock</b>
                    <p>Withdraw and send stay closed until trade opens.</p>
                  </div>
                </li>
                <li>
                  <Trophy size={15} />
                  <div>
                    <b>$1,000 qualify</b>
                    <p>Unlock {rate}% USD commission on referred buys.</p>
                  </div>
                </li>
                <li>
                  <ShieldCheck size={15} />
                  <div>
                    <b>{data.investor?.label || "Mining User"}</b>
                    <p>{walletOn ? data.wallet.short : "Connect Phantom to settle."}</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </motion.article>

        <motion.article className={styles.ticket} initial="hidden" animate="show" variants={fadeUp}>
          <div className={styles.cardHead}>
            <div>
              <p className={styles.kicker}>Order ticket</p>
              <h2>Buy WLT</h2>
            </div>
            <span className={styles.pill}>Fixed $0.50</span>
          </div>

          <div className={styles.walletChip}>
            <span className={styles.iconTile}>
              <Wallet size={16} />
            </span>
            <div>
              <small>Settlement wallet</small>
              <b>{walletOn ? data.wallet.short : "Phantom required"}</b>
            </div>
            {walletOn ? null : (
              <button className={styles.chipBtn} type="button" onClick={connectWallet} disabled={Boolean(busy)}>
                {busy === "wallet" ? "..." : "Connect"}
              </button>
            )}
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
              <dt>Pay with</dt>
              <dd>SOL · Phantom</dd>
            </div>
            <div className={styles.total}>
              <dt>Total due</dt>
              <dd>{money(quote.total)}</dd>
            </div>
          </dl>

          {error ? <p className={styles.error}>{error}</p> : null}
          {note ? <p className={styles.ok}>{note}</p> : null}

          <button
            className={styles.primaryWide}
            type="button"
            onClick={buyWlt}
            disabled={Boolean(busy) || quote.amount < 1}
          >
            {busy === "buy" ? "Confirming with Phantom..." : "Confirm purchase"}
          </button>

          <Link className={styles.ghost} href={walletHref}>
            Open wallet <ArrowRight size={14} />
          </Link>
        </motion.article>
      </div>

      <ol className={styles.flow}>
        {FLOW.map((step, index) => (
          <motion.li
            key={step.n}
            className={index < activeStep ? styles.flowDone : index === activeStep ? styles.flowNow : styles.flowIdle}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 * index }}
          >
            <span>{step.n}</span>
            <strong>{step.title}</strong>
            <p>{step.copy}</p>
          </motion.li>
        ))}
      </ol>

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

      <section className={styles.infoRow}>
        <article className={styles.qualify}>
          <div className={styles.cardHead}>
            <div>
              <p className={styles.kicker}>Investor ladder</p>
              <h2>{qualified ? "Qualified" : "Toward $1,000"}</h2>
            </div>
            <span className={qualified ? styles.qualifyBadge : styles.qualifyBadgeIdle}>
              {qualified ? <Trophy size={14} /> : <Fingerprint size={14} />}
              {qualified ? "Unlocked" : "Locked"}
            </span>
          </div>

          <div className={styles.ladder}>
            <Ring value={progress} label="complete" />
            <div className={styles.ladderCopy}>
              <div className={styles.meterHead}>
                <span>{money(data.qualify.current)}</span>
                <em>of {money(data.qualify.target)}</em>
              </div>
              <div className={styles.bar} aria-hidden="true">
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                />
              </div>
              <ol className={styles.rungs}>
                <li className={qualifyCurrent > 0 || allocated ? styles.rungOn : styles.rungOff}>
                  <ShoppingBag size={14} />
                  <div>
                    <b>Participant</b>
                    <small>Confirmed presale purchase</small>
                  </div>
                </li>
                <li className={qualified ? styles.rungOn : styles.rungOff}>
                  <BadgeCheck size={14} />
                  <div>
                    <b>Qualified · {rate}% USD</b>
                    <small>Direct referral commission</small>
                  </div>
                </li>
              </ol>
              <p className={styles.ladderNote}>
                {qualified
                  ? `${rate}% of referred buys credits in USD. Withdraw it as SOL from Wallet at the live rate.`
                  : `Buy another ${money(data.qualify.remaining)} to unlock ${rate}% USD referral commission.`}
              </p>
            </div>
          </div>
        </article>

        <article className={styles.stackCard}>
          <div className={styles.cardHead}>
            <div>
              <p className={styles.kicker}>Allocation map</p>
              <h2>Your vault</h2>
            </div>
            <Coins size={18} />
          </div>
          <div className={styles.stackViz} aria-hidden="true">
            {[capital / 40, vaultWlt / 80, progress * 0.7].map((h, index) => (
              <motion.span
                key={index}
                initial={{ height: "12%" }}
                animate={{ height: `${Math.min(100, 18 + h)}%` }}
                transition={{ duration: 0.8, delay: 0.1 * index }}
              />
            ))}
          </div>
          <ul className={styles.miniStats}>
            <li>
              <span>Capital</span>
              <b>{money(capital)}</b>
            </li>
            <li>
              <span>Tokens</span>
              <b>{vaultWlt.toFixed(4)}</b>
            </li>
            <li>
              <span>Status</span>
              <b>{TOKEN_LOCK.presaleLocked ? "Locked" : "Open"}</b>
            </li>
          </ul>
          <Link className={styles.ghost} href={walletHref}>
            Manage tokens in Wallet
          </Link>
        </article>

        <article className={styles.lockCard}>
          <div className={styles.cardHead}>
            <div>
              <p className={styles.kicker}>Commission desk</p>
              <h2>{money(earned)} USD</h2>
            </div>
            <Banknote size={18} />
          </div>
          <div className={styles.pieRow}>
            <svg className={styles.pie} viewBox="0 0 36 36" aria-hidden="true">
              <circle className={styles.pieTrack} cx="18" cy="18" r="15.9" />
              {(() => {
                let offset = 0;
                return split.map((slice) => {
                  const pct = (slice.value / splitTotal) * 100;
                  const circle = (
                    <circle
                      key={slice.label}
                      className={styles.pieSlice}
                      cx="18"
                      cy="18"
                      r="15.9"
                      stroke={slice.color}
                      strokeDasharray={`${pct} ${100 - pct}`}
                      strokeDashoffset={-offset}
                    />
                  );
                  offset += pct;
                  return circle;
                });
              })()}
            </svg>
            <ul className={styles.pieLegend}>
              {split.map((slice) => (
                <li key={slice.label}>
                  <i style={{ background: slice.color }} />
                  <span>{slice.label}</span>
                  <b>{money(slice.value)}</b>
                </li>
              ))}
            </ul>
          </div>
          <p className={styles.ladderNote}>
            Direct 5% lives in USD. Phantom receives SOL at the live rate. Mining 10/5/3 stays locked WLT.
          </p>
        </article>
      </section>

      <section className={styles.rulesCard}>
        <div className={styles.cardHead}>
          <div>
            <p className={styles.kicker}>Settlement rules</p>
            <h2>How value moves</h2>
          </div>
          <Lock size={18} />
        </div>
        <ol className={styles.rules}>
          <li>
            <span>A</span>
            USD amount converts at a hard $0.50 peg. No slippage.
          </li>
          <li>
            <span>B</span>
            You sign in Phantom and settle the ticket in SOL.
          </li>
          <li>
            <span>C</span>
            WLT credits to your vault immediately and stays locked.
          </li>
          <li>
            <span>D</span>
            Referral commission is USD in Wallet, paid as SOL on withdraw.
          </li>
        </ol>
      </section>

      {purchases.length ? (
        <section className={styles.tableCard}>
          <div className={styles.cardHead}>
            <div>
              <p className={styles.kicker}>Ledger</p>
              <h2>Confirmed allocations</h2>
            </div>
            <ShoppingBag size={18} />
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>When</th>
                  <th>USD</th>
                  <th>WLT</th>
                  <th>Wallet</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{stamp(row.createdAt)}</strong>
                      <small className={styles.hash}>{row.txHash || "—"}</small>
                    </td>
                    <td>{money(row.usd)}</td>
                    <td>{tokens(row.wlt)}</td>
                    <td>{row.wallet || "—"}</td>
                    <td>
                      <em className={styles.status}>{row.status || "confirmed"}</em>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

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
              <em>USD</em>
            </article>
          </div>
        </section>
      ) : null}
    </div>
  );
}
