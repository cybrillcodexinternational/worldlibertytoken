"use client";

import { useMemo, useState } from "react";
import {
  Box,
  ChevronRight,
  Cpu,
  Map,
  Minus,
  Plus,
  Search,
  Share2,
  Shield,
  Users,
} from "lucide-react";

const CATEGORIES = [
  { id: "general", label: "General", Icon: Cpu },
  { id: "tokenomics", label: "Research Areas", Icon: Share2 },
  { id: "ecosystem", label: "Ecosystem", Icon: Box },
  { id: "roadmap", label: "Roadmap", Icon: Map },
  { id: "buying", label: "Learning Resources", Icon: Search },
  { id: "security", label: "Security", Icon: Shield },
  { id: "community", label: "Community", Icon: Users },
  { id: "technical", label: "Technical", Icon: Cpu },
];

const FAQS = [
  {
    id: "g1",
    category: "general",
    q: "What is Robotic Networks Research?",
    a: "Robotic Networks Research (RNR) is a research and learning platform focused on robotics, automation, intelligent systems, and connected technologies.",
  },
  {
    id: "g2",
    category: "general",
    q: "What does RNR stand for?",
    a: "RNR stands for Robotic Networks Research.",
  },
  {
    id: "g3",
    category: "general",
    q: "What topics does the platform cover?",
    a: "The research areas include robotics and automation, artificial intelligence, connected systems, and human-robot interaction.",
  },
  {
    id: "g4",
    category: "general",
    q: "Who is the research for?",
    a: "The articles are written for curious readers, students, and technology enthusiasts who want an accessible introduction to robotics and related fields.",
  },
  {
    id: "t1",
    category: "tokenomics",
    q: "Where can I find the main research topics?",
    a: "Visit the Research page to browse the platform's focus areas and follow links to related articles.",
  },
  {
    id: "t2",
    category: "tokenomics",
    q: "Does RNR publish technical research?",
    a: "The site shares educational articles and research-oriented material. Check the Resources and News pages for available publications and updates.",
  },
  {
    id: "t3",
    category: "tokenomics",
    q: "Can I suggest a research topic?",
    a: "Use the contact or community links provided on the site to share topic ideas. Suggestions can help guide future educational content.",
  },
  {
    id: "e1",
    category: "ecosystem",
    q: "What does the RNR ecosystem include?",
    a: "The platform brings together research topics, learning resources, news, and community participation around robotics and intelligent systems.",
  },
  {
    id: "e2",
    category: "ecosystem",
    q: "How are the research areas connected?",
    a: "Robotics draws on disciplines such as automation, artificial intelligence, sensing, and networking. The site groups these topics to make those connections easier to explore.",
  },
  {
    id: "r1",
    category: "roadmap",
    q: "How many phases are on the roadmap?",
    a: "The roadmap describes areas the platform aims to explore, such as research curation, educational resources, and connected-systems topics. It should not be read as a guarantee of delivery dates.",
  },
  {
    id: "r2",
    category: "roadmap",
    q: "Where can I track delivery progress?",
    a: "Visit the Roadmap page for the current high-level direction. Published plans may change as research priorities evolve.",
  },
  {
    id: "b1",
    category: "buying",
    q: "Where should I start learning about robotics?",
    a: "Start with the Research page for an overview, then explore the Blog for introductory articles and topic guides.",
  },
  {
    id: "b2",
    category: "buying",
    q: "How can I find articles on a specific topic?",
    a: "Use the search and category filters on the Blog and News pages to browse available content.",
  },
  {
    id: "s1",
    category: "security",
    q: "How should I assess technical claims?",
    a: "Review the source and context of each article, compare claims with independent technical references, and treat emerging research as subject to change.",
  },
  {
    id: "s2",
    category: "security",
    q: "How do I avoid scams?",
    a: "Be cautious with unexpected messages and links. Do not share passwords or account credentials, and verify sources before downloading files or following technical instructions.",
  },
  {
    id: "c1",
    category: "community",
    q: "How can I join the community?",
    a: "Use the community links provided on the site to follow discussions and share ideas about robotics and connected technologies.",
  },
  {
    id: "c2",
    category: "community",
    q: "Can readers contribute ideas?",
    a: "Readers can suggest topics and share feedback through the available contact or community channels.",
  },
  {
    id: "x1",
    category: "technical",
    q: "Where can developers find documentation?",
    a: "Start with the research articles and linked references. Technical documentation is included where available on individual resources.",
  },
  {
    id: "x2",
    category: "technical",
    q: "Does RNR build or certify robots?",
    a: "The site is focused on research and educational content. Do not assume that a device has been built, tested, or certified unless a specific publication clearly states that.",
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
