"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import styles from "../../tokenomics/tokenomics.module.css";
import { staggerContainer, fadeUpItem } from "./SectionReveal";

export default function BreadcrumbHeader() {
  return (
    <section className={`${styles.section} ${styles.breadcrumbSection}`}>
      <motion.div
        className={`tp-inner ${styles.breadcrumbInner}`}
        variants={staggerContainer(0.12)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
      >
        <div>
          <motion.p variants={fadeUpItem} className={styles.crumbTrail}>
            <Link href="/">Home</Link>
            <span>/</span>
            <span className={styles.crumbCurrent}>Tokenomics</span>
          </motion.p>
          <motion.p variants={fadeUpItem} className={styles.breadcrumbKicker}>
            Tokenomics
          </motion.p>
          <motion.h1 variants={fadeUpItem} className={styles.breadcrumbTitle}>
            Tokenomics
          </motion.h1>
          <motion.p variants={fadeUpItem} className={styles.breadcrumbDescription}>
            A transparent look at how WLT supply, allocation and utility are
            structured to support long-term ecosystem growth.
          </motion.p>
        </div>
        <motion.div variants={fadeUpItem} className={styles.breadcrumbSide}>
          A Fairer Economy
          <br />
          A Brighter Tomorrow
        </motion.div>
      </motion.div>
    </section>
  );
}
