import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import styles from "../../echosystem/echosystem.module.css";
import globeImage from "../../../assets/images/heroneon.png";

export default function EcosystemJoinCta() {
  return (
    <section className={styles.joinSection}>
      <div className={`tp-inner ${styles.joinInner}`}>
        <div className={styles.joinFrame}>
          <div className={styles.joinCopy}>
            <p className={styles.joinKicker}>Join The Ecosystem</p>
            <h2 className={styles.joinTitle}>Be Part Of A Brighter Tomorrow.</h2>
            <p className={styles.joinText}>
              Explore, participate, and grow with World Liberty Token. Together,
              we can create a more inclusive and empowered global future.
            </p>
            <div className={styles.joinActions}>
              <Link href="/register" className={styles.joinPrimary}>
                Get Started
                <ArrowRight size={16} strokeWidth={2.2} />
              </Link>
              <Link href="#" className={styles.joinSecondary}>
                Read Whitepaper
              </Link>
            </div>
          </div>

          <div className={styles.joinVisual} aria-hidden="true">
            <Image
              src={globeImage}
              alt=""
              className={styles.joinGlobe}
              sizes="(max-width: 992px) 100vw, 58vw"
            />
          </div>

          <div className={styles.joinSideNote}>
            <p>
              People
              <br />
              Utility
              <br />
              Freedom
              <br />
              A Brighter Tomorrow
            </p>
            <span className={styles.joinAccent}></span>
          </div>
        </div>
      </div>
    </section>
  );
}
