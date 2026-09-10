"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import styles from "../../tokenomics/tokenomics.module.css";
import { ALLOCATION } from "./data";

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;
  return (
    <div className={styles.chartTooltip}>
      <span className={styles.chartTooltipPercent}>{item.percent}%</span>
      {item.name}
    </div>
  );
}

const EMPTY_DATA = ALLOCATION.map((entry) => ({ ...entry, percent: 0.0001 }));

export default function TokenDistributionChart() {
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapRef = useRef(null);
  const isInView = useInView(wrapRef, { once: true, margin: "-80px" });

  return (
    <div className={styles.donutWrap} ref={wrapRef}>
      <div className={styles.donutChartBox}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              key={isInView ? "filled" : "empty"}
              data={isInView ? ALLOCATION : EMPTY_DATA}
              dataKey="percent"
              nameKey="name"
              innerRadius="64%"
              outerRadius="96%"
              paddingAngle={1.4}
              startAngle={90}
              endAngle={-270}
              isAnimationActive
              animationDuration={1400}
              animationEasing="ease-out"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(-1)}
            >
              {ALLOCATION.map((entry, index) => (
                <Cell
                  key={entry.key}
                  fill={entry.color}
                  stroke="#050505"
                  strokeWidth={3}
                  opacity={activeIndex === -1 || activeIndex === index ? 1 : 0.38}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <motion.div
          className={styles.donutCenter}
          initial={{ opacity: 0, scale: 0.86 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className={styles.donutCenterValue}>1B</span>
          <span className={styles.donutCenterUnit}>WLT</span>
          <span className={styles.donutCenterCaption}>Total Supply</span>
        </motion.div>
      </div>
    </div>
  );
}
