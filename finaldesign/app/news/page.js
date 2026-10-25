import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "./news.module.css";
import NewsListing from "../components/news/NewsListing";

export const metadata = {
  title: "News — Robotic Networks Research",
  description: "Robotics, automation, and intelligent-systems news and research updates.",
};

export default function NewsPage() {
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
                  <span>News</span>
                </p>

                <p className={styles.kicker}>News</p>
                <h1 className={styles.title}>
                  Latest Updates
                  <br />
                  From The Robotics And Research Community.
                </h1>
                <p className={styles.description}>
                  Explore developments in robotics, automation, artificial
                  intelligence, and connected technologies.
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
                <video
                  className={styles.globe}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label="Robotic arm animation"
                >
                  <source src="/images/mini-robot.mp4" type="video/mp4" />
                </video>
                <div className={styles.rightNote} aria-hidden="true">
                  <p>
                    Stay
                    <br />
                    Informed
                    <br />
                    Stay
                    <br />
                    Ahead
                  </p>
                  <span className={styles.noteAccent}></span>
                </div>
              </div>
            </div>
          </div>
        </section>
        <NewsListing />
      </main>
      <Footer />
    </>
  );
}
