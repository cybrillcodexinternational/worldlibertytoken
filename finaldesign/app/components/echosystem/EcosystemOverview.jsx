import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  BrainCircuit,
  Cpu,
  Globe,
  Hexagon,
  Network,
  Radio,
  ScanFace,
  Search,
  ShieldCheck,
} from "lucide-react";
import styles from "../../echosystem/echosystem.module.css";

const HIGHLIGHTS = [
  {
    title: "Connected Research",
    text: "Explore ideas across robotics, automation, and intelligent systems.",
    Icon: Network,
  },
  {
    title: "Accessible Learning",
    text: "Clear explanations make complex technology easier to understand.",
    Icon: Search,
  },
  {
    title: "Emerging Technology",
    text: "Follow developments in artificial intelligence and connected devices.",
    Icon: BrainCircuit,
  },
  {
    title: "Responsible Design",
    text: "Consider people, safety, and impact as technology advances.",
    Icon: ShieldCheck,
  },
];

const MODULES = [
  {
    title: "Robotics",
    text: "Discover robotic platforms and how they interact with the world.",
    Icon: Bot,
  },
  {
    title: "Automation",
    text: "Explore machines and workflows designed to perform repeatable tasks.",
    Icon: Cpu,
  },
  {
    title: "Artificial Intelligence",
    text: "Learn about perception, models, and machine decision-making.",
    Icon: BrainCircuit,
  },
  {
    title: "Human-Robot Interaction",
    text: "Study how people and robotic systems communicate and collaborate.",
    Icon: ScanFace,
  },
  {
    title: "Sensors & Networks",
    text: "Understand the devices and connections that help systems sense and share information.",
    Icon: Radio,
  },
  {
    title: "Research Library",
    text: "Browse explainers, guides, and articles across emerging technology.",
    Icon: Search,
  },
  {
    title: "Responsible Technology",
    text: "Consider safety, accessibility, privacy, and real-world impact.",
    Icon: ShieldCheck,
  },
  {
    title: "Connected Systems",
    text: "Explore how intelligent devices exchange information and work together.",
    Icon: Network,
  },
  {
    title: "Emerging Ideas",
    text: "Keep up with new questions and developments across the field.",
    Icon: Globe,
  },
];

export default function EcosystemOverview() {
  return (
    <section className={styles.overviewSection}>
      <div className={`tp-inner ${styles.overviewInner}`}>
        <div className={styles.highlightGrid}>
          {HIGHLIGHTS.map(({ title, text, Icon }) => (
            <article className={styles.highlightCard} key={title}>
              <span className={styles.highlightIcon} aria-hidden="true">
                <Icon size={32} strokeWidth={1.6} />
              </span>
              <div className={styles.highlightCopy}>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>

        <div className={styles.overviewBody}>
          <div className={styles.overviewCopy}>
            <p className={styles.overviewKicker}>Research Overview</p>
            <h2 className={styles.overviewTitle}>
              Explore The
              <br />
              Connected Field.
            </h2>
            <p className={styles.overviewText}>
              Robotics connects engineering, software, sensing, and human
              experience. Explore these linked disciplines through accessible
              articles and topic guides.
            </p>
            <button type="button" className={styles.overviewCta}>
              Browse Research Areas
              <ArrowRight size={16} strokeWidth={2.2} />
            </button>
          </div>

          <div className={styles.moduleGrid}>
            {MODULES.map(({ title, text, Icon }) => (
              <article className={styles.moduleCard} key={title}>
                <span className={styles.moduleIcon} aria-hidden="true">
                  <Icon size={24} strokeWidth={1.7} />
                </span>
                <span className={styles.moduleArrow} aria-hidden="true">
                  <ArrowUpRight size={16} strokeWidth={2} />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
