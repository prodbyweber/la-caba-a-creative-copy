import React, { useEffect, useState } from "react";

export function inkFor(hex) {
  const raw = String(hex || "#141414").replace("#", "");
  const full = raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw;
  const r = parseInt(full.slice(0, 2), 16) || 0;
  const g = parseInt(full.slice(2, 4), 16) || 0;
  const b = parseInt(full.slice(4, 6), 16) || 0;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62 ? "#080808" : "#f1efe8";
}

const VISIBLE = 8;

/** Tarjeta del configurador con píldoras y demo automática. */
export default function PillCard({ card, index = 0, selected = [], onToggle, demo = true }) {
  const options = card.options || [];
  const [demoIndex, setDemoIndex] = useState(-1);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!demo || options.length === 0) {
      setDemoIndex(-1);
      return undefined;
    }
    let i = 0;
    let interval = 0;
    const start = setTimeout(() => {
      setDemoIndex(0);
      interval = setInterval(() => {
        i = (i + 1) % options.length;
        setDemoIndex(i);
      }, 1100);
    }, index * 380);
    return () => {
      clearTimeout(start);
      if (interval) clearInterval(interval);
    };
  }, [demo, index, options.length]);

  const many = options.length > VISIBLE;
  const head = options.slice(0, VISIBLE);
  const rest = options.slice(VISIBLE);

  const pill = (option) => {
    const isOn = selected.includes(option);
    const isDemo = demo && !isOn && demoIndex === options.indexOf(option);
    return (
      <button
        key={option}
        type="button"
        className={`ccl-pill ${isOn ? "is-on" : ""} ${isDemo ? "is-demo" : ""}`}
        onClick={() => onToggle(option)}
        aria-pressed={isOn}
      >
        {option}
      </button>
    );
  };

  return (
    <div
      className={`ccl-bcard ${inkFor(card.color) === "#f1efe8" ? "ccl-bcard--dark" : ""}`}
      style={{ background: card.color || "#141414", color: inkFor(card.color) }}
    >
      <div className="ccl-bcard__head">
        <span className="ccl-bcard__num">{String(index + 1).padStart(2, "0")}</span>
        <h3 className="ccl-bcard__title">{card.title}</h3>
        {card.multi && <span className="ccl-bcard__hint">varias opciones</span>}
      </div>

      <div className="ccl-bcard__pills">{head.map(pill)}</div>

      {many && expanded && <div className="ccl-pills__more">{rest.map(pill)}</div>}

      {many && (
        <button
          type="button"
          className="ccl-pill ccl-pill--more"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          {expanded ? "Ver menos" : `+ más (${rest.length})`}
        </button>
      )}
    </div>
  );
}