"use client";

import { useEffect } from "react";

const SELECTORS = [
  ".ecosystem-kicker",
  ".ecosystem-heading",
  ".ecosystem-description",
  ".why-novax-kicker",
  ".why-novax-heading",
  ".why-feature",
  ".tokenomics-kicker",
  ".tokenomics-heading",
  ".tokenomics-row",
  ".mission-kicker",
  ".mission-heading",
  ".mission-description p",
  ".roadmap-kicker",
  ".roadmap-phase-tag",
  ".roadmap-heading",
  ".roadmap-lead-list li",
  ".latest-news-kicker",
  ".latest-news-heading",
  ".latest-news-description",
  ".latest-news-link",
  ".news-card",
  ".ecosystem-cta-copy h2",
  ".ecosystem-cta-copy p",
  ".ecosystem-cta-action",
];

export default function ScrollReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll(SELECTORS.join(","));
    if (!elements.length) return;

    if (!("IntersectionObserver" in window)) {
      elements.forEach((el) => {
        el.classList.add("sr-fade-up", "is-visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    elements.forEach((el, index) => {
      el.classList.add("sr-fade-up");
      el.style.transitionDelay = `${(index % 4) * 90}ms`;
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
