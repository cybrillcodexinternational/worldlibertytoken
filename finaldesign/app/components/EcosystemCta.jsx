import Link from "next/link";

export default function EcosystemCta() {
  return (
    <section className="ecosystem-cta-section">
      <div className="ecosystem-cta-inner">
        <div className="ecosystem-cta-visual">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video autoPlay muted loop playsInline>
            <source src="/images/coindd.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="ecosystem-cta-copy">
          <h2>Unlock The Full WLT Ecosystem Experience.</h2>
          <p>
            Join a global movement for digital liberty.
            <br />
            Create your account and start your journey today.
          </p>
        </div>
        <div className="ecosystem-cta-action">
          <Link className="ecosystem-cta-button" href="/register">
            Create Account <span aria-hidden="true">&#8594;</span>
          </Link>
          <p>
            Secure <span>&bull;</span> Decentralized <span>&bull;</span>{" "}
            Future-Ready
          </p>
        </div>
      </div>
    </section>
  );
}
