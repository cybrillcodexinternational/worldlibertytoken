"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Anchor,
  BadgeCheck,
  CalendarCheck,
  Coins,
  Cpu,
  Crown,
  Flame,
  Gem,
  Globe,
  Handshake,
  Heart,
  Lock,
  Medal,
  Megaphone,
  Network,
  Pickaxe,
  Rocket,
  Share2,
  Sparkles,
  Timer,
  Trophy,
  UserPlus,
  Users,
  Vault,
} from "lucide-react";
import styles from "./achievements.module.css";

const ICONS = {
  Anchor,
  BadgeCheck,
  CalendarCheck,
  Coins,
  Cpu,
  Crown,
  Flame,
  Gem,
  Globe,
  Handshake,
  Heart,
  Medal,
  Megaphone,
  Network,
  Pickaxe,
  Rocket,
  Share2,
  Sparkles,
  Timer,
  Trophy,
  UserPlus,
  Users,
  Vault,
};

const TABS = [
  { key: "personal", label: "Personal", hint: "Your presale", Icon: Coins },
  { key: "network", label: "Network", hint: "3-level tree", Icon: Network },
  { key: "mining", label: "Mining", hint: "Completed cycles", Icon: Pickaxe },
  { key: "referral", label: "Referral", hint: "Members invited", Icon: UserPlus },
  { key: "loyalty", label: "Loyalty", hint: "Days with WLT", Icon: Heart },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

function BadgeIcon({ name, size = 22 }) {
  const Icon = ICONS[name] || Medal;
  return <Icon size={size} />;
}

function stamp(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString();
}

function Ring({ value, size = 168, stroke = 10, label, sub }) {
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

export default function AchievementStudio() {
  const [data, setData] = useState({ categories: [], unlockedCount: 0, totalCount: 0 });
  const [tab, setTab] = useState("personal");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/achievements/status", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.message || "Could not load achievements.");
        }
        setData(payload);
      })
      .catch((err) => setError(err.message));
  }, []);

  const categories = Array.isArray(data.categories) ? data.categories : [];
  const category = useMemo(
    () => categories.find((item) => item.key === tab) || categories[0],
    [categories, tab]
  );

  const overall = data.totalCount
    ? Math.round((Number(data.unlockedCount || 0) / Number(data.totalCount)) * 100)
    : 0;

  const categoryBars = categories.map((item) => {
    const total = item.badges?.length || 0;
    const unlocked = item.badges?.filter((badge) => badge.unlocked).length || 0;
    return {
      key: item.key,
      label: TABS.find((tabItem) => tabItem.key === item.key)?.label || item.label,
      unlocked,
      total,
      pct: total ? Math.round((unlocked / total) * 100) : 0,
    };
  });

  const activeTab = TABS.find((item) => item.key === (category?.key || tab)) || TABS[0];
  const unlockedHere = category?.badges?.filter((badge) => badge.unlocked).length || 0;
  const totalHere = category?.badges?.length || 0;
  const nextProgress = Number(category?.next?.progress || 0);
  const badges = category?.badges || [];

  return (
    <div className={styles.studio}>
      <motion.header className={styles.hero} initial="hidden" animate="show" variants={fadeUp}>
        <div className={styles.scanlines} />
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>
            <Medal size={12} /> Hall of badges
          </p>
          <h1>Milestones that prove the work</h1>
          <p className={styles.lead}>
            Personal badges use confirmed presale purchases only. Network badges count verified referral-tree
            investment across three levels. Mining, referral, and loyalty track completed cycles, members, and days.
          </p>
          <ul className={styles.heroFacts}>
            <li>
              <Trophy size={14} />
              {data.unlockedCount}/{data.totalCount || 0} unlocked
            </li>
            <li>
              <Lock size={14} />
              Locked until the threshold is hit
            </li>
            <li>
              <Sparkles size={14} />
              Live from your dashboard
            </li>
          </ul>
        </div>
        <div className={styles.seal}>
          <span className={styles.orbitA} />
          <span className={styles.orbitB} />
          <Ring value={overall} size={168} label="collection" sub={`${data.unlockedCount} of ${data.totalCount || 0}`} />
        </div>
      </motion.header>

      {error ? <p className={styles.error}>{error}</p> : null}

      <nav className={styles.tabs} aria-label="Achievement categories">
        {TABS.map((item) => {
          const on = (category?.key || tab) === item.key;
          const bar = categoryBars.find((row) => row.key === item.key);
          return (
            <button
              key={item.key}
              type="button"
              className={on ? styles.tabOn : styles.tab}
              onClick={() => setTab(item.key)}
            >
              <item.Icon size={16} />
              <strong>{item.label}</strong>
              <small>{bar ? `${bar.unlocked}/${bar.total}` : item.hint}</small>
            </button>
          );
        })}
      </nav>

      {category ? (
        <>
          <section className={styles.kpis}>
            <article>
              <span className={styles.iconTile}>
                <activeTab.Icon size={16} />
              </span>
              <small>Tracked total</small>
              <b>{category.totalLabel}</b>
              <em>{activeTab.hint}</em>
            </article>
            <article>
              <span className={styles.iconTile}>
                <BadgeCheck size={16} />
              </span>
              <small>Current badge</small>
              <b>{category.current ? category.current.name : "None yet"}</b>
              <em>{category.current ? "Highest unlocked" : "Buy or complete to start"}</em>
            </article>
            <article>
              <span className={styles.iconTile}>
                <Trophy size={16} />
              </span>
              <small>This track</small>
              <b>
                {unlockedHere}/{totalHere}
              </b>
              <em>badges unlocked</em>
            </article>
            <article>
              <span className={styles.iconTile}>
                <Sparkles size={16} />
              </span>
              <small>Next target</small>
              <b>{category.next ? category.next.name : "Max tier"}</b>
              <em>{category.next ? `${nextProgress}% complete` : "All badges earned"}</em>
            </article>
          </section>

          <section className={styles.infoRow}>
            <article className={styles.nextCard}>
              <div className={styles.cardHead}>
                <div>
                  <p className={styles.kicker}>Next unlock</p>
                  <h2>{category.next ? category.next.name : "Track complete"}</h2>
                </div>
                {category.next ? <Lock size={18} /> : <Trophy size={18} />}
              </div>
              <div className={styles.nextBody}>
                <Ring
                  value={category.next ? nextProgress : 100}
                  size={148}
                  label={category.next ? "to next" : "complete"}
                  sub={category.next ? category.next.thresholdLabel : "max"}
                />
                <div className={styles.nextCopy}>
                  <p>
                    {category.next
                      ? category.next.description
                      : "Every badge on this track is unlocked. Switch tabs to keep climbing."}
                  </p>
                  {category.next ? (
                    <>
                      <div className={styles.meterHead}>
                        <span>{category.next.currentLabel}</span>
                        <em>{category.next.thresholdLabel}</em>
                      </div>
                      <div className={styles.bar}>
                        <motion.span
                          key={`${category.key}-next`}
                          initial={{ width: 0 }}
                          animate={{ width: `${nextProgress}%` }}
                          transition={{ duration: 0.9, ease: "easeOut" }}
                        />
                      </div>
                      <em className={styles.pctNote}>{nextProgress}% complete</em>
                    </>
                  ) : null}
                </div>
              </div>
            </article>

            <article className={styles.chartCard}>
              <div className={styles.cardHead}>
                <div>
                  <p className={styles.kicker}>Collection map</p>
                  <h2>Track completion</h2>
                </div>
                <Medal size={18} />
              </div>
              <div className={styles.chart}>
                {categoryBars.map((row) => (
                  <button
                    key={row.key}
                    type="button"
                    className={row.key === category.key ? styles.chartRowOn : styles.chartRow}
                    onClick={() => setTab(row.key)}
                  >
                    <small>{row.label}</small>
                    <div className={styles.chartTrack}>
                      <motion.i
                        initial={{ width: 0 }}
                        animate={{ width: `${row.pct}%` }}
                        transition={{ duration: 0.9, ease: "easeOut" }}
                      />
                    </div>
                    <b>
                      {row.unlocked}/{row.total}
                    </b>
                  </button>
                ))}
              </div>
            </article>
          </section>

          <section className={styles.grid}>
            {badges.map((badge, index) => (
              <motion.article
                key={badge.id}
                className={badge.unlocked ? styles.cardOn : styles.card}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * index, duration: 0.35 }}
              >
                <div className={styles.cardTop}>
                  <span className={badge.unlocked ? styles.iconOn : styles.icon}>
                    <BadgeIcon name={badge.icon} />
                  </span>
                  <em>{badge.unlocked ? "Unlocked" : "Locked"}</em>
                </div>
                <h3>{badge.name}</h3>
                <p>{badge.description}</p>
                <div className={styles.bar}>
                  <motion.span
                    key={`${badge.id}-bar`}
                    initial={{ width: 0 }}
                    animate={{ width: `${badge.progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                <footer>
                  <span>
                    {badge.currentLabel} / {badge.thresholdLabel}
                  </span>
                  {badge.unlocked ? <small>{stamp(badge.unlockedAt)}</small> : <Lock size={12} />}
                </footer>
              </motion.article>
            ))}
          </section>
        </>
      ) : null}
    </div>
  );
}
