import Header from "./components/Header";
import Hero from "./components/Hero";
import EcosystemStrip from "./components/EcosystemStrip";
import EcosystemShowcase from "./components/EcosystemShowcase";
import WhyNovax from "./components/WhyNovax";
import Tokenomics from "./components/Tokenomics";
import Mission from "./components/Mission";
import Roadmap from "./components/Roadmap";
import LatestNews from "./components/LatestNews";
import EcosystemCta from "./components/EcosystemCta";
import Footer from "./components/Footer";
import ScrollReveal from "./components/ScrollReveal";

export default function Home() {
  return (
    <>
      <div className="cursor-dot" aria-hidden="true"></div>
      <div className="cursor-ring" aria-hidden="true"></div>
      <Header />
      <Hero />
      <EcosystemStrip />
      <EcosystemShowcase />
      <WhyNovax />
      <Tokenomics />
      <Mission />
      <Roadmap />
      <LatestNews />
      <EcosystemCta />
      <Footer />
      <ScrollReveal />
    </>
  );
}
