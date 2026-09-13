"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowDownToLine,
  BadgeCheck,
  Banknote,
  Check,
  Copy,
  GitBranch,
  Link2,
  Network,
  Pickaxe,
  Radio,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trophy,
  UserPlus,
  Users,
  Wallet,
  Waves,
  Zap,
} from "lucide-react";
import styles from "./referral.module.css";

const EMPTY = {
  code: "",
  poolNote: "",
  counts: { level1: 0, level2: 0, level3: 0, total: 0 },
  earnings: { total: 0, today: 0, payouts: 0, byLevel: [] },
  network: { level1: [], level2: [], level3: [] },
  transactions: [],
  levels: [
    { level: 1, rate: 0.1, label: "Level 1 Mining Referral Reward" },
    { level: 2, rate: 0.05, label: "Level 2 Mining Referral Reward" },
    { level: 3, rate: 0.03, label: "Level 3 Mining Referral Reward" },
  ],
  presale: {
    investor: { label: "Mining User", eligiblePresaleReferral: false },
    qualify: { current: 0, target: 1000, remaining: 1000, progress: 0, unlocked: false },
    commission: { earned: 0, available: 0, withdrawn: 0, pending: 0 },
    network: { total: 0, mining: 0, presale: 0, qualifiedDirect: 0 },
    commissions: [],
    wallet: { connected: false, short: "" },
  },
};

