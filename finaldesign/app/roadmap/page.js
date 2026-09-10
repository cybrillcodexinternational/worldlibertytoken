import Header from "../components/Header";
import Footer from "../components/Footer";
import RoadmapHero from "../components/roadmap/RoadmapHero";
import RoadmapPhases from "../components/roadmap/RoadmapPhases";
import DetailedRoadmap from "../components/roadmap/DetailedRoadmap";
import RoadmapNumbers from "../components/roadmap/RoadmapNumbers";
import DeliveryTracker from "../components/roadmap/DeliveryTracker";
import WhyThisRoadmap from "../components/roadmap/WhyThisRoadmap";
import RoadmapCta from "../components/roadmap/RoadmapCta";
import styles from "./roadmap.module.css";

export const metadata = {
  title: "Roadmap — World Liberty Token",
  description:
    "The World Liberty Token roadmap from foundation and launch through expansion and long-term ecosystem evolution.",
};

export default function RoadmapPage() {
  return (
    <>
      <div className="cursor-dot" aria-hidden="true"></div>
      <div className="cursor-ring" aria-hidden="true"></div>
      <Header />
      <main className={styles.page}>
        <RoadmapHero />
        <RoadmapPhases />
        <DetailedRoadmap />
        <RoadmapNumbers />
        <DeliveryTracker />
        <WhyThisRoadmap />
        <RoadmapCta />
      </main>
      <Footer />
    </>
  );
}
