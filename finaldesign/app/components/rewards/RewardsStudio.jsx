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

function CoinDropGame({ active, disabled, onComplete }) {
  const completed = useRef(false);
  const [coins, setCoins] = useState([]);
  const [caught, setCaught] = useState(0);

  useEffect(() => {
    if (!active) {
      return undefined;
    }
    completed.current = false;
    setCaught(0);
    setCoins(Array.from({ length: 12 }, (_, index) => ({ id: index, collected: false })));
    return undefined;
  }, [active]);

  function collectCoin(id) {
    if (disabled || completed.current) {
      return;
    }
    setCoins((current) => current.map((coin) => (coin.id === id ? { ...coin, collected: true } : coin)));
    setCaught((value) => {
      const next = value + 1;
      if (next >= 7 && !completed.current) {
        completed.current = true;
        onComplete();
      }
      return Math.min(7, next);
    });
  }

  if (!active) return null;

  return (
    <div className={styles.coinArena} role="application" aria-label="Daily Rewards coin collection game">
      <div className={styles.coinInstructions}>Tap 7 WLT coins to unlock your daily reward</div>
      <div className={styles.tapCoinGrid}>
        {coins.map((coin) => (
          <button
            key={coin.id}
            type="button"
            className={`${styles.dropCoin} ${coin.collected ? styles.coinCollected : ""}`}
            onClick={() => collectCoin(coin.id)}
            disabled={coin.collected || disabled}
            aria-label={coin.collected ? "WLT coin collected" : "Collect WLT coin"}
          >
            <Coins size={22} />
          </button>
        ))}
      </div>
      <div className={styles.catchProgress}><span style={{ width: `${(caught / 7) * 100}%` }} /><b>{caught} / 7 collected</b></div>
    </div>
  );

  useEffect(() => {
    if (!active || disabled) {
      return undefined;
    }
    coinsRef.current = [];
    nextId.current = 0;
    lastFrame.current = performance.now();
    spawnTimer.current = 0;
    completed.current = false;
    setCoins([]);
    setCaught(0);
    setCatcher(50);

    let frame;
    const tick = (time) => {
      const delta = Math.min(40, time - lastFrame.current);
      lastFrame.current = time;
      spawnTimer.current += delta;
      if (spawnTimer.current > 620) {
        spawnTimer.current = 0;
        coinsRef.current.push({ id: nextId.current++, left: 8 + Math.random() * 84, top: -10, speed: 0.045 + Math.random() * 0.035 });
      }
      const arena = arenaRef.current;
      const catcherBox = catcherRef.current?.getBoundingClientRect();
      const arenaBox = arena?.getBoundingClientRect();
      const nextCoins = [];
      let caughtNow = 0;
      coinsRef.current.forEach((coin) => {
        const nextTop = coin.top + coin.speed * delta;
        const isCatchHeight = nextTop > 78 && nextTop < 90;
        const isCaught = isCatchHeight && catcherBox && arenaBox && Math.abs((coin.left / 100) * arenaBox.width - (catcherBox.left - arenaBox.left + catcherBox.width / 2)) < 42;
        if (isCaught) {
          caughtNow += 1;
        } else if (nextTop < 104) {
          nextCoins.push({ ...coin, top: nextTop });
        }
      });
      coinsRef.current = nextCoins;
      if (caughtNow) {
        setCaught((value) => {
          const next = value + caughtNow;
          if (next >= 7 && !completed.current) {
            completed.current = true;
            onComplete();
          }
          return Math.min(7, next);
        });
      }
      setCoins(nextCoins);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, disabled, onComplete]);

  function moveCatcher(clientX) {
    const arena = arenaRef.current;
    if (!arena) return;
    const rect = arena.getBoundingClientRect();
    setCatcher(Math.min(90, Math.max(10, ((clientX - rect.left) / rect.width) * 100)));
  }

  useEffect(() => {
    const onKeyDown = (event) => {
      if (!active || disabled) return;
      setCatcher((value) => Math.min(90, Math.max(10, value + (event.key === "ArrowRight" ? 5 : event.key === "ArrowLeft" ? -5 : 0))));
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, disabled]);

  if (!active) return null;

  return (
    <div
      ref={arenaRef}
      className={styles.coinArena}
      onPointerMove={(event) => event.buttons && moveCatcher(event.clientX)}
      onPointerDown={(event) => moveCatcher(event.clientX)}
      role="application"
      aria-label="Daily Rewards game"
    >
      <div className={styles.coinInstructions}>Catch 7 WLT coins to unlock your daily reward</div>
      {coins.map((coin) => <span key={coin.id} className={styles.dropCoin} style={{ left: `${coin.left}%`, top: `${coin.top}%` }}><Coins size={22} /></span>)}
      <div ref={catcherRef} className={styles.coinCatcher} style={{ left: `${catcher}%` }}><Wallet size={22} /><span>WLT</span></div>
      <div className={styles.catchProgress}><span style={{ width: `${(caught / 7) * 100}%` }} /><b>{caught} / 7 caught</b></div>
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
  const [gameOn, setGameOn] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const loadStatus = useCallback(async () => {
    const response = await fetch("/api/rewards/status", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to load Daily Rewards.");
    }
    setPayload(data);
    if (data.today) {
      setGameOn(false);
      setRevealed(true);
    } else {
      setGameOn(true);
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

  const completeGame = useCallback(async () => {
    setStarting(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/rewards/complete", { method: "POST" });
      const data = await response.json();
      if (!response.ok && !data.today) {
        throw new Error(data.message || "Could not start Daily Rewards.");
      }
      setPayload(data);
      if (data.today && data.ok === false) {
        setGameOn(false);
        setRevealed(true);
        setNotice(data.message);
        return;
      }
      setGameOn(false);
      setRevealed(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setStarting(false);
    }
  }, []);

  if (loading) {
    return <div className={styles.studio}>Loading Daily Rewards…</div>;
  }

  if (!payload) {
    return <div className={styles.studio}>{error || "Daily Rewards is unavailable."}</div>;
  }

  const grid = payload.today?.grid || Array(9).fill(null);
  const winAmount = payload.today?.prize;
  const showWin = revealed && payload.today;
  const playing = gameOn && !revealed;
  const clock = splitClock(resetMs);
  const sealed = Boolean(payload.today) && revealed;

  return (
    <div className={styles.studio}>
      <section className={styles.heroRow}>
        <article className={`${styles.ticket} ${playing ? styles.ticketLive : ""} ${showWin ? styles.ticketWon : ""}`}>
          <div className={styles.scanlines} />
          <div className={styles.ticketHead}>
            <div>
              <p className={styles.kicker}>DAILY REWARDS PROTOCOL</p>
              <h1>Catch your WLT reward</h1>
            </div>
            <span className={sealed ? styles.statusIdle : styles.statusLive}>
              <i />
              {sealed ? "CLAIMED" : playing ? "DROP LIVE" : "READY"}
            </span>
          </div>

          <ul className={styles.process}>
            <li className={!payload.today || playing ? styles.stepActive : styles.stepDone}>
              <Coins size={16} />
              Drop
            </li>
            <li className={playing ? styles.stepActive : sealed ? styles.stepDone : ""}>
              <Fingerprint size={16} />
              Catch
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
            {showWin ? <div className={styles.grid}>
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
            </div> : <CoinDropGame active={playing} disabled={starting} onComplete={completeGame} />}
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
                  ? "Counting your WLT reward…"
                  : playing
                    ? "Tap the coins to collect 7 WLT pieces."
                    : `Reward claimed. Next drop in ${formatClock(resetMs)}.`}
              </p>
            </div>
          )}
        </article>
      </section>

      <section className={`${styles.vault} ${playing ? styles.controlLive : ""}`}>
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
          <p className={styles.lede}>Catch 7 WLT coins to unlock one server-generated daily reward.</p>
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
              <p>Catch today’s coins to open the seven-day log.</p>
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
