import getPool from "@/lib/db";

export const DEFAULT_SOL_USD = 140;
const CACHE_MS = 60_000;

let cache = { rate: 0, at: 0 };

export function roundSol(value) {
  return Number(Number(value || 0).toFixed(8));
}

export function usdToSol(usd, rate) {
  const price = Number(rate) > 0 ? Number(rate) : DEFAULT_SOL_USD;
  return roundSol(Number(usd || 0) / price);
}

async function fallbackRate() {
  try {
    const db = getPool();
    const [rows] = await db.query("SELECT sol_usd_rate FROM airdrop_settings WHERE id = 1 LIMIT 1");
    const rate = Number(rows[0]?.sol_usd_rate);
    if (Number.isFinite(rate) && rate > 0) {
      return rate;
    }
  } catch {
    // airdrop settings may not exist yet
  }
  return DEFAULT_SOL_USD;
}

export async function getSolUsdRate() {
  if (cache.rate > 0 && Date.now() - cache.at < CACHE_MS) {
    return cache.rate;
  }

  let live = 0;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
      { signal: controller.signal, cache: "no-store" }
    );
    clearTimeout(timer);
    if (response.ok) {
      const payload = await response.json();
      live = Number(payload?.solana?.usd);
    }
  } catch {
    live = 0;
  }

  const rate = Number.isFinite(live) && live > 0 ? live : await fallbackRate();
  cache = { rate, at: Date.now() };
  return rate;
}
