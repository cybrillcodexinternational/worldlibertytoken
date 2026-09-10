"use client";

import Link from "next/link";
import styles from "../../roadmap/roadmap.module.css";
import SectionReveal from "../tokenomics/SectionReveal";

export default function RoadmapCta() {
  return (
    <section className={`${styles.section} ${styles.ctaSection}`}>
      <div className="tp-inner">
        <SectionReveal className={styles.ctaInner}>
          <h2 className={styles.ctaHeading}>
            <span>Building The Future,</span>
            <br />
            One Phase At A Time.
          </h2>
          <p className={styles.ctaText}>
            Be part of a global movement for digital liberty.
            <br />
            Read our whitepaper or join the community today.
          </p>
          <div className={styles.ctaButtons}>
            <Link href="#" className={styles.btnSecondary}>
              Read Whitepaper
            </Link>
            <Link href="#" className={styles.btnPrimary}>
              Join The Community
              <span className={styles.btnArrow}>→</span>
            </Link>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
