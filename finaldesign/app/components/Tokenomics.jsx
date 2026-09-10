const ROWS = [
  { percent: "30%", label: "Ecosystem Growth" },
  { percent: "20%", label: "Community Rewards" },
  { percent: "15%", label: "Liquidity & Markets" },
  { percent: "15%", label: "Team & Advisors" },
  { percent: "10%", label: "Marketing" },
  { percent: "10%", label: "Treasury" },
];

export default function Tokenomics() {
  return (
    <section className="tokenomics-section">
      <div className="tokenomics-inner">
        <div className="tokenomics-content">
          <p className="tokenomics-kicker">Tokenomics</p>
          <h2 className="tokenomics-heading">
            A Balanced Model
            <br />
            For Sustainable
            <br />
            Growth.
          </h2>
        </div>
        <div className="tokenomics-visual">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video muted loop autoPlay playsInline className="tokenomics-video">
            <source src="/images/tokenomics.mp4" type="video/mp4" />
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
