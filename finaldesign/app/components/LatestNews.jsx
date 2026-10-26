"use client";

import { useEffect, useState } from "react";

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function LatestNews() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/news?pageSize=3", { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load the latest news.");
        }
        setArticles(data.articles.slice(0, 3));
      })
      .catch((fetchError) => {
        if (fetchError.name !== "AbortError") {
          setError(fetchError.message || "Unable to load the latest news.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  return (
    <section className="latest-news-section">
      <div className="latest-news-inner">
        <div className="latest-news-intro">
          <div className="latest-news-copy">
            <p className="latest-news-kicker">
              <span aria-hidden="true"></span>
              Latest Updates
            </p>
            <h2 className="latest-news-heading">
              Stay Informed.
              <br />
              <span>Stay Ahead.</span>
            </h2>
            <p className="latest-news-description">
              Robotics research, technology explainers, and updates on
              intelligent systems—curated for curious readers.
            </p>
          </div>
          <a className="latest-news-link" href="/news">
            View All News <span aria-hidden="true">&#8594;</span>
          </a>
        </div>

        <div className="latest-news-grid" aria-live="polite">
          {loading
            ? Array.from({ length: 3 }, (_, index) => (
                <div
                  className="news-card news-card-skeleton"
                  key={`news-skeleton-${index}`}
                  aria-hidden="true"
                >
                  <div className="news-card-image"></div>
                  <div className="news-card-body">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              ))
            : null}

          {!loading && error ? (
            <p className="latest-news-message" role="status">
              {error}
            </p>
          ) : null}

          {!loading && !error && articles.length === 0 ? (
            <p className="latest-news-message" role="status">
              No news updates are available right now.
            </p>
          ) : null}

          {!loading &&
            !error &&
            articles.map((item) => {
              const url = item.url || "/news";
              const isExternal = !url.startsWith("/");
              const date = formatDate(item.publishedAt);

              return (
                <article className="news-card" key={url}>
                  <a
                    className="news-card-link"
                    href={url}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    aria-label={`Read ${item.title}`}
                  >
                    <div
                      className="news-card-image"
                      aria-hidden="true"
                      style={
                        item.image
                          ? { backgroundImage: `url("${item.image}")` }
                          : undefined
                      }
                    >
                      <span className="news-card-image-label">RNR INSIGHTS</span>
                    </div>
                    <div className="news-card-body">
                      <div className="news-card-meta">
                        <span className="news-card-category">{item.source}</span>
                        {date ? <time>{date}</time> : null}
                      </div>
                      <h3>{item.title}</h3>
                      {item.description ? (
                        <p className="news-card-description">
                          {item.description}
                        </p>
                      ) : null}
                      <span className="news-card-read">
                        Read update <span aria-hidden="true">&#8594;</span>
                      </span>
                    </div>
                  </a>
                </article>
              );
            })}
        </div>
      </div>
    </section>
  );
}
