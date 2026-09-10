export default function Hero() {
  return (
    <section className="home-hero">
      <div className="container-fluid">
        <div className="row main-hero-section">
          <div className="col-md-6 hero-text">
            <div className="hero-text-area">
              <div className="hero-subtitle">World Liberty Token</div>
              <div className="hero-title">
                Building <br />
                The Next Era <br />
                Of Digital Values
              </div>
              <div className="hero-description">
                World Liberty Token powers a modular ecosystem of
                decentralized tools, real utility, and a global community
                <br />
                designed for what comes next.
              </div>
              <div className="hero-btns">
                <button className="colored-button">
                  Explore the echosystem <span aria-hidden="true">&#8594;</span>
                </button>
                <button className="bordered-button">Read Whitepapers</button>
              </div>
            </div>
          </div>
          <div className="col-md-6 hero-video">
            <div className="hero-image-coin">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video autoPlay muted playsInline>
                <source src="/images/coinassemble.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
