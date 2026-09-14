"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  Circle,
  Clock3,
  Coins,
  EyeOff,
  Gift,
  Hourglass,
  Landmark,
  Lock,
  MoonStar,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Timer,
  Vault,
  Wallet,
} from "lucide-react";
import styles from "./airdrop.module.css";

const EMPTY = {
  eligible: false,
  qualifying: { usd: 0, wlt: 0, status: "Locked" },
  wallet: { connected: false, address: "", short: "" },
  balance: { earned: 0, available: 0, withdrawn: 0, asset: "SOL" },
  cycle: { completed: 0, total: 4, progress: [] },
  next: { label: "Saturday Night", at: null, state: "countdown", slot: null, of: 4 },
  history: [],
  withdrawals: [],
};

const STEPS = [
  { Icon: ShoppingBag, title: "Buy presale WLT", copy: "Only confirmed purchases open the cycle." },
  { Icon: BadgeCheck, title: "Confirmed capital", copy: "Mined, scratch, and referral WLT never qualify." },
  { Icon: Wallet, title: "Keep Phantom ready", copy: "Released SOL is withdrawn from Wallet." },
  { Icon: CalendarClock, title: "Four Saturdays", copy: "One drop each Saturday night. A fifth is ignored." },
  { Icon: EyeOff, title: "Amount stays sealed", copy: "No rate or estimate is shown before release." },
  { Icon: Gift, title: "Reward is revealed", copy: "SOL appears only after the drop is distributed." },
  { Icon: Landmark, title: "Credit to Wallet", copy: "Received SOL sits in your bonus balance." },
  { Icon: Lock, title: "WLT stays locked", copy: "Purchased tokens do not unlock with airdrops." },
];

