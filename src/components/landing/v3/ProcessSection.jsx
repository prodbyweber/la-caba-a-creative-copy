import React, { useEffect, useRef, useState } from "react";
import CtaLink from "./CtaLink";
import ProcessCard from "./process/ProcessCard";

/** Cómo funciona: fondo naranja, tarjetas grandes de color y paneles CSS animados. */
export default function ProcessSection({ section, steps = [] }) {
  const list = steps.filter((s) => s.is_visible !== false);
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
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="ccl-how" id="proceso" ref={ref}>
      <div className="ccl-wrap">
        {section?.eyebrow && <span className="ccl-eyebrow ccl-how__eyebrow">{section.eyebrow}</span>}
        <h2 className="ccl-display ccl-how__title">{section?.title || "Cómo funciona"}</h2>
        {section?.subtitle && <p className="ccl-how__sub">{section.subtitle}</p>}

        <div className="ccl-how__grid">
          {list.map((step, i) => (
            <ProcessCard key={step.id || step.title} step={step} index={i} live={live} />
          ))}
        </div>

        {section?.cta_label && (
          <div className="ccl-how__cta">
            <CtaLink to={section.cta_link || "#comenzar"} className="ccl-btn ccl-btn--ink">
              {section.cta_label}
            </CtaLink>
          </div>
        )}
      </div>
    </section>
  );
}