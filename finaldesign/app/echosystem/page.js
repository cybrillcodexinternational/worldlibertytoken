import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "./echosystem.module.css";
import EcosystemOverview from "../components/echosystem/EcosystemOverview";
import EcosystemHowItWorks from "../components/echosystem/EcosystemHowItWorks";
import EcosystemJoinCta from "../components/echosystem/EcosystemJoinCta";

export const metadata = {
  title: "Research Ecosystem — Robotic Networks Research",
  description: "Explore robotics, automation, artificial intelligence, and connected-systems research.",
};

export default function EchosystemPage() {
  return (
    <>
      <div className="cursor-dot" aria-hidden="true"></div>
      <div className="cursor-ring" aria-hidden="true"></div>
      <Header />
      <main className={styles.page}>
        <section className={styles.heroSection}>
          <div className="container-fluid">
            <div className={styles.heroInner}>
              <div className={styles.heroCopy}>
                <p className={styles.breadcrumbs}>
                  <span>Home</span>
                  <span className={styles.crumbDivider}>/</span>
                  <span>Ecosystem</span>
                </p>

                <p className={styles.kicker}>Research Ecosystem</p>
                <h1 className={styles.title}>
                  A Connected Research Ecosystem
                  <br />
                  For Intelligent Systems.
                </h1>
                <p className={styles.description}>
                  Robotic Networks Research connects ideas across robotics,
                  automation, artificial intelligence, and networked
                  technologies to make complex topics easier to explore.
                </p>
              </div>

              <div className={styles.centerRail} aria-hidden="true">
                <div className={styles.noteBlock}>
                  <p>People</p>
                  <p>Utility</p>
                  <p>Robotics</p>
                  <p>Automation</p>
                </div>
                <span className={styles.noteAccent}></span>
              </div>

              <div className={styles.heroVisual}>
                <video
                  className={styles.globe}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label="Research ecosystem animation"
                >
                  <source src="/images/ecosystem-video.mp4" type="video/mp4" />
                </video>
                <div className={styles.rightNote} aria-hidden="true">
                  <p>
                    Research
                    <br />
                    Explore
                    <br />
                    Understand
                  </p>
                  <span className={styles.noteAccent}></span>
                </div>
              </div>
            </div>
          </div>
        </section>
        <EcosystemOverview />
        <EcosystemHowItWorks />
        <EcosystemJoinCta />
      </main>
      <Footer />
    </>
  );
}
