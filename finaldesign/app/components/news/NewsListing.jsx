"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Eye, Search } from "lucide-react";
import styles from "../../news/news.module.css";
import coinImage from "../../../assets/images/novax-coin.png";
import globeImage from "../../../assets/images/heroneon.png";
import ecosystemImage from "../../../assets/images/echosystem.png";
import tokenomicsImage from "../../../assets/images/tokenomics.png";
import cityImage from "../../../assets/images/echosystem5.png";
import partnershipImage from "../../../assets/images/patnershipfinal.jpeg";
import communityImage from "../../../assets/images/moon.jpeg";

const FILTERS = [
  "All",
  "Announcements",
  "Tokenomics",
  "Ecosystem",
  "Guides",
  "Industry",
  "Community",
];

const FEATURED = {
  category: "Announcements",
  date: "Sep 13, 2026",
  title: "World Liberty Token Enters a New Phase of Global Expansion",
  excerpt:
    "We are excited to share the next chapter in our journey. World Liberty Token is officially entering a new phase of global expansion, strengthening our ecosystem, partnerships, and real-world utility.",
  readTime: "5 min read",
  views: "12.4K",
  image: coinImage,
};

const ARTICLES = [
  {
    id: "ecosystem",
    category: "Ecosystem",
    date: "Aug 28, 2026",
    title: "Building a More Inclusive Financial Future",
    excerpt:
      "Discover how WLT is creating real-world utility and empowering communities across the globe through decentralised innovation.",
    readTime: "4 min read",
    views: "8.3K",
    image: globeImage,
  },
  {
    id: "tokenomics",
    category: "Tokenomics",
    date: "Aug 22, 2026",
    title: "Understanding the Tokenomics Behind WLT",
    excerpt:
      "A deep dive into our token distribution, supply model, and how it fuels a sustainable and growing ecosystem.",
    readTime: "6 min read",
    views: "10.1K",
    image: tokenomicsImage,
  },
  {
    id: "guides",
    category: "Guides",
    date: "Aug 18, 2026",
    title: "How To Buy WLT: A Step-by-Step Guide",
    excerpt:
      "A simple guide to getting started with WLT, including wallet setup, exchange options, and security best practices.",
    readTime: "5 min read",
    views: "9.7K",
    image: cityImage,
  },
  {
    id: "partnerships",
    category: "Partnerships",
    date: "Aug 14, 2026",
    title: "Strategic Partnerships for a Stronger Tomorrow",
    excerpt:
      "We're building strategic partnerships to expand utility, adoption, and global accessibility for World Liberty Token.",
    readTime: "3 min read",
    views: "6.8K",
    image: partnershipImage,
  },
  {
    id: "community",
    category: "Community",
    date: "Aug 10, 2026",
    title: "Our Community, Our Strength",
    excerpt:
      "The WLT community is at the heart of everything we do. Learn how our global community is shaping the future of digital freedom.",
    readTime: "4 min read",
    views: "5.9K",
    image: communityImage,
  },
  {
    id: "industry",
    category: "Industry",
    date: "Aug 05, 2026",
    title: "The Future of Digital Assets in a Changing World",
    excerpt:
      "Explore the opportunities and challenges shaping the next era of blockchain, and how WLT is positioned for long-term impact.",
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
                alt="World Liberty Token coin"
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
