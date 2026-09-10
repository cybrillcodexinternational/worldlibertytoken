const PHASES = [
  {
    tag: "Phase 02",
    title: "Launch",
    items: ["Token Launch", "Ecosystem Modules", "Exchange Listings"],
  },
  {
    tag: "Phase 03",
    title: "Expansion",
    items: [
      "Strategic Partnerships",
      "Cross-Chain Integration",
      "Global Growth",
    ],
  },
  {
    tag: "Phase 04",
    title: "Evolution",
    items: ["DAO Governance", "Advanced Utilities", "Mass Adoption"],
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
            <li>Project Development</li>
            <li>Core Smart Contracts</li>
            <li>Community Building</li>
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
            <span className="roadmap-emblem-ring roadmap-emblem-ring-outer"></span>
            <span className="roadmap-emblem-ring roadmap-emblem-ring-inner"></span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/circle.png"
              alt=""
              className="roadmap-emblem-logo"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
