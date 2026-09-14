"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpRight,
  Bell,
  ChartNoAxesCombined,
  ChevronDown,
  ChevronRight,
  Coins,
  Copy,
  Gift,
  HandCoins,
  Handshake,
  Headphones,
  House,
  LayoutDashboard,
  Lock,
  Medal,
  Pickaxe,
  Receipt,
  Search,
  SendHorizontal,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  UserRound,
  Users,
  Wallet,
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
import coinImage from "../../../assets/images/novax-coin.png";
import heroGlow from "../../../assets/images/heroneon.png";
import { TOKEN_LOCK } from "@/lib/token-lock";

const ICON = 18;
const STROKE = 1.7;

const PRICE_SERIES = [
  { x: "1", value: 0.168 },
  { x: "2", value: 0.184 },
  { x: "3", value: 0.176 },
  { x: "4", value: 0.198 },
  { x: "5", value: 0.192 },
  { x: "6", value: 0.214 },
  { x: "7", value: 0.208 },
  { x: "8", value: 0.226 },
  { x: "9", value: 0.218 },
  { x: "10", value: 0.242 },
  { x: "11", value: 0.236 },
  { x: "12", value: 0.258 },
  { x: "13", value: 0.252 },
  { x: "14", value: 0.274 },
  { x: "15", value: 0.268 },
  { x: "16", value: 0.292 },
  { x: "17", value: 0.286 },
  { x: "18", value: 0.308 },
  { x: "19", value: 0.298 },
  { x: "20", value: 0.324 },
];

const PORTFOLIO = [
  { name: "WLT Tokens", value: 78, color: "#c9f53a" },
  { name: "USDT", value: 12, color: "#6d7a52" },
  { name: "Other Assets", value: 10, color: "#2b3320" },
];

const PERIODS = ["1D", "1W", "1M", "3M", "6M", "1Y"];

const QUICK_ACTIONS = [
  { label: "Deposit", Icon: ArrowDownToLine },
  { label: "Withdraw", Icon: HandCoins, locked: true },
  { label: "Buy WLT", Icon: Wallet },
  { label: "Send", Icon: SendHorizontal, locked: true },
  { label: "Receive", Icon: ArrowDownToLine },
  { label: "Swap", Icon: ArrowLeftRight },
];

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", Icon: House },
  { key: "users", label: "Users", Icon: UserRound, adminOnly: true },
  { key: "wallet", label: "Wallet", Icon: Wallet },
  { key: "presale", label: "Presale", Icon: ShoppingBag },
  { key: "airdrops", label: "Airdrops", Icon: Sparkles },
  { key: "mining", label: "Mining", Icon: Pickaxe },
  { key: "rewards", label: "Scratch & Win", Icon: Gift },
  { key: "achievements", label: "Achievements", Icon: Medal },
  { key: "referral", label: "Referral Program", Icon: Users, chevron: true },
  { key: "transactions", label: "Transactions", Icon: Receipt },
  { key: "market", label: "Market & Charts", Icon: ChartNoAxesCombined },
  { key: "kyc", label: "KYC Verification", Icon: ShieldCheck, locked: true },
  { key: "settings", label: "Settings", Icon: Settings },
  { key: "support", label: "Support", Icon: Headphones },
];

function navHref(key, panel) {
  if (key === "dashboard") {
    return panel === "admin" ? "/admin" : "/user";
  }
  if (key === "users") {
    return "/admin/users";
  }
  if (key === "mining") {
    return panel === "admin" ? "/admin/mining" : "/user/mining";
  }
  if (key === "rewards") {
    return panel === "admin" ? "/admin/rewards" : "/user/rewards";
  }
  if (key === "referral") {
    return panel === "admin" ? "/admin/referral" : "/user/referral";
  }
  if (key === "presale" ) {
    return panel === "admin" ? "/admin/presale" : "/user/presale";
  }
  if (key === "airdrops") {
    return panel === "admin" ? "/admin/airdrops" : "/user/airdrops";
  }
  if (key === "achievements") {
    return panel === "admin" ? "/admin/achievements" : "/user/achievements";
  }
  if (key === "wallet") {
    return panel === "admin" ? "/admin/wallet" : "/user/wallet";
  }
  if (key === "transactions") {
    return panel === "admin" ? "/admin/transactions" : "/user/transactions";
  }
  if (key === "market") {
    return panel === "admin" ? "/admin/market" : "/user/market";
  }
  if (key === "settings") {
    return panel === "admin" ? "/admin/settings" : "/user/settings";
  }
  if (key === "support") {
    return panel === "admin" ? "/admin/support" : "/user/support";
  }
  return "#";
}

function NavIcon({ Icon }) {
  return <Icon size={ICON} strokeWidth={STROKE} />;
}

