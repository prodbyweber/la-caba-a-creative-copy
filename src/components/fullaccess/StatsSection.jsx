import React from "react";

const ROWS = [
  { value: "+100", label: "Artistas desarrollados" },
  { value: "+1M", label: "Reproducciones" },
  { value: "+30", label: "Países" },
];

export default function StatsSection() {
  return (
    <section className="fa-statsrow" aria-label="Trayectoria">
      <div className="fa-wrap">
        <div className="fa-statsrow__grid">
          {ROWS.map((row) => (
            <div className="fa-statsrow__cell" key={row.label}>
              <span className="fa-statsrow__value">{row.value}</span>
              <span className="fa-statsrow__label">{row.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}