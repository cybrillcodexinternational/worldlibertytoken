"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Banknote,
  BatteryCharging,
  CalendarClock,
  Coins,
  Crown,
  Fingerprint,
  Flame,
  History,
  Landmark,
  Layers,
  Rocket,
  ShieldCheck,
  Sparkles,
  Ticket,
  TimerReset,
  Trophy,
  Wallet,
  WandSparkles,
  Zap,
} from "lucide-react";
import styles from "./rewards.module.css";

const TIER_META = {
  Spark: { Icon: Zap, hue: "#c9f53a" },
  Pulse: { Icon: Activity, hue: "#b6e22b" },
  Charge: { Icon: BatteryCharging, hue: "#d7ff5c" },
  Boost: { Icon: Rocket, hue: "#e8ff86" },
  Strike: { Icon: Flame, hue: "#ffd36a" },
  Vault: { Icon: Landmark, hue: "#f3f6ea" },
  Liberty: { Icon: Crown, hue: "#fff4b0" },
};

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

function splitClock(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    hours: String(Math.floor(total / 3600)).padStart(2, "0"),
    minutes: String(Math.floor((total % 3600) / 60)).padStart(2, "0"),
    seconds: String(total % 60).padStart(2, "0"),
  };
}

function tierForAmount(amount, odds = []) {
  const match = odds.find((tier) => Number(tier.amount) === Number(amount));
  return match?.label || null;
}

function FoilLayer({ active, onBegin, onClear }) {
  const canvasRef = useRef(null);
  const wrappingRef = useRef(null);
  const drawing = useRef(false);
  const cleared = useRef(false);
  const begun = useRef(false);
  const moves = useRef(0);

  const paintFoil = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrappingRef.current;
    if (!canvas || !wrap || cleared.current) {
      return;
    }
    const rect = wrap.getBoundingClientRect();
    if (rect.width < 8 || rect.height < 8) {
      return;
    }
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, "#e7ff7a");
    gradient.addColorStop(0.28, "#c9f53a");
    gradient.addColorStop(0.55, "#8fa53a");
    gradient.addColorStop(0.78, "#d6e86a");
    gradient.addColorStop(1, "#5d6828");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);

    ctx.globalAlpha = 0.16;
    for (let i = 0; i < 22; i += 1) {
      ctx.fillStyle = i % 2 ? "#ffffff" : "#111806";
      ctx.fillRect(i * (rect.width / 14) - 50, -30, 16, rect.height + 60);
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = "rgba(16, 20, 12, 0.62)";
    ctx.font = "800 15px Segoe UI";
    ctx.textAlign = "center";
    ctx.fillText("SCRATCH TO REVEAL", rect.width / 2, rect.height / 2 - 8);
    ctx.font = "700 11px Segoe UI";
    ctx.fillText("MATCH 3  ·  DAILY WLT TICKET", rect.width / 2, rect.height / 2 + 16);
  }, []);

  useEffect(() => {
    if (!active) {
      return undefined;
    }
    begun.current = false;
    cleared.current = false;
    paintFoil();
    const onResize = () => paintFoil();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [active, paintFoil]);

  function measureClear(ctx, canvas) {
    const sample = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparent = 0;
    for (let i = 3; i < sample.length; i += 32) {
      if (sample[i] < 40) {
        transparent += 1;
      }
    }
    return transparent / (sample.length / 32);
  }

  function scratchAt(event) {
    const canvas = canvasRef.current;
    if (!canvas || !active || cleared.current) {
      return;
    }
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 26, 0, Math.PI * 2);
    ctx.fill();

    moves.current += 1;
    if (moves.current % 4 !== 0) {
      return;
    }
    if (measureClear(ctx, canvas) > 0.5) {
      cleared.current = true;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      onClear();
    }
  }

  if (!active) {
    return null;
  }

  return (
    <div
      ref={wrappingRef}
      className={styles.foilWrap}
      onPointerDown={async (event) => {
        drawing.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        if (onBegin && !begun.current) {
          begun.current = true;
          await onBegin();
        }
        scratchAt(event);
      }}
      onPointerMove={(event) => {
        if (drawing.current) {
          scratchAt(event);
        }
      }}
      onPointerUp={() => {
        drawing.current = false;
      }}
    >
      <canvas ref={canvasRef} className={styles.foil} />
    </div>
  );
}

