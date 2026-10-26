const FEATURES = [
  {
    title: "Research-Led Insights",
    text: "Explore clear summaries of robotics research and emerging technologies.",
    glyph: (
      <>
        <path d="M4 8.5L12 4L20 8.5V15.5L12 20L4 15.5V8.5Z" />
        <path d="M12 12V20" />
        <path d="M4 8.5L12 12L20 8.5" />
      </>
    ),
  },
  {
    title: "Robotics & Automation",
    text: "Understand robotic systems, automation, and how their components work together.",
    glyph: (
      <>
        <circle cx="8" cy="8" r="1.4" />
        <circle cx="16" cy="8" r="1.4" />
        <circle cx="8" cy="16" r="1.4" />
        <circle cx="16" cy="16" r="1.4" />
        <circle cx="12" cy="12" r="1.4" />
        <path d="M9.2 8.6L10.8 11.2" />
        <path d="M14.8 8.6L13.2 11.2" />
        <path d="M9.2 15.4L10.8 12.8" />
        <path d="M14.8 15.4L13.2 12.8" />
      </>
    ),
  },
  {
    title: "Connected Systems",
    text: "Follow developments in intelligent networks and connected devices.",
    glyph: (
      <>
        <path d="M8.5 10C10.16 10 11.5 8.66 11.5 7C11.5 5.34 10.16 4 8.5 4C6.84 4 5.5 5.34 5.5 7C5.5 8.66 6.84 10 8.5 10Z" />
        <path d="M16.5 9.5C17.88 9.5 19 8.38 19 7C19 5.62 17.88 4.5 16.5 4.5C15.12 4.5 14 5.62 14 7C14 8.38 15.12 9.5 16.5 9.5Z" />
        <path d="M3.8 19C4.5 16.4 6.7 14.7 9.3 14.7C11.9 14.7 14.1 16.4 14.8 19" />
        <path d="M13.6 19C14.2 17.3 15.8 16.1 17.7 16.1C19.6 16.1 21.2 17.3 21.8 19" />
      </>
    ),
  },
  {
    title: "Research & Resources",
    text: "Explore research topics, project updates, and practical learning resources.",
    glyph: (
      <>
        <path d="M12 3L13.8 8.2L19 10L13.8 11.8L12 17L10.2 11.8L5 10L10.2 8.2L12 3Z" />
        <path d="M18.2 14.2L19.1 16.8L21.7 17.7L19.1 18.6L18.2 21.2L17.3 18.6L14.7 17.7L17.3 16.8L18.2 14.2Z" />
        <path d="M5.8 14.5L6.5 16.5L8.5 17.2L6.5 17.9L5.8 19.9L5.1 17.9L3.1 17.2L5.1 16.5L5.8 14.5Z" />
      </>
    ),
  },
];

function WhyFeature({ title, text, glyph }) {
  return (
    <div className="why-feature">
      <div className="why-feature-icon" aria-hidden="true">
        <svg className="why-feature-ring" viewBox="0 0 56 56" fill="none">
          <circle cx="28" cy="28" r="26" strokeDasharray="1.6 5.2" />
        </svg>
        <svg className="why-feature-glyph" viewBox="0 0 24 24" fill="none">
          {glyph}
        </svg>
      </div>
      <h3 className="why-feature-title">{title}</h3>
      <p className="why-feature-text">{text}</p>
    </div>
  );
}

export default function WhyRnr() {
  return (
    <section className="why-novax">
      <div className="why-novax-inner">
        <div className="why-novax-left">
          <video
            className="why-robot-image"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="Robot holding a weight animation"
          >
            <source src="/images/robot-holding-weight.mp4" type="video/mp4" />
          </video>
          <div className="why-novax-copy">
            <p className="why-novax-kicker">Why Robotic Networks Research</p>
            <h2 className="why-novax-heading">
              Built On Purpose.
              <br />
              Designed To Last.
            </h2>
          </div>
        </div>
        <div className="why-novax-panel">
          <div className="why-novax-carousel">
            <div className="why-novax-track">
              {FEATURES.map((feature) => (
                <WhyFeature key={feature.title} {...feature} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
