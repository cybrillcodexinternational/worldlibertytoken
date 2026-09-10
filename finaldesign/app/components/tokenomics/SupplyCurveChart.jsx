"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import styles from "../../tokenomics/tokenomics.module.css";
import { SUPPLY_CURVE } from "./data";

const LINE_COLOR = "hsl(70.79deg 85% 62%)";

function formatSupply(value) {
  if (value >= 1000000000) return "1.0B";
  if (value >= 1000000) return `${Math.round(value / 1000000)}M`;
  return "0";
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className={styles.chartTooltip}>
      <span className={styles.chartTooltipPercent}>{formatSupply(payload[0].value)}</span>
      Month {label}
    </div>
  );
}

function GlowDot({ cx, cy }) {
  if (cx == null || cy == null) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={9} fill={LINE_COLOR} fillOpacity={0.18} />
      <circle cx={cx} cy={cy} r={5} fill={LINE_COLOR} />
    </g>
  );
}

export default function SupplyCurveChart() {
  const wrapRef = useRef(null);
  const isInView = useInView(wrapRef, { once: true, margin: "-80px" });

  return (
    <div className={styles.chartCard} ref={wrapRef}>
      <div className={styles.chartCardHead}>
        <p className={styles.chartCardTitle}>Token Release Curve</p>
        <span className={styles.chartLegend}>
          <span className={styles.chartLegendDot} />
          Cumulative Supply
        </span>
      </div>
      <div className={styles.chartPlot}>
        <div className={styles.chartAnnotation}>
          <strong>1,000,000,000 WLT</strong>
          <span>Total Supply Reached</span>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            key={isInView ? "drawn" : "idle"}
            data={SUPPLY_CURVE}
            margin={{ top: 18, right: 22, left: 4, bottom: 22 }}
          >
            <defs>
              <linearGradient id="supplyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={LINE_COLOR} stopOpacity={0.45} />
                <stop offset="58%" stopColor={LINE_COLOR} stopOpacity={0.16} />
                <stop offset="100%" stopColor={LINE_COLOR} stopOpacity={0} />
              </linearGradient>
              <filter id="supplyGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical horizontal />
            <XAxis
              dataKey="month"
              ticks={[0, 12, 24, 36, 48, 60]}
              tick={{ fill: "#8a8a8a", fontSize: 12 }}
              axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
              tickLine={false}
              dy={8}
              label={{
                value: "Months",
                position: "insideBottom",
                offset: -10,
                fill: "#8a8a8a",
                fontSize: 12,
              }}
            />
            <YAxis
              domain={[0, 1000000000]}
              ticks={[0, 200000000, 400000000, 600000000, 800000000, 1000000000]}
              tickFormatter={formatSupply}
              tick={{ fill: "#8a8a8a", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.12)" }} />
            <Area
              type="monotone"
              dataKey="supply"
              stroke="none"
              fill="url(#supplyGradient)"
              isAnimationActive={isInView}
              animationDuration={1500}
              animationEasing="ease-out"
            />
            <Line
              type="monotone"
              dataKey="supply"
              stroke={LINE_COLOR}
              strokeWidth={3}
              dot={<GlowDot />}
              activeDot={false}
              filter="url(#supplyGlow)"
              isAnimationActive={isInView}
              animationDuration={1500}
              animationEasing="ease-out"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
