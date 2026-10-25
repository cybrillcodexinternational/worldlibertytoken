import Header from "../components/Header";
import Footer from "../components/Footer";
import FaqHero from "../components/faq/FaqHero";
import FaqBrowse from "../components/faq/FaqBrowse";
import FaqHelp from "../components/faq/FaqHelp";
import styles from "./faq.module.css";

export const metadata = {
  title: "FAQ — Robotic Networks Research",
  description:
    "Answers to common questions about Robotic Networks Research, its research areas, and learning resources.",
};

export default function FaqPage() {
  return (
    <>
      <div className="cursor-dot" aria-hidden="true"></div>
      <div className="cursor-ring" aria-hidden="true"></div>
      <Header />
      <main className={styles.page}>
        <FaqHero />
        <FaqBrowse />
        <FaqHelp />
      </main>
      <Footer />
    </>
  );
}
