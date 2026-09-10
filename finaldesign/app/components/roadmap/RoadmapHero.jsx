"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import styles from "../../roadmap/roadmap.module.css";
import { staggerContainer, fadeUpItem } from "../tokenomics/SectionReveal";
import GlobeNetwork from "./GlobeNetwork";

export default function RoadmapHero() {
  return (
    <section className={`${styles.section} ${styles.breadcrumbSection}`}>
      <motion.div
        className={`tp-inner ${styles.breadcrumbInner}`}
        variants={staggerContainer(0.1)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
      >
        <div className={styles.heroCopy}>
          <motion.p variants={fadeUpItem} className={styles.crumbTrail}>
            <Link href="/">Home</Link>
            <span className={styles.crumbSep}>/</span>
            <span className={styles.crumbCurrent}>Roadmap</span>
          </motion.p>
          <motion.p variants={fadeUpItem} className={styles.breadcrumbKicker}>
            Roadmap
          </motion.p>
          <motion.h1 variants={fadeUpItem} className={styles.breadcrumbTitle}>
            Roadmap
          </motion.h1>
          <motion.p variants={fadeUpItem} className={styles.breadcrumbDescription}>
            A clear, phased growth plan for World Liberty Token (WLT) —
            building real utility, global adoption, and a more open financial
            future.
          </motion.p>
        </div>

        <div className={styles.heroVisual} aria-hidden="true">
          <div className={styles.quotePrimary}>
            <p>
              People
              <br />
              Utility
              <br />
              Freedom
              <br />
              A Brighter Tomorrow
            </p>
            <span className={styles.quoteBar} />
          </div>

          <div className={styles.globeWrap}>
            <GlobeNetwork />
          </div>

          <div className={styles.quoteSecondary}>
            <p>
              A
              <br />
              More Open
              <br />
              Financial
              <br />
              Tomorrow
            </p>
            <span className={styles.quoteBar} />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
