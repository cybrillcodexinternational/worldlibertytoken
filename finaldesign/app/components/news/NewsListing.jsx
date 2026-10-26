"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Eye, Search } from "lucide-react";
import styles from "../../news/news.module.css";
import globeImage from "../../../assets/images/heroneon.png";
import ecosystemImage from "../../../assets/images/echosystem.png";
import cityImage from "../../../assets/images/echosystem5.png";
import partnershipImage from "../../../assets/images/patnershipfinal.jpeg";
import communityImage from "../../../assets/images/moon.jpeg";

const roboticsImage = "/images/featured-robot-coin.png";

const FILTERS = [
  "All",
  "Announcements",
  "Research",
  "Ecosystem",
  "Guides",
  "Industry",
  "Community",
];

const FEATURED = {
  category: "Announcements",
  date: "Sep 13, 2026",
  title: "Robotics Research: Ideas Shaping Intelligent Systems",
  excerpt:
    "Explore current themes in robotics, automation, and connected technologies through clear research summaries and learning resources.",
  readTime: "5 min read",
  views: "12.4K",
  image: "/images/featured-robot-coin.png",
};

const ARTICLES = [
  {
    id: "ecosystem",
    category: "Ecosystem",
    date: "Aug 28, 2026",
    title: "How Robots Sense And Respond To The World",
    excerpt:
      "An introduction to sensing technologies and the systems that help robots interpret their surroundings.",
    readTime: "4 min read",
    views: "8.3K",
    image: globeImage,
  },
  {
    id: "research",
    category: "Research",
    date: "Aug 22, 2026",
    title: "Understanding Robotics And Automation",
    excerpt:
      "A practical guide to robotic platforms, automated workflows, and the technologies that connect them.",
    readTime: "6 min read",
    views: "10.1K",
    image: roboticsImage,
  },
  {
    id: "guides",
    category: "Guides",
    date: "Aug 18, 2026",
    title: "A Guide To Human-Robot Interaction",
    excerpt:
      "Explore the principles behind safe, accessible, and effective collaboration between people and machines.",
    readTime: "5 min read",
    views: "9.7K",
    image: cityImage,
  },
  {
    id: "partnerships",
    category: "Partnerships",
    date: "Aug 14, 2026",
    title: "Why Responsible Robotics Design Matters",
    excerpt:
      "Consider safety, privacy, accessibility, and real-world impact when developing intelligent systems.",
    readTime: "3 min read",
    views: "6.8K",
    image: partnershipImage,
  },
  {
    id: "community",
    category: "Community",
    date: "Aug 10, 2026",
    title: "Robotics Research Starts With Good Questions",
    excerpt:
      "See how curiosity and clear research questions help explain complex technologies and their possible uses.",
    readTime: "4 min read",
    views: "5.9K",
    image: communityImage,
  },
  {
    id: "industry",
    category: "Industry",
    date: "Aug 05, 2026",
    title: "Connected Devices And Intelligent Networks",
    excerpt:
      "Learn how connected devices exchange information and what that means for modern robotic systems.",
    readTime: "7 min read",
    views: "11.3K",
    image: ecosystemImage,
  },
];

function matchesQuery(item, query) {
  if (!query) return true;
  const haystack = `${item.category} ${item.title} ${item.excerpt}`.toLowerCase();
  return haystack.includes(query);
}

export default function NewsListing() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const search = query.trim().toLowerCase();

  const filteredArticles = useMemo(() => {
    return ARTICLES.filter((article) => {
      const categoryOk = filter === "All" || article.category === filter;
      return categoryOk && matchesQuery(article, search);
    });
  }, [filter, search]);

  const showFeatured =
    (filter === "All" || filter === "Announcements") &&
    matchesQuery(FEATURED, search);

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

        {showFeatured ? (
          <article className={styles.featuredCard}>
            <div className={styles.featuredMedia}>
              <span className={styles.featuredBadge}>Featured</span>
              <Image
                src={FEATURED.image}
                alt="Robotic Networks Research emblem"
                className={styles.featuredImage}
                sizes="(max-width: 992px) 100vw, 46vw"
                fill
              />
            </div>
            <div className={styles.featuredCopy}>
              <div className={styles.cardMeta}>
                <span className={styles.cardCategory}>{FEATURED.category}</span>
                <span className={styles.cardDate}>{FEATURED.date}</span>
              </div>
              <h2>{FEATURED.title}</h2>
              <p>{FEATURED.excerpt}</p>
              <div className={styles.featuredFooter}>
                <Link href="#" className={styles.readButton}>
                  Read Full Article
                  <ArrowRight size={15} strokeWidth={2.2} />
                </Link>
                <div className={styles.stats}>
                  <span>
                    <Clock size={14} strokeWidth={1.8} />
                    {FEATURED.readTime}
                  </span>
                  <span>
                    <Eye size={14} strokeWidth={1.8} />
                    {FEATURED.views}
                  </span>
                </div>
              </div>
            </div>
          </article>
        ) : null}

        <div className={styles.articleGrid}>
          {filteredArticles.map((article) => (
            <article className={styles.articleCard} key={article.id}>
              <div className={styles.articleMedia}>
                <Image
                  src={article.image}
                  alt=""
                  fill
                  className={styles.articleImage}
                  sizes="(max-width: 992px) 100vw, 32vw"
                />
              </div>
              <div className={styles.articleBody}>
                <div className={styles.cardMeta}>
                  <span className={styles.cardCategory}>{article.category}</span>
                  <span className={styles.cardDate}>{article.date}</span>
                </div>
                <h3>{article.title}</h3>
                <p>{article.excerpt}</p>
                <div className={styles.articleFooter}>
                  <div className={styles.stats}>
                    <span>
                      <Clock size={13} strokeWidth={1.8} />
                      {article.readTime}
                    </span>
                    <span>
                      <Eye size={13} strokeWidth={1.8} />
                      {article.views}
                    </span>
                  </div>
                  <Link href="#" className={styles.articleArrow} aria-label={`Read ${article.title}`}>
                    <ArrowRight size={16} strokeWidth={2} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {!showFeatured && filteredArticles.length === 0 ? (
          <p className={styles.emptyState}>No articles match your search.</p>
        ) : null}

        <div className={styles.pagination}>
          {[1, 2, 3, 4].map((item) => (
            <button
              type="button"
              key={item}
              className={page === item ? styles.pageActive : styles.pageBtn}
              onClick={() => setPage(item)}
            >
              {item}
            </button>
          ))}
          <span className={styles.pageDots}>...</span>
          <button
            type="button"
            className={page === 10 ? styles.pageActive : styles.pageBtn}
            onClick={() => setPage(10)}
          >
            10
          </button>
        </div>

        <div className={styles.subscribeCard}>
          <div className={styles.subscribeCopy}>
            <p className={styles.subscribeKicker}>Stay Updated</p>
            <h2>
              Get The Latest
              <br />
              From Robotic Networks Research.
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
