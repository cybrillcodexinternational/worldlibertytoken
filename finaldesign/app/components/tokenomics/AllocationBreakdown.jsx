"use client";

import { motion } from "framer-motion";
import {
  Box,
  Users,
  BarChart3,
  Handshake,
  Megaphone,
  Wallet,
  Gift,
} from "lucide-react";
import Link from "next/link";
import styles from "../../tokenomics/tokenomics.module.css";
import SectionReveal, { staggerContainer } from "./SectionReveal";
import AllocationCard from "./AllocationCard";
import { ALLOCATION } from "./data";

const ICONS = {
  ecosystem: Box,
  community: Users,
  liquidity: BarChart3,
  partnerships: Handshake,
  team: Users,
  marketing: Megaphone,
  treasury: Wallet,
  launch: Gift,
};

export default function AllocationBreakdown() {
  return (
    <section className={styles.section}>
      <div className="tp-inner">
        <SectionReveal>
          <div className={styles.allocationHead}>
            <div>
              <p className={styles.allocationKicker}>Allocation Details</p>
              <h2 className={styles.allocationHeading}>Every Token Has A Purpose.</h2>
            </div>
            <Link href="#" className={`${styles.btnSecondary} ${styles.allocationButton}`}>
              View Full Breakdown
              <span className={styles.btnArrow}>→</span>
            </Link>
          </div>
          <p className={styles.allocationText}>
            The allocation is strategically designed to fuel ecosystem growth,
            reward the community, and ensure long-term sustainability.
          </p>
        </SectionReveal>
        <div className={styles.allocationScroller}>
          <motion.div
            className={styles.allocationGrid}
            variants={staggerContainer(0.08)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
          >
            {ALLOCATION.map((item) => (
              <AllocationCard
                key={item.key}
                icon={ICONS[item.key]}
                name={item.name}
                percent={item.percent}
                tokens={item.tokens}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
