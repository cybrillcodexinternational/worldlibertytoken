import Link from "next/link";
import { FileText, Gamepad2, Mail, Send } from "lucide-react";

const CONTACTS = [
  {
    label: "Email Support",
    value: "support@worldlibertytoken.com",
    href: "mailto:support@worldlibertytoken.com",
    Icon: Mail,
  },
  {
    label: "Join Telegram",
    value: "t.me/worldlibertytoken",
    href: "https://t.me/worldlibertytoken",
    Icon: Send,
  },
  {
    label: "Join Discord",
    value: "discord.gg/wlt",
    href: "https://discord.gg/wlt",
    Icon: Gamepad2,
  },
  {
    label: "Read Documentation",
    value: "docs.worldlibertytoken.com",
    href: "#",
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
              Our team is always ready to assist you. Get in touch
              <br />
              and we&apos;ll be happy to answer your questions.
            </p>
            <Link href="mailto:support@worldlibertytoken.com" className="faq-help-btn">
              Contact Us <span aria-hidden="true">→</span>
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
