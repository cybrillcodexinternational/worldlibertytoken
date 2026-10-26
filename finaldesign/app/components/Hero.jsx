import Link from "next/link";

export default function Hero() {
  return (
    <section className="home-hero">
      <div className="container-fluid">
        <div className="row main-hero-section">
          <div className="col-md-6 hero-text">
            <div className="hero-text-area">
              <div className="hero-subtitle">Robotic Networks Research</div>
              <div className="hero-title">
                Exploring <br />
                Intelligent <br />
                Systems
              </div>
              <div className="hero-description">
                Discover robotics, automation, and connected technologies
                through accessible research, ideas, and practical insights.
              </div>
              <div className="hero-btns">
                <Link className="colored-button" href="/echosystem">
                  Explore Research <span aria-hidden="true">&#8594;</span>
                </Link>
                <Link className="bordered-button" href="/blog">
                  Read Articles
                </Link>
              </div>
            </div>
          </div>
          <div className="col-md-6 hero-video">
            <div className="hero-image-coin">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                className="hero-video-element"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              >
                <source
                  src="/images/robot-flipping-coin.mp4"
                  type="video/mp4"
                />
              </video>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
