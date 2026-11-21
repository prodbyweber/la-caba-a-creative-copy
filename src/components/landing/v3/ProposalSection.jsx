import React from "react";

/** La propuesta: tres bloques cortos justo después del hero. */
export default function ProposalSection({ section, blocks = [] }) {
  const list = blocks.filter((b) => b.is_visible !== false && (b.label || b.text));

  return (
    <section className="ccl-snap ccl-snap--cream" id="propuesta">
      <div className="ccl-wrap ccl-snap__inner">
        {section?.eyebrow && <span className="ccl-eyebrow">{section.eyebrow}</span>}
        {section?.title && (
          <h2 className="ccl-display ccl-h2" style={{ marginTop: 12 }}>
            {section.title}
          </h2>
        )}

        <div className="ccl-prop">
          {list.map((block, i) => (
            <article className="ccl-prop__item" key={block.id || block.label}>
              <span className="ccl-prop__num">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="ccl-prop__label">{block.label}</h3>
              {block.text && <p className="ccl-prop__text">{block.text}</p>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}