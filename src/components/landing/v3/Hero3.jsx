import React from "react";
import HeroMedia from "./HeroMedia";
import CtaLink from "./CtaLink";
import { ArrowRight } from "lucide-react";

export default function Hero3({ section, settings, videos = [] }) {
  const lines = (section?.title || "Construye tu catálogo.")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <section className="ccl-snap ccl-snap--dark ccl-hero" id="top">
      <div className="ccl-hero__media">
        <HeroMedia videos={videos} poster={settings?.hero_poster_url || ""} />
      </div>
      <div className="ccl-hero__veil" />

      <div className="ccl-wrap ccl-snap__inner">
        {section?.eyebrow && <span className="ccl-eyebrow">{section.eyebrow}</span>}

        <h1 className="ccl-display ccl-h1 ccl-hero__title">
          {lines.map((line, i) => (
            <span
              key={line}
              className={i > 0 ? "ccl-hero__title-alt" : undefined}
              style={{ display: "block" }}
            >
              {line}
            </span>
          ))}
        </h1>

        {section?.subtitle && <p className="ccl-lead">{section.subtitle}</p>}

        {(section?.cta_label || section?.cta2_label) && (
          <div className="ccl-hero__ctas">
            {section?.cta_label && (
              <CtaLink to={section.cta_link} className="ccl-btn ccl-btn--primary">
                {section.cta_label} <ArrowRight size={14} />
              </CtaLink>
            )}
            {section?.cta2_label && (
              <CtaLink to={section.cta2_link} className="ccl-btn ccl-btn--ghost">
                {section.cta2_label}
              </CtaLink>
            )}
          </div>
        )}
      </div>
    </section>
  );
}