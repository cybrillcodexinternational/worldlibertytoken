"use client";

import { Box, Goal, Layers, Users } from "lucide-react";
import { motion } from "framer-motion";
import styles from "../../roadmap/roadmap.module.css";
import SectionReveal, {
  staggerContainer,
  fadeUpItem,
} from "../tokenomics/SectionReveal";

const STATS = [
  {
    value: "6",
    label: "Total Phases",
    note: "A structured path forward",
    Icon: Layers,
  },
  {
    value: "30+",
    label: "Key Milestones",
    note: "From development to global scale",
    Icon: Goal,
  },
  {
    value: "8+",
    label: "Ecosystem Modules",
    note: "Building real utility",
    Icon: Box,
  },
  {
    value: "80K+",
    label: "Global Community",
    note: "And growing rapidly",
    Icon: Users,
  },
];

export default function RoadmapNumbers() {
  return (
    <section className={`${styles.section} ${styles.numbersSection}`}>
      <div className={`tp-inner ${styles.numbersInner}`}>
        <SectionReveal className={styles.numbersCopy}>
          <p className={styles.numbersKicker}>Roadmap In Numbers</p>
          <h2 className={styles.numbersHeading}>
            Measurable
            <br />
            Progress.
          </h2>
        </SectionReveal>

        <motion.div
          className={styles.numbersGrid}
          variants={staggerContainer(0.08)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          {STATS.map((stat) => {
            const Icon = stat.Icon;
            return (
              <motion.article
                key={stat.label}
                variants={fadeUpItem}
                className={styles.numbersCard}
              >
                <span className={styles.numbersIcon}>
                  <Icon size={24} strokeWidth={1.5} />
                </span>
                <p className={styles.numbersValue}>{stat.value}</p>
                <p className={styles.numbersLabel}>{stat.label}</p>
                <p className={styles.numbersNote}>{stat.note}</p>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
