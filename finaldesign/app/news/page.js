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

              <div className={styles.heroVisual}>
                <video
                  className={styles.globe}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label="Golden connected globe animation"
                >
                  <source src="/images/ecosystem-hero.mp4" type="video/mp4" />
                </video>
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
