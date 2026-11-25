import React from "react";
import Counter, { formatCompact } from "@/components/landing/v3/Counter";

const ROWS = [
  { value: 100, prefix: "+", label: "Artistas desarrollados" },
  { value: 1000000, prefix: "+", label: "Reproducciones" },
  { value: 30, prefix: "+", label: "Países" },
];

export default function StatsSection() {
  return (
    <section className="fa-statsrow" aria-label="Trayectoria">
      <div className="fa-wrap">
        <div className="fa-statsrow__grid">
          {ROWS.map((row) => (
            <div className="fa-statsrow__cell" key={row.label}>
              <span className="fa-statsrow__value">
                <Counter
                  value={row.value}
                  prefix={row.prefix}
                  format={formatCompact}
                  duration={2000}
                />
              </span>
              <span className="fa-statsrow__label">{row.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}