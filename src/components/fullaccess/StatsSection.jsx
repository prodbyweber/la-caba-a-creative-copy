import React from "react";
import { motion } from "framer-motion";

function value(stats) {
  if (stats.value === null || stats.value === undefined) return "—";
  return `${stats.prefix || ""}${stats.value}${stats.suffix || ""}`;
}

export default function StatsSection({ settings, stats }) {
  return (
    <section className="fa-sec fa-sec--line" id="trayectoria">
      <div className="fa-wrap">
        <div className="fa-sec-head">
          <span className="fa-eyebrow">Trayectoria</span>
          <h2 className="fa-display fa-h2" style={{ textTransform: "none" }}>
            {settings.stats_title}
          </h2>
          <p className="fa-lead">{settings.stats_intro}</p>
        </div>

        <div className="fa-stats">
          {stats.map((stat, index) => (
            <motion.div
              className="fa-stat"
              key={`${stat.label}-${index}`}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: index * 0.06 }}
            >
              <span className="fa-stat__value">{value(stat)}</span>
              <span className="fa-stat__label">{stat.label}</span>
              {stat.note ? <span className="fa-stat__note">{stat.note}</span> : null}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}