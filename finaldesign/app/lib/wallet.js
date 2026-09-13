import { getAirdropStatus } from "@/lib/airdrop";
import { getMiningStatus } from "@/lib/mining";
import { getPresaleStatus } from "@/lib/presale";
import { getReferralStatus } from "@/lib/referral";
import { getRewardsStatus } from "@/lib/rewards";
import { TOKEN_LOCK } from "@/lib/token-lock";

function roundToken(value) {
  return Number(Number(value || 0).toFixed(7));
}

function stamp(value) {
  const time = value ? new Date(value).getTime() : 0;
  return Number.isNaN(time) ? 0 : time;
}

export async function getWalletStatus(userId) {
  const [mining, presale, referral, rewards, airdrop] = await Promise.all([
    getMiningStatus(userId),
    getPresaleStatus(userId),
    getReferralStatus(userId),
    getRewardsStatus(userId),
    getAirdropStatus(userId),
  ]);

  const mined = roundToken(mining.lifetimeMined);
  const scratch = roundToken(rewards.lifetimeEarned);
  const miningReferral = roundToken(referral.earnings?.total);
  const presaleWlt = roundToken(presale.allocation?.wlt);
  const ledger = roundToken(mining.balance);
  const tokensLocked = Boolean(TOKEN_LOCK.tokensLocked);
  const lockedWlt = tokensLocked
    ? roundToken(mined + scratch + miningReferral + presaleWlt)
    : 0;
  const totalWlt = roundToken(ledger + presaleWlt);

  const activity = [
    ...(mining.history || []).map((row) => ({
      id: `mine-${row.id}`,
      at: row.endsAt || row.startedAt,
      source: "Mining",
      title: row.status === "active" ? "Live mining cycle" : "24h mining credit",
      detail: `Cycle reward ${roundToken(row.reward)} WLT`,
      amount: `+${roundToken(row.mined)} WLT`,
      status: row.status,
      lock: tokensLocked,
    })),
    ...(rewards.history || []).map((row, index) => ({
      id: `scratch-${row.day || index}`,
      at: row.day,
      source: "Scratch & Win",
      title: row.label || "Scratch prize",
      detail: `UTC day ${row.day}`,
      amount: `+${roundToken(row.prize)} WLT`,
      status: "credited",
      lock: tokensLocked,
    })),
    ...(referral.transactions || []).map((row) => ({
      id: `ref-${row.id}`,
      at: row.createdAt,
      source: "Mining referral",
      title: row.label,
      detail: `${row.minerName} mined ${roundToken(row.minedAmount)} WLT · L${row.level}`,
      amount: `+${roundToken(row.reward)} WLT`,
      status: "credited",
      lock: tokensLocked,
    })),
    ...(presale.purchases || []).map((row) => ({
      id: `buy-${row.id}`,
      at: row.createdAt,
      source: "Presale",
      title: "WLT purchase",
      detail: `Paid $${Number(row.usd || 0).toFixed(2)} at $0.50 · ${row.txHash || ""}`,
      amount: `+${roundToken(row.wlt)} WLT`,
      status: row.status,
      lock: tokensLocked,
    })),
    ...(presale.commissions || []).map((row) => ({
      id: `usd-${row.id}`,
      at: row.createdAt,
      source: "Presale referral",
      title: row.label,
      detail: `${row.buyerName} bought $${Number(row.purchaseUsd || 0).toFixed(2)} · 5% USD`,
      amount: `+$${Number(row.commission || 0).toFixed(2)}`,
      status: row.status,
      lock: false,
    })),
    ...(presale.withdrawals || []).map((row) => ({
      id: `wd-${row.id}`,
      at: row.createdAt,
      source: "Withdrawal",
      title: `${row.asset || "SOL"} to Phantom`,
      detail:
        row.txHash ||
        (row.solAmount
          ? `$${Number(row.amount || 0).toFixed(2)} -> ${Number(row.solAmount || 0).toFixed(8)} SOL`
          : row.wallet || ""),
      amount: row.solAmount
        ? `-${Number(row.solAmount || 0).toFixed(8)} SOL`
        : `-$${Number(row.amount || 0).toFixed(2)}`,
      status: row.status,
      lock: false,
    })),
    ...(airdrop.history || []).map((row) => ({
      id: `airdrop-${row.id}`,
      at: row.at,
      source: "Presale airdrop",
      title: `Airdrop ${row.label}`,
      detail: row.txHash || "Released Saturday-night reward",
      amount: `+${Number(row.sol || 0).toFixed(8)} SOL`,
      status: row.status,
      lock: false,
    })),
    ...(airdrop.withdrawals || []).map((row) => ({
      id: `airdrop-wd-${row.id}`,
      at: row.createdAt,
      source: "Airdrop withdrawal",
      title: `${row.asset || "SOL"} to Phantom`,
      detail: row.txHash || row.wallet || "",
      amount: `-${Number(row.amount || 0).toFixed(8)} SOL`,
      status: row.status,
      lock: false,
    })),
  ].sort((a, b) => stamp(b.at) - stamp(a.at));

  return {
    lock: TOKEN_LOCK,
    wallet: presale.wallet,
    investor: presale.investor,
    balances: {
      totalWlt,
      ledger,
      lockedWlt,
      mined,
      scratch,
      miningReferral,
      presale: presaleWlt,
      presaleUsd: Number(presale.allocation?.usd || 0),
      usdcAvailable: Number(presale.commission?.available || 0),
      commissionEarned: Number(presale.commission?.earned || 0),
      commissionWithdrawn: Number(presale.commission?.withdrawn || 0),
      airdropSol: Number(airdrop.balance?.earned || 0),
      airdropSolAvailable: Number(airdrop.balance?.available || 0),
      airdropSolWithdrawn: Number(airdrop.balance?.withdrawn || 0),
    },
    withdrawable: {
      commissionUsd: Number(presale.commission?.available || 0),
      airdropSol: Number(airdrop.balance?.available || 0),
    },
    mining: {
      cycles: mining.cycles,
      live: mining.session?.status === "active",
      session: mining.session,
    },
    rewards: {
      plays: rewards.plays,
      lifetime: scratch,
    },
    referral: {
      code: referral.code,
      counts: referral.counts,
      earnings: referral.earnings,
      levels: referral.levels,
    },
    presale: {
      stage: presale.stage,
      price: presale.price,
      qualify: presale.qualify,
      commission: presale.commission,
      stablecoin: presale.settlement || presale.stablecoin || "SOL",
    },
    activity,
  };
}
