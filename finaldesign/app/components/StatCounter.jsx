"use client";

import { useEffect, useRef, useState } from "react";

function formatValue(value, format) {
  if (format === "comma") {
    return Math.round(value).toLocaleString("en-US");
  }
  return Math.round(value).toString();
}

export default function StatCounter({
  target,
  prefix = "",
  suffix = "",
  format = "plain",
  className,
}) {
  const ref = useRef(null);
  const [display, setDisplay] = useState(`${prefix}${formatValue(0, format)}${suffix}`);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let cancelled = false;

    function animate() {
      const duration = 1800;
      let startTime = null;

      function step(timestamp) {
        if (cancelled) return;
        if (startTime === null) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = target * eased;
        setDisplay(`${prefix}${formatValue(current, format)}${suffix}`);

        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          setDisplay(`${prefix}${formatValue(target, format)}${suffix}`);
        }
      }

      window.requestAnimationFrame(step);
    }

    if (!("IntersectionObserver" in window)) {
      animate();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={ref} className={className}>
      {display}
    </div>
  );
}
