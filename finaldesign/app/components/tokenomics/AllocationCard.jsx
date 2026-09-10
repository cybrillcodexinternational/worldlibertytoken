"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import styles from "../../tokenomics/tokenomics.module.css";
import { fadeUpItem } from "./SectionReveal";

export default function AllocationCard({ icon: Icon, name, percent, tokens }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div ref={ref} variants={fadeUpItem} className={styles.allocationCard}>
      <Icon className={styles.allocationIcon} strokeWidth={1.5} />
      <div className={styles.allocationPercent}>{percent}%</div>
      <div className={styles.allocationName}>{name}</div>
      <div className={styles.allocationAmount}>{tokens}</div>
      <div className={styles.progressTrack}>
        <div
          className={styles.progressFill}
          style={{ width: isInView ? `${percent}%` : "0%" }}
        />
      </div>
    </motion.div>
  );
}
