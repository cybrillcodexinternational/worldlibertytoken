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
  title: "Tokenomics — World Liberty Token",
  description:
    "A transparent look at WLT token supply, allocation, vesting schedule and utility across the ecosystem.",
};

export default function TokenomicsPage() {
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
