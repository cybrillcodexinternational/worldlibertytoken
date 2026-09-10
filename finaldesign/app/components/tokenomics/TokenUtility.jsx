"use client";

import { motion } from "framer-motion";
import { Landmark, Coins, Unlock, ArrowLeftRight, Users } from "lucide-react";
import styles from "../../tokenomics/tokenomics.module.css";
import SectionReveal, { staggerContainer, fadeUpItem } from "./SectionReveal";

const UTILITY = [
  {
    icon: Landmark,
    title: "Governance",
    text: "Vote on proposals that shape the ecosystem's direction.",
  },
  {
    icon: Coins,
    title: "Staking & Rewards",
    text: "Earn yield by locking tokens to help secure the network.",
  },
  {
    icon: Unlock,
    title: "Ecosystem Access",
    text: "Unlock premium features across partner platforms.",
  },
  {
    icon: ArrowLeftRight,
    title: "Transactions",
    text: "Used as the primary medium of exchange on-chain.",
  },
  {
    icon: Users,
    title: "Community",
    text: "Powers rewards, referrals and community initiatives.",
  },
];

export default function TokenUtility() {
  return (
    <section className={styles.section}>
      <div className="tp-inner">
        <SectionReveal>
          <p className={styles.kicker}>Token Utility</p>
          <h2 className={styles.heading}>More Than A Store Of Value</h2>
        </SectionReveal>
        <motion.div
          className={styles.utilityGrid}
          variants={staggerContainer(0.08)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          {UTILITY.map(({ icon: Icon, title, text }) => (
            <motion.div key={title} variants={fadeUpItem} className={styles.utilityItem}>
              <Icon className={styles.utilityIcon} strokeWidth={1.5} />
              <div className={styles.utilityTitle}>{title}</div>
              <div className={styles.utilityText}>{text}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
