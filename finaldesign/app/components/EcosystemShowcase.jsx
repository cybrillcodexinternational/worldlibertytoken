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
            Robotic Networks Research brings robotics, automation,
            <br />
            intelligent systems, and emerging research together
            <br />
            in one connected place.
          </p>
        </div>

        <div className="ecosystem-video-wrap" aria-label="Ecosystem overview video">
          <video
            className="ecosystem-video"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="Ecosystem overview video"
          >
            <source src="/images/ecosystem-video.mp4" type="video/mp4" />
          </video>
        </div>
      </div>
    </section>
  );
}
