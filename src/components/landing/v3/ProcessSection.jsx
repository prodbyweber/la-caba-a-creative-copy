import React, { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

const AUTOPLAY_MS = 6500;

/** Cómo funciona: una etapa protagonista a la vez, centrada, con progreso. */
export default function ProcessSection({ section, steps = [] }) {
  const list = steps.filter((s) => s.is_visible !== false);
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto || list.length < 2) return undefined;
    const timer = setInterval(() => setActive((i) => (i + 1) % list.length), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [auto, list.length]);

  if (!list.length) return null;

  const current = list[Math.min(active, list.length - 1)];
  const total = String(list.length).padStart(2, "0");

  const go = (next) => {
    setAuto(false);
    setActive((next + list.length) % list.length);
  };

  return (
    <section className="ccl-snap ccl-how" id="proceso">
      <div className="ccl-wrap ccl-snap__inner ccl-how__inner">
        <h2 className="ccl-display ccl-how__title">{section?.title || "Cómo funciona"}</h2>

        <div className="ccl-how__progress" role="tablist" aria-label="Etapas del proceso">
          {list.map((step, i) => (
            <button
              key={step.id || step.title}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Etapa ${i + 1}: ${step.title}`}
              className={`ccl-how__seg${i === active ? " is-on" : ""}${i < active ? " is-done" : ""}`}
              onClick={() => go(i)}
            >
              <span className="ccl-how__seg-bar" />
            </button>
          ))}
        </div>

        <div className="ccl-how__panel" key={current.id || current.title}>
          <span className="ccl-how__num">{current.num || `0${active + 1}`}</span>
          <h3 className="ccl-display ccl-how__step">{current.title}</h3>
          <p className="ccl-how__text">{current.text}</p>
        </div>

        <div className="ccl-how__nav">
          <button
            type="button"
            className="ccl-how__arrow"
            onClick={() => go(active - 1)}
            aria-label="Etapa anterior"
          >
            <ArrowLeft size={18} strokeWidth={2} />
          </button>
          <span className="ccl-how__count">
            {String(active + 1).padStart(2, "0")} <em>/ {total}</em>
          </span>
          <button
            type="button"
            className="ccl-how__arrow"
            onClick={() => go(active + 1)}
            aria-label="Etapa siguiente"
          >
            <ArrowRight size={18} strokeWidth={2} />
          </button>
        </div>
      </div>
    </section>
  );
}