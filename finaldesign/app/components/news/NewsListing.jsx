"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Search } from "lucide-react";
import styles from "../../news/news.module.css";
import fallbackImage from "../../../assets/images/novax-coin.png";

const FILTERS = [
  "All",
  "Announcements",
  "Tokenomics",
  "Ecosystem",
  "Guides",
  "Industry",
  "Community",
];

const CATEGORY_QUERIES = {
  All: "cryptocurrency OR blockchain OR bitcoin OR web3",
  Announcements: "crypto token launch OR crypto announcement",
  Tokenomics: "tokenomics OR crypto token supply",
  Ecosystem: "blockchain ecosystem OR web3 ecosystem",
  Guides: "how to buy crypto OR crypto guide",
  Industry: "cryptocurrency regulation OR crypto industry",
  Community: "crypto community OR web3 community",
};

const PAGE_SIZE = 10;

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

function estimateReadTime(text) {
  const words = (text || "").split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 60))} min read`;
}

export default function NewsListing() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [articles, setArticles] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const search = query.trim();
    const baseQuery = CATEGORY_QUERIES[filter] || CATEGORY_QUERIES.All;
    const finalQuery = search ? `${baseQuery} AND ${search}` : baseQuery;

    setLoading(true);
    setError("");

    const params = new URLSearchParams({
      q: finalQuery,
      page: String(page),
      pageSize: String(PAGE_SIZE),
    });

    fetch(`/api/news?${params.toString()}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          setError(data.message || "Unable to load news right now.");
          setArticles([]);
          setTotalResults(0);
          return;
        }
        setArticles(data.articles);
        setTotalResults(data.totalResults);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError("Unable to load news right now.");
          setArticles([]);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [filter, page, query]);

  const featured = page === 1 ? articles[0] : null;
  const gridArticles = page === 1 ? articles.slice(1) : articles;
  const totalPages = Math.max(1, Math.ceil(totalResults / PAGE_SIZE));

  const pageNumbers = useMemo(() => {
    const count = Math.min(totalPages, 10);
    return Array.from({ length: count }, (_, i) => i + 1);
  }, [totalPages]);

  return (
    <section className={styles.listingSection}>
      <div className={`tp-inner ${styles.listingInner}`}>
        <div className={styles.toolbar}>
          <label className={styles.searchBox}>
            <Search size={16} strokeWidth={1.8} />
            <input
              type="search"
              placeholder="Search articles, topics..."
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
            />
          </label>
          <div className={styles.filters}>
            {FILTERS.map((item) => (
              <button
                type="button"
                key={item}
                className={filter === item ? styles.filterActive : styles.filterChip}
                onClick={() => {
                  setFilter(item);
                  setPage(1);
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {loading ? <p className={styles.emptyState}>Loading latest news...</p> : null}
        {!loading && error ? <p className={styles.emptyState}>{error}</p> : null}

        {!loading && !error && featured ? (
          <article className={styles.featuredCard}>
            <div className={styles.featuredMedia}>
              <span className={styles.featuredBadge}>Featured</span>
              <Image
                src={featured.image || fallbackImage}
                alt={featured.title}
                className={styles.featuredImage}
                sizes="(max-width: 992px) 100vw, 46vw"
                fill
                unoptimized={Boolean(featured.image)}
              />
            </div>
            <div className={styles.featuredCopy}>
              <div className={styles.cardMeta}>
                <span className={styles.cardCategory}>{featured.source}</span>
                <span className={styles.cardDate}>{formatDate(featured.publishedAt)}</span>
              </div>
              <h2>{featured.title}</h2>
              <p>{featured.description}</p>
              <div className={styles.featuredFooter}>
                <Link href={featured.url} target="_blank" rel="noopener noreferrer" className={styles.readButton}>
                  Read Full Article
                  <ArrowRight size={15} strokeWidth={2.2} />
                </Link>
                <div className={styles.stats}>
                  <span>
                    <Clock size={14} strokeWidth={1.8} />
                    {estimateReadTime(featured.description)}
                  </span>
                </div>
              </div>
            </div>
          </article>
        ) : null}

        <div className={styles.articleGrid}>
          {gridArticles.map((article) => (
            <article className={styles.articleCard} key={article.url}>
              <div className={styles.articleMedia}>
                <Image
                  src={article.image || fallbackImage}
                  alt=""
                  fill
                  className={styles.articleImage}
                  sizes="(max-width: 992px) 100vw, 32vw"
                  unoptimized={Boolean(article.image)}
                />
              </div>
              <div className={styles.articleBody}>
                <div className={styles.cardMeta}>
                  <span className={styles.cardCategory}>{article.source}</span>
                  <span className={styles.cardDate}>{formatDate(article.publishedAt)}</span>
                </div>
                <h3>{article.title}</h3>
                <p>{article.description}</p>
                <div className={styles.articleFooter}>
                  <div className={styles.stats}>
                    <span>
                      <Clock size={13} strokeWidth={1.8} />
                      {estimateReadTime(article.description)}
                    </span>
                  </div>
                  <Link
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.articleArrow}
                    aria-label={`Read ${article.title}`}
                  >
                    <ArrowRight size={16} strokeWidth={2} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {!loading && !error && !featured && gridArticles.length === 0 ? (
          <p className={styles.emptyState}>No articles match your search.</p>
        ) : null}

        <div className={styles.pagination}>
          {pageNumbers.map((item) => (
            <button
              type="button"
              key={item}
              className={page === item ? styles.pageActive : styles.pageBtn}
              onClick={() => setPage(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className={styles.subscribeCard}>
          <div className={styles.subscribeCopy}>
            <p className={styles.subscribeKicker}>Stay Updated</p>
            <h2>
              Get The Latest
              <br />
              From World Liberty Token.
            </h2>
            <p className={styles.subscribeText}>
              Subscribe to our newsletter and never miss an update, insight, or
              announcement.
            </p>
          </div>
          <form
            className={styles.subscribeForm}
            onSubmit={(event) => event.preventDefault()}
          >
            <input type="email" placeholder="Enter your email" required />
            <button type="submit" aria-label="Subscribe">
              <ArrowRight size={18} strokeWidth={2.2} />
            </button>
            <p>No spam. Only important updates.</p>
          </form>
        </div>
      </div>
    </section>
  );
}
