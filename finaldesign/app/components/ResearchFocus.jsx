const ROWS = [
  { percent: "30%", label: "Robotics & Automation" },
  { percent: "20%", label: "Artificial Intelligence" },
  { percent: "15%", label: "Connected Systems" },
  { percent: "15%", label: "Human-Robot Interaction" },
  { percent: "10%", label: "Research & Education" },
  { percent: "10%", label: "Responsible Technology" },
];

export default function ResearchFocus() {
  return (
    <section className="tokenomics-section" id="research">
      <div className="tokenomics-inner">
        <div className="tokenomics-content">
          <p className="tokenomics-kicker">Research Focus</p>
          <h2 className="tokenomics-heading">
            Robotics And
            <br />
            Intelligent
            <br />
            Systems.
          </h2>
        </div>
        <div className="tokenomics-visual">
          <video
            className="tokenomics-video"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="Spinning gold coin animation"
          >
            <source src="/images/research-focus-spinning-coin.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="tokenomics-list">
          {ROWS.map((row) => (
            <div className="tokenomics-row" key={row.label}>
              <span className="tokenomics-percent">{row.percent}</span>
              <span className="tokenomics-label">{row.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
