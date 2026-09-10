import Header from "../Header";
import Footer from "../Footer";
import Image from "next/image";
import styles from "../../auth/auth.module.css";
import heroNeon from "../../../assets/images/heroneon.png";

export default function AuthShell({
  crumb,
  kicker,
  title,
  description,
  highlights,
  children,
}) {
  return (
    <>
      <div className="cursor-dot" aria-hidden="true"></div>
      <div className="cursor-ring" aria-hidden="true"></div>
      <Header />
      <main className={styles.page}>
        <section className={styles.section}>
          <div className="container-fluid">
            <div className={styles.inner}>
              <div className={styles.copy}>
                <p className={styles.breadcrumbs}>
                  <span>Home</span>
                  <span className={styles.crumbDivider}>/</span>
                  <span>{crumb}</span>
                </p>
                <p className={styles.kicker}>{kicker}</p>
                <h1 className={styles.title}>{title}</h1>
                <p className={styles.description}>{description}</p>
                <div className={styles.highlights}>
                  {highlights.map((item) => (
                    <span className={styles.highlight} key={item}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              {children}
            </div>
          </div>
          <Image
            src={heroNeon}
            alt=""
            className={styles.globe}
            sizes="(max-width: 992px) 90vw, 58vw"
          />
        </section>
      </main>
      <Footer />
    </>
  );
}