export default function DashboardSurface({ user, panel, activeNav = "dashboard", children }) {
  const router = useRouter();
  const displayName = user?.full_name || "User";
  const impersonator = user?.impersonator || null;
  const roleLabel = impersonator
    ? `Viewing as ${displayName}`
    : panel === "admin"
      ? "Administrator"
      : "Verified User";
  const initial = displayName.trim().charAt(0).toUpperCase() || "U";
  const [leaving, setLeaving] = useState(false);

  const [period, setPeriod] = useState("1M");
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [referral, setReferral] = useState({
    url: "",
    total: 0,
    active: 0,
    earnings: "0.0000000 WLT",
    commission: "$0.00",
  });

  useEffect(() => {
    let alive = true;

    async function loadReferral() {
      try {
        const response = await fetch("/api/referral/status", { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok || !alive) {
          return;
        }
        const origin = window.location.origin;
        setReferral({
          url: payload.code ? `${origin}/register?ref=${encodeURIComponent(payload.code)}` : "",
          total: Number(payload.presale?.network?.total || payload.counts?.total || 0),
          active: Number(payload.presale?.network?.qualifiedDirect || 0),
          earnings: `${Number(payload.earnings?.total || 0).toFixed(7)} WLT`,
          commission: `$${Number(payload.presale?.commission?.available || 0).toFixed(2)}`,
        });
      } catch {
        if (alive) {
          setReferral((current) => current);
        }
      }
    }

    loadReferral();
    return () => {
      alive = false;
    };
  }, []);

  async function copyReferral() {
    if (!referral.url) {
      return;
    }
    try {
      await navigator.clipboard.writeText(referral.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  async function stopImpersonation() {
    setLeaving(true);
    try {
      const response = await fetch("/api/auth/stop-impersonation", { method: "POST" });
      const payload = await response.json();
      router.push(payload.redirectTo || "/admin/users");
      router.refresh();
    } finally {
      setLeaving(false);
    }
  }

  return (
    <div className={styles.pageWrap}>
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.brand}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/novax-logo.png" alt="World Liberty Token" />
          <span>
            <b>WLT</b>
            <small>WORLD LIBERTY TOKEN</small>
          </span>
        </Link>

        <nav className={styles.sideNav}>
          {NAV_ITEMS.filter((item) => !item.adminOnly || panel === "admin").map((item) => {
            const active = item.key === activeNav;
            const locked = Boolean(item.locked);
            return (
              <Link
                key={item.key}
                href={locked ? "#" : navHref(item.key, panel)}
                className={`${active ? styles.navActive : styles.navItem}${locked ? ` ${styles.navLocked}` : ""}`}
                aria-disabled={locked}
                onClick={locked ? (event) => event.preventDefault() : undefined}
              >
                <NavIcon Icon={item.Icon} />
                <span>{item.label}</span>
                {locked ? (
                  <em className={styles.navLockBadge}>
                    <Lock size={10} strokeWidth={2.4} />
                    Locked
                  </em>
                ) : item.chevron ? (
                  <ChevronRight size={14} strokeWidth={2} className={styles.navChevron} />
                ) : null}
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
            <Link href="/" className={styles.promoBtn}>
              Join the Movement <span>→</span>
            </Link>
          </div>
        </article>
      </aside>

      <div className={styles.main}>
        {impersonator ? (
          <div className={styles.impersonateBar}>
            <span>
              Impersonating <b>{displayName}</b> as {impersonator.full_name}
            </span>
            <button type="button" onClick={stopImpersonation} disabled={leaving}>
              {leaving ? "Returning…" : "Return to admin"}
            </button>
          </div>
        ) : null}
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
                  <Link
                    href={panel === "admin" ? "/admin/settings" : "/user/settings"}
                    className={styles.logoutBtn}
                    onClick={() => setMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <LogoutButton className={styles.logoutBtn} />
                </div>
              ) : null}
            </div>
          </div>
        </header>

        {children ? (
          children
        ) : (
        <>
        {impersonator ? (
          <div className={styles.returnBanner}>
            <p>
              Returning to your account as{" "}
              <strong>{displayName}</strong>
              <button
                type="button"
                className={styles.returnBtn}
                onClick={() => {
                  setLeaving(true);
                  setTimeout(() => {
                    router.push("/user");
                  }, 300);
                }}
              >
                <ChevronRight size={14} />
                Return to Account
              </button>
            </p>
          </div>
        ) : null}

        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.heroEyebrow}>WELCOME BACK,</p>
            <h1>
              {displayName} <span className={styles.wave}>👋</span>
            </h1>
            <p className={styles.heroLead}>
              Be part of a more open, inclusive and financial future with World
              Liberty Token.
            </p>
            <p className={styles.heroQuote}>
              &ldquo;FREEDOM . INNOVATION . COMMUNITY&rdquo;
            </p>
            <div className={styles.heroActions}>
              <Link href="/" className={styles.heroPrimary}>
                Explore Ecosystem <span>→</span>
              </Link>
              <Link href="#" className={styles.heroGhost}>
                View Whitepaper
              </Link>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <span className={`${styles.orbit} ${styles.orbitA}`} />
            <span className={`${styles.orbit} ${styles.orbitB}`} />
            <span className={`${styles.orbit} ${styles.orbitC}`} />
            <span className={styles.orbitSpark} />
            <Image src={coinImage} alt="World Liberty Token coin" className={styles.heroCoin} />
          </div>

          <div className={styles.heroEarth}>
            <Image src={heroGlow} alt="" />
            <div className={styles.vertCopy}>
              <span>PEOPLE</span>
              <span>UTILITY</span>
              <span>FREEDOM</span>
              <span>A BRIGHTER</span>
              <span>TOMORROW</span>
            </div>
          </div>
        </section>

        <section className={styles.statsGrid}>
          <article className={styles.statCard}>
            <div className={styles.statIcon}>
              <Coins size={18} strokeWidth={1.7} />
            </div>
            <div className={styles.statBody}>
              <p>WLT Balance</p>
              <h3>12,450.85 WLT</h3>
              <div className={styles.statMeta}>
                <small className={styles.lockMeta}>
                  <Lock size={11} strokeWidth={2.2} /> Tokens locked
                </small>
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
              <p>WLT Price</p>
              <h3>$0.3204</h3>
              <div className={styles.statMeta}>
                <b>
                  <ArrowUpRight size={12} strokeWidth={2.4} /> +12.4%{" "}
                  <em>(24h)</em>
                </b>
              </div>
            </div>
            <button className={styles.roundBtn} type="button" aria-label="Open price">
              <ChevronRight size={16} />
            </button>
          </article>

          <article className={styles.statCard}>
            <div className={styles.statIcon}>
              <Gift size={18} strokeWidth={1.7} />
            </div>
            <div className={styles.statBody}>
              <p>Daily Reward</p>
              <h3>Scratch & Win</h3>
              <div className={styles.statMeta}>
                <small>Up to 1.0000000 WLT</small>
                <Link href={panel === "admin" ? "/admin/rewards" : "/user/rewards"} className={styles.claimBtn}>
                  Play Now
                </Link>
              </div>
            </div>
            <Link
              href={panel === "admin" ? "/admin/rewards" : "/user/rewards"}
              className={`${styles.roundBtn} ${styles.rewardArrow}`}
              aria-label="Open rewards"
            >
              <ChevronRight size={16} />
            </Link>
          </article>

          <article className={styles.statCard}>
            <div className={styles.statIcon}>
              <Pickaxe size={18} strokeWidth={1.7} />
            </div>
            <div className={styles.statBody}>
              <p>Mining Status</p>
              <h3>Active</h3>
              <div className={styles.statMeta}>
                <small>2.8756990 WLT / 24h</small>
                <Link href={panel === "admin" ? "/admin/mining" : "/user/mining"} className={styles.ghostMini}>
                  View Mining
                </Link>
              </div>
            </div>
            <Link
              href={panel === "admin" ? "/admin/mining" : "/user/mining"}
              className={`${styles.roundBtn} ${styles.miningArrow}`}
              aria-label="Open mining"
            >
              <ChevronRight size={16} />
            </Link>
          </article>
        </section>

        <section className={styles.midRow}>
          <article className={styles.chartCard}>
            <div className={styles.chartHead}>
              <div>
                <h3>
                  <i className={styles.liveDot} /> WLT Price Chart
                </h3>
                <p>
                  $0.3204 <b>+12.4%</b>
                </p>
              </div>
              <button className={styles.rangeBtn} type="button">
                1 Month <ChevronDown size={14} />
              </button>
            </div>
            <div className={styles.chartWrap}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={PRICE_SERIES} margin={{ top: 8, right: 6, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="wltArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#c9f53a" stopOpacity={0.38} />
                      <stop offset="100%" stopColor="#c9f53a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(201,245,58,0.06)" vertical={false} />
                  <YAxis
                    orientation="right"
                    domain={[0.1, 0.4]}
                    ticks={[0.1, 0.2, 0.3, 0.4]}
                    tickFormatter={(v) => `$${Number(v).toFixed(2)}`}
                    axisLine={false}
                    tickLine={false}
                    width={46}
                    tick={{ fill: "#8d9578", fontSize: 11 }}
                  />
                  <Tooltip
                    cursor={{ stroke: "rgba(201,245,58,0.35)" }}
                    contentStyle={{
                      background: "#0c1008",
                      border: "1px solid rgba(201,245,58,0.35)",
                      borderRadius: 10,
                      color: "#eef6d2",
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#c9f53a"
                    strokeWidth={2.4}
                    fill="url(#wltArea)"
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
              <h3>Your Portfolio</h3>
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
                  <strong>$3,982.76</strong>
                  <small>Total Value</small>
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
              {QUICK_ACTIONS.map((action) => {
                const locked = Boolean(action.locked && TOKEN_LOCK.minedLocked);
                return (
                  <button
                    key={action.label}
                    type="button"
                    className={locked ? styles.quickBtnLocked : styles.quickBtn}
                    disabled={locked}
                    title={locked ? TOKEN_LOCK.message : undefined}
                  >
                    {locked ? <Lock size={20} strokeWidth={1.7} /> : <action.Icon size={20} strokeWidth={1.7} />}
                    <span>{action.label}</span>
                    {locked ? <small>Locked</small> : null}
                  </button>
                );
              })}
            </div>
            {TOKEN_LOCK.minedLocked ? (
              <p className={styles.lockNote}>
                <Lock size={13} /> WLT cannot be withdrawn or sent until trade opens, including presale purchases.
              </p>
            ) : null}
          </article>
        </section>

        <section className={styles.bottomRow}>
          <article className={styles.referCard}>
            <div className={styles.cardHead}>
              <div>
                <h3>Referral Program</h3>
                <p className={styles.subHead}>Mining 10/5/3 WLT · Presale 5% USD (SOL payout)</p>
              </div>
              <button className={styles.copyLink} type="button" onClick={copyReferral}>
                {copied ? "Copied" : "Copy Link"}
              </button>
            </div>
            <div className={styles.linkBox}>
              <span>{referral.url || "Generating referral URL..."}</span>
              <button type="button" onClick={copyReferral} aria-label="Copy referral link">
                <Copy size={15} strokeWidth={1.8} />
              </button>
            </div>
            <div className={styles.referStats}>
              <div>
                <Users size={16} strokeWidth={1.8} />
                <b>{referral.total}</b>
                <small>Total Referrals</small>
              </div>
              <div>
                <Handshake size={16} strokeWidth={1.8} />
                <b>{referral.active}</b>
                <small>Qualified Presale</small>
              </div>
              <div>
                <Coins size={16} strokeWidth={1.8} />
                <b>{referral.earnings}</b>
                <small>Mining Earnings</small>
              </div>
              <div>
                <Coins size={16} strokeWidth={1.8} />
                <b>{referral.commission}</b>
                <small>USD Commission</small>
              </div>
            </div>
          </article>

          <article className={styles.txCard}>
            <div className={styles.cardHead}>
              <h3>Recent Transactions</h3>
              <button className={styles.viewAll} type="button">
                View All <ChevronRight size={14} />
              </button>
            </div>
            <ul className={styles.txList}>
              <li>
                <i className={styles.txIn}>↓</i>
                <div>
                  <strong>Received</strong>
                  <small>From: Muhammad Khan</small>
                </div>
                <time>Apr 16, 2024  10:24 AM</time>
              </li>
              <li>
                <i className={styles.txOut}>↑</i>
                <div>
                  <strong>Withdraw</strong>
                  <small>To: External Wallet</small>
                </div>
                <time>Apr 14, 2024  04:18 PM</time>
              </li>
              <li>
                <i className={styles.txMine}>
                  <Pickaxe size={13} />
                </i>
                <div>
                  <strong>Mining Reward</strong>
                  <small>Daily Mining</small>
                </div>
                <time>Apr 14, 2024  12:00 AM</time>
              </li>
              <li>
                <i className={styles.txBuy}>$</i>
                <div>
                  <strong>Purchase</strong>
                  <small>From: USDT</small>
                </div>
                <time>Apr 12, 2024  02:36 PM</time>
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
                <img src="/images/echosystem.png" alt="" />
                <div>
                  <strong>WLT Mining Beta Now Live</strong>
                  <small>Apr 16, 2024</small>
                </div>
              </li>
              <li>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/partnership.png" alt="" />
                <div>
                  <strong>WLT Partners with Global Payment Network</strong>
                  <small>Apr 02, 2024</small>
                </div>
              </li>
              <li>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/tokenomics.png" alt="" />
                <div>
                  <strong>Dashboard v1 Official Release</strong>
                  <small>Mar 18, 2024</small>
                </div>
              </li>
            </ul>
          </article>
        </section>
        </>
        )}
      </div>
    </div>
  );
}
