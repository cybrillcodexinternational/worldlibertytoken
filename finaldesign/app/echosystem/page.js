import Header from "../components/Header";
import Footer from "../components/Footer";
import Image from "next/image";
import styles from "./echosystem.module.css";
import heroNeon from "../../assets/images/heroneon.png";
import EcosystemOverview from "../components/echosystem/EcosystemOverview";
import EcosystemHowItWorks from "../components/echosystem/EcosystemHowItWorks";
import EcosystemJoinCta from "../components/echosystem/EcosystemJoinCta";

export const metadata = {
  title: "Echosystem — World Liberty Token",
  description: "Explore the World Liberty Token echosystem.",
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

                <p className={styles.kicker}>Ecosystem</p>
                <h1 className={styles.title}>
                  A Unified Ecosystem
                  <br />
                  Built For Every Participant.
                </h1>
                <p className={styles.description}>
                  Connecting utilities, community, and real-world opportunity -
                  World Liberty Token brings together people, products, and
                  possibilities to create a more open financial future.
                </p>
              </div>

              <div className={styles.centerRail} aria-hidden="true">
                <div className={styles.noteBlock}>
                  <p>People</p>
                  <p>Utility</p>
                  <p>Freedom</p>
                  <p>A Brighter Tomorrow</p>
                </div>
                <span className={styles.noteAccent}></span>
              </div>

              <div className={styles.heroVisual}>
                <Image
                  src={heroNeon}
                  alt="Neon globe network"
                  className={styles.globe}
                  priority
                />
                <div className={styles.rightNote} aria-hidden="true">
                  <p>
                    A
                    <br />
                    More Open
                    <br />
                    Financial
                    <br />
                    Tomorrow
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
