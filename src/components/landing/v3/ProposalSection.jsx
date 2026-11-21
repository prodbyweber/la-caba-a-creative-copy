import React from "react";
import CtaLink from "./CtaLink";

const HIGHLIGHT = "estructura";

/** "Tu música, con estructura.": titular palabra a palabra y tres bloques cortos. */
export default function ProposalSection({ section, blocks = [] }) {
  const list = blocks.filter((b) => b.is_visible !== false && (b.label || b.text));
  const words = (section?.title || "Tu música, con estructura.").split(" ");

  return (
    <section className="ccl-snap ccl-snap--cream ccl-snap--auto ccl-prop2" id="propuesta">
      <div className="ccl-wrap ccl-snap__inner">
        {section?.eyebrow && <span className="ccl-eyebrow">{section.eyebrow}</span>}

        <h2 className="ccl-display ccl-prop2__title">
          {words.map((word, i) => {
            const clean = word.toLowerCase().replace(/[.,]/g, "");
            return (
              <span
                key={`${word}-${i}`}
                className={`ccl-word ${clean === HIGHLIGHT ? "is-hi" : ""}`}
                style={{ "--d": `${i * 70}ms` }}
              >
                {word}{" "}
              </span>
            );
          })}
        </h2>

        {section?.subtitle && <p className="ccl-lead">{section.subtitle}</p>}

        <div className="ccl-prop2__blocks">
          {list.map((block, i) => (
            <article className="ccl-prop2__item" key={block.id || block.label} style={{ "--d": `${180 + i * 110}ms` }}>
              <span className="ccl-prop2__num">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="ccl-prop2__label">{block.label}</h3>
              {block.text && <p className="ccl-prop2__text">{block.text}</p>}
            </article>
          ))}
        </div>

        {section?.cta_label && (
          <div className="ccl-prop2__cta">
            <CtaLink to={section.cta_link || "#comenzar"} className="ccl-btn ccl-btn--primary">
              {section.cta_label}
            </CtaLink>
          </div>
        )}
      </div>
    </section>
  );
}