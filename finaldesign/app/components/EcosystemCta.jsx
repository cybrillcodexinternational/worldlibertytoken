import Link from "next/link";

export default function EcosystemCta() {
  return (
    <section className="ecosystem-cta-section">
      <div className="ecosystem-cta-inner">
        <div className="ecosystem-cta-visual">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video autoPlay muted loop playsInline>
            <source src="/images/explore-network.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="ecosystem-cta-copy">
          <h2>Explore Robotic Networks Research.</h2>
          <p>
            Explore robotics research and follow new ideas and developments.
            <br />
            Create an account to access your network tools.
          </p>
        </div>
        <div className="ecosystem-cta-action">
          <Link className="ecosystem-cta-button" href="/register">
          Create Research Account <span aria-hidden="true">&#8594;</span>
          </Link>
          <p>
            Research <span>&bull;</span> Insights <span>&bull;</span>{" "}
            Robotics <span>&bull;</span> Research
          </p>
        </div>
      </div>
    </section>
  );
}
