import React, { useEffect, useRef, useState } from "react";

const CARD_COLORS = ["#ff5833", "#f1efe8", "#c9431f", "#141414"];
const CARD_INKS = ["#0a0a0b", "#0a0a0b", "#f1efe8", "#f1efe8"];
const STEP_MS = 2200;

/** Cómo funciona: una pantalla fija, las cuatro tarjetas y el paso activo pasando solo. */
export default function ProcessSection({ section, steps = [] }) {
  const list = steps.filter((s) => s.is_visible !== false);
  const ref = useRef(null);
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || list.length === 0) return undefined;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setInView(entry.isIntersecting && entry.intersectionRatio > 0.5);
      },
      { threshold: [0, 0.5, 0.9] }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [list.length]);

  useEffect(() => {
    if (!inView || list.length < 2) return undefined;
    const timer = setTimeout(() => setActive((v) => (v + 1) % list.length), STEP_MS);
    return () => clearTimeout(timer);
  }, [inView, list.length, active]);

  if (list.length === 0) return null;

  return (
    <section className="ccl-snap ccl-how" id="proceso" ref={ref}>
      <div className="ccl-wrap ccl-snap__inner ccl-how__inner">
        <span className="ccl-eyebrow">Proceso</span>
        <h2 className="ccl-display ccl-how__title">{section?.title || "Cómo funciona"}</h2>
        <p className="ccl-how__lead">{section?.subtitle || "Sin vueltas."}</p>

        <div className="ccl-how__grid">
          {list.map((step, i) => (
            <button
              key={step.id || step.title}
              type="button"
              className={`ccl-step2${i === active ? " is-on" : ""}`}
              style={{ background: CARD_COLORS[i % 4], color: CARD_INKS[i % 4] }}
              onClick={() => setActive(i)}
              aria-current={i === active}
            >
              <span className="ccl-step2__num">{step.num || `0${i + 1}`}</span>
              <span className="ccl-step2__copy">
                <span className="ccl-step2__title">{step.title}</span>
                {step.text && <span className="ccl-step2__text">{step.text}</span>}
              </span>
            </button>
          ))}
        </div>

        <div className="ccl-how__meter" aria-hidden="true">
          <span
            className="ccl-how__meter-bar"
            style={{ width: `${((active + 1) / list.length) * 100}%` }}
          />
        </div>
      </div>
    </section>
  );
}