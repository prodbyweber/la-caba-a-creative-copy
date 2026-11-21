import React, { useEffect, useState } from "react";
import { ArrowDown, ArrowRight } from "lucide-react";
import { LOGO } from "./constants";
import { scrollToSection } from "./scrollToSection";

function Keywords({ words = [] }) {
  const list = (words || []).filter(Boolean);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (list.length < 2) return undefined;
    const timer = setInterval(() => setIndex((v) => (v + 1) % list.length), 1700);
    return () => clearInterval(timer);
  }, [list.length]);

  if (!list.length) return null;

  return (
    <div className="ccl-road__keys" aria-hidden="true">
      {list.map((word, i) => (
        <React.Fragment key={word}>
          {i > 0 && <span className="ccl-road__dotsep">·</span>}
          <span className={i === index ? "is-on" : ""}>{word}</span>
        </React.Fragment>
      ))}
    </div>
  );
}

/** Onboarding en pasos a pantalla completa con hilo de progreso vertical. */
export default function RoadmapSection({ section, steps = [] }) {
  const list = steps.filter((s) => s.is_visible !== false);
  const intro = list.find((s) => s.is_intro);
  const rest = list.filter((s) => !s.is_intro);

  return (
    <div className="ccl-roadmap" id="roadmap">
      {intro && (
        <section className="ccl-snap ccl-road__intro">
          <div className="ccl-wrap ccl-snap__inner ccl-road__intro-inner">
            {section?.eyebrow && <span className="ccl-road__eyebrow">{section.eyebrow}</span>}
            {section?.title && <span className="ccl-road__kicker">{section.title}</span>}
            <img className="ccl-road__logo" src={LOGO} alt="Cabaña Creative" />
            <h2 className="ccl-display ccl-road__claim">{intro.title}</h2>
            {intro.subline && <p className="ccl-road__sub">{intro.subline}</p>}
            <Keywords words={intro.keywords} />
          </div>
          <span className="ccl-road__hint">
            <ArrowDown size={12} /> Desliza
          </span>
        </section>
      )}

      {rest.map((step, i) => (
        <section className="ccl-snap ccl-road" key={step.id || step.num || step.title}>
          <div className="ccl-road__rail" aria-hidden="true">
            <span className="ccl-road__line" />
            <span className="ccl-road__fill" />
            <span className="ccl-road__dot" />
          </div>

          <div className="ccl-wrap ccl-snap__inner ccl-road__body">
            {step.num && <span className="ccl-road__num">{step.num}</span>}
            <h2 className="ccl-display ccl-road__title">{step.title}</h2>
            {step.text && <p className="ccl-road__text">{step.text}</p>}
            {step.cta_label && (
              <button
                type="button"
                className="ccl-btn ccl-btn--primary"
                onClick={() => scrollToSection(String(step.cta_link || "#comenzar").replace("#", ""))}
              >
                {step.cta_label} <ArrowRight size={14} />
              </button>
            )}
          </div>

          {i < rest.length - 1 && (
            <span className="ccl-road__hint">
              <ArrowDown size={12} /> Desliza
            </span>
          )}
        </section>
      ))}
    </div>
  );
}