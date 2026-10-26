"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Bell,
  BookOpen,
  ChartNoAxesCombined,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Copy,
  Cpu,
  House,
  LayoutDashboard,
  Network,
  Newspaper,
  Search,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from "recharts";
import LogoutButton from "../auth/LogoutButton";
import styles from "./dashboard.module.css";
import heroGlow from "../../../assets/images/heroneon.png";

const ICON = 18;
const STROKE = 1.7;

const ACTIVITY_SERIES = [
  { x: "1", value: 18 },
  { x: "2", value: 22 },
  { x: "3", value: 20 },
  { x: "4", value: 31 },
  { x: "5", value: 29 },
  { x: "6", value: 38 },
  { x: "7", value: 35 },
  { x: "8", value: 44 },
  { x: "9", value: 41 },
  { x: "10", value: 52 },
  { x: "11", value: 48 },
  { x: "12", value: 58 },
];

const PORTFOLIO = [
  { name: "Robotics", value: 40, color: "#e0b869" },
  { name: "Automation", value: 35, color: "#c39348" },
  { name: "Intelligent Systems", value: 25, color: "#806b48" },
];

const PERIODS = ["1D", "1W", "1M", "3M", "6M", "1Y"];

const QUICK_ACTIONS = [
  { label: "Explore Research", Icon: Search, href: "/tokenomics" },
  { label: "Browse Articles", Icon: BookOpen, href: "/blog" },
  { label: "Read Updates", Icon: Newspaper, href: "/news" },
  { label: "Robotics & AI", Icon: Cpu, href: "/tokenomics" },
  { label: "Connected Systems", Icon: Network, href: "/echosystem" },
  { label: "Get Help", Icon: CircleHelp, href: "/faq" },
];

const NAV_ITEMS = [
  { label: "Dashboard", Icon: House, href: "dashboard" },
  { label: "Research Library", Icon: BookOpen, href: "/blog" },
  { label: "Research Areas", Icon: LayoutDashboard, href: "/tokenomics" },
  { label: "Technology News", Icon: Newspaper, href: "/news" },
  { label: "Ecosystem", Icon: Network, href: "/echosystem" },
  { label: "FAQ", Icon: CircleHelp, href: "/faq" },
];

function NavIcon({ Icon }) {
  return <Icon size={ICON} strokeWidth={STROKE} />;
}

