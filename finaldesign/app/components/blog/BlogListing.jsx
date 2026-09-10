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
  "Insights",
  "Education",
  "Tokenomics",
  "Ecosystem",
  "Guides",
  "Community",
];

const FEATURED = {
  category: "Insights",
  date: "Sep 09, 2026",
  title: "Why Utility Will Define The Next Era Of Digital Assets",
  excerpt:
    "Tokens that last are built on real use, not short-term hype. This article explores how World Liberty Token is designing utility, community, and long-term value into every part of the ecosystem.",
  readTime: "8 min read",
  views: "14.2K",
  image: coinImage,
};

const ARTICLES = [
  {
    id: "education",
    category: "Education",
    date: "Aug 30, 2026",
    title: "A Beginner's Guide To Decentralized Finance",
    excerpt:
      "Understand the foundations of DeFi, wallets, and on-chain value — and how WLT fits into a more open financial future.",
    readTime: "6 min read",
    views: "9.4K",
    image: globeImage,
  },
  {
    id: "tokenomics",
    category: "Tokenomics",
    date: "Aug 24, 2026",
    title: "How Sustainable Token Design Builds Trust",
    excerpt:
      "A closer look at supply, allocation, and vesting — and why transparent tokenomics matter for long-term ecosystem growth.",
    readTime: "7 min read",
    views: "11.6K",
    image: tokenomicsImage,
  },
  {
    id: "guides",
    category: "Guides",
    date: "Aug 19, 2026",
    title: "How To Get Started With WLT In 10 Minutes",
    excerpt:
      "A practical walkthrough covering wallet setup, security basics, and the first steps to participate in the WLT ecosystem.",
    readTime: "5 min read",
    views: "8.8K",
    image: cityImage,
  },
  {
    id: "ecosystem",
    category: "Ecosystem",
    date: "Aug 12, 2026",
    title: "Inside The WLT Product Stack",
    excerpt:
      "From staking and mining to payments and dApps — how each product connects to create one unified ecosystem.",
    readTime: "6 min read",
    views: "7.1K",
    image: ecosystemImage,
  },
  {
    id: "community",
    category: "Community",
    date: "Aug 08, 2026",
    title: "Builders, Believers, And The Power Of Shared Vision",
    excerpt:
      "The people behind World Liberty Token are shaping a global movement. Here's how community participation drives real progress.",
    readTime: "4 min read",
    views: "6.3K",
    image: communityImage,
  },
  {
    id: "insights",
    category: "Insights",
    date: "Aug 02, 2026",
    title: "Partnerships That Expand Real-World Access",
    excerpt:
      "Strategic collaboration is how utility scales. Explore how WLT is working with partners to bring digital freedom to more people.",
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
            <p className={styles.subscribeKicker}>Stay Inspired</p>
            <h2>
              Insights From
              <br />
              World Liberty Token.
            </h2>
            <p className={styles.subscribeText}>
              Subscribe for new articles, guides, and long-form thinking from
              the WLT ecosystem.
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
