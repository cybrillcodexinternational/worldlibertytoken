"use client";

import { useMemo, useState } from "react";
import {
  Box,
  ChevronRight,
  Coins,
  Cpu,
  Map,
  Minus,
  Plus,
  Search,
  Share2,
  Shield,
  Users,
  Wallet,
} from "lucide-react";

const CATEGORIES = [
  { id: "general", label: "General", Icon: Coins },
  { id: "tokenomics", label: "Tokenomics", Icon: Share2 },
  { id: "ecosystem", label: "Ecosystem", Icon: Box },
  { id: "roadmap", label: "Roadmap", Icon: Map },
  { id: "buying", label: "Buying & Wallets", Icon: Wallet },
  { id: "security", label: "Security", Icon: Shield },
  { id: "community", label: "Community", Icon: Users },
  { id: "technical", label: "Technical", Icon: Cpu },
];

const FAQS = [
  {
    id: "g1",
    category: "general",
    q: "What is World Liberty Token (WLT)?",
    a: "World Liberty Token (WLT) is a next-generation digital asset designed to empower individuals, communities, and businesses through a transparent, secure, and utility-driven ecosystem. WLT goes beyond being a token — it's a movement for a more inclusive and financially free future.",
  },
  {
    id: "g2",
    category: "general",
    q: "What is the total supply of WLT?",
    a: "WLT has a fixed, transparent total supply defined in our tokenomics. Allocation, vesting, and emission details are published so holders can track distribution over time.",
  },
  {
    id: "g3",
    category: "general",
    q: "Which blockchain is WLT built on?",
    a: "WLT is designed as a utility token for a modular ecosystem, with smart-contract infrastructure planned for a secure, widely supported blockchain network.",
  },
  {
    id: "g4",
    category: "general",
    q: "What are the main use cases of WLT?",
    a: "WLT powers ecosystem access, staking and rewards, governance participation, and utility across World Liberty Token products and partner modules.",
  },
  {
    id: "g5",
    category: "general",
    q: "How can I buy WLT?",
    a: "WLT will be available through official launch channels and later through supported exchanges and wallets. Always use links from worldlibertytoken.com.",
  },
  {
    id: "g6",
    category: "general",
    q: "Is WLT a good long-term investment?",
    a: "WLT is built for long-term utility, not short-term hype. We do not provide investment advice — review the whitepaper, tokenomics, and risks before participating.",
  },
  {
    id: "g7",
    category: "general",
    q: "How is the token supply distributed?",
    a: "Supply is allocated across community, ecosystem growth, development, liquidity, and long-term reserves, with vesting designed to support sustainable expansion.",
  },
  {
    id: "g8",
    category: "general",
    q: "When will WLT be listed on exchanges?",
    a: "Exchange listings are planned as part of the Expansion phase. Announcements will be published on official World Liberty Token channels only.",
  },
  {
    id: "g9",
    category: "general",
    q: "How can I stay updated?",
    a: "Follow official World Liberty Token channels, including the website, community platforms, and news updates, for launches, listings, and product releases.",
  },
  {
    id: "g10",
    category: "general",
    q: "Where can I read the full whitepaper?",
    a: "The full whitepaper is available from the Whitepapers link in the site navigation and from official World Liberty Token resources.",
  },
  {
    id: "t1",
    category: "tokenomics",
    q: "How is WLT allocated?",
    a: "Allocation covers community, ecosystem, team, liquidity, and reserves. Exact percentages and vesting timelines are detailed on the Tokenomics page.",
  },
  {
    id: "t2",
    category: "tokenomics",
    q: "Does WLT have a vesting schedule?",
    a: "Yes. Team, partners, and ecosystem allocations follow a vesting schedule to support long-term alignment and reduce sudden supply shocks.",
  },
  {
    id: "t3",
    category: "tokenomics",
    q: "Is the supply inflationary?",
    a: "WLT tokenomics are structured for transparency and sustainability. Emission and unlock details are published so supply growth is measurable.",
  },
  {
    id: "e1",
    category: "ecosystem",
    q: "What products are part of the WLT ecosystem?",
    a: "The ecosystem is modular — wallets, dashboards, staking, community tools, and future utilities designed to create real use cases for WLT.",
  },
  {
    id: "e2",
    category: "ecosystem",
    q: "How does utility grow over time?",
    a: "Each roadmap phase adds products and integrations so WLT moves from launch utility toward a broader, interconnected financial toolkit.",
  },
  {
    id: "r1",
    category: "roadmap",
    q: "How many phases are on the roadmap?",
    a: "The public roadmap is structured in six phases, from Foundation through Global Scale, with clear milestones at each step.",
  },
  {
    id: "r2",
    category: "roadmap",
    q: "Where can I track delivery progress?",
    a: "The Roadmap page includes a delivery tracker showing completion across Foundation, Pre Launch and Mining, Launch, Expansion, Evolution, and Global Scale.",
  },
  {
    id: "b1",
    category: "buying",
    q: "Which wallets will support WLT?",
    a: "WLT will be compatible with standard wallets that support the launch network. Official wallet guidance will be published before public sale.",
  },
  {
    id: "b2",
    category: "buying",
    q: "Will there be a presale?",
    a: "Presale access is planned as part of the Launch phase. Dates, terms, and official links will be announced only through verified channels.",
  },
  {
    id: "s1",
    category: "security",
    q: "How is the project securing smart contracts?",
    a: "Security reviews, contract planning, and pre-launch audits are part of the Foundation and Pre Launch phases before public release.",
  },
  {
    id: "s2",
    category: "security",
    q: "How do I avoid scams?",
    a: "Never share seed phrases. Use only official website links and verified social accounts. World Liberty Token will never DM you asking for funds.",
  },
  {
    id: "c1",
    category: "community",
    q: "How can I join the community?",
    a: "Join official community channels from the website. Community growth, education, and open communication are core to the WLT vision.",
  },
  {
    id: "c2",
    category: "community",
    q: "Will there be governance?",
    a: "Governance features are planned in later roadmap phases so holders can help shape ecosystem decisions as the network matures.",
  },
  {
    id: "x1",
    category: "technical",
    q: "Where can developers find documentation?",
    a: "Technical documentation will be published alongside ecosystem modules. Check official resources for contract addresses and integration guides.",
  },
  {
    id: "x2",
    category: "technical",
    q: "Will WLT be open for integrations?",
    a: "Yes. The ecosystem is built to expand through modules, partnerships, and future cross-chain exploration as the network scales.",
  },
];

