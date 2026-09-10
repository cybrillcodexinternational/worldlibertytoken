"use client";

import { motion } from "framer-motion";
import { Layers, Box, Link2, Users } from "lucide-react";
import styles from "../../tokenomics/tokenomics.module.css";
import SectionReveal, { staggerContainer, fadeUpItem } from "./SectionReveal";
import TokenDistributionChart from "./TokenDistributionChart";
import { ALLOCATION } from "./data";

const CARDS = [
  {
    key: "symbol",
    icon: Layers,
    value: "WLT",
    line1: "Token Symbol",
    line2: "World Liberty Token",
  },
  {
    key: "supply",
    icon: Box,
    value: "1,000,000,000",
    line1: "Total Supply",
    line2: "Fixed & Immutable",
  },
  {
    key: "chain",
    icon: Link2,
    value: "BEP-20",
    line1: "Blockchain",
    line2: "BNB Smart Chain",
  },
  {
    key: "community",
    icon: Users,
    value: "Global",
    line1: "Community",
    line2: "Built for Everyone",
  },
];

export default function TokenOverview() {
  return (
    <section className={styles.section}>
      <div className="tp-inner">
        <div className={styles.overviewInner}>
          <SectionReveal className={styles.overviewCopy}>
            <p className={styles.overviewKicker}>Token Overview</p>
            <h2 className={styles.overviewHeading}>
              Built On Trust.
              <br />
              Designed For People.
            </h2>
            <p className={styles.overviewText}>
              World Liberty Token (WLT) has a fixed supply and a clear
              distribution model to ensure transparency, sustainability,
              and real-world utility.
            </p>
            <motion.div
              className={styles.overviewCards}
              variants={staggerContainer(0.1)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
            >
              {CARDS.map(({ key, icon: Icon, value, line1, line2 }) => (
                <motion.div key={key} variants={fadeUpItem} className={styles.overviewCard}>
                  <Icon className={styles.overviewCardIcon} strokeWidth={1.6} />
                  <div className={styles.overviewCardBody}>
                    <div className={styles.overviewCardValue}>{value}</div>
                    <div className={styles.overviewCardLabel}>{line1}</div>
                    <div className={styles.overviewCardLabel}>{line2}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </SectionReveal>

          <SectionReveal delay={0.12} className={styles.overviewChart}>
            <TokenDistributionChart />
          </SectionReveal>

          <SectionReveal delay={0.2} className={styles.overviewLegendCol}>
            <ul className={styles.legend}>
              {ALLOCATION.map((entry) => (
                <li key={entry.key} className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: entry.color }} />
                  <span className={styles.legendPercent}>{entry.percent}%</span>
                  <span className={styles.legendName}>{entry.name}</span>
                </li>
              ))}
            </ul>
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}