export default function DashboardSurface({ user, panel }) {
  const displayName = user?.full_name || "User";
  const roleLabel = panel === "admin" ? "Administrator" : "Verified User";
  const homeHref = panel === "admin" ? "/admin" : "/user";
  const initial = displayName.trim().charAt(0).toUpperCase() || "U";
  const refSlug = displayName.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const referralUrl = `/register?ref=${refSlug || "member"}`;

  const [period, setPeriod] = useState("1M");
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  async function copyReferral() {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={styles.pageWrap}>
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.brand}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/rnr-logo.png" alt="" />
          <span>
            <b>RNR</b>
            <small>ROBOTIC NETWORKS RESEARCH</small>
          </span>
        </Link>

        <nav className={styles.sideNav}>
          {NAV_ITEMS.map((item, index) => {
            const active = index === 0;
            return (
              <Link
                key={item.label}
                href={active ? homeHref : item.href}
                className={active ? styles.navActive : styles.navItem}
              >
                <NavIcon Icon={item.Icon} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <article className={styles.promo}>
          <Image src={heroGlow} alt="" className={styles.promoImg} />
          <div className={styles.promoCopy}>
            <p>
              A STRONGER TOMORROW.
              <br />
              TOGETHER.
            </p>
            <Link href="/tokenomics" className={styles.promoBtn}>
              Explore Research <span>→</span>
            </Link>
          </div>
        </article>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <label className={styles.searchBox}>
            <Search size={16} strokeWidth={1.8} />
            <input type="search" placeholder="Search anything..." />
          </label>

          <div className={styles.topbarRight}>
            <button className={styles.iconBtn} type="button" aria-label="Notifications">
              <Bell size={18} strokeWidth={1.7} />
              <i className={styles.notifDot} />
            </button>

            <button className={styles.langBtn} type="button">
              EN
              <ChevronDown size={14} strokeWidth={2} />
            </button>

            <div className={styles.userWrap}>
              <button
                className={styles.userBadge}
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
              >
                <span>{initial}</span>
                <div>
                  <strong>{displayName}</strong>
                  <small>{roleLabel}</small>
                </div>
                <ChevronDown size={14} strokeWidth={2} />
              </button>
              {menuOpen ? (
                <div className={styles.userMenu}>
                  <LogoutButton className={styles.logoutBtn} />
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.heroEyebrow}>RESEARCH DASHBOARD · SAMPLE DATA</p>
            <h1>
              {displayName} <span className={styles.wave}>👋</span>
            </h1>
            <p className={styles.heroLead}>
              Explore robotics, automation, and intelligent systems with
              Robotic Networks Research.
            </p>
            <p className={styles.heroQuote}>
              &ldquo;RESEARCH . DISCOVERY . UNDERSTANDING&rdquo;
            </p>
            <div className={styles.heroActions}>
              <Link href="/" className={styles.heroPrimary}>
                Explore Ecosystem <span>→</span>
              </Link>
              <Link href="/tokenomics" className={styles.heroGhost}>
                View Research
              </Link>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <span className={`${styles.orbit} ${styles.orbitA}`} />
            <span className={`${styles.orbit} ${styles.orbitB}`} />
            <span className={`${styles.orbit} ${styles.orbitC}`} />
            <span className={styles.orbitSpark} />
            <Image src="/images/rnr-logo.png" alt="Robotic Networks Research emblem" width={220} height={220} className={styles.heroCoin} />
          </div>

          <div className={styles.heroEarth}>
            <Image src={heroGlow} alt="" />
            <div className={styles.vertCopy}>
              <span>PEOPLE</span>
              <span>UTILITY</span>
              <span>ROBOTICS</span>
              <span>RESEARCH</span>
              <span>DISCOVERY</span>
            </div>
          </div>
        </section>

        <section className={styles.statsGrid}>
          <article className={styles.statCard}>
            <div className={styles.statIcon}>
              <BookOpen size={18} strokeWidth={1.7} />
            </div>
            <div className={styles.statBody}>
              <p>Research Reads</p>
              <h3>12</h3>
              <div className={styles.statMeta}>
                <small>Example dashboard value</small>
                <b>Illustrative</b>
              </div>
            </div>
            <button className={styles.roundBtn} type="button" aria-label="Open balance">
              <ChevronRight size={16} />
            </button>
          </article>

          <article className={styles.statCard}>
            <div className={styles.statIcon}>
              <ChartNoAxesCombined size={18} strokeWidth={1.7} />
            </div>
            <div className={styles.statBody}>
              <p>Research Areas</p>
              <h3>04</h3>
              <div className={styles.statMeta}>
                <b>
                  Robotics &amp; AI
                </b>
              </div>
            </div>
            <button className={styles.roundBtn} type="button" aria-label="Open price">
              <ChevronRight size={16} />
            </button>
          </article>

          <article className={styles.statCard}>
            <div className={styles.statIcon}>
              <BookOpen size={18} strokeWidth={1.7} />
            </div>
            <div className={styles.statBody}>
              <p>Saved Resources</p>
              <h3>25</h3>
              <div className={styles.statMeta}>
                <small className={styles.timer}>Reading list</small>
                <Link className={styles.ghostMini} href="/blog">Browse Articles</Link>
              </div>
            </div>
            <button className={styles.roundBtn} type="button" aria-label="Open rewards">
              <ChevronRight size={16} />
            </button>
          </article>

          <article className={styles.statCard}>
            <div className={styles.statIcon}>
              <Newspaper size={18} strokeWidth={1.7} />
            </div>
            <div className={styles.statBody}>
              <p>Research Updates</p>
              <h3>Latest</h3>
              <div className={styles.statMeta}>
                <small>News &amp; articles</small>
                <button className={styles.ghostMini} type="button">
                  View Updates
                </button>
              </div>
            </div>
            <button className={styles.roundBtn} type="button" aria-label="Open research updates">
              <ChevronRight size={16} />
            </button>
          </article>
        </section>

        <section className={styles.midRow}>
          <article className={styles.chartCard}>
            <div className={styles.chartHead}>
              <div>
                <h3>
                  <i className={styles.liveDot} /> Research Activity
                </h3>
                <p>Sample activity index <b>Illustrative</b></p>
              </div>
              <button className={styles.rangeBtn} type="button">
                1 Month <ChevronDown size={14} />
              </button>
            </div>
            <div className={styles.chartWrap}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ACTIVITY_SERIES} margin={{ top: 8, right: 6, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rnrArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#e0b869" stopOpacity={0.38} />
                      <stop offset="100%" stopColor="#e0b869" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(224,184,105,0.12)" vertical={false} />
                  <YAxis
                    orientation="right"
                    domain={[0, 75]}
                    ticks={[0, 25, 50, 75]}
                    axisLine={false}
                    tickLine={false}
                    width={46}
                    tick={{ fill: "#a29a8b", fontSize: 11 }}
                  />
                  <Tooltip
                    cursor={{ stroke: "rgba(224,184,105,0.45)" }}
                    contentStyle={{
                      background: "#0c0c0b",
                      border: "1px solid rgba(224,184,105,0.35)",
                      borderRadius: 10,
                      color: "#f1eee7",
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#e0b869"
                    strokeWidth={2.4}
                    fill="url(#rnrArea)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className={styles.periods}>
              {PERIODS.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={item === period ? styles.periodActive : styles.periodBtn}
                  onClick={() => setPeriod(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </article>

          <article className={styles.portfolioCard}>
            <div className={styles.cardHead}>
              <h3>Research Topic Mix</h3>
              <button className={styles.iconGhost} type="button" aria-label="Portfolio options">
                <LayoutDashboard size={15} />
              </button>
            </div>
            <div className={styles.portfolioInner}>
              <div className={styles.pieWrap}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={PORTFOLIO}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={58}
                      outerRadius={78}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {PORTFOLIO.map((item) => (
                        <Cell key={item.name} fill={item.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className={styles.pieCenter}>
                  <strong>Sample</strong>
                  <small>Topic Mix</small>
                </div>
              </div>
              <ul className={styles.mixList}>
                {PORTFOLIO.map((item) => (
                  <li key={item.name}>
                    <i style={{ background: item.color }} />
                    <span>{item.name}</span>
                    <b>{item.value}%</b>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <article className={styles.quickCard}>
            <div className={styles.cardHead}>
              <h3>Quick Actions</h3>
            </div>
            <div className={styles.quickGrid}>
              {QUICK_ACTIONS.map((action) => (
                <Link key={action.label} href={action.href} className={styles.quickBtn}>
                  <action.Icon size={20} strokeWidth={1.7} />
                  <span>{action.label}</span>
                </Link>
              ))}
            </div>
          </article>
        </section>

        <section className={styles.bottomRow}>
          <article className={styles.referCard}>
            <div className={styles.cardHead}>
              <div>
                <h3>Share Research</h3>
                  <p className={styles.subHead}>Invite others to explore RNR.</p>
              </div>
              <button className={styles.copyLink} type="button" onClick={copyReferral}>
                {copied ? "Copied" : "Copy Link"}
              </button>
            </div>
            <div className={styles.linkBox}>
              <span>{referralUrl}</span>
              <button type="button" onClick={copyReferral} aria-label="Copy referral link">
                <Copy size={15} strokeWidth={1.8} />
              </button>
            </div>
            <div className={styles.referStats}>
              <div>
                <Users size={16} strokeWidth={1.8} />
                <b>Explore</b>
                <small>Robotics articles</small>
              </div>
              <div>
                <Network size={16} strokeWidth={1.8} />
                <b>Discover</b>
                <small>Connected systems</small>
              </div>
              <div>
                <BookOpen size={16} strokeWidth={1.8} />
                <b>Read</b>
                <small>Research resources</small>
              </div>
            </div>
          </article>

          <article className={styles.txCard}>
            <div className={styles.cardHead}>
              <h3>Recent Activity</h3>
              <button className={styles.viewAll} type="button">
                View All <ChevronRight size={14} />
              </button>
            </div>
            <ul className={styles.txList}>
              <li>
                <i className={styles.txIn}>↓</i>
                <div>
                  <strong>Research guide viewed</strong>
                  <small>Robotics fundamentals</small>
                </div>
                <time>Today</time>
              </li>
              <li>
                <i className={styles.txOut}>↑</i>
                <div>
                  <strong>Topic explored</strong>
                  <small>Automation systems</small>
                </div>
                <time>This week</time>
              </li>
              <li>
                <i className={styles.txMine}>
                  <BookOpen size={13} />
                </i>
                <div>
                  <strong>Resource saved</strong>
                  <small>Connected technologies</small>
                </div>
                <time>This week</time>
              </li>
              <li>
                <i className={styles.txBuy}>•</i>
                <div>
                  <strong>Research update</strong>
                  <small>Intelligent systems</small>
                </div>
                <time>Recently</time>
              </li>
            </ul>
          </article>

          <article className={styles.newsCard}>
            <div className={styles.cardHead}>
              <h3>Latest Updates</h3>
              <button className={styles.viewAll} type="button">
                View All <ChevronRight size={14} />
              </button>
            </div>
            <ul className={styles.newsList}>
              <li>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/cube.png" alt="" />
                <div>
                  <strong>Explore robotics and automation</strong>
                  <small>Research guide</small>
                </div>
              </li>
              <li>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/rnr-logo.png" alt="" />
                <div>
                  <strong>Understanding connected systems</strong>
                  <small>Technology overview</small>
                </div>
              </li>
              <li>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/rnr-logo.png" alt="" />
                <div>
                  <strong>New research topics added</strong>
                  <small>Platform update</small>
                </div>
              </li>
            </ul>
          </article>
        </section>
      </div>
    </div>
  );
}
