"use client";

import { useEffect, useState } from "react";

function formatDate(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default function LatestNews() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/news?pageSize=3", { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setArticles(data.articles.slice(0, 3));
      })
      .catch((err) => {
        if (err.name !== "AbortError") setArticles([]);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

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
          {loading ? (
            <p>Loading latest news...</p>
          ) : (
            articles.map((item) => (
              <article className="news-card" key={item.url}>
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  {item.image ? (
                    <div
                      className="news-card-image"
                      style={{ backgroundImage: `url(${item.image})`, backgroundSize: "cover", backgroundPosition: "center" }}
                    ></div>
                  ) : (
                    <div className="news-card-image news-card-image-ecosystem"></div>
                  )}
                  <div className="news-card-body">
                    <p className="news-card-category">{item.source}</p>
                    <h3>{item.title}</h3>
                    <div className="news-card-meta">
                      <span>{formatDate(item.publishedAt)}</span>
                      <span aria-hidden="true">&#8594;</span>
                    </div>
                  </div>
                </a>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

