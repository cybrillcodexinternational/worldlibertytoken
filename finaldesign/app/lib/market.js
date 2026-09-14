const MARKETS_URL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=30&page=1&sparkline=true&price_change_percentage=1h%2C24h%2C7d";

const HEADERS = {
  Accept: "application/json",
  "User-Agent": "WLT-Market/1.0",
};

const RANGE_DAYS = {
  "1H": 1,
  "24H": 1,
  "7D": 7,
  "30D": 30,
  "90D": 90,
  "1Y": 365,
};

const MARKETS_TTL = 20_000;
const CHART_TTL = {
  "1H": 20_000,
  "24H": 20_000,
  "7D": 60_000,
  "30D": 120_000,
  "90D": 180_000,
  "1Y": 300_000,
};

let marketsCache = { at: 0, data: null };
const chartCache = new Map();

function finite(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

async function gecko(url, timeout = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
      headers: HEADERS,
    });
    if (!response.ok) {
      const error = new Error(`Market feed ${response.status}`);
      error.status = response.status;
      throw error;
    }
    return response.json();
  } finally {
    clearTimeout(timer);
  }
}

function mapCoin(row) {
  const spark = Array.isArray(row?.sparkline_in_7d?.price) ? row.sparkline_in_7d.price.map((n) => finite(n)) : [];
  return {
    id: String(row.id || ""),
    rank: finite(row.market_cap_rank),
    name: String(row.name || "Unknown"),
    symbol: String(row.symbol || "").toUpperCase(),
    image: String(row.image || ""),
    price: finite(row.current_price),
    change1h: finite(row.price_change_percentage_1h_in_currency),
    change24h: finite(row.price_change_percentage_24h_in_currency ?? row.price_change_percentage_24h),
    change7d: finite(row.price_change_percentage_7d_in_currency),
    marketCap: finite(row.market_cap),
    volume: finite(row.total_volume),
    high24h: finite(row.high_24h),
    low24h: finite(row.low_24h),
    spark,
  };
}

function summarize(coins) {
  const sorted24h = [...coins].sort((a, b) => b.change24h - a.change24h);
  const gainer = sorted24h[0] || null;
  const loser = sorted24h[sorted24h.length - 1] || null;
  const volume = coins.reduce((sum, coin) => sum + coin.volume, 0);
  const marketCap = coins.reduce((sum, coin) => sum + coin.marketCap, 0);
  return {
    count: coins.length,
    marketCap,
    volume,
    gainer: gainer ? { id: gainer.id, symbol: gainer.symbol, name: gainer.name, change24h: gainer.change24h } : null,
    loser: loser ? { id: loser.id, symbol: loser.symbol, name: loser.name, change24h: loser.change24h } : null,
  };
}

export function listRanges() {
  return Object.keys(RANGE_DAYS);
}

export async function getTopMarkets() {
  if (marketsCache.data && Date.now() - marketsCache.at < MARKETS_TTL) {
    return { ...marketsCache.data, stale: false };
  }

  try {
    const payload = await gecko(MARKETS_URL);
    const coins = Array.isArray(payload) ? payload.map(mapCoin).filter((coin) => coin.id) : [];
    const data = {
      ok: true,
      coins,
      summary: summarize(coins),
      updatedAt: new Date().toISOString(),
    };
    marketsCache = { at: Date.now(), data };
    return { ...data, stale: false };
  } catch (error) {
    if (marketsCache.data) {
      return { ...marketsCache.data, stale: true };
    }
    return {
      ok: false,
      message: error.message || "Could not load live markets.",
      coins: [],
      summary: summarize([]),
      updatedAt: null,
      stale: false,
    };
  }
}

export async function getCoinChart(id, range = "24H") {
  const coinId = String(id || "").trim().toLowerCase();
  const key = RANGE_DAYS[range] ? range : "24H";
  if (!coinId) {
    return { ok: false, message: "Choose a coin.", points: [], range: key };
  }

  const cacheKey = `${coinId}:${key}`;
  const cached = chartCache.get(cacheKey);
  const ttl = CHART_TTL[key] || 60_000;
  if (cached && Date.now() - cached.at < ttl) {
    return { ...cached.data, stale: false };
  }

  const days = RANGE_DAYS[key];
  const url = `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(coinId)}/market_chart?vs_currency=usd&days=${days}`;

  try {
    const payload = await gecko(url, 10000);
    const prices = Array.isArray(payload?.prices) ? payload.prices : [];
    const volumes = Array.isArray(payload?.total_volumes) ? payload.total_volumes : [];
    const cutoff = key === "1H" ? Date.now() - 60 * 60 * 1000 : 0;

    const points = prices
      .map(([ts, price], index) => {
        const time = Number(ts);
        if (!Number.isFinite(time) || (cutoff && time < cutoff)) {
          return null;
        }
        return {
          t: time,
          price: finite(price),
          volume: finite(volumes[index]?.[1]),
        };
      })
      .filter(Boolean);

    const highs = points.map((p) => p.price);
    const data = {
      ok: true,
      id: coinId,
      range: key,
      points,
      high: highs.length ? Math.max(...highs) : 0,
      low: highs.length ? Math.min(...highs) : 0,
      updatedAt: new Date().toISOString(),
    };
    chartCache.set(cacheKey, { at: Date.now(), data });
    return { ...data, stale: false };
  } catch (error) {
    if (cached?.data) {
      return { ...cached.data, stale: true };
    }
    return {
      ok: false,
      message: error.message || "Could not load trade chart.",
      id: coinId,
      range: key,
      points: [],
      high: 0,
      low: 0,
      updatedAt: null,
      stale: false,
    };
  }
}