function PrizeGlyph({ label, size = 18 }) {
  const meta = TIER_META[label] || TIER_META.Spark;
  const Icon = meta.Icon;
  return <Icon size={size} strokeWidth={1.8} />;
}

export default function RewardsStudio() {
  const [payload, setPayload] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [foilOn, setFoilOn] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const loadStatus = useCallback(async () => {
    const response = await fetch("/api/rewards/status", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to load scratch card.");
    }
    setPayload(data);
    if (data.today) {
      setFoilOn(false);
      setRevealed(true);
    } else {
      setFoilOn(true);
      setRevealed(false);
    }
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

    const tick = setInterval(() => setNow(Date.now()), 250);
    return () => {
      alive = false;
      clearInterval(tick);
    };
  }, [loadStatus]);

  const resetMs = useMemo(() => {
    if (!payload?.resetsAt) {
      return 0;
    }
    return Math.max(0, new Date(payload.resetsAt).getTime() - now);
  }, [payload, now]);

  const resetProgress = useMemo(() => {
    const dayMs = 24 * 60 * 60 * 1000;
    return Math.min(100, Math.max(0, ((dayMs - resetMs) / dayMs) * 100));
  }, [resetMs]);

  async function dealCard() {
    setStarting(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/rewards/complete", { method: "POST" });
      const data = await response.json();
      if (!response.ok && !data.today) {
        throw new Error(data.message || "Could not deal today's card.");
      }
      setPayload(data);
      if (data.today && data.ok === false) {
        setFoilOn(false);
        setRevealed(true);
        setNotice(data.message);
        return;
      }
      setFoilOn(true);
      setRevealed(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setStarting(false);
    }
  }

  if (loading) {
    return <div className={styles.studio}>Loading scratch ticket…</div>;
  }

  if (!payload) {
    return <div className={styles.studio}>{error || "Scratch & Win is unavailable."}</div>;
  }

  const grid = payload.today?.grid || Array(9).fill(null);
  const winAmount = payload.today?.prize;
  const showWin = revealed && payload.today;
  const scratching = foilOn && !revealed;
  const clock = splitClock(resetMs);
  const sealed = Boolean(payload.today) && revealed;

  return (
    <div className={styles.studio}>
      <section className={styles.heroRow}>
        <article className={`${styles.ticket} ${scratching ? styles.ticketLive : ""} ${showWin ? styles.ticketWon : ""}`}>
          <div className={styles.scanlines} />
          <div className={styles.ticketHead}>
            <div>
              <p className={styles.kicker}>SCRATCH PROTOCOL</p>
              <h1>Daily WLT ticket</h1>
            </div>
            <span className={sealed ? styles.statusIdle : styles.statusLive}>
              <i />
              {sealed ? "SEALED" : scratching ? "LIVE FOIL" : "READY"}
            </span>
          </div>

          <ul className={styles.process}>
            <li className={!payload.today || scratching ? styles.stepActive : styles.stepDone}>
              <Ticket size={16} />
              Deal
            </li>
            <li className={scratching ? styles.stepActive : sealed ? styles.stepDone : ""}>
              <Fingerprint size={16} />
              Scratch
            </li>
            <li className={showWin ? styles.stepActive : ""}>
              <Layers size={16} />
              Match 3
            </li>
            <li className={showWin ? styles.stepDone : ""}>
              <Wallet size={16} />
              Credit
            </li>
          </ul>

          <div className={`${styles.cardStage} ${showWin ? styles.cardWon : ""}`}>
            <div className={styles.orbit} aria-hidden>
              <span />
              <span />
              <span />
            </div>
            <div className={styles.grid}>
              {grid.map((amount, index) => {
                const label = amount === null ? null : tierForAmount(amount, payload.odds);
                const win = Boolean(winAmount && amount === winAmount && revealed);
                return (
                  <motion.div
                    key={`${amount}-${index}`}
                    className={`${styles.cell} ${win ? styles.cellWin : ""}`}
                    initial={false}
                    animate={win ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                    transition={{ duration: 0.7, delay: index * 0.04 }}
                  >
                    {amount === null ? (
                      <Sparkles size={18} />
                    ) : (
                      <>
                        <span className={styles.cellIcon}>
                          <PrizeGlyph label={label} />
                        </span>
                        <small>{label || "WLT"}</small>
                        <b>{Number(amount).toFixed(3)}</b>
                      </>
                    )}
                  </motion.div>
                );
              })}
            </div>
            <FoilLayer
              active={scratching}
              onBegin={async () => {
                if (payload.canPlay && !starting) {
                  await dealCard();
                }
              }}
              onClear={() => {
                setRevealed(true);
                setFoilOn(false);
                setNotice(payload.message || `You won ${formatToken(payload.todayPrize)} WLT.`);
              }}
            />
            {showWin ? (
              <div className={styles.confetti} aria-hidden>
                {Array.from({ length: 14 }, (_, i) => (
                  <i key={i} style={{ "--i": i }} />
                ))}
              </div>
            ) : null}
          </div>

          {showWin ? (
            <motion.div className={styles.winBanner} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <span className={styles.winGlyph}>
                <PrizeGlyph label={payload.today.label} size={20} />
              </span>
              <div>
                <strong>{payload.today.label} matched</strong>
                <p>{formatToken(payload.today.prize)} WLT credited to wallet.</p>
              </div>
              <WandSparkles size={18} />
            </motion.div>
          ) : (
            <div className={styles.hintRow}>
              <Fingerprint size={16} />
              <p>
                {starting
                  ? "Sealing today's ticket…"
                  : scratching
                    ? "Drag across the foil. Three matching icons bank the prize."
                    : `Ticket sealed. Next draw in ${formatClock(resetMs)}.`}
              </p>
            </div>
          )}
        </article>
      </section>

      <section className={`${styles.vault} ${scratching ? styles.controlLive : ""}`}>
        <div className={styles.vaultAura} />
        <div className={styles.controlHead}>
          <div>
            <p className={styles.kicker}>VAULT LINK</p>
            <h2>Wallet feed</h2>
          </div>
          <span className={styles.vaultBadge}>
            <TimerReset size={14} />
            UTC MIDNIGHT
          </span>
        </div>

        <div className={styles.vaultBody}>
          <div className={styles.countStage}>
            <p className={styles.countLabel}>Next card in</p>
            <div className={styles.countRow}>
              {[
                ["HOURS", clock.hours],
                ["MINUTES", clock.minutes],
                ["SECONDS", clock.seconds],
              ].map(([unit, value], index) => (
                <div key={unit} className={styles.countBlock}>
                  {index ? <span className={styles.countColon}>:</span> : null}
                  <article>
                    <b>
                      <span>{value[0]}</span>
                      <span>{value[1]}</span>
                    </b>
                    <small>{unit}</small>
                  </article>
                </div>
              ))}
            </div>
            <div className={styles.countTrack}>
              <i style={{ width: `${resetProgress}%` }} />
            </div>
            <div className={styles.capRow}>
              <span>Cycle consumed</span>
              <b>{Math.round(resetProgress)}% · 24h UTC</b>
            </div>
          </div>

          <div className={styles.vaultMetrics}>
            <article className={styles.metricTile}>
              <Wallet size={16} />
              <p>Balance</p>
              <h3>{formatToken(payload.balance)}</h3>
              <em>WLT</em>
            </article>
            <article className={styles.metricTile}>
              <Coins size={16} />
              <p>Today</p>
              <h3>{payload.today ? formatToken(payload.today.prize) : "—"}</h3>
              <em>{payload.today?.label || "unplayed"}</em>
            </article>
            <article className={styles.metricTile}>
              <Trophy size={16} />
              <p>Best card</p>
              <h3>{formatToken(payload.bestWin)}</h3>
              <em>lifetime</em>
            </article>
            <article className={styles.metricTile}>
              <Ticket size={16} />
              <p>Plays</p>
              <h3>{payload.plays}</h3>
              <em>tickets</em>
            </article>
          </div>
        </div>
      </section>

      {error ? <p className={styles.alert}>{error}</p> : null}
      {notice && showWin ? <p className={styles.ok}>{notice}</p> : null}

      <section className={styles.statsRow}>
        <article className={styles.statCard}>
          <span className={styles.statIcon}><Banknote size={18} /></span>
          <div>
            <p>Lifetime wins</p>
            <h3>{formatToken(payload.lifetimeEarned)} <em>WLT</em></h3>
          </div>
        </article>
        <article className={styles.statCard}>
          <span className={styles.statIcon}><ShieldCheck size={18} /></span>
          <div>
            <p>Fair draw</p>
            <h3>Server prize</h3>
          </div>
        </article>
        <article className={styles.statCard}>
          <span className={styles.statIcon}><CalendarClock size={18} /></span>
          <div>
            <p>Cadence</p>
            <h3>1 / UTC day</h3>
          </div>
        </article>
        <article className={styles.statCard}>
          <span className={styles.statIcon}><Crown size={18} /></span>
          <div>
            <p>Jackpot</p>
            <h3>1.0000000 <em>WLT</em></h3>
          </div>
        </article>
      </section>

      <section className={styles.gridRow}>
        <article className={styles.historyCard}>
          <div className={styles.ticketHead}>
            <div>
              <p className={styles.kicker}>PAYOUT MAP</p>
              <h2>Match three icons</h2>
            </div>
            <span className={styles.vaultBadge}>
              <Layers size={14} />
              7 TIERS
            </span>
          </div>
          <p className={styles.lede}>Scratch the foil. Three identical icons credit that tier to your wallet.</p>
          <div className={styles.ladder}>
            {payload.odds.map((tier, index) => {
              const width = Number(String(tier.chance).replace("%", ""));
              const rare = width <= 2.5;
              return (
                <motion.article
                  key={tier.label}
                  className={`${styles.ladderRow} ${rare ? styles.ladderRare : ""}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <div className={styles.ladderIcons} aria-hidden>
                    <span><PrizeGlyph label={tier.label} size={15} /></span>
                    <span><PrizeGlyph label={tier.label} size={15} /></span>
                    <span><PrizeGlyph label={tier.label} size={15} /></span>
                  </div>
                  <div className={styles.oddsCopy}>
                    <div className={styles.ladderMeta}>
                      <strong>{tier.label}</strong>
                      <small>{tier.chance} drop</small>
                    </div>
                    <div className={styles.oddsBar}>
                      <i style={{ width: `${Math.max(10, width)}%` }} />
                    </div>
                  </div>
                  <b>{formatToken(tier.amount)} <em>WLT</em></b>
                </motion.article>
              );
            })}
          </div>
        </article>

        <article className={styles.yieldCard}>
          <div className={styles.ticketHead}>
            <div>
              <p className={styles.kicker}>TICKET LOG</p>
              <h2>Last 7 draws</h2>
            </div>
            <span className={styles.vaultBadge}>
              <History size={14} />
              HISTORY
            </span>
          </div>
          {payload.history.length ? (
            <ol className={styles.timeline}>
              {payload.history.map((row, index) => (
                <li key={row.day} className={index === 0 ? styles.timelineNow : ""}>
                  <span className={styles.timelineDot}>
                    <PrizeGlyph label={row.label} size={14} />
                  </span>
                  <div>
                    <strong>{row.label}</strong>
                    <small>{row.day}</small>
                  </div>
                  <b>+{formatToken(row.prize)}</b>
                </li>
              ))}
            </ol>
          ) : (
            <div className={styles.emptyLog}>
              <Ticket size={22} />
              <strong>No tickets yet</strong>
              <p>Scratch today’s foil to open the seven-day log.</p>
            </div>
          )}
          <div className={styles.legend}>
            <span>
              <TimerReset size={14} /> UTC reset
            </span>
            <span>
              <Sparkles size={14} /> Instant credit
            </span>
            <span>
              <Flame size={14} /> Liberty jackpot
            </span>
          </div>
        </article>
      </section>
    </div>
  );
}
