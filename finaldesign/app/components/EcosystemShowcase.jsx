export default function EcosystemShowcase() {
  return (
    <section className="ecosystem-showcase">
      <div className="ecosystem-showcase-inner">
        <div className="ecosystem-content">
          <span className="ecosystem-stars-extra" aria-hidden="true"></span>
          <p className="ecosystem-kicker">Ecosystem</p>
          <h2 className="ecosystem-heading">
            A Unified Ecosystem
            <br />
            Built For Every
            <br />
            Participant.
          </h2>
          <p className="ecosystem-description">
            From early access to real-world utility, NovaX
            <br />
            brings together the essential modules that
            <br />
            drive participation, growth, and adoption.
          </p>
        </div>
        <div className="ecosystem-visual">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video className="echo-video" muted autoPlay loop playsInline>
            <source src="/images/echosystem.mp4" type="video/mp4" />
          </video>
        </div>
      </div>
    </section>
  );
}
