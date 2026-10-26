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
            <p className={styles.joinKicker}>Explore The Research</p>
            <h2 className={styles.joinTitle}>Discover Intelligent Systems.</h2>
            <p className={styles.joinText}>
              Follow research topics, learn about emerging technologies, and
              explore how robotics connects with the world around us.
            </p>
            <div className={styles.joinActions}>
              <Link href="/tokenomics" className={styles.joinPrimary}>
                Explore RNR
                <ArrowRight size={16} strokeWidth={2.2} />
              </Link>
              <Link href="/blog" className={styles.joinSecondary}>
                Read Articles
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
              Automation
              <br />
              Research
              <br />
              Discovery
            </p>
            <span className={styles.joinAccent}></span>
          </div>
        </div>
      </div>
    </section>
  );
}