const LEVEL_META = [
  { level: 1, Icon: Zap, caption: "Direct miners" },
  { level: 2, Icon: GitBranch, caption: "Their network" },
  { level: 3, Icon: Waves, caption: "Third ring" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

function formatToken(value) {
  return `${Number(value || 0).toFixed(7)} WLT`;
}

function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function formatWhen(value) {
  return value ? new Date(value).toLocaleString() : "";
}

function initials(name) {
  return String(name || "W")
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function buildReferralUrl(code) {
  if (typeof window === "undefined" || !code) {
    return "";
  }
  return `${window.location.origin}/register?ref=${encodeURIComponent(code)}`;
}

export default function ReferralStudio({ panel = "user" }) {
  const [data, setData] = useState(EMPTY);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const response = await fetch("/api/referral/status", { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.message || "Could not load referral network.");
        }
        if (alive) {
          setData({ ...EMPTY, ...payload, presale: { ...EMPTY.presale, ...(payload.presale || {}) } });
          setError("");
        }
      } catch (err) {
        if (alive) {
          setError(err.message || "Could not load referral network.");
        }
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const referralUrl = useMemo(() => buildReferralUrl(data.code), [data.code]);
  const network = data.network?.[`level${tab}`] || [];
  const presale = data.presale || EMPTY.presale;
  const walletHref = panel === "admin" ? "/admin/wallet" : "/user/wallet";
  const presaleHref = panel === "admin" ? "/admin/presale" : "/user/presale";
  const qualified = Boolean(presale.qualify?.unlocked);
  const totalNetwork = presale.network?.total ?? data.counts.total;

  async function copyLink() {
    if (!referralUrl) {
      return;
    }
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  const kpis = [
    { label: "Total Referrals", value: totalNetwork, Icon: Users },
    { label: "Qualified Presale", value: presale.network?.qualifiedDirect || 0, Icon: Trophy },
    { label: "Mining Network", value: presale.network?.mining ?? data.counts.total, Icon: Pickaxe },
    { label: "USD Available", value: money(presale.commission?.available), Icon: Wallet },
  ];

  return (
    <motion.div className={styles.studio} variants={stagger} initial="hidden" animate="show">
      <motion.section className={styles.hero} variants={fadeUp}>
        <div className={styles.viz}>
          <div className={styles.scan} />
          <span className={styles.orbit} />
          <span className={`${styles.orbit} ${styles.orbitInner}`} />
          <motion.span className={`${styles.sat} ${styles.satA}`} animate={{ y: [0, -6, 0] }} transition={{ duration: 3.2, repeat: Infinity }}>
            <Pickaxe size={16} />
          </motion.span>
          <motion.span className={`${styles.sat} ${styles.satB}`} animate={{ y: [0, 8, 0] }} transition={{ duration: 2.6, repeat: Infinity }}>
            <Users size={16} />
          </motion.span>
          <motion.span className={`${styles.sat} ${styles.satC}`} animate={{ y: [0, -8, 0] }} transition={{ duration: 3.8, repeat: Infinity }}>
            <Banknote size={16} />
          </motion.span>
          <div className={styles.core}>
            <Network size={42} strokeWidth={1.7} />
            <small>YOU</small>
          </div>
        </div>

        <div className={styles.heroCopy}>
          <p className={styles.kicker}>
            <Radio size={12} /> Dual Referral Protocol
          </p>
          <h1>Mine. Invest. Refer. Earn.</h1>
          <p className={styles.copy}>
            One invite URL. Two reward economies. Mining pays 10% / 5% / 3% in WLT.
            Qualified presale investors earn a separate 5% USD commission (paid out in SOL).
          </p>
          <div className={styles.statusRow}>
            <span className={`${styles.chip} ${styles.chipLive}`}>
              <i className={styles.dot} /> {presale.investor?.label || "Mining User"}
            </span>
            <span className={styles.chip}>
              {qualified ? <BadgeCheck size={13} /> : <ShieldCheck size={13} />}
              {qualified ? "Presale qualified" : "Mining economy"}
            </span>
            <span className={styles.chip}>
              <Link2 size={13} /> {data.code || "CODE"}
            </span>
          </div>
          <div className={styles.linkBox}>
            <span>{referralUrl || "Generating your domain referral URL..."}</span>
            <button className={styles.iconBtn} type="button" onClick={copyLink} aria-label="Copy referral URL">
              {copied ? <Check size={15} /> : <Copy size={15} />}
            </button>
          </div>
          <div className={styles.actions}>
            <button className={styles.primary} type="button" onClick={copyLink}>
              <Share2 size={15} /> {copied ? "Copied" : "Copy Invite URL"}
            </button>
            <Link className={styles.ghost} href={presaleHref}>
              <ShoppingBag size={15} /> Open Presale
            </Link>
          </div>
        </div>
      </motion.section>

      {error ? <p className={styles.error}>{error}</p> : null}

      <motion.section className={styles.statsRow} variants={stagger}>
        {kpis.map((item) => (
          <motion.article key={item.label} className={styles.stat} variants={fadeUp}>
            <span className={styles.statIcon}>
              <item.Icon size={18} />
            </span>
            <div>
              <small>{item.label}</small>
              <b>{item.value}</b>
            </div>
          </motion.article>
        ))}
      </motion.section>

      <motion.section className={styles.treeCard} variants={fadeUp}>
        <div className={styles.treeHead}>
          <div>
            <p className={styles.kicker}>
              <GitBranch size={12} /> Mining Infographic
            </p>
            <h2>Three-Level WLT Network</h2>
          </div>
          <span className={styles.chip}>
            <Sparkles size={13} /> Pool funded · miner keeps 100%
          </span>
        </div>

        <div className={styles.pyramid}>
          <motion.div className={styles.you} animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 2.4, repeat: Infinity }}>
            <Network size={18} />
            <b>You</b>
            <small>Origin Node</small>
          </motion.div>
          <span className={styles.stem} />
          <div className={styles.levels}>
            {(data.levels || EMPTY.levels).map((tier, index) => {
              const Meta = LEVEL_META[index];
              const Icon = Meta.Icon;
              const earned = data.earnings.byLevel?.find((row) => row.level === tier.level);
              const count = data.counts?.[`level${tier.level}`] || 0;
              return (
                <motion.article
                  key={tier.level}
                  className={styles.level}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 * index }}
                >
                  <span className={styles.ring}>
                    <Icon size={22} />
                  </span>
                  <span className={styles.pct}>{Math.round(tier.rate * 100)}%</span>
                  <small>Level {tier.level} · {Meta.caption}</small>
                  <b>{formatToken(earned?.total || 0)}</b>
                  <small>{count} members</small>
                </motion.article>
              );
            })}
          </div>
        </div>
        <p className={styles.note} style={{ marginTop: 14 }}>
          Total mining referral earnings {formatToken(data.earnings.total)}. Rewards credit when a
          24h mine completes — never deducted from the miner.
        </p>
      </motion.section>

      <section className={styles.split}>
        <motion.article className={styles.economy} variants={fadeUp}>
          <p className={styles.kicker}>
            <Pickaxe size={12} /> Mining Economy
          </p>
          <h2>Earn in WLT</h2>
          <div className={styles.flow}>
            <div className={`${styles.step} ${styles.arrow}`}>
              <UserPlus size={16} />
              Invite
            </div>
            <div className={`${styles.step} ${styles.arrow}`}>
              <Pickaxe size={16} />
              They mine
            </div>
            <div className={`${styles.step} ${styles.arrow}`}>
              <Zap size={16} />
              10 / 5 / 3
            </div>
            <div className={styles.step}>
              <Wallet size={16} />
              WLT credit
            </div>
          </div>
          <div className={styles.kpi}>
            {(data.levels || EMPTY.levels).map((tier) => {
              const earned = data.earnings.byLevel?.find((row) => row.level === tier.level);
              return (
                <div key={tier.level} className={styles.kpiRow}>
                  <span className={styles.ico}>{Math.round(tier.rate * 100)}%</span>
                  <span>{tier.label}</span>
                  <b>{formatToken(earned?.total || 0)}</b>
                </div>
              );
            })}
          </div>
        </motion.article>

        <motion.article className={styles.economy} variants={fadeUp}>
          <p className={styles.kicker}>
            <Banknote size={12} /> Presale Economy
          </p>
          <h2>Earn in USD</h2>
          <div className={styles.flow}>
            <div className={`${styles.step} ${styles.arrow}`}>
              <ShoppingBag size={16} />
              Buy $1,000
            </div>
            <div className={`${styles.step} ${styles.arrow}`}>
              <UserPlus size={16} />
              Refer buyer
            </div>
            <div className={`${styles.step} ${styles.arrow}`}>
              <BadgeCheck size={16} />
              5% direct
            </div>
            <div className={styles.step}>
              <ArrowDownToLine size={16} />
              SOL payout
            </div>
          </div>
          <p className={styles.meterLabel}>
            {qualified
              ? "Qualified WLT Presale Referrer"
              : `Unlock ${money(presale.qualify?.current)} / $1,000`}
          </p>
          <div className={styles.meter}>
            <motion.span
              initial={{ width: 0 }}
              animate={{ width: `${presale.qualify?.progress || 0}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
          <div className={styles.kpi}>
            <div className={styles.kpiRow}>
              <span className={styles.ico}>
                <Trophy size={16} />
              </span>
              <span>Total earned</span>
              <b>{money(presale.commission?.earned)}</b>
            </div>
            <div className={styles.kpiRow}>
              <span className={styles.ico}>
                <Wallet size={16} />
              </span>
              <span>Available</span>
              <b>{money(presale.commission?.available)}</b>
            </div>
            <div className={styles.kpiRow}>
              <span className={styles.ico}>
                <ArrowDownToLine size={16} />
              </span>
              <span>Withdrawn {presale.wallet?.short || ""}</span>
              <b>{money(presale.commission?.withdrawn)}</b>
            </div>
          </div>
          <div className={styles.actions} style={{ marginTop: 12 }}>
            <Link className={styles.primary} href={walletHref}>
              <Wallet size={15} /> Withdraw in Wallet
            </Link>
          </div>
        </motion.article>
      </section>

      <section className={styles.split}>
        <motion.article className={styles.roster} variants={fadeUp}>
          <p className={styles.kicker}>
            <Users size={12} /> My Network
          </p>
          <h2>{data.counts.total} Members</h2>
          <div className={styles.tabs}>
            {[1, 2, 3].map((level) => (
              <button
                key={level}
                type="button"
                className={tab === level ? styles.on : undefined}
                onClick={() => setTab(level)}
              >
                L{level} · {data.counts?.[`level${level}`] || 0}
              </button>
            ))}
          </div>
          <div className={styles.list}>
            {network.length ? (
              network.map((member, index) => (
                <motion.div
                  key={member.id}
                  className={styles.row}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <span className={styles.avatar}>{initials(member.name)}</span>
                  <div>
                    <strong>{member.name}</strong>
                    <small>Level {member.level} · Joined {formatWhen(member.joinedAt)}</small>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className={styles.empty}>No members on this level yet. Share your URL.</p>
            )}
          </div>
        </motion.article>

        <motion.article className={styles.log} variants={fadeUp}>
          <p className={styles.kicker}>
            <Radio size={12} /> Live Ledger
          </p>
          <h2>Payout Timeline</h2>
          <div className={styles.list}>
            {presale.commissions?.map((row) => (
              <div key={`p-${row.id}`} className={styles.row}>
                <span className={styles.avatar}>
                  <Banknote size={16} />
                </span>
                <div>
                  <strong>{row.label}</strong>
                  <small>
                    Direct 5% USD · {row.buyerName} bought {money(row.purchaseUsd)} · {row.status}
                  </small>
                  <small className={styles.hash}>{row.txHash}</small>
                  <time>{formatWhen(row.createdAt)}</time>
                </div>
                <b>+{money(row.commission)}</b>
              </div>
            ))}
            {data.transactions.map((row) => (
              <div key={row.id} className={styles.row}>
                <span className={styles.avatar}>
                  <Pickaxe size={16} />
                </span>
                <div>
                  <strong>{row.label}</strong>
                  <small>
                    {row.minerName} mined {formatToken(row.minedAmount)}
                  </small>
                  <time>{formatWhen(row.createdAt)}</time>
                </div>
                <b>+{formatToken(row.reward)}</b>
              </div>
            ))}
            {!data.transactions.length && !presale.commissions?.length ? (
              <p className={styles.empty}>
                Mining WLT and presale USD credits appear here after network activity.
              </p>
            ) : null}
          </div>
        </motion.article>
      </section>

      {panel === "admin" && data.admin ? (
        <motion.article className={styles.admin} variants={fadeUp}>
          <p className={styles.kicker}>
            <ShieldCheck size={12} /> Control Room
          </p>
          <h2>Pool + Presale</h2>
          <section className={styles.statsRow}>
            <article className={styles.stat}>
              <span className={styles.statIcon}>
                <Pickaxe size={18} />
              </span>
              <div>
                <small>Mining Pool Paid</small>
                <b>{formatToken(data.admin.poolPaid)}</b>
              </div>
            </article>
            <article className={styles.stat}>
              <span className={styles.statIcon}>
                <ShoppingBag size={18} />
              </span>
              <div>
                <small>Presale Raised</small>
                <b>{money(data.adminPresale?.usd)}</b>
              </div>
            </article>
            <article className={styles.stat}>
              <span className={styles.statIcon}>
                <Banknote size={18} />
              </span>
              <div>
                <small>USD Commissions</small>
                <b>{money(data.adminPresale?.commissionPaid)}</b>
              </div>
            </article>
            <article className={styles.stat}>
              <span className={styles.statIcon}>
                <Trophy size={18} />
              </span>
              <div>
                <small>Qualified Investors</small>
                <b>{data.adminPresale?.qualifiedInvestors || 0}</b>
              </div>
            </article>
          </section>
        </motion.article>
      ) : null}
    </motion.div>
  );
}
