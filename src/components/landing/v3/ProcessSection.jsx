import React, { useEffect, useRef, useState } from "react";

const CARD_COLORS = ["#ff5833", "#f1efe8", "#c9431f", "#141414"];
const CARD_INKS = ["#0a0a0b", "#0a0a0b", "#f1efe8", "#f1efe8"];

const scrollParent = (node) => {
  let el = node?.parentElement;
  while (el && el !== document.body) {
    if (/(auto|scroll)/.test(window.getComputedStyle(el).overflowY)) return el;
    el = el.parentElement;
  }
  return document.documentElement;
};

/** Cómo funciona: panel fijo y tarjetas que se activan con el scroll. */
export default function ProcessSection({ section, steps = [] }) {
  const list = steps.filter((s) => s.is_visible !== false);
  const ref = useRef(null);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || list.length === 0) return undefined;

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      setProgress(p);
      setActive(Math.min(list.length - 1, Math.floor(p * list.length)));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [list.length]);

  if (list.length === 0) return null;

  const goTo = (index) => {
    const el = ref.current;
    if (!el) return;
    const root = scrollParent(el);
    const rect = el.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    const target = root.scrollTop + rect.top + (total * (index + 0.35)) / list.length;
    root.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
  };

  return (
    <section className="ccl-how" id="proceso" ref={ref}>
      <div className="ccl-how__sticky">
        <div className="ccl-wrap ccl-how__inner">
          <span className="ccl-eyebrow">Proceso</span>
          <h2 className="ccl-display ccl-how__title">{section?.title || "Cómo funciona"}</h2>
          <p className="ccl-how__lead">{section?.subtitle || "Cuatro pasos. Sin vueltas."}</p>

          <div className="ccl-how__grid">
            {list.map((step, i) => (
              <button
                key={step.id || step.title}
                type="button"
                className={`ccl-step2${i === active ? " is-on" : ""}`}
                style={{ background: CARD_COLORS[i % 4], color: CARD_INKS[i % 4] }}
                onClick={() => goTo(i)}
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
            <span className="ccl-how__meter-bar" style={{ width: `${Math.max(5, progress * 100)}%` }} />
          </div>
        </div>
      </div>
    </section>
  );
}