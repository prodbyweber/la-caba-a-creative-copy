import React, { useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import { LOGO } from "./constants";
import { scrollToSection } from "./scrollToSection";
import CtaLink from "./CtaLink";

export default function ManifestoSection({ section }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const [keyword, setKeyword] = useState(0);

  const keywords = (section?.body || "Explorar, Descubrir, Cabaña")
    .split(",")
    .map((w) => w.trim())
    .filter(Boolean);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (!("IntersectionObserver" in window)) {
      setInView(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    // Red de seguridad: el contenido siempre acaba visible.
    const safety = setTimeout(() => setInView(true), 3000);
    return () => {
      io.disconnect();
      clearTimeout(safety);
    };
  }, []);

  useEffect(() => {
    if (!inView || keywords.length < 2) return undefined;
    const id = setInterval(() => setKeyword((k) => (k + 1) % keywords.length), 2200);
    return () => clearInterval(id);
  }, [inView, keywords.length]);

  return (
    <section className={`ccl-snap ccl-manifesto ${inView ? "is-in" : ""}`} id="manifiesto" ref={ref}>
      <span className="ccl-manifesto__reveal" aria-hidden="true" />

      <div className="ccl-wrap ccl-manifesto__inner">
        <img className="ccl-manifesto__logo" src={LOGO} alt="Cabaña Creative" />

        <h2 className="ccl-display ccl-manifesto__title">{section?.title}</h2>
        {section?.subtitle && <p className="ccl-manifesto__sub">{section.subtitle}</p>}

        <div className="ccl-manifesto__kw" aria-live="polite">
          {keywords.map((word, i) => (
            <span key={word} className={i === keyword ? "is-on" : ""}>
              {word}
            </span>
          ))}
        </div>

        <button type="button" className="ccl-manifesto__scroll" onClick={() => scrollToSection("estudio")}>
          Desliza <ArrowDown size={14} className="ccl-manifesto__arrow" />
        </button>

        {section?.cta_label && (
          <CtaLink to={section.cta_link} className="ccl-btn ccl-manifesto__cta">
            {section.cta_label}
          </CtaLink>
        )}
      </div>
    </section>
  );
}