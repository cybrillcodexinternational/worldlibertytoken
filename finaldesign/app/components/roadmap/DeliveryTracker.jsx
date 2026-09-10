"use client";

import { motion } from "framer-motion";
import styles from "../../roadmap/roadmap.module.css";
import SectionReveal, {
  staggerContainer,
  fadeUpItem,
} from "../tokenomics/SectionReveal";

const ROWS = [
  { num: "01", title: "Foundation", percent: 100 },
  { num: "02", title: "Pre Launch and Mining", percent: 40 },
  { num: "03", title: "Launch", percent: 20 },
  { num: "04", title: "Expansion", percent: 10 },
  { num: "05", title: "Evolution", percent: 0 },
  { num: "06", title: "Global Scale", percent: 0 },
];

export default function DeliveryTracker() {
  return (
    <section className={`${styles.section} ${styles.trackerSection}`}>
      <div className={`tp-inner ${styles.trackerInner}`}>
        <SectionReveal className={styles.trackerCopy}>
          <p className={styles.trackerKicker}>Delivery Tracker</p>
          <h2 className={styles.trackerHeading}>
            From Vision
            <br />
            To Reality.
          </h2>
          <p className={styles.trackerText}>
            Tracking our progress across key phases
            <br />
            as we build a more open and inclusive
            <br />
            global financial ecosystem.
          </p>
        </SectionReveal>

        <motion.div
          className={styles.trackerList}
          variants={staggerContainer(0.06)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          {ROWS.map((row) => (
            <motion.div
              key={row.num}
              variants={fadeUpItem}
              className={styles.trackerRow}
            >
              <span className={styles.trackerNum}>{row.num}</span>
              <span className={styles.trackerName}>{row.title}</span>
              <div className={styles.trackerBar}>
                <span
                  className={styles.trackerFill}
                  style={{ width: `${Math.max(row.percent, 1.6)}%` }}
                />
              </div>
              <span className={styles.trackerPct}>{row.percent}%</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
