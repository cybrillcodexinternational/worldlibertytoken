"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Coins,
  Cpu,
  Gauge,
  History,
  Hourglass,
  Lock,
  Pickaxe,
  Power,
  Radio,
  ShieldCheck,
  TimerReset,
  TrendingUp,
  Wallet,
  Waves,
  Zap,
} from "lucide-react";
import styles from "./mining.module.css";
import { TOKEN_LOCK } from "@/lib/token-lock";

const HASH_STREAM = Array.from({ length: 18 }, (_, i) => i);

function formatToken(value) {
  return Number(value || 0).toFixed(7);
}

function formatClock(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function hashRateAt(elapsedSec, mining) {
  if (!mining) {
    return 0.8 + Math.abs(Math.sin(elapsedSec / 9)) * 1.4;
  }
  return (
    126.4 +
    Math.sin(elapsedSec / 6.5) * 9.8 +
    Math.sin(elapsedSec / 2.4) * 4.6 +
    Math.cos(elapsedSec / 11) * 3.2
  );
}

function buildChart(elapsedMs, mining) {
  const elapsedSec = Math.floor(elapsedMs / 1000);
  return Array.from({ length: 28 }, (_, index) => {
    const t = Math.max(0, elapsedSec - (27 - index) * 8);
    return {
      t: index,
      rate: Number(hashRateAt(t, mining).toFixed(2)),
    };
  });
}

function liveMined(session, now) {
  if (!session) {
    return 0;
  }
  const started = new Date(session.startedAt).getTime();
  const ends = new Date(session.endsAt).getTime();
  const reward = Number(session.reward);
  if (now >= ends || session.status !== "active") {
    return reward;
  }
  const progress = Math.min(1, Math.max(0, (now - started) / (ends - started)));
  return Number((reward * progress).toFixed(7));
}

export default function MiningStudio() {
  const [payload, setPayload] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  const loadStatus = useCallback(async () => {
    const response = await fetch("/api/mining/status", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to load mining status.");
    }
    setPayload(data);
    setNow(Date.now());
    return data;
  }, []);

  useEffect(() => {
    let alive = true;
    loadStatus()
      .catch((err) => {
        if (alive) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (alive) {
          setLoading(false);
        }
      });

    const tick = setInterval(() => setNow(Date.now()), 200);
    const sync = setInterval(() => {
      loadStatus().catch(() => {});
    }, 15000);

    return () => {
      alive = false;
      clearInterval(tick);
      clearInterval(sync);
    };
  }, [loadStatus]);

  const session = payload?.session || null;
  const mining = Boolean(session && session.status === "active" && now < new Date(session.endsAt).getTime());
  const remainingMs = mining ? Math.max(0, new Date(session.endsAt).getTime() - now) : 0;
  const elapsedMs = mining
    ? Math.max(0, now - new Date(session.startedAt).getTime())
    : session
      ? Number(session.durationMs || 0)
      : 0;
  const progress = mining
    ? Math.min(1, elapsedMs / Number(session.durationMs || 1))
    : session?.status === "completed"
      ? 1
      : 0;
  const mined = liveMined(session, now);
  const chart = useMemo(() => buildChart(elapsedMs, mining), [elapsedMs, mining]);
  const hashRate = hashRateAt(elapsedMs / 1000, mining);
  const canStart = Boolean(payload?.canStart) || (!mining && !loading);
  const completed = Boolean(session && !mining);

  async function handleStart() {
    setStarting(true);
    setError("");
    try {
      const response = await fetch("/api/mining/start", { method: "POST" });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to start mining.");
      }
      setPayload(data);
      setNow(Date.now());
    } catch (err) {
      setError(err.message);
    } finally {
      setStarting(false);
    }
  }

  const ringStyle = {
    background: `conic-gradient(#c9f53a ${progress * 360}deg, rgba(201,245,58,0.08) 0deg)`,
  };

  return (
    <section className={styles.studio}>
      <div className={styles.heroRow}>
        <motion.article
          className={`${styles.reactorCard} ${mining ? styles.reactorLive : ""}`}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.scanlines} />

          <div className={styles.reactorHead}>
            <div>
              <p className={styles.kicker}>
                {mining ? "CYCLE ONLINE" : completed ? "CYCLE COMPLETE" : "MINER STANDBY"}
              </p>
              <h1>WLT Quantum Miner</h1>
            </div>
            <span className={mining ? styles.statusLive : styles.statusIdle}>
              <i />
              {mining ? "Hashing" : completed ? "Idle" : "Offline"}
            </span>
          </div>

          <div className={styles.reactorBody}>
            <div className={styles.reactorStage}>
              <div className={styles.hashRain} aria-hidden="true">
                {HASH_STREAM.slice(0, 10).map((col) => (
                  <span key={col} style={{ animationDelay: `${col * 0.18}s` }}>
                    {mining ? "A7F91C 0E8B3D C1EA46" : "000000 111111 0A0A0A"}
                  </span>
                ))}
              </div>
              <div className={styles.reactor}>
                <div className={`${styles.ring} ${styles.ringA}`} />
                <div className={`${styles.ring} ${styles.ringB}`} />
                <div className={`${styles.ring} ${styles.ringC}`} />
                <div className={styles.beam} />
                <div className={styles.core}>
                  <Pickaxe size={34} strokeWidth={1.6} />
                </div>
                <div className={styles.pickOrbit}>
                  <i />
                </div>
              </div>
              <p className={styles.coreLabel}>{mining ? "Node extracting" : "Awaiting start"}</p>
            </div>

            <div className={styles.reactorInfo}>
              <ol className={styles.process}>
                <li className={mining || completed ? styles.stepDone : styles.stepActive}>
                  <Power size={14} />
                  <span>Start</span>
                </li>
                <li className={mining ? styles.stepActive : completed ? styles.stepDone : styles.stepIdle}>
                  <Waves size={14} />
                  <span>Mine 24h</span>
                </li>
                <li className={completed ? styles.stepActive : styles.stepIdle}>
                  <Lock size={14} />
                  <span>Auto-stop</span>
                </li>
                <li className={styles.stepIdle}>
                  <TimerReset size={14} />
                  <span>Restart</span>
                </li>
              </ol>

              <div className={styles.reactorTiles}>
                <article>
                  <span className={styles.metricIcon}>
                    <Coins size={16} />
                  </span>
                  <p>Cycle cap</p>
                  <h3>2.8756990 <em>WLT</em></h3>
                </article>
                <article>
                  <span className={styles.metricIcon}>
                    <Hourglass size={16} />
                  </span>
                  <p>Locked window</p>
                  <h3>24 <em>hours</em></h3>
                </article>
                <article>
                  <span className={styles.metricIcon}>
                    <Zap size={16} />
                  </span>
                  <p>Emission</p>
                  <h3>Linear</h3>
                </article>
                <article>
                  <span className={styles.metricIcon}>
                    <ShieldCheck size={16} />
                  </span>
                  <p>Shutdown</p>
                  <h3>Automatic</h3>
                </article>
              </div>
            </div>
          </div>
        </motion.article>

        <motion.article
          className={`${styles.controlCard} ${mining ? styles.controlLive : ""}`}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
        >
          <div className={styles.controlHead}>
            <div>
              <p className={styles.controlKicker}>
                {mining ? "LIVE EXTRACTION" : completed ? "CYCLE CLOSED" : "READY TO MINE"}
              </p>
              <h2>{mining ? "Extracting yield" : completed ? "Restart required" : "Ready to initialize"}</h2>
            </div>
            <span className={mining ? styles.statusLive : styles.statusIdle}>
              <i />
              {mining ? "Online" : completed ? "Stopped" : "Standby"}
            </span>
          </div>

          <div className={styles.infographic}>
            <div className={styles.gaugeCol}>
              <div className={styles.progressRing} style={ringStyle}>
                <div className={styles.progressInner}>
                  <Coins size={16} strokeWidth={1.8} />
                  <small>Mined now</small>
                  <strong>{formatToken(mined)}</strong>
                  <span>WLT</span>
                </div>
              </div>
              <div className={styles.capRow}>
                <small>0</small>
                <b>2.8756990 cap</b>
                <small>24h</small>
              </div>
            </div>

            <div className={styles.metricGrid}>
              <article className={styles.metricTile}>
                <span className={styles.metricIcon}>
                  <Hourglass size={18} strokeWidth={1.8} />
                </span>
                <p>Time left</p>
                <h3>{mining ? formatClock(remainingMs) : "24:00:00"}</h3>
              </article>
              <article className={styles.metricTile}>
                <span className={styles.metricIcon}>
                  <Gauge size={18} strokeWidth={1.8} />
                </span>
                <p>Hashrate</p>
                <h3>{hashRate.toFixed(2)} <em>MH/s</em></h3>
              </article>
              <article className={styles.metricTile}>
                <span className={styles.metricIcon}>
                  <Activity size={18} strokeWidth={1.8} />
                </span>
                <p>Progress</p>
                <h3>{(progress * 100).toFixed(2)}%</h3>
              </article>
              <article className={styles.metricTile}>
                <span className={styles.metricIcon}>
                  <TimerReset size={18} strokeWidth={1.8} />
                </span>
                <p>Cycle</p>
                <h3>24 hours</h3>
              </article>
            </div>
          </div>

          <div className={styles.timeline}>
            <div className={styles.timelineBar}>
              <span style={{ width: `${Math.max(3, progress * 100)}%` }} />
            </div>
            <div className={styles.timelineMarks}>
              <small>Start</small>
              <small>12h</small>
              <small>Auto-stop</small>
            </div>
          </div>

          <ul className={styles.legend}>
            <li>
              <Lock size={14} /> Mined WLT locked until trade
            </li>
            <li>
              <Coins size={14} /> 2.8756990 WLT / cycle
            </li>
            <li>
              <Clock3 size={14} /> Manual restart
            </li>
          </ul>

          <button
            type="button"
            className={mining ? styles.busyBtn : styles.startBtn}
            onClick={handleStart}
            disabled={loading || starting || mining || !payload?.canStart}
          >
            {starting
              ? "Initializing..."
              : mining
                ? "Mining in progress"
                : completed
                  ? "Restart Mining"
                  : "Start Mining"}
          </button>
          {error ? <p className={styles.error}>{error}</p> : null}
        </motion.article>
      </div>

      <section className={styles.statsRow}>
        {payload && [
          { label: "Cycle Reward", value: formatToken(payload.reward), unit: "WLT", hint: "Hard cap / 24h", Icon: Pickaxe },
          { label: "Wallet Balance", value: formatToken(payload.balance), unit: "WLT", hint: "Credited + live", Icon: Wallet },
          { label: "Lifetime Mined", value: formatToken(payload.lifetimeMined), unit: "WLT", hint: "All completed cycles", Icon: Coins },
          { label: "Completed Cycles", value: String(payload.cycles), unit: "runs", hint: "Auto-stopped windows", Icon: Cpu },
        ].map((item, index) => (
          <motion.article
            key={item.label}
            className={styles.statCard}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + index * 0.05 }}
          >
            <div className={styles.statTop}>
              <span className={styles.metricIcon}>
                <item.Icon size={16} strokeWidth={1.8} />
              </span>
              <small>{item.hint}</small>
            </div>
            <p>{item.label}</p>
            <h3>
              {item.value} <em>{item.unit}</em>
            </h3>
          </motion.article>
        ))}
      </section>

      <section className={styles.gridRow}>
        <article className={styles.chartCard}>
          <div className={styles.cardHead}>
            <div className={styles.headCopy}>
              <span className={styles.metricIcon}>
                <Activity size={16} strokeWidth={1.8} />
              </span>
              <div>
                <h3>Live Hashrate Graph</h3>
                <p>{mining ? "Nonce stream locked to this 24h cycle." : "Miner idle. Hashrate in standby."}</p>
              </div>
            </div>
            <span className={mining ? styles.statusLive : styles.statusIdle}>
              <i />
              {mining ? "Live" : "Idle"}
            </span>
          </div>

          <div className={styles.chartMeta}>
            <div>
              <Radio size={14} />
              <b>{hashRate.toFixed(2)}</b>
              <small>MH/s now</small>
            </div>
            <div>
              <TrendingUp size={14} />
              <b>{Math.max(...chart.map((point) => point.rate)).toFixed(2)}</b>
              <small>peak window</small>
            </div>
            <div>
              <Gauge size={14} />
              <b>{mining ? "126+" : "1.4"}</b>
              <small>target band</small>
            </div>
          </div>

          <div className={styles.chartWrap}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="hashFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c9f53a" stopOpacity={0.42} />
                    <stop offset="100%" stopColor="#c9f53a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" hide />
                <YAxis hide domain={[0, 160]} />
                <Tooltip
                  cursor={{ stroke: "rgba(201,245,58,0.28)" }}
                  contentStyle={{
                    background: "#0c1008",
                    border: "1px solid rgba(201,245,58,0.35)",
                    borderRadius: 10,
                    color: "#eef6d2",
                    fontSize: 12,
                  }}
                  formatter={(value) => [`${value} MH/s`, "Hashrate"]}
                />
                <Area type="monotone" dataKey="rate" stroke="#c9f53a" strokeWidth={2.4} fill="url(#hashFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className={styles.yieldCard}>
          <div className={styles.cardHead}>
            <div className={styles.headCopy}>
              <span className={styles.metricIcon}>
                <TrendingUp size={16} strokeWidth={1.8} />
              </span>
              <div>
                <h3>24h Yield Curve</h3>
                <p>Linear emission. Hard cap at 2.8756990 WLT.</p>
              </div>
            </div>
          </div>

          <div className={styles.yieldGauge}>
            <div className={styles.yieldTrack}>
              <span style={{ width: `${Math.max(4, progress * 100)}%` }} />
            </div>
            <div className={styles.yieldScale}>
              <small>0.0000000</small>
              <small>1.4378495</small>
              <small>2.8756990</small>
            </div>
          </div>

          <ul className={styles.yieldFacts}>
            <li>
              <span className={styles.metricIcon}>
                <Zap size={14} />
              </span>
              <b>0.0000333</b>
              <small>WLT / second</small>
            </li>
            <li>
              <span className={styles.metricIcon}>
                <Hourglass size={14} />
              </span>
              <b>0.1198208</b>
              <small>WLT / hour</small>
            </li>
            <li>
              <span className={styles.metricIcon}>
                <Coins size={14} />
              </span>
              <b>2.8756990</b>
              <small>WLT / cycle</small>
            </li>
          </ul>
          {TOKEN_LOCK.minedLocked ? (
            <p className={styles.lockNote}>
              <Lock size={14} />
              Mined tokens stay in your wallet. Withdraw and send stay closed until trade opens.
            </p>
          ) : null}
        </article>
      </section>

      <section className={styles.historyCard}>
        <div className={styles.cardHead}>
          <div className={styles.headCopy}>
            <span className={styles.metricIcon}>
              <History size={16} strokeWidth={1.8} />
            </span>
            <div>
              <h3>Cycle History</h3>
              <p>Completed windows credit 2.8756990 WLT, then wait for restart.</p>
            </div>
          </div>
        </div>
        <ul className={styles.historyList}>
          {(payload?.history || []).length ? (
            payload.history.map((item) => {
              const activeItem = item.status === "active" && now < new Date(item.endsAt).getTime();
              return (
                <li key={item.id} className={activeItem ? styles.historyLive : styles.historyDone}>
                  <span className={activeItem ? styles.historyIconLive : styles.historyIconDone}>
                    {activeItem ? <Pickaxe size={16} /> : <CheckCircle2 size={16} />}
                  </span>
                  <div>
                    <strong>{activeItem ? "Live cycle" : "Completed cycle"}</strong>
                    <small>
                      <CalendarClock size={12} />
                      {new Date(item.startedAt).toLocaleString()} → {new Date(item.endsAt).toLocaleString()}
                    </small>
                  </div>
                  <div className={styles.historyYield}>
                    <b>{formatToken(activeItem ? mined : item.reward)}</b>
                    <small>WLT</small>
                  </div>
                </li>
              );
            })
          ) : (
            <li className={styles.empty}>
              <Pickaxe size={16} />
              No mining cycles yet. Start your first 24-hour run.
            </li>
          )}
        </ul>
      </section>
    </section>
  );
}
