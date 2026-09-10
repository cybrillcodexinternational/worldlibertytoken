"use client";

import styles from "../../tokenomics/tokenomics.module.css";
import SectionReveal from "./SectionReveal";
import VestingTable from "./VestingTable";

export default function VestingSchedule() {
  return (
    <section className={styles.section}>
      <div className="tp-inner">
        <div className={styles.vestingInner}>
          <SectionReveal>
            <p className={styles.kicker}>Vesting Schedule</p>
            <h2 className={styles.heading}>Aligned Incentives Over Time</h2>
            <p className={styles.text}>
              Team, partner and treasury allocations unlock gradually with
              defined cliffs, keeping every stakeholder committed to the
              project&apos;s long-term success rather than short-term exits.
            </p>
            <a href="#" className={`${styles.btnSecondary} ${styles.vestingButton}`}>
              View Vesting Details
              <span className={styles.btnArrow}>→</span>
            </a>
          </SectionReveal>
          <SectionReveal delay={0.15}>
            <VestingTable />
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}
