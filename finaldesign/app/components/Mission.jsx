export default function Mission() {
  return (
    <section className="mission-section">
      <div className="mission-inner">
        <div className="mission-visual">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/background.png"
            alt="World Liberty Token geometric background"
            className="mission-image"
          />
        </div>
        <div className="mission-content">
          <p className="mission-kicker">Our Mission</p>
          <h2 className="mission-heading">
            More Than
            <br />A Token.
          </h2>
        </div>
        <div className="mission-description">
          <p>
            World Liberty Token Coin is the foundation for a new digital
            economy—where innovation meets integrity, and every participant
            has a place to grow.
          </p>
        </div>
      </div>
    </section>
  );
}
