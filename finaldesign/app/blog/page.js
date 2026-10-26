import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "../news/news.module.css";
import BlogListing from "../components/blog/BlogListing";

export const metadata = {
  title: "Blog — Robotic Networks Research",
  description:
    "Accessible guides and research articles about robotics, automation, and intelligent systems.",
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
                  Robotics, Ideas
                  <br />
                  And Intelligent Systems.
                </h1>
                <p className={styles.description}>
                  Explore guides and research that make robotics, automation,
                  artificial intelligence, and connected systems easier to
                  understand.
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
        <BlogListing />
      </main>
      <Footer />
    </>
  );
}
