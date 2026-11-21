import React, { useEffect, useRef, useState } from "react";

/** Ejemplo ilustrativo del avance de un proyecto. No usa datos reales. */
export default function FollowUpSection({ section, stages = [] }) {
  const list = stages.filter((s) => s.is_visible !== false && s.label);
  const ref = useRef(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setLive(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setLive(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (list.length === 0) return null;

  return (
    <section className="ccl-flow" id="seguimiento" ref={ref}>
      <div className="ccl-wrap">
        <span className="ccl-tag">{section?.eyebrow || "Ejemplo ilustrativo"}</span>
        <h2 className="ccl-display ccl-h2 ccl-flow__title">{section?.title || "Así avanza un proyecto."}</h2>
        {section?.subtitle && <p className="ccl-small">{section.subtitle}</p>}

        <div className={`ccl-flow__card ${live ? "is-live" : ""}`}>
          {list.map((stage, i) => (
            <div className="ccl-flow__row" key={stage.id || stage.label} style={{ "--d": `${i * 130}ms` }}>
              <div className="ccl-flow__head">
                <span className="ccl-flow__label">{stage.label}</span>
                <span className="ccl-flow__pct">{Math.round(stage.progress || 0)}%</span>
              </div>
              <div className="ccl-flow__bar">
                <i style={{ "--w": `${Math.max(0, Math.min(100, stage.progress || 0))}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}