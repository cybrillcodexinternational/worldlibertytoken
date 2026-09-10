const NEWS = [
  {
    category: "Ecosystem",
    imageClass: "news-card-image-ecosystem",
    title: (
      <>
        WLT Mainnet Beta
        <br />
        Now Live
      </>
    ),
    date: "May 12, 2025",
  },
  {
    category: "Partnership",
    imageClass: "news-card-image-partnership",
    title: (
      <>
        WLT Partners with
        <br />
        Global Payment Network
      </>
    ),
    date: "May 06, 2025",
  },
  {
    category: "Development",
    imageClass: "news-card-image-development",
    title: (
      <>
        WLT Dashboard v1.0
        <br />
        Official Release
      </>
    ),
    date: "Apr 28, 2025",
  },
];

export default function LatestNews() {
  return (
    <section className="latest-news-section">
      <div className="latest-news-inner">
        <div className="latest-news-intro">
          <p className="latest-news-kicker">Latest Updates</p>
          <h2 className="latest-news-heading">
            Stay Informed.
            <br />
            Stay Ahead.
          </h2>
          <p className="latest-news-description">
            The latest news, insights, and milestones from the WLT ecosystem.
          </p>
          <a className="latest-news-link" href="/news">
            View All News <span aria-hidden="true">&#8594;</span>
          </a>
        </div>
        <div className="latest-news-grid">
          {NEWS.map((item) => (
            <article className="news-card" key={item.category}>
              <div className={`news-card-image ${item.imageClass}`}></div>
              <div className="news-card-body">
                <p className="news-card-category">{item.category}</p>
                <h3>{item.title}</h3>
                <div className="news-card-meta">
                  <span>{item.date}</span>
                  <span aria-hidden="true">&#8594;</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
