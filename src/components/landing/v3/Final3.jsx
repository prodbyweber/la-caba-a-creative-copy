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
          {section?.eyebrow && <span className="ccl-eyebrow">{section.eyebrow}</span>}
          <h2 className="ccl-display ccl-h1 ccl-final__title">
            {section?.title || "Tu catálogo empieza en la cabaña."}
          </h2>
          {section?.body && <p className="ccl-final__text">{section.body}</p>}

          <div className="ccl-final__ctas">
            <CtaLink to={section?.cta_link || SESSION_CTA} className="ccl-btn ccl-btn--primary ccl-btn--xl">
              {section?.cta_label || "Agendar sesión de descubrimiento"} <ArrowRight size={15} />
            </CtaLink>
          </div>

          {section?.cta2_label && (
            <CtaLink to={section.cta2_link} className="ccl-final__alt">
              {section.cta2_label}
            </CtaLink>
          )}
        </div>
      </div>

      <div className="ccl-final__tail">
        <Footer3 settings={settings} />
      </div>
    </section>
  );
}