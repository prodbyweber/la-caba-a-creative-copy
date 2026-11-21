import React from "react";
import CtaLink from "./CtaLink";

/** Preguntas frecuentes en acordeón (editable desde admin). */
export default function FaqSection({ section, items = [] }) {
  const list = items.filter((i) => i.is_visible !== false && i.question);

  return (
    <section className="ccl-faqsec" id="faq">
      <div className="ccl-wrap">
        {section?.eyebrow && <span className="ccl-eyebrow">{section.eyebrow}</span>}
        <h2 className="ccl-display ccl-h2 ccl-faqsec__title">{section?.title || "Preguntas frecuentes"}</h2>
        {section?.subtitle && <p className="ccl-lead">{section.subtitle}</p>}

        <div className="ccl-faq">
          {list.map((item) => (
            <details className="ccl-faq__item" key={item.id || item.question}>
              <summary className="ccl-faq__q">
                <span>{item.question}</span>
                <i aria-hidden="true">+</i>
              </summary>
              <p className="ccl-faq__a">{item.answer}</p>
            </details>
          ))}
        </div>

        {section?.cta_label && (
          <div className="ccl-faqsec__cta">
            <CtaLink to={section.cta_link || "#comenzar"} className="ccl-btn ccl-btn--primary">
              {section.cta_label}
            </CtaLink>
          </div>
        )}
      </div>
    </section>
  );
}