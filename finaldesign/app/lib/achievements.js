import getPool from "@/lib/db";
import { ensureAirdropSchema } from "@/lib/airdrop";
import { ensureMiningSchema, getMiningStatus } from "@/lib/mining";
import { ensurePresaleSchema } from "@/lib/presale";
import { ensureReferralSchema, getReferralStatus } from "@/lib/referral";
import { getRewardsStatus } from "@/lib/rewards";

export const BADGE_CATEGORIES = [
  { key: "personal", label: "Personal Investment", metric: "presale_usd", unit: "USD" },
  { key: "network", label: "Network Investment", metric: "network_usd", unit: "USD" },
  { key: "mining", label: "Mining", metric: "mining_cycles", unit: "cycles" },
  { key: "referral", label: "Referral", metric: "referral_count", unit: "members" },
  { key: "loyalty", label: "Loyalty", metric: "loyalty_days", unit: "days" },
];

const DEFAULT_BADGES = [
  { category: "personal", name: "Presale Starter", threshold: 1, icon: "Sparkles", description: "Made a confirmed WLT presale purchase." },
  { category: "personal", name: "WLT Investor", threshold: 250, icon: "Coins", description: "Built a confirmed presale position." },
  { category: "personal", name: "Qualified Investor", threshold: 1000, icon: "BadgeCheck", description: "Reached the $1,000 qualified presale tier." },
  { category: "personal", name: "Silver Investor", threshold: 5000, icon: "Medal", description: "Confirmed $5,000 in personal presale investment." },
  { category: "personal", name: "Gold Investor", threshold: 15000, icon: "Trophy", description: "Confirmed $15,000 in personal presale investment." },
  { category: "personal", name: "Platinum Investor", threshold: 50000, icon: "Gem", description: "Confirmed $50,000 in personal presale investment." },
  { category: "personal", name: "Elite Investor", threshold: 100000, icon: "Crown", description: "Confirmed $100,000 in personal presale investment." },
  { category: "personal", name: "WLT Whale", threshold: 250000, icon: "Anchor", description: "Confirmed $250,000 in personal presale investment." },
  { category: "network", name: "Network Starter", threshold: 100, icon: "Users", description: "Your referral network made its first confirmed presale purchases." },
  { category: "network", name: "Bronze Network", threshold: 1000, icon: "Share2", description: "$1,000 in confirmed network presale investment." },
  { category: "network", name: "Silver Network", threshold: 5000, icon: "Network", description: "$5,000 in confirmed network presale investment." },
  { category: "network", name: "Gold Network", threshold: 25000, icon: "Trophy", description: "$25,000 in confirmed network presale investment." },
  { category: "network", name: "Platinum Network", threshold: 50000, icon: "Gem", description: "$50,000 in confirmed network presale investment." },
  { category: "network", name: "Elite Network", threshold: 100000, icon: "Crown", description: "$100,000 in confirmed network presale investment." },
  { category: "network", name: "Investment Ambassador", threshold: 250000, icon: "Handshake", description: "$250,000 in confirmed network presale investment." },
  { category: "network", name: "Global Network Leader", threshold: 500000, icon: "Globe", description: "$500,000 in confirmed network presale investment." },
  { category: "network", name: "Million Dollar Network", threshold: 1000000, icon: "Rocket", description: "$1,000,000 in confirmed network presale investment." },
  { category: "mining", name: "First Cycle", threshold: 1, icon: "Pickaxe", description: "Completed your first 24-hour mining cycle.", metric: "mining_cycles" },
  { category: "mining", name: "Dedicated Miner", threshold: 7, icon: "Timer", description: "Completed 7 mining cycles.", metric: "mining_cycles" },
  { category: "mining", name: "Hash Veteran", threshold: 30, icon: "Cpu", description: "Completed 30 mining cycles.", metric: "mining_cycles" },
  { category: "mining", name: "Vault Builder", threshold: 50, icon: "Vault", description: "Mined 50 WLT from completed cycles.", metric: "mined_wlt" },
  { category: "referral", name: "First Invite", threshold: 1, icon: "UserPlus", description: "Brought your first member into the network." },
  { category: "referral", name: "Team Builder", threshold: 10, icon: "Users", description: "Grew a 10-member referral network." },
  { category: "referral", name: "Community Lead", threshold: 50, icon: "Megaphone", description: "Grew a 50-member referral network." },
  { category: "referral", name: "Network Architect", threshold: 200, icon: "Network", description: "Grew a 200-member referral network." },
  { category: "loyalty", name: "Early Believer", threshold: 1, icon: "Heart", description: "Joined the World Liberty Token community." },
  { category: "loyalty", name: "30-Day Loyal", threshold: 30, icon: "CalendarCheck", description: "Stayed with WLT for 30 days." },
  { category: "loyalty", name: "Season Regular", threshold: 90, icon: "Flame", description: "Stayed with WLT for 90 days." },
  { category: "loyalty", name: "Airdrop Participant", threshold: 1, icon: "Sparkles", description: "Received a confirmed presale airdrop.", metric: "airdrop_count" },
];

function roundUsd(value) {
  return Number(Number(value || 0).toFixed(2));
}

function roundToken(value) {
  return Number(Number(value || 0).toFixed(7));
}

function metricFor(badge) {
  if (badge.metric) {
    return badge.metric;
  }
  const category = BADGE_CATEGORIES.find((item) => item.key === badge.category);
  return category?.metric || "presale_usd";
}

async function getNetworkPresaleUsd(userId) {
  const db = getPool();
  const [l1] = await db.query("SELECT id, presale_usd FROM users WHERE referred_by = ?", [userId]);
  const l1Ids = l1.map((row) => Number(row.id));
  let deeper = [];
  if (l1Ids.length) {
    const [l2] = await db.query("SELECT id, presale_usd FROM users WHERE referred_by IN (?)", [l1Ids]);
    deeper = deeper.concat(l2);
    const l2Ids = l2.map((row) => Number(row.id));
    if (l2Ids.length) {
      const [l3] = await db.query("SELECT presale_usd FROM users WHERE referred_by IN (?)", [l2Ids]);
      deeper = deeper.concat(l3);
    }
  }
  return roundUsd([...l1, ...deeper].reduce((sum, row) => sum + Number(row.presale_usd || 0), 0));
}

export async function ensureAchievementSchema() {
  await ensurePresaleSchema();
  await ensureReferralSchema();
  await ensureMiningSchema();
  await ensureAirdropSchema();
  const db = getPool();

  await db.query(`
    CREATE TABLE IF NOT EXISTS achievement_badges (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      category ENUM('personal', 'network', 'mining', 'referral', 'loyalty') NOT NULL,
      name VARCHAR(80) NOT NULL,
      description VARCHAR(255) NOT NULL DEFAULT '',
      icon VARCHAR(40) NOT NULL DEFAULT 'Medal',
      metric VARCHAR(32) NOT NULL DEFAULT 'presale_usd',
      threshold DECIMAL(18,4) NOT NULL DEFAULT 0,
      reward_note VARCHAR(160) NOT NULL DEFAULT '',
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_badge_category (category, sort_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS user_badges (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT UNSIGNED NOT NULL,
      badge_id BIGINT UNSIGNED NOT NULL,
      unlocked_at DATETIME NOT NULL,
      UNIQUE KEY uniq_user_badge (user_id, badge_id),
      INDEX idx_user_badges_user (user_id, unlocked_at),
      CONSTRAINT fk_ubadge_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_ubadge_badge FOREIGN KEY (badge_id)
        REFERENCES achievement_badges(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  const [[count]] = await db.query("SELECT COUNT(*) AS total FROM achievement_badges");
  if (!Number(count.total)) {
    for (const [index, badge] of DEFAULT_BADGES.entries()) {
      await db.query(
        `INSERT INTO achievement_badges
          (category, name, description, icon, metric, threshold, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          badge.category,
          badge.name,
          badge.description,
          badge.icon,
          metricFor(badge),
          badge.threshold,
          index + 1,
        ]
      );
    }
  }
}

async function loadBadges(db) {
  const [rows] = await db.query(
    `SELECT id, category, name, description, icon, metric, threshold, reward_note, sort_order
     FROM achievement_badges
     ORDER BY category ASC, threshold ASC, sort_order ASC`
  );
  return rows;
}

export async function getUserAchievementMetrics(userId) {
  const db = getPool();
  const [userRows] = await db.query(
    "SELECT presale_usd, created_at FROM users WHERE id = ? LIMIT 1",
    [userId]
  );
  const user = userRows[0] || {};
  const [mining, referral, rewards] = await Promise.all([
    getMiningStatus(userId),
    getReferralStatus(userId),
    getRewardsStatus(userId),
  ]);
  const [[airdrops]] = await db.query(
    "SELECT COUNT(*) AS total FROM airdrop_payouts WHERE user_id = ?",
    [userId]
  );
  const created = user.created_at ? new Date(user.created_at).getTime() : Date.now();
  const loyaltyDays = Math.max(1, Math.floor((Date.now() - created) / 86400000) || 1);

  return {
    presale_usd: roundUsd(user.presale_usd),
    network_usd: await getNetworkPresaleUsd(userId),
    mining_cycles: Number(mining.cycles || 0),
    mined_wlt: roundToken(mining.lifetimeMined),
    referral_count: Number(referral.counts?.total || 0),
    loyalty_days: loyaltyDays,
    airdrop_count: Number(airdrops.total || 0),
    scratch_plays: Number(rewards.plays || 0),
  };
}

function metricValue(metrics, metric) {
  return Number(metrics[metric] || 0);
}

function formatMetric(metric, value) {
  if (metric === "presale_usd" || metric === "network_usd") {
    return `$${roundUsd(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (metric === "mined_wlt") {
    return `${roundToken(value)} WLT`;
  }
  return `${Number(value || 0)}`;
}

async function unlockDueBadges(userId, badges, metrics) {
  const db = getPool();
  const due = badges.filter((badge) => metricValue(metrics, badge.metric) >= Number(badge.threshold));
  for (const badge of due) {
    await db.query(
      `INSERT IGNORE INTO user_badges (user_id, badge_id, unlocked_at)
       VALUES (?, ?, UTC_TIMESTAMP())`,
      [userId, badge.id]
    );
  }
}

function decorateCategory(badges, unlocks, metrics, category) {
  const rows = badges
    .filter((badge) => badge.category === category)
    .sort((a, b) => Number(a.threshold) - Number(b.threshold));

  const decorated = rows.map((badge) => {
    const current = metricValue(metrics, badge.metric);
    const threshold = Number(badge.threshold);
    const unlocked = Boolean(unlocks[badge.id]);
    const progress = threshold <= 0 ? 100 : Math.min(100, Math.round((current / threshold) * 100));
    return {
      id: Number(badge.id),
      category: badge.category,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      metric: badge.metric,
      threshold,
      rewardNote: unlocked ? badge.reward_note || "" : "",
      current,
      currentLabel: formatMetric(badge.metric, current),
      thresholdLabel: formatMetric(badge.metric, threshold),
      progress,
      unlocked,
      unlockedAt: unlocks[badge.id] || null,
    };
  });

  const currentBadge = [...decorated].reverse().find((badge) => badge.unlocked) || null;
  const nextBadge = decorated.find((badge) => !badge.unlocked) || null;
  const headlineMetric = decorated[0]?.metric || BADGE_CATEGORIES.find((item) => item.key === category)?.metric;
  const total = metricValue(metrics, headlineMetric);

  return {
    key: category,
    label: BADGE_CATEGORIES.find((item) => item.key === category)?.label || category,
    total,
    totalLabel: formatMetric(headlineMetric, total),
    current: currentBadge,
    next: nextBadge,
    badges: decorated,
  };
}

export async function getAchievementStatus(userId) {
  await ensureAchievementSchema();
  const db = getPool();
  const badges = await loadBadges(db);
  const metrics = await getUserAchievementMetrics(userId);
  await unlockDueBadges(userId, badges, metrics);

  const [unlockRows] = await db.query(
    "SELECT badge_id, unlocked_at FROM user_badges WHERE user_id = ?",
    [userId]
  );
  const unlocks = Object.fromEntries(
    unlockRows.map((row) => [Number(row.badge_id), row.unlocked_at])
  );

  const categories = BADGE_CATEGORIES.map((item) => decorateCategory(badges, unlocks, metrics, item.key));
  const unlockedCount = categories.reduce(
    (sum, category) => sum + category.badges.filter((badge) => badge.unlocked).length,
    0
  );

  return {
    metrics,
    unlockedCount,
    totalCount: badges.length,
    categories,
  };
}

export async function getAdminAchievementOverview() {
  await ensureAchievementSchema();
  const db = getPool();
  const badges = await loadBadges(db);
  const [[unlocks]] = await db.query("SELECT COUNT(*) AS total FROM user_badges");
  return {
    categories: BADGE_CATEGORIES,
    unlocks: Number(unlocks.total || 0),
    badges: badges.map((badge) => ({
      id: Number(badge.id),
      category: badge.category,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      metric: badge.metric,
      threshold: Number(badge.threshold),
      rewardNote: badge.reward_note || "",
      sortOrder: Number(badge.sort_order),
    })),
  };
}

export async function saveAchievementBadge(input) {
  await ensureAchievementSchema();
  const db = getPool();
  const category = BADGE_CATEGORIES.some((item) => item.key === input.category)
    ? input.category
    : "personal";
  const fallbackMetric = BADGE_CATEGORIES.find((item) => item.key === category)?.metric || "presale_usd";
  const payload = [
    category,
    String(input.name || "Badge").slice(0, 80),
    String(input.description || "").slice(0, 255),
    String(input.icon || "Medal").slice(0, 40),
    String(input.metric || fallbackMetric).slice(0, 32),
    Number(input.threshold || 0),
    String(input.rewardNote || input.reward_note || "").slice(0, 160),
    Number(input.sortOrder || input.sort_order || 0),
  ];

  if (input.id) {
    await db.query(
      `UPDATE achievement_badges
       SET category = ?, name = ?, description = ?, icon = ?, metric = ?, threshold = ?, reward_note = ?, sort_order = ?
       WHERE id = ?`,
      [...payload, Number(input.id)]
    );
  } else {
    await db.query(
      `INSERT INTO achievement_badges
        (category, name, description, icon, metric, threshold, reward_note, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      payload
    );
  }

  return getAdminAchievementOverview();
}

export async function deleteAchievementBadge(id) {
  await ensureAchievementSchema();
  const db = getPool();
  await db.query("DELETE FROM achievement_badges WHERE id = ?", [Number(id)]);
  return getAdminAchievementOverview();
}
