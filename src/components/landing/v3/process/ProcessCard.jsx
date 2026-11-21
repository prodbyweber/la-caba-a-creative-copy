import React from "react";
import { inkFor } from "../builder/PillCard";
import MiniPanel from "./MiniPanels";

/** Tarjeta grande de "Cómo funciona": cubo numerado, copy, viñetas y mini panel. */
export default function ProcessCard({ step, index = 0, live = false }) {
  const color = step.color || "#080808";
  const ink = inkFor(color);
  const dark = ink === "#f1efe8";
  const bullets = (step.bullets || []).filter(Boolean).slice(0, 2);

  return (
    <article
      className={`ccl-how__card ${dark ? "ccl-how__card--dark" : ""} ${live ? "is-live" : ""}`}
      style={{
        background: color,
        color: ink,
        "--card-bg": color,
        "--card-ink": ink,
        "--d": `${index * 90}ms`,
      }}
    >
      <div className="ccl-how__top">
        <span className="ccl-how__num">{step.num || String(index + 1).padStart(2, "0")}</span>
        <h3 className="ccl-how__name">{step.title}</h3>
        {step.text && <p className="ccl-how__text">{step.text}</p>}
        {bullets.length > 0 && (
          <ul className="ccl-how__list">
            {bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </div>

      <MiniPanel kind={step.panel} />
    </article>
  );
}