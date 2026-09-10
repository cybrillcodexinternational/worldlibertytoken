"use client";

import Link from "next/link";
import { CircleHelp, FileText, ShieldCheck, Users } from "lucide-react";

const STRIP = [
  { title: "Transparent Answers", Icon: ShieldCheck },
  { title: "Verified Information", Icon: FileText },
  { title: "Community Focused", Icon: Users },
  {
    title: (
      <>
        Still Have Questions?
        <br />
        We&apos;re Here To Help.
      </>
    ),
    Icon: CircleHelp,
  },
];

export default function FaqHero() {
  return (
    <section className="faq-hero">
      <div className="tp-inner faq-hero-inner">
        <div className="faq-hero-copy">
          <p className="faq-crumb">
            <Link href="/">Home</Link>
            <span className="faq-crumb-sep">›</span>
            <span>FAQ</span>
          </p>
          <h1 className="faq-hero-title">
            Frequently
            <br />
            Asked Questions
          </h1>
          <p className="faq-hero-text">
            Find clear answers to common questions about World Liberty Token,
            our ecosystem, and the future we are building together.
          </p>
        </div>

        <div className="faq-hero-quote">
          <span className="faq-hero-quote-bar" />
          <p>
            Know More
            <br />
            Build Together
          </p>
        </div>
      </div>

      <div className="faq-planet" aria-hidden="true" />

      <div className="faq-strip">
        <div className="tp-inner faq-strip-inner">
          {STRIP.map((item, index) => {
            const Icon = item.Icon;
            return (
              <div className="faq-strip-item" key={index}>
                <span className="faq-strip-icon">
                  <Icon size={36} strokeWidth={1.5} />
                </span>
                <p className="faq-strip-title">{item.title}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