function money(value) {
  return `$${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function sol(value) {
  return Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 8,
  });
}

function wlt(value) {
  return Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 7,
  });
}

function stamp(value) {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}

function splitTime(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: String(Math.floor(total / 86400)).padStart(2, "0"),
    hours: String(Math.floor((total % 86400) / 3600)).padStart(2, "0"),
    minutes: String(Math.floor((total % 3600) / 60)).padStart(2, "0"),
    seconds: String(total % 60).padStart(2, "0"),
  };
}

function SlotIcon({ state }) {
  if (state === "completed") {
    return <CheckCircle2 size={16} />;
  }
  if (state === "preparing") {
    return <Hourglass size={16} />;
  }
  return <Circle size={16} />;
}

function slotLabel(state) {
  if (state === "completed") {
    return "Released";
  }
  if (state === "preparing") {
    return "Preparing";
  }
  return "Upcoming";
}

export default function AirdropStudio({ panel = "user" }) {
  const [data, setData] = useState(EMPTY);
  const [now, setNow] = useState(Date.now());
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/airdrop/status", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.message || "Could not load airdrops.");
        }
        setData({ ...EMPTY, ...payload });
      })
      .catch((err) => setError(err.message));

    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  const walletHref = panel === "admin" ? "/admin/wallet" : "/user/wallet";
  const presaleHref = panel === "admin" ? "/admin/presale" : "/user/presale";
  const remaining = data.next?.at ? Math.max(0, new Date(data.next.at).getTime() - now) : 0;
  const clock = splitTime(remaining);
  const progress = Array.from(
    { length: 4 },
    (_, index) => data.cycle?.progress?.[index] || { slot: index + 1, state: "upcoming" }
  );
  const nextSlot = data.next?.slot || progress.find((item) => item.state !== "completed")?.slot || 1;

  return (
    <div className={styles.studio}>
      <motion.header className={styles.hero} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className={styles.scanlines} aria-hidden="true" />
        <div className={styles.heroCopy}>
          <div className={styles.heroMeta}>
            <span className={data.eligible ? styles.statusLive : styles.statusRequired}>
              <i />
              {data.eligible ? "Presale qualified" : "Purchase required"}
            </span>
            <p className={styles.kicker}>
              <MoonStar size={12} /> Saturday-night vault
            </p>
          </div>
          <h1>My Airdrops</h1>
          <p className={styles.lead}>
            Confirmed presale purchases only. Four sealed SOL drops each month. The amount stays hidden until a cycle is
            actually released — never estimated, never previewed.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.ghostInline} href={presaleHref}>
              <ShoppingBag size={14} /> Purchase
            </Link>
          </div>
        </div>

        <div className={styles.seal}>
          <div className={styles.orbitA} />
          <div className={styles.orbitB} />
          <div className={styles.sealCore}>
            <Sparkles size={28} strokeWidth={1.6} />
            <small>Slot</small>
            <b>
              {nextSlot}/{data.cycle.total || 4}
            </b>
          </div>
        </div>
      </motion.header>

      {error ? <p className={styles.error}>{error}</p> : null}

      <section className={styles.kpis}>
        <article>
          <span className={styles.ico}>
            <Coins size={16} />
          </span>
          <small>Qualifying investment</small>
          <b>{money(data.qualifying.usd)}</b>
          <em>Confirmed presale only</em>
        </article>
        <article>
          <span className={styles.ico}>
            <Lock size={16} />
          </span>
          <small>Purchased WLT</small>
          <b>{wlt(data.qualifying.wlt)}</b>
          <em>Locked until trade</em>
        </article>
        <article>
          <span className={styles.ico}>
            <CalendarClock size={16} />
          </span>
          <small>Drops this cycle</small>
          <b>
            {data.cycle.completed}/{data.cycle.total || 4}
          </b>
          <em>Max four Saturdays</em>
        </article>
        <article>
          <span className={styles.ico}>
            <Wallet size={16} />
          </span>
          <small>Available SOL</small>
          <b>{sol(data.balance.available)}</b>
          <em>{data.wallet.connected ? data.wallet.short : "Withdraw in Wallet"}</em>
        </article>
      </section>

      <section className={styles.stage}>
        <article className={styles.nextCard}>
          <div className={styles.cardHead}>
            <div>
              <p className={styles.kicker}>
                <Timer size={12} /> Next drop
              </p>
              <h2>{data.next.label || "Saturday Night"}</h2>
            </div>
            <span className={styles.slotChip}>
              {nextSlot} of {data.cycle.total || 4}
            </span>
          </div>

          {data.next.state === "preparing" ? (
            <p className={styles.clockNote}>The distribution window is open. The SOL amount stays sealed until release.</p>
          ) : data.next.state === "ineligible" ? (
            <p className={`${styles.clockNote} ${styles.presaleRequiredNote}`}>
              Buy confirmed presale WLT to join the next Saturday-night cycle.
            </p>
          ) : data.next.at ? (
            <div className={styles.clock}>
              <span>
                <em>{clock.days}</em>
                <small>Days</small>
              </span>
              <span>
                <em>{clock.hours}</em>
                <small>Hours</small>
              </span>
              <span>
                <em>{clock.minutes}</em>
                <small>Minutes</small>
              </span>
              <span>
                <em>{clock.seconds}</em>
                <small>Seconds</small>
              </span>
            </div>
          ) : (
            <p className={styles.clockNote}>This month’s four airdrops are complete. The next cycle opens next month.</p>
          )}

          <p className={styles.progressLabel}>Monthly cycle</p>
          <ol className={styles.pips}>
            {progress.map((item) => (
              <li
                key={item.slot}
                className={
                  item.state === "completed"
                    ? styles.pipOn
                    : item.state === "preparing"
                      ? styles.pipLive
                      : styles.pipOff
                }
              >
                <SlotIcon state={item.state} />
                <div>
                  <b>Drop {item.slot}</b>
                  <small>{slotLabel(item.state)}</small>
                </div>
              </li>
            ))}
          </ol>

          <div className={styles.mystery}>
            <EyeOff size={18} />
            <div>
              <b>Reward sealed</b>
              <p>Your next WLT Presale Airdrop is being prepared. The amount is revealed only after distribution.</p>
            </div>
          </div>
        </article>

        <article className={styles.withdrawCard}>
          <div className={styles.cardHead}>
            <div>
              <p className={styles.kicker}>
                <Vault size={12} /> Bonus SOL
              </p>
              <h2>Received vault</h2>
            </div>
            <Sparkles size={18} />
          </div>

          <ul className={styles.mini}>
            <li>
              <span>
                <Gift size={14} /> Earned
              </span>
              <b>{sol(data.balance.earned)} SOL</b>
            </li>
            <li>
              <span>
                <Wallet size={14} /> Available
              </span>
              <b>{sol(data.balance.available)} SOL</b>
            </li>
            <li>
              <span>
                <Landmark size={14} /> Withdrawn
              </span>
              <b>{sol(data.balance.withdrawn)} SOL</b>
            </li>
          </ul>

          <p className={styles.clockNote}>Withdrawals are managed in Wallet. Nothing is sent from this page.</p>
          <Link className={styles.primary} href={walletHref}>
            Open Wallet <ArrowRight size={14} />
          </Link>
        </article>
      </section>

      <section className={styles.how}>
        <div className={styles.cardHead}>
          <div>
            <p className={styles.kicker}>
              <ShieldCheck size={12} /> Protocol
            </p>
            <h2>How WLT airdrops work</h2>
          </div>
        </div>
        <ol>
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <span className={styles.stepIco}>
                <step.Icon size={16} />
              </span>
              <div>
                <small>0{index + 1}</small>
                <b>{step.title}</b>
                <p>{step.copy}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.tableCard}>
        <div className={styles.cardHead}>
          <div>
            <p className={styles.kicker}>
              <Clock3 size={12} /> Ledger
            </p>
            <h2>Released history</h2>
          </div>
        </div>
        {data.history.length ? (
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Airdrop</th>
                  <th>SOL received</th>
                  <th>USD equivalent</th>
                  <th>Status</th>
                  <th>Transaction</th>
                </tr>
              </thead>
              <tbody>
                {data.history.map((row) => (
                  <tr key={row.id}>
                    <td>{stamp(row.at)}</td>
                    <td>{row.label}</td>
                    <td>{sol(row.sol)} SOL</td>
                    <td>{money(row.usd)}</td>
                    <td>
                      <em className={styles.pill}>{row.status}</em>
                    </td>
                    <td className={styles.hash}>{row.txHash || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className={styles.empty}>
            <EyeOff size={16} /> No completed airdrops yet. Future amounts stay hidden until an admin distributes a Saturday drop.
          </p>
        )}
      </section>
    </div>
  );
}
