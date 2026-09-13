"use client";

import {
  Box,
  Check,
  Globe,
  Layers,
  Pickaxe,
  Rocket,
  Settings,
} from "lucide-react";
import { motion } from "framer-motion";
import styles from "../../roadmap/roadmap.module.css";
import SectionReveal, {
  staggerContainer,
  fadeUpItem,
} from "../tokenomics/SectionReveal";

const PHASES = [
  {
    num: "01",
    title: "Foundation",
    subtitle: "Ideas. Infrastructure. Community.",
    Icon: Box,
    status: "completed",
    items: [
      "Project development",
      "Core concept & vision",
      "Smart contract planning",
      "Brand creation",
      "3-level mining referral: 10% / 5% / 3% of mined WLT",
    ],
  },
  {
    num: "02",
    title: "Pre Launch and Mining",
    subtitle: "Prepare the network. Start mining.",
    Icon: Pickaxe,
    status: "progress",
    items: [
      "Mining protocol setup",
      "Node preparation",
      "Testnet mining",
      "Miner onboarding",
      "Pre-launch security review",
    ],
  },
  {
    num: "03",
    title: "Launch",
    subtitle: "From vision to reality.",
    Icon: Rocket,
    status: "upcoming",
    items: [
      "Token launch",
      "Website release",
      "Whitepaper publish",
      "Phantom presale at $0.50 / WLT",
      "Qualified investor referral: $1,000 unlock · 5% USD (SOL payout)",
    ],
  },
  {
    num: "04",
    title: "Expansion",
    subtitle: "Grow. Partner. Empower.",
    Icon: Layers,
    status: "upcoming",
    items: [
      "Exchange listings",
      "Strategic partnerships",
      "Staking & rewards rollout",
      "Dashboard launch",
      "Mining referral network: 10% / 5% / 3% of mined WLT",
    ],
  },
  {
    num: "05",
    title: "Evolution",
    subtitle: "More utility. Greater impact.",
    Icon: Settings,
    status: "upcoming",
    items: [
      "Governance features",
      "Advanced utilities",
      "Cross-chain exploration",
      "Ecosystem scaling",
      "Marketing expansion",
    ],
  },
  {
    num: "06",
    title: "Global Scale",
    subtitle: "A borderless financial future.",
    Icon: Globe,
    status: "upcoming",
    items: [
      "Mass adoption",
      "Enterprise partnerships",
      "Global community network",
      "Product maturity",
      "Long-term sustainability",
    ],
  },
];

const STATUS = {
  completed: { label: "Completed", className: "statusDone" },
  progress: { label: "In Progress", className: "statusProgress" },
  upcoming: { label: "Upcoming", className: "statusSoon" },
};

function StatusMark({ status }) {
  if (status === "completed") {
    return (
      <span className={styles.statusMarkDone}>
        <Check size={10} strokeWidth={3} />
      </span>
    );
  }

  return (
    <span
      className={
        status === "progress" ? styles.statusMarkProgress : styles.statusMarkSoon
      }
    />
  );
}

export default function DetailedRoadmap() {
  return (
    <section className={`${styles.section} ${styles.detailSection}`}>
      <div className="tp-inner">
        <SectionReveal className={styles.detailIntro}>
          <div>
            <p className={styles.detailKicker}>Detailed Roadmap</p>
            <h2 className={styles.detailHeading}>Built Step By Step.</h2>
          </div>
          <p className={styles.detailText}>
            Each phase is designed to deliver real value, strengthen our ecosystem,
            and bring us closer to a more open, inclusive, and empowered global
            economy.
          </p>
        </SectionReveal>

        <motion.div
          className={styles.detailGrid}
          variants={staggerContainer(0.08)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          {PHASES.map((phase) => {
            const Icon = phase.Icon;
            const status = STATUS[phase.status];
            const filled = phase.status !== "upcoming";

            return (
              <motion.article
                key={phase.num}
                variants={fadeUpItem}
                className={styles.detailCard}
              >
                <div className={styles.detailTop}>
                  <span className={styles.detailNum}>{phase.num}</span>
                  <span className={styles.detailIcon}>
                    <Icon size={22} strokeWidth={1.4} />
                  </span>
                </div>
                <h3 className={styles.detailTitle}>{phase.title}</h3>
                <p className={styles.detailSub}>{phase.subtitle}</p>
                <span className={styles.detailRule} />
                <ul className={styles.detailList}>
                  {phase.items.map((item) => (
                    <li key={item}>
                      <span
                        className={
                          filled ? styles.checkFilled : styles.checkOutline
                        }
                      >
                        <Check size={9} strokeWidth={3} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className={`${styles.detailStatus} ${styles[status.className]}`}>
                  <StatusMark status={phase.status} />
                  {status.label}
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
