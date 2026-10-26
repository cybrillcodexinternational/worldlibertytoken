import Link from "next/link";
import { FileText, Gamepad2, Mail, Send } from "lucide-react";

const CONTACTS = [
  {
    label: "Explore Research",
    value: "Robotics, automation, intelligent systems",
    href: "/tokenomics",
    Icon: Mail,
  },
  {
    label: "Read Articles",
    value: "Guides and learning resources",
    href: "/blog",
    Icon: Send,
  },
  {
    label: "Latest News",
    value: "Technology updates and research",
    href: "/news",
    Icon: Gamepad2,
  },
  {
    label: "Explore The Ecosystem",
    value: "Discover connected research topics",
    href: "/echosystem",
    Icon: FileText,
  },
];

export default function FaqHelp() {
  return (
    <section className="faq-help">
      <div className="tp-inner">
        <div className="faq-help-card">
          <div className="faq-help-copy">
            <p className="faq-help-kicker">Still Have Questions?</p>
            <h2 className="faq-help-title">
              We&apos;re Here
              <br />
              To Help.
            </h2>
            <p className="faq-help-text">
              Browse the research library, explore recent updates,
              <br />
              or find an answer in the frequently asked questions.
            </p>
            <Link href="/blog" className="faq-help-btn">
              Browse Articles <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="faq-help-visual">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="faq-help-art"
              src="/images/support.png"
              alt=""
            />
          </div>

          <div className="faq-help-contacts">
            {CONTACTS.map((item) => {
              const Icon = item.Icon;
              return (
                <a
                  key={item.label}
                  className="faq-help-link"
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                >
                  <span className="faq-help-link-icon">
                    <Icon size={18} strokeWidth={1.7} />
                  </span>
                  <span>
                    <strong>{item.label}</strong>
                    <em>{item.value}</em>
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
