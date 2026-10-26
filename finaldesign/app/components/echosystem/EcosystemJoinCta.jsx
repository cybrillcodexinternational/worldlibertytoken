import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import styles from "../../echosystem/echosystem.module.css";

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
              src="/images/ecosystem-explore-coins.png"
              alt=""
              className={styles.joinGlobe}
              width={370}
              height={370}
              sizes="(max-width: 992px) 84vw, 480px"
              unoptimized
            />
          </div>

        </div>
      </div>
    </section>
  );
}
