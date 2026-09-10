"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Zap, Lock, Leaf, Globe } from "lucide-react";
import styles from "../../tokenomics/tokenomics.module.css";
import SectionReveal, { staggerContainer, fadeUpItem } from "./SectionReveal";

const PRINCIPLES = [
  {
    icon: Zap,
    filled: true,
    title: "Utility Driven",
    text: "Real-world use cases",
  },
  {
    icon: Lock,
    filled: false,
    title: "Fair Distribution",
    text: "Balanced for all",
  },
  {
    icon: Leaf,
    filled: true,
    title: "Long-Term Value",
    text: "Sustainable growth",
  },
  {
    icon: Globe,
    filled: false,
    title: "Community First",
    text: "Built by the people",
  },
];

export default function Principles() {
  return (
    <section className={styles.section}>
      <div className="tp-inner">
        <div className={styles.principlesTop}>
          <SectionReveal className={styles.principlesCopy}>
            <p className={styles.principlesKicker}>Key Principles</p>
            <h2 className={styles.principlesHeading}>
              A Tokenomics Model
              <br />
              That Works For Everyone.
            </h2>
          </SectionReveal>
          <motion.div
            className={styles.principlesGrid}
            variants={staggerContainer(0.08)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
          >
            {PRINCIPLES.map(({ icon: Icon, filled, title, text }) => (
              <motion.div key={title} variants={fadeUpItem} className={styles.principleCard}>
                <span className={styles.principleIcon}>
                  <Icon
                    size={28}
                    strokeWidth={1.6}
                    fill={filled ? "currentColor" : "none"}
                  />
                </span>
                <div className={styles.principleTitle}>{title}</div>
                <div className={styles.principleText}>{text}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <SectionReveal delay={0.12} className={styles.principleBanner}>
          <div className={styles.principleBannerVisual}>
            <Image
              src="/images/novax-coin.png"
              alt="World Liberty Token"
              width={220}
              height={220}
              className={styles.principleBannerCoin}
            />
          </div>
          <div className={styles.principleBannerCopy}>
            <p className={styles.principleBannerEyebrow}>Be Part Of A Global Movement</p>
            <h3 className={styles.principleBannerHeading}>
              More Than A Token.
              <br />
              A Brighter Tomorrow.
            </h3>
          </div>
          <Link href="#" className={styles.principleBannerBtn}>
            Join The Community
            <span className={styles.btnArrow}>→</span>
          </Link>
        </SectionReveal>
      </div>
    </section>
  );
}
