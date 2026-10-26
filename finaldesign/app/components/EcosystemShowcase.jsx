import { BookOpen, Bot, BrainCircuit, Network } from "lucide-react";

const FEATURES = [
  {
    number: "01",
    title: "Robotics & Automation",
    description:
      "Explore the machines, tools, and breakthroughs shaping the next generation of robotics.",
    Icon: Bot,
  },
  {
    number: "02",
    title: "Intelligent Systems",
    description:
      "See how artificial intelligence helps connected systems sense, learn, and make decisions.",
    Icon: BrainCircuit,
  },
  {
    number: "03",
    title: "Connected Networks",
    description:
      "Follow the technologies that bring devices, data, and people together.",
    Icon: Network,
  },
  {
    number: "04",
    title: "Research & Learning",
    description:
      "Find approachable insights, research topics, and resources to keep exploring.",
    Icon: BookOpen,
  },
];

export default function EcosystemShowcase() {
  return (
    <section className="ecosystem-showcase" id="ecosystem">
      <div className="ecosystem-showcase-inner">
        <header className="ecosystem-features-heading">
          <div>
            <p className="ecosystem-kicker">One Connected Network</p>
            <h2 className="ecosystem-heading">Explore The Ecosystem</h2>
          </div>
          <p className="ecosystem-features-intro">
            Discover robotics, intelligent systems, and connected research
            through one evolving network of ideas.
          </p>
        </header>

        <div className="ecosystem-features-layout">
          <figure className="ecosystem-visual">
            <video
              className="ecosystem-visual-media"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="A robot car moving across the screen"
            >
              <source src="/images/home-ecosystem-robot-car.mp4" type="video/mp4" />
            </video>
            <div className="ecosystem-visual-shade" aria-hidden="true" />
            <figcaption className="ecosystem-visual-caption">
              <span className="ecosystem-visual-label">Robotics in focus</span>
              <strong>Where intelligent ideas move forward.</strong>
            </figcaption>
          </figure>

          <div className="ecosystem-features-grid">
            {FEATURES.map(({ number, title, description, Icon }) => (
              <article className="ecosystem-feature-card" key={number}>
                <div className="ecosystem-feature-topline">
                  <span className="ecosystem-feature-icon" aria-hidden="true">
                    <Icon size={24} strokeWidth={1.5} />
                  </span>
                  <span className="ecosystem-feature-number">{number}</span>
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
