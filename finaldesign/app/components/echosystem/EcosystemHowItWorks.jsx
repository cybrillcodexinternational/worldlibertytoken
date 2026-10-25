import { Bot, BrainCircuit, Cpu, Network } from "lucide-react";
import styles from "../../echosystem/echosystem.module.css";

const STATS = [
  { value: "01", label: "Robotics", Icon: Bot },
  { value: "02", label: "Automation", Icon: Cpu },
  { value: "03", label: "Artificial Intelligence", Icon: BrainCircuit },
  { value: "04", label: "Connected Systems", Icon: Network },
];

const RESEARCH_FIELDS = [
  "Robotics",
  "Automation",
  "Artificial Intelligence",
  "Sensors",
  "Networks",
  "Human-Robot Interaction",
];

export default function EcosystemHowItWorks() {
  return (
    <>
      <section className={styles.howSection}>
        <div className={`tp-inner ${styles.howInner}`}>
          <div className={styles.howCopy}>
            <p className={styles.howKicker}>Explore The Field</p>
            <h2 className={styles.howTitle}>
              Connected
              <br />
              Disciplines
            </h2>
            <p className={styles.howText}>
              Robotics brings together mechanical design, software, sensing,
              artificial intelligence, and human experience.
            </p>
          </div>

          <div className={styles.cycleWrap}>
            <video
              className={styles.cycleImage}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="Mini robot exploring robotics concepts"
            >
              <source src="/images/mini-robot.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      <section className={styles.numbersSection}>
        <div className={`tp-inner ${styles.numbersInner}`}>
          <div className={styles.numbersCopy}>
            <p className={styles.howKicker}>Research Topics</p>
            <h2 className={styles.numbersTitle}>
              Explore The
              <br />
              Connections.
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
            <p className={styles.howKicker}>Areas Of Study</p>
            <h2 className={styles.partnersTitle}>Ideas In Motion</h2>
            <p className={styles.partnersText}>
              Explore these connected fields through research, explainers, and
              educational resources. The roadmap reflects areas of interest,
              not promised delivery dates.
            </p>
          </div>
          <div className={styles.partnersGrid}>
            {RESEARCH_FIELDS.map((field) => (
              <article className={styles.partnerCard} key={field}>
                <span className={styles.partnerMark}>{field}</span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
