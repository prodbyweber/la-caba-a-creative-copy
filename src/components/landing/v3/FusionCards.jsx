import React from "react";

/** Fusiones de géneros como tarjetas cinemáticas con su cifra. */
export default function FusionCards({ items = [] }) {
  if (items.length === 0) return null;

  return (
    <div className="ccl-fusion">
      <div className="ccl-wrap">
        <span className="ccl-eyebrow">Fusion</span>
        <div className="ccl-fusion__grid">
          {items.map((item, i) => (
            <article
              className="ccl-fcard"
              key={item.id || item.key || item.name}
              style={{ "--tint": item.tint || "#ff5833", "--accent": item.accent || "#ff5833" }}
            >
              {item.image_url && (
                <img className="ccl-fcard__img" src={item.image_url} alt="" loading="lazy" />
              )}
              <span className="ccl-fcard__tint" aria-hidden="true" />
              <span className="ccl-fcard__veil" aria-hidden="true" />
              <span className="ccl-fcard__idx">{String(i + 1).padStart(2, "0")}</span>

              <div className="ccl-fcard__body">
                <h3 className="ccl-fcard__name">{item.name}</h3>
                {item.subgenres && <p className="ccl-fcard__sub">{item.subgenres}</p>}
                {(item.figure_text || item.figure_label) && (
                  <div className="ccl-fcard__fig">
                    {item.figure_text && <span className="ccl-fcard__value">{item.figure_text}</span>}
                    {item.figure_label && <span className="ccl-fcard__label">{item.figure_label}</span>}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}