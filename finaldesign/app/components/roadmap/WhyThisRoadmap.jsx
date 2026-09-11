"use client";

import { BarChart3, Box, Eye, Users } from "lucide-react";
import { motion } from "framer-motion";
import styles from "../../roadmap/roadmap.module.css";
import SectionReveal, {
  staggerContainer,
  fadeUpItem,
} from "../tokenomics/SectionReveal";

const CARDS = [
  {
    title: "Transparent Planning",
    text: "Clear milestones and open communication at every step.",
    Icon: Eye,
  },
  {
    title: "Sustainable Growth",
    text: "Built for long-term value, not short-term hype.",
    Icon: BarChart3,
  },
  {
    title: "Utility-Driven Expansion",
    text: "Real products, real use cases, real impact.",
    Icon: Box,
  },
  {
    title: "Community-Centered Vision",
    text: "Invite miners and earn 10%, 5%, and 3% of their mined WLT from the Referral Reward Pool — never deducted from the miner.",
    Icon: Users,
  },
];

export default function WhyThisRoadmap() {
  return (
    <section className={`${styles.section} ${styles.whySection}`}>
      <div className={`tp-inner ${styles.whyInner}`}>
        <SectionReveal className={styles.whyCopy}>
          <p className={styles.whyKicker}>Why This Roadmap</p>
          <h2 className={styles.whyHeading}>
            A Stronger
            <br />
            Tomorrow.
          </h2>
          <p className={styles.whyText}>
            Our roadmap is more than a timeline —
            <br />
            it&apos;s a commitment to a better, more open
            <br />
            financial future for everyone.
          </p>
        </SectionReveal>

        <motion.div
          className={styles.whyGrid}
          variants={staggerContainer(0.08)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          {CARDS.map((card) => {
            const Icon = card.Icon;
            return (
              <motion.article
                key={card.title}
                variants={fadeUpItem}
                className={styles.whyCard}
              >
                <span className={styles.whyIcon}>
                  <Icon size={44} strokeWidth={1.4} />
                </span>
                <h3 className={styles.whyCardTitle}>{card.title}</h3>
                <p className={styles.whyCardText}>{card.text}</p>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
