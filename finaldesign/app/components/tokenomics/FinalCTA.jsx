"use client";

import Link from "next/link";
import styles from "../../tokenomics/tokenomics.module.css";
import SectionReveal from "./SectionReveal";

export default function FinalCTA() {
  return (
    <section className={`${styles.section} ${styles.ctaSection}`}>
      <div className="tp-inner">
        <SectionReveal className={styles.ctaInner}>
          <div>
            <p className={styles.ctaEyebrow}>Get Involved</p>
            <h2 className={styles.ctaHeading}>Be Part Of The Next Chapter</h2>
          </div>
          <div className={styles.ctaButtons}>
            <Link href="#" className={styles.btnPrimary}>
              Join The Community
              <span className={styles.btnArrow}>→</span>
            </Link>
            <Link href="#" className={styles.btnSecondary}>
              Explore Ecosystem
              <span className={styles.btnArrow}>→</span>
            </Link>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
