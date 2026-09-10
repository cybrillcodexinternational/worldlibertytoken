"use client";

import { Flame, ShieldCheck } from "lucide-react";
import styles from "../../tokenomics/tokenomics.module.css";
import SectionReveal from "./SectionReveal";
import SupplyCurveChart from "./SupplyCurveChart";

export default function SupplyEmission() {
  return (
    <section className={styles.section}>
      <div className="tp-inner">
        <div className={styles.supplyInner}>
          <SectionReveal className={styles.supplyCopy}>
            <p className={styles.supplyKicker}>Supply & Emission</p>
            <h2 className={styles.supplyHeading}>
              A Controlled Supply
              <br />
              For A Stronger Future.
            </h2>
            <p className={styles.supplyText}>
              WLT has a fixed supply of 1,000,000,000 tokens with a
              deflationary approach, ensuring long-term value and
              stability in the ecosystem.
            </p>
            <div className={styles.supplyRows}>
              <div className={styles.supplyRow}>
                <span className={styles.supplyRowIcon}>
                  <Flame size={28} strokeWidth={1.6} fill="currentColor" />
                </span>
                <div>
                  <div className={styles.supplyRowTitle}>No Additional Minting</div>
                  <div className={styles.supplyRowText}>Fixed Supply Forever</div>
                </div>
              </div>
              <div className={styles.supplyRow}>
                <span className={styles.supplyRowIcon}>
                  <ShieldCheck size={28} strokeWidth={1.75} />
                </span>
                <div>
                  <div className={styles.supplyRowTitle}>Transparent & Auditable</div>
                  <div className={styles.supplyRowText}>On-Chain Verification</div>
                </div>
              </div>
            </div>
          </SectionReveal>
          <SectionReveal delay={0.12} className={styles.supplyChartCol}>
            <SupplyCurveChart />
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}
