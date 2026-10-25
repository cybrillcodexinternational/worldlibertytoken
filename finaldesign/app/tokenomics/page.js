import Header from "../components/Header";
import Footer from "../components/Footer";
import BreadcrumbHeader from "../components/tokenomics/BreadcrumbHeader";
import TokenOverview from "../components/tokenomics/TokenOverview";
import AllocationBreakdown from "../components/tokenomics/AllocationBreakdown";
import SupplyEmission from "../components/tokenomics/SupplyEmission";
import VestingSchedule from "../components/tokenomics/VestingSchedule";
import Principles from "../components/tokenomics/Principles";
import styles from "./tokenomics.module.css";

export const metadata = {
  title: "Tokenomics — Robotic Networks Research",
  description:
    "Explore Robotic Networks Research, its key areas, roadmap, and project resources.",
};

export default function RnrOverviewPage() {
  return (
    <>
      <div className="cursor-dot" aria-hidden="true"></div>
      <div className="cursor-ring" aria-hidden="true"></div>
      <Header />
      <main className={styles.page}>
        <BreadcrumbHeader />
        <TokenOverview />
        <AllocationBreakdown />
        <SupplyEmission />
        <VestingSchedule />
        <Principles />
      </main>
      <Footer />
    </>
  );
}
