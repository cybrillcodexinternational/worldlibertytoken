import {
  ArrowRight,
  ArrowUpRight,
  Box,
  CircleDot,
  Eye,
  Gem,
  Globe,
  Hexagon,
  Rocket,
  TrendingUp,
  User,
  Users,
  Wallet,
} from "lucide-react";
import styles from "../../echosystem/echosystem.module.css";

const HIGHLIGHTS = [
  {
    title: "Unified Ecosystem",
    text: "All products and services connected through WLT.",
    Icon: Box,
  },
  {
    title: "Real Utility",
    text: "Designed for real-world use cases.",
    Icon: Rocket,
  },
  {
    title: "Global Access",
    text: "Borderless opportunities for everyone.",
    Icon: Globe,
  },
  {
    title: "Community First",
    text: "Built by the community, for the community.",
    Icon: Users,
  },
];

const MODULES = [
  {
    title: "WLT Token",
    text: "The core of the ecosystem, powering all products and services.",
    Icon: Globe,
  },
  {
    title: "Presale Platform",
    text: "Early access for a brighter future.",
    Icon: Rocket,
  },
  {
    title: "Mining System",
    text: "Participate, earn, and grow.",
    Icon: TrendingUp,
  },
  {
    title: "Staking & Rewards",
    text: "Earn passive income and long-term benefits.",
    Icon: Gem,
  },
  {
    title: "Wallet & Payments",
    text: "Send, receive, and spend WLT globally.",
    Icon: Wallet,
  },
  {
    title: "Exchange & Liquidity",
    text: "Greater accessibility and trading opportunities.",
    Icon: Eye,
  },
  {
    title: "Ecosystem dApps",
    text: "A growing suite of decentralized applications.",
    Icon: Hexagon,
  },
  {
    title: "Real World Utility",
    text: "Use WLT in everyday life, products, and services.",
    Icon: CircleDot,
  },
  {
    title: "Governance",
    text: "Community-driven decisions for a fair future.",
    Icon: User,
  },
];

export default function EcosystemOverview() {
  return (
    <section className={styles.overviewSection}>
      <div className={`tp-inner ${styles.overviewInner}`}>
        <div className={styles.highlightGrid}>
          {HIGHLIGHTS.map(({ title, text, Icon }) => (
            <article className={styles.highlightCard} key={title}>
              <span className={styles.highlightIcon} aria-hidden="true">
                <Icon size={32} strokeWidth={1.6} />
              </span>
              <div className={styles.highlightCopy}>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>

        <div className={styles.overviewBody}>
          <div className={styles.overviewCopy}>
            <p className={styles.overviewKicker}>Ecosystem Overview</p>
            <h2 className={styles.overviewTitle}>
              Built To Empower
              <br />
              Everyone.
            </h2>
            <p className={styles.overviewText}>
              Our ecosystem brings together innovative products, strategic
              partnerships, and a growing community to create a sustainable and
              inclusive digital economy. Each component is designed to add real
              value and work together seamlessly.
            </p>
            <button type="button" className={styles.overviewCta}>
              Learn How It Works
              <ArrowRight size={16} strokeWidth={2.2} />
            </button>
          </div>

          <div className={styles.moduleGrid}>
            {MODULES.map(({ title, text, Icon }) => (
              <article className={styles.moduleCard} key={title}>
                <span className={styles.moduleIcon} aria-hidden="true">
                  <Icon size={24} strokeWidth={1.7} />
                </span>
                <span className={styles.moduleArrow} aria-hidden="true">
                  <ArrowUpRight size={16} strokeWidth={2} />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
