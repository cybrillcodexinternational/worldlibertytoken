import Image from "next/image";
import { MapPin, RefreshCcw, Target, Users } from "lucide-react";
import styles from "../../echosystem/echosystem.module.css";
import cycleImage from "../../../assets/images/3sectionimage.png";

const STATS = [
  { value: "125K+", label: "Community Members", Icon: Users },
  { value: "50+", label: "Strategic Partners", Icon: RefreshCcw },
  { value: "10+", label: "Ecosystem Products", Icon: MapPin },
  { value: "100+", label: "Countries Reached", Icon: Target },
];

const PARTNERS = [
  { name: "Binance" },
  { name: "Tron" },
  { name: "Chainlink" },
  { name: "Polygon" },
  { name: "AWS" },
  { name: "Circle" },
];

function PartnerMark({ name }) {
  if (name === "Binance") {
    return (
      <span className={styles.partnerMark}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3L15.2 6.2L12 9.4L8.8 6.2L12 3Z" />
          <path d="M6.2 8.8L9.4 12L6.2 15.2L3 12L6.2 8.8Z" />
          <path d="M17.8 8.8L21 12L17.8 15.2L14.6 12L17.8 8.8Z" />
          <path d="M12 14.6L15.2 17.8L12 21L8.8 17.8L12 14.6Z" />
        </svg>
        BINANCE
      </span>
    );
  }

  if (name === "Tron") {
    return (
      <span className={styles.partnerMark}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 5L12 3L20 8L12 21L4 5Z" />
        </svg>
        TRON
      </span>
    );
  }

  if (name === "Chainlink") {
    return (
      <span className={styles.partnerMark}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3L19 7V17L12 21L5 17V7L12 3Z" />
        </svg>
        Chainlink
      </span>
    );
  }

  if (name === "Polygon") {
    return (
      <span className={styles.partnerMark}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 8.5L12 5.5L17 8.5V15.5L12 18.5L7 15.5V8.5Z" />
        </svg>
        polygon
      </span>
    );
  }

  if (name === "AWS") {
    return <span className={`${styles.partnerMark} ${styles.partnerAws}`}>aws</span>;
  }

  return (
    <span className={styles.partnerMark}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="7" />
        <path d="M9 12H15" />
      </svg>
      CIRCLE
    </span>
  );
}

export default function EcosystemHowItWorks() {
  return (
    <>
      <section className={styles.howSection}>
        <div className={`tp-inner ${styles.howInner}`}>
          <div className={styles.howCopy}>
            <p className={styles.howKicker}>How It Works</p>
            <h2 className={styles.howTitle}>
              A Seamless
              <br />
              Ecosystem
            </h2>
            <p className={styles.howText}>
              Every part of the World Liberty Token ecosystem is interconnected,
              creating a continuous cycle of growth, utility, and community
              value.
            </p>
          </div>

          <div className={styles.cycleWrap}>
            <Image
              src={cycleImage}
              alt="WLT ecosystem cycle: Users, Trade, Grow, Reinvest, Use, and Earn"
              className={styles.cycleImage}
              sizes="(max-width: 1250px) 100vw, 70vw"
            />
          </div>
        </div>
      </section>

      <section className={styles.numbersSection}>
        <div className={`tp-inner ${styles.numbersInner}`}>
          <div className={styles.numbersCopy}>
            <p className={styles.howKicker}>Ecosystem In Numbers</p>
            <h2 className={styles.numbersTitle}>
              Real Growth.
              <br />
              Real Impact.
            </h2>
          </div>
          <div className={styles.numbersGrid}>
            {STATS.map(({ value, label, Icon }) => (
              <article className={styles.numbersCard} key={label}>
                <span className={styles.numbersIcon} aria-hidden="true">
                  <Icon size={28} strokeWidth={1.6} />
                </span>
                <div>
                  <p className={styles.numbersValue}>{value}</p>
                  <p className={styles.numbersLabel}>{label}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.partnersSection}>
        <div className={`tp-inner ${styles.partnersInner}`}>
          <div className={styles.partnersCopy}>
            <p className={styles.howKicker}>Powering Together</p>
            <h2 className={styles.partnersTitle}>Our Partners</h2>
            <p className={styles.partnersText}>
              We collaborate with leading blockchain projects, financial
              institutions, and technology providers to expand the possibilities
              of the WLT ecosystem.
            </p>
          </div>
          <div className={styles.partnersGrid}>
            {PARTNERS.map((partner) => (
              <article className={styles.partnerCard} key={partner.name}>
                <PartnerMark name={partner.name} />
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
