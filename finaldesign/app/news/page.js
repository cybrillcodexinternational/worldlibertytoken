import Header from "../components/Header";
import Footer from "../components/Footer";
import Image from "next/image";
import styles from "./news.module.css";
import heroNeon from "../../assets/images/heroneon.png";
import NewsListing from "../components/news/NewsListing";

export const metadata = {
  title: "News — World Liberty Token",
  description: "Latest news, updates, and milestones from the World Liberty Token ecosystem.",
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
                  From The WLT Ecosystem.
                </h1>
                <p className={styles.description}>
                  Stay informed with announcements, partnerships, product
                  releases, and milestones from World Liberty Token - built for
                  people, utility, and a brighter tomorrow.
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
