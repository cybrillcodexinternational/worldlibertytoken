const PHASES = [
  {
    tag: "Phase 02",
    title: "Learning",
    items: ["Accessible Guides", "Research Library", "Topic Collections"],
  },
  {
    tag: "Phase 03",
    title: "Exploration",
    items: [
      "Robotics & Automation",
      "Artificial Intelligence",
      "Connected Systems",
    ],
  },
  {
    tag: "Phase 04",
    title: "Responsible Progress",
    items: ["Human-Robot Interaction", "Safety & Ethics", "Emerging Ideas"],
  },
];

function RoadmapPhase({ tag, title, items, isCopy }) {
  return (
    <div
      className={isCopy ? "roadmap-phase roadmap-phase-copy" : "roadmap-phase"}
      aria-hidden={isCopy || undefined}
    >
      <span className="roadmap-dot" aria-hidden="true"></span>
      <p className="roadmap-phase-tag">{tag}</p>
      <h3 className="roadmap-phase-title">{title}</h3>
      <ul className="roadmap-phase-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default function Roadmap() {
  return (
    <section className="roadmap-section">
      <div className="roadmap-inner">
        <div className="roadmap-lead">
          <p className="roadmap-kicker">Roadmap</p>
          <p className="roadmap-phase-tag">Phase 01</p>
          <h2 className="roadmap-heading">Foundation</h2>
          <ul className="roadmap-lead-list">
            <li>Build a clear research foundation</li>
            <li>Explain core robotics concepts</li>
            <li>Connect ideas across disciplines</li>
          </ul>
        </div>
        <div className="roadmap-timeline">
          <span className="roadmap-connector" aria-hidden="true"></span>
          <div className="roadmap-phases-viewport">
            <div className="roadmap-phases-track">
              {PHASES.map((phase) => (
                <RoadmapPhase key={phase.tag} {...phase} />
              ))}
              {PHASES.map((phase) => (
                <RoadmapPhase key={`${phase.tag}-copy`} {...phase} isCopy />
              ))}
            </div>
          </div>
          <div className="roadmap-emblem" aria-hidden="true">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              className="roadmap-emblem-video"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            >
              <source src="/images/home-roadmap-checkpoint.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    </section>
  );
}
