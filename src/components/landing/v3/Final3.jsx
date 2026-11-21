import React from "react";
import { ArrowRight } from "lucide-react";
import { SESSION_CTA } from "./constants";
import CtaLink from "./CtaLink";
import Footer3 from "./Footer3";

export default function Final3({ settings, section }) {
  return (
    <section className="ccl-snap ccl-final" id="final">
      <div className="ccl-final__screen">
        <div className="ccl-wrap ccl-final__inner">
          <span className="ccl-eyebrow">{section?.eyebrow || "Empezar"}</span>
          <h2 className="ccl-display ccl-h1 ccl-final__title">
            {section?.title || "Lanza tu catálogo."}
          </h2>

          <div className="ccl-final__ctas">
            <CtaLink to={section?.cta_link || SESSION_CTA} className="ccl-btn ccl-btn--primary">
              {section?.cta_label || "Enviar mi proyecto"} <ArrowRight size={14} />
            </CtaLink>
            {section?.cta2_label && (
              <CtaLink to={section?.cta2_link || SESSION_CTA} className="ccl-btn ccl-btn--ghost">
                {section.cta2_label}
              </CtaLink>
            )}
          </div>
        </div>
      </div>

      <div className="ccl-final__tail">
        <Footer3 settings={settings} />
      </div>
    </section>
  );
}