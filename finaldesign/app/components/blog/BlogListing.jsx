"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Eye, Search } from "lucide-react";
import styles from "../../news/news.module.css";
import globeImage from "../../../assets/images/heroneon.png";
import ecosystemImage from "../../../assets/images/echosystem.png";
import roboticsImage from "../../../assets/images/cube.png";
import cityImage from "../../../assets/images/echosystem5.png";
import partnershipImage from "../../../assets/images/patnershipfinal.jpeg";
import communityImage from "../../../assets/images/moon.jpeg";

const FILTERS = [
  "All",
  "Insights",
  "Education",
  "Robotics",
  "Ecosystem",
  "Guides",
  "Community",
];

const FEATURED = {
  category: "Insights",
  date: "Sep 09, 2026",
  title: "How Robotics Is Changing The Way We Work",
  excerpt:
    "An introduction to modern robotics, automation, and the questions shaping how people and machines work together.",
  readTime: "8 min read",
  views: "14.2K",
  image: "/images/featured-robot-coin.png",
};

const ARTICLES = [
  {
    id: "education",
    category: "Education",
    date: "Aug 30, 2026",
    title: "A Beginner's Guide To Robotics",
    excerpt:
      "Explore the essential ideas behind robotic systems, sensors, actuators, and the software that coordinates them.",
    readTime: "6 min read",
    views: "9.4K",
    image: globeImage,
  },
  {
    id: "sensors",
    category: "Robotics",
    date: "Aug 24, 2026",
    title: "How Sensors Help Robots Understand Their Environment",
    excerpt:
      "Learn how cameras, distance sensors, and other inputs help robotic systems observe and respond to the world.",
    readTime: "7 min read",
    views: "11.6K",
    image: roboticsImage,
  },
  {
    id: "guides",
    category: "Guides",
    date: "Aug 19, 2026",
    title: "Getting Started With Automation",
    excerpt:
      "A practical introduction to automation concepts, common system components, and responsible design considerations.",
    readTime: "5 min read",
    views: "8.8K",
    image: cityImage,
  },
  {
    id: "ecosystem",
    category: "Ecosystem",
    date: "Aug 12, 2026",
    title: "Inside A Modern Robotics System",
    excerpt:
      "Discover how hardware, software, sensors, and networks combine to support robotic applications.",
    readTime: "6 min read",
    views: "7.1K",
    image: ecosystemImage,
  },
  {
    id: "community",
    category: "Community",
    date: "Aug 08, 2026",
    title: "Why Human-Robot Interaction Matters",
    excerpt:
      "Explore the design choices that help people understand, trust, and work effectively with robotic systems.",
    readTime: "4 min read",
    views: "6.3K",
    image: communityImage,
  },
  {
    id: "insights",
    category: "Insights",
    date: "Aug 02, 2026",
    title: "Connected Robots And The Future Of Networks",
    excerpt:
      "A clear overview of the communication technologies that let distributed devices share information.",
    readTime: "5 min read",
    views: "10.5K",
    image: partnershipImage,
  },
];

function matchesQuery(item, query) {
  if (!query) return true;
  const haystack = `${item.category} ${item.title} ${item.excerpt}`.toLowerCase();
  return haystack.includes(query);
}

export default function BlogListing() {
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
    (filter === "All" || filter === "Insights") && matchesQuery(FEATURED, search);

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
                alt="Robotic network research illustration"
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
            <p className={styles.subscribeKicker}>Stay Inspired</p>
            <h2>
              Insights From
              <br />
              Robotic Networks Research.
            </h2>
            <p className={styles.subscribeText}>
              Subscribe for new articles, guides, and long-form thinking from
              robotics and intelligent systems.
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
