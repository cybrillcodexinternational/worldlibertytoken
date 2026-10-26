export default function Mission() {
  return (
    <section className="mission-section">
      <div className="mission-inner">
        <div className="mission-visual">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/research-network-gold.jpg"
            alt="Golden connected research network"
            className="mission-image"
          />
        </div>
        <div className="mission-content">
          <p className="mission-kicker">Our Mission</p>
          <h2 className="mission-heading">
            Ideas Into
            <br />Intelligent Systems.
          </h2>
        </div>
        <div className="mission-description">
          <p>
            Robotic Networks Research explores robotics, automation, and
            connected technologies—making complex ideas easier to understand
            through accessible research and practical insights.
          </p>
        </div>
      </div>
    </section>
  );
}
