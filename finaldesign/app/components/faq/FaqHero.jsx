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
            Find answers about robotics research, learning resources, and the
            technologies explored by Robotic Networks Research.
          </p>
        </div>

        <video
          className="faq-planet"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="FAQ hero animation"
        >
          <source src="/images/faq-hero-black-background.mp4" type="video/mp4" />
        </video>
      </div>

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
