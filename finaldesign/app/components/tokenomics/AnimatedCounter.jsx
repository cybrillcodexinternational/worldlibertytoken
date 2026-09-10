"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

function formatValue(value, format, prefix, suffix) {
  const rounded = Math.round(value);
  const str = format === "comma" ? rounded.toLocaleString("en-US") : String(rounded);
  return `${prefix}${str}${suffix}`;
}

export default function AnimatedCounter({
  value,
  format = "plain",
  prefix = "",
  suffix = "",
  duration = 1.6,
  className,
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [display, setDisplay] = useState(formatValue(0, format, prefix, suffix));

  useEffect(() => {
    if (!isInView) return undefined;

    let raf;
    const start = performance.now();
    const ms = duration * 1000;

    function step(now) {
      const progress = Math.min((now - start) / ms, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(formatValue(value * eased, format, prefix, suffix));
      if (progress < 1) {
        raf = requestAnimationFrame(step);
      }
    }

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [isInView, value, duration, format, prefix, suffix]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
