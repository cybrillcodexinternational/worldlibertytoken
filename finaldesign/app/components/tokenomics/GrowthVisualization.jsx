"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import styles from "../../tokenomics/tokenomics.module.css";
import SectionReveal from "./SectionReveal";
import { GROWTH_DATA, GROWTH_METRICS } from "./data";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className={styles.chartTooltip}>
      <div style={{ marginBottom: 6, color: "#f2f2f2" }}>{label}</div>
      {payload.map((entry) => (
        <div key={entry.dataKey} style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </div>
      ))}
    </div>
  );
}

export default function GrowthVisualization() {
  return (
    <section className={`${styles.section} ${styles.growthSection}`}>
      <div className="tp-inner">
        <SectionReveal className={styles.growthHead}>
          <p className={styles.kicker}>Growth Visualization</p>
          <h2 className={styles.heading}>Built For Compounding Utility</h2>
          <p className={styles.text}>
            A conceptual view of how utility, ecosystem reach and adoption are
            designed to expand together over time.
          </p>
        </SectionReveal>
        <SectionReveal delay={0.15} className={styles.growthChartWrap}>
          <div className={styles.growthLegend}>
            {GROWTH_METRICS.map((m) => (
              <span key={m.key} className={styles.growthLegendItem}>
                <span className={styles.growthLegendDash} style={{ background: m.color }} />
                {m.label}
              </span>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={GROWTH_DATA} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="year"
                tick={{ fill: "#7a7a7a", fontSize: 11 }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#7a7a7a", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={36}
              />
              <Tooltip content={<CustomTooltip />} />
              {GROWTH_METRICS.map((m) => (
                <Line
                  key={m.key}
                  type="monotone"
                  dataKey={m.key}
                  name={m.label}
                  stroke={m.color}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive
                  animationDuration={1400}
                  animationEasing="ease-out"
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
          <p className={styles.growthNote}>
            Illustrative utility index for concept purposes only — not a price
            or financial forecast.
          </p>
        </SectionReveal>
      </div>
    </section>
  );
}
