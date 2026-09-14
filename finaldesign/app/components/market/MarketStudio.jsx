"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  ChartNoAxesCombined,
  Search,
  Wallet,
} from "lucide-react";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import styles from "./market.module.css";

const RANGES = ["1H", "24H", "7D", "30D", "90D", "1Y"];
const POLL_MS = 30_000;

function money(value, digits) {
  const n = Number(value || 0);
  const max = digits ?? (Math.abs(n) >= 1 ? 2 : Math.abs(n) >= 0.01 ? 4 : 6);
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: max, maximumFractionDigits: max })}`;
}

function compact(value) {
  const n = Number(value || 0);
  const abs = Math.abs(n);
  if (abs >= 1e12) {
    return `$${(n / 1e12).toFixed(2)}T`;
  }
  if (abs >= 1e9) {
    return `$${(n / 1e9).toFixed(2)}B`;
  }
  if (abs >= 1e6) {
    return `$${(n / 1e6).toFixed(2)}M`;
  }
  if (abs >= 1e3) {
    return `$${(n / 1e3).toFixed(2)}K`;
  }
  return money(n);
}

function pct(value) {
  const n = Number(value || 0);
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

function clock(value) {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleTimeString();
}

function axisTime(ts, range) {
  const date = new Date(ts);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  if (range === "1H" || range === "24H") {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function MiniSpark({ points, up }) {
  if (!points?.length) {
    return <span className={styles.sparkEmpty}>—</span>;
  }
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const d = points
    .map((p, i) => {
      const x = (i / Math.max(points.length - 1, 1)) * 100;
      const y = 26 - ((p - min) / span) * 24;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
  return (
    <svg className={styles.spark} viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden="true">
      <path d={d} fill="none" stroke={up ? "#c9f53a" : "#ff7a7a"} strokeWidth="1.8" />
    </svg>
  );
}

function ChartTip({ active, payload, range }) {
  if (!active || !payload?.length) {
    return null;
  }
  const row = payload[0]?.payload;
  if (!row) {
    return null;
  }
  return (
    <div className={styles.tip}>
      <small>{axisTime(row.t, range)}</small>
      <b>{money(row.price, Math.abs(row.price) >= 1 ? 2 : 6)}</b>
      <em>Vol {compact(row.volume)}</em>
    </div>
  );
}

export default function MarketStudio() {
  const [coins, setCoins] = useState([]);
  const [summary, setSummary] = useState({ marketCap: 0, volume: 0, gainer: null, loser: null });
  const [updatedAt, setUpdatedAt] = useState(null);
  const [stale, setStale] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [range, setRange] = useState("24H");
  const [chart, setChart] = useState({ points: [], high: 0, low: 0 });
  const [chartLoading, setChartLoading] = useState(false);

  useEffect(() => {
    let alive = true;

    async function loadMarkets() {
      try {
        const response = await fetch("/api/market/status", { cache: "no-store" });
        const payload = await response.json();
        if (!alive) {
          return;
        }
        if (!response.ok) {
          setError(payload.message || "Live market feed is unavailable.");
          return;
        }
        setError("");
        setCoins(payload.coins || []);
        setSummary(payload.summary || { marketCap: 0, volume: 0, gainer: null, loser: null });
        setUpdatedAt(payload.updatedAt || null);
        setStale(Boolean(payload.stale));
        setSelectedId((current) => current || payload.coins?.[0]?.id || "");
      } catch {
        if (alive) {
          setError("Live market feed is unavailable.");
        }
      }
    }

    loadMarkets();
    const timer = setInterval(loadMarkets, POLL_MS);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!selectedId) {
      return undefined;
    }
    let alive = true;

    async function loadChart() {
      setChartLoading(true);
      try {
        const response = await fetch(
          `/api/market/chart?id=${encodeURIComponent(selectedId)}&range=${encodeURIComponent(range)}`,
          { cache: "no-store" }
        );
        const payload = await response.json();
        if (!alive) {
          return;
        }
        if (!response.ok) {
          setChart({ points: [], high: 0, low: 0 });
          return;
        }
        setChart({
          points: payload.points || [],
          high: Number(payload.high || 0),
          low: Number(payload.low || 0),
        });
      } catch {
        if (alive) {
          setChart({ points: [], high: 0, low: 0 });
        }
      } finally {
        if (alive) {
          setChartLoading(false);
        }
      }
    }

    loadChart();
    const fast = range === "1H" || range === "24H";
    const timer = setInterval(loadChart, fast ? POLL_MS : 60_000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [selectedId, range]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return coins;
    }
    return coins.filter(
      (coin) => coin.name.toLowerCase().includes(q) || coin.symbol.toLowerCase().includes(q)
    );
  }, [coins, query]);

  const selected = coins.find((coin) => coin.id === selectedId) || coins[0] || null;
  const up = Number(selected?.change24h || 0) >= 0;
  const series = chart.points.map((point) => ({ ...point, vol: point.volume }));

  return (
    <div className={styles.studio}>
      <section className={styles.hero}>
        <i className={styles.scanlines} />
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>
            <Activity size={12} />
            Live markets
            <span className={styles.pulse} />
          </p>
          <h1>Top 30 coins, real-time charts</h1>
          <p className={styles.lead}>
            Ranked by market cap. Tap any asset to open its USD trade view. Prices refresh every 30 seconds.
          </p>
        </div>
        <div className={styles.heroMeta}>
          <small>Last tick</small>
          <b>{clock(updatedAt)}</b>
          <em>{stale ? "Cached feed" : "CoinGecko live"}</em>
        </div>
      </section>

      <section className={styles.kpis}>
        <article>
          <small>Top 30 cap</small>
          <b>{compact(summary.marketCap)}</b>
        </article>
        <article>
          <small>24h volume</small>
          <b>{compact(summary.volume)}</b>
        </article>
        <article>
          <small>Biggest gainer</small>
          <b>{summary.gainer?.symbol || "—"}</b>
          <em className={styles.up}>{pct(summary.gainer?.change24h)}</em>
        </article>
        <article>
          <small>Biggest loser</small>
          <b>{summary.loser?.symbol || "—"}</b>
          <em className={styles.down}>{pct(summary.loser?.change24h)}</em>
        </article>
      </section>

      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.split}>
        <section className={styles.board}>
          <div className={styles.boardHead}>
            <h2>Market board</h2>
            <label className={styles.search}>
              <Search size={14} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search coin or ticker"
              />
            </label>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Asset</th>
                  <th>Price</th>
                  <th>1H</th>
                  <th>24H</th>
                  <th>7D</th>
                  <th>Spark</th>
                  <th>Cap</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((coin) => {
                  const active = coin.id === selected?.id;
                  const dayUp = coin.change24h >= 0;
                  return (
                    <tr
                      key={coin.id}
                      className={active ? styles.rowOn : styles.row}
                      onClick={() => {
                        setSelectedId(coin.id);
                        if (typeof window !== "undefined" && window.matchMedia("(max-width: 1100px)").matches) {
                          document.getElementById("trade-chart")?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                      }}
                    >
                      <td>{coin.rank}</td>
                      <td>
                        <span className={styles.asset}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={coin.image} alt="" />
                          <span>
                            <b>{coin.symbol}</b>
                            <small>{coin.name}</small>
                          </span>
                        </span>
                      </td>
                      <td>{money(coin.price)}</td>
                      <td className={coin.change1h >= 0 ? styles.up : styles.down}>{pct(coin.change1h)}</td>
                      <td className={dayUp ? styles.up : styles.down}>{pct(coin.change24h)}</td>
                      <td className={coin.change7d >= 0 ? styles.up : styles.down}>{pct(coin.change7d)}</td>
                      <td>
                        <MiniSpark points={coin.spark} up={coin.change7d >= 0} />
                      </td>
                      <td>{compact(coin.marketCap)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.trade} id="trade-chart">
          {selected ? (
            <>
              <div className={styles.tradeHead}>
                <div className={styles.pair}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selected.image} alt="" />
                  <div>
                    <p className={styles.kicker}>
                      <ChartNoAxesCombined size={12} />
                      Trade chart
                    </p>
                    <h2>
                      {selected.symbol}
                      <span>/USD</span>
                    </h2>
                    <small>{selected.name}</small>
                  </div>
                </div>
                <div className={styles.priceBlock}>
                  <b className={up ? styles.up : styles.down}>{money(selected.price)}</b>
                  <em className={up ? styles.up : styles.down}>
                    {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {pct(selected.change24h)} 24h
                  </em>
                </div>
              </div>

              <div className={styles.ranges}>
                {RANGES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={item === range ? styles.rangeOn : styles.range}
                    onClick={() => setRange(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className={styles.chartWrap}>
                {chartLoading && !series.length ? <p className={styles.chartWait}>Loading chart…</p> : null}
                {!chartLoading && !series.length ? <p className={styles.chartWait}>No candles for this range.</p> : null}
                {series.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="wltPriceFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={up ? "#c9f53a" : "#ff7a7a"} stopOpacity="0.28" />
                          <stop offset="100%" stopColor={up ? "#c9f53a" : "#ff7a7a"} stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(201,245,58,0.08)" vertical={false} />
                      <XAxis
                        dataKey="t"
                        tickFormatter={(value) => axisTime(value, range)}
                        minTickGap={28}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#8d9578", fontSize: 11 }}
                      />
                      <YAxis
                        yAxisId="price"
                        orientation="right"
                        domain={["auto", "auto"]}
                        tickFormatter={(value) => compact(value).replace("$", "")}
                        axisLine={false}
                        tickLine={false}
                        width={54}
                        tick={{ fill: "#8d9578", fontSize: 11 }}
                      />
                      <YAxis yAxisId="vol" hide domain={[0, "auto"]} />
                      <Tooltip content={<ChartTip range={range} />} />
                      <Bar yAxisId="vol" dataKey="vol" fill="rgba(201,245,58,0.18)" barSize={4} />
                      <Area
                        yAxisId="price"
                        type="monotone"
                        dataKey="price"
                        stroke={up ? "#c9f53a" : "#ff7a7a"}
                        strokeWidth={2}
                        fill="url(#wltPriceFill)"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : null}
              </div>

              <ul className={styles.stats}>
                <li>
                  <small>24h high</small>
                  <b>{money(selected.high24h)}</b>
                </li>
                <li>
                  <small>24h low</small>
                  <b>{money(selected.low24h)}</b>
                </li>
                <li>
                  <small>Range high</small>
                  <b>{money(chart.high)}</b>
                </li>
                <li>
                  <small>Range low</small>
                  <b>{money(chart.low)}</b>
                </li>
                <li>
                  <small>Volume</small>
                  <b>{compact(selected.volume)}</b>
                </li>
                <li>
                  <small>Market cap</small>
                  <b>{compact(selected.marketCap)}</b>
                </li>
              </ul>
            </>
          ) : (
            <div className={styles.emptyTrade}>
              <Wallet size={22} />
              <p>Select a coin to open its trade chart.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
