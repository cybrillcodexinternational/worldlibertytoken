import StatCounter from "./StatCounter";

export default function EcosystemStrip() {
  return (
    <section className="ecosystem-strip">
      <div className="container-fluid">
        <div className="row stats-row g-0">
          <div className="col-lg-3 col-md-6">
            <div className="stat-item">
              <div className="stat-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" />
                  <path d="M12 2V12" />
                  <path d="M3 7L12 12L21 7" />
                </svg>
              </div>
              <div className="stat-meta">
                <div className="stat-label">Total Supply</div>
                <StatCounter
                  className="stat-value"
                  target={1000000000}
                  format="comma"
                />
                <div className="stat-caption">NOVAX</div>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <div className="stat-item">
              <div className="stat-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L21 7L12 12L3 7L12 2Z" />
                  <path d="M3 12L12 17L21 12" />
                  <path d="M3 17L12 22L21 17" />
                </svg>
              </div>
              <div className="stat-meta">
                <div className="stat-label">Ecosystem Modules</div>
                <StatCounter
                  className="stat-subvalue"
                  target={8}
                  suffix="+"
                />
                <div className="stat-caption">Core Utilities</div>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <div className="stat-item">
              <div className="stat-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M8 10C9.66 10 11 8.66 11 7C11 5.34 9.66 4 8 4C6.34 4 5 5.34 5 7C5 8.66 6.34 10 8 10Z" />
                  <path d="M16 9C17.38 9 18.5 7.88 18.5 6.5C18.5 5.12 17.38 4 16 4C14.62 4 13.5 5.12 13.5 6.5C13.5 7.88 14.62 9 16 9Z" />
                  <path d="M3.5 18C4.2 15.68 6.32 14 8.84 14C11.36 14 13.48 15.68 14.18 18" />
                  <path d="M13.2 18C13.78 16.28 15.37 15.05 17.23 15.05C19.09 15.05 20.68 16.28 21.26 18" />
                </svg>
              </div>
              <div className="stat-meta">
                <div className="stat-label">Community</div>
                <StatCounter
                  className="stat-subvalue"
                  target={250}
                  suffix="K+"
                />
                <div className="stat-caption">Global Members</div>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <div className="stat-item">
              <div className="stat-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="8" />
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2V5" />
                  <path d="M12 19V22" />
                  <path d="M2 12H5" />
                  <path d="M19 12H22" />
                </svg>
              </div>
              <div className="stat-meta">
                <div className="stat-label">Launch Vision</div>
                <StatCounter
                  className="stat-subvalue"
                  target={2025}
                  prefix="Q4 "
                />
                <div className="stat-caption">Phase 1</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