export default function FaqBrowse() {
  const [category, setCategory] = useState("general");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState("g1");

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQS.filter((item) => {
      const inCategory = item.category === category;
      if (!q) return inCategory;
      return (
        inCategory &&
        (item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q))
      );
    });
  }, [category, query]);

  const selectCategory = (id) => {
    setCategory(id);
    setQuery("");
    const first = FAQS.find((item) => item.category === id);
    setOpenId(first ? first.id : null);
  };

  return (
    <section className="faq-browse">
      <div className="tp-inner faq-browse-inner">
        <aside className="faq-cats">
          <p className="faq-cats-kicker">Browse By Category</p>
          <div className="faq-cats-list">
            {CATEGORIES.map((item) => {
              const Icon = item.Icon;
              const active = item.id === category;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={active ? "faq-cat is-active" : "faq-cat"}
                  onClick={() => selectCategory(item.id)}
                >
                  <span className="faq-cat-icon">
                    <Icon size={18} strokeWidth={1.7} />
                  </span>
                  <span className="faq-cat-label">{item.label}</span>
                  <ChevronRight size={16} strokeWidth={1.8} />
                </button>
              );
            })}
          </div>
        </aside>

        <div className="faq-panel">
          <label className="faq-search">
            <Search size={16} strokeWidth={1.8} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search your question..."
            />
          </label>

          <div className="faq-list">
            {items.length === 0 ? (
              <p className="faq-empty">No matching questions in this category.</p>
            ) : (
              items.map((item) => {
                const open = item.id === openId;
                return (
                  <article
                    key={item.id}
                    className={open ? "faq-item is-open" : "faq-item"}
                  >
                    <button
                      type="button"
                      className="faq-item-head"
                      onClick={() => setOpenId(open ? null : item.id)}
                      aria-expanded={open}
                    >
                      <span>{item.q}</span>
                      {open ? (
                        <Minus size={18} strokeWidth={2} />
                      ) : (
                        <Plus size={18} strokeWidth={2} />
                      )}
                    </button>
                    {open ? <p className="faq-item-body">{item.a}</p> : null}
                  </article>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
