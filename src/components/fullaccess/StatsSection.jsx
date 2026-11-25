import React from "react";
import { motion } from "framer-motion";

function value(stat) {
  if (stat.value === null || stat.value === undefined) return "—";
  return `${stat.prefix || ""}${stat.value}${stat.suffix || ""}`;
}

export default function StatsSection({ stats }) {
  if (!stats?.length) return null;

  return (
    <section className="fa-credits" id="trayectoria">
      <div className="fa-wrap">
        <div className="fa-credits__grid">
          {stats.slice(0, 3).map((stat, index) => (
            <motion.div
              className="fa-credit"
              key={`${stat.label}-${index}`}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: index * 0.06 }}
            >
              <span className="fa-credit__value">{value(stat)}</span>
              <span className="fa-credit__label">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}