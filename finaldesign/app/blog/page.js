import Header from "../components/Header";
import Footer from "../components/Footer";
import Image from "next/image";
import styles from "../news/news.module.css";
import heroNeon from "../../assets/images/heroneon.png";
import BlogListing from "../components/blog/BlogListing";

export const metadata = {
  title: "Blog — World Liberty Token",
  description:
    "Insights, guides, and long-form thinking from the World Liberty Token ecosystem.",
};

export default function BlogPage() {
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
                  <span>Blog</span>
                </p>

                <p className={styles.kicker}>Blog</p>
                <h1 className={styles.title}>
                  Insights, Ideas
                  <br />
                  And A Brighter Tomorrow.
                </h1>
                <p className={styles.description}>
                  Explore guides, education, and long-form thinking from World
                  Liberty Token — built to help you understand utility,
                  community, and the future of open finance.
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
                    Learn
                    <br />
                    Explore
                    <br />
                    Build
                    <br />
                    Together
                  </p>
                  <span className={styles.noteAccent}></span>
                </div>
              </div>
            </div>
          </div>
        </section>
        <BlogListing />
      </main>
      <Footer />
    </>
  );
}
