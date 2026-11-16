import React from "react";
import FeatureVisual from "./FeatureVisual";

export default function FeaturesSection({ section, features = [], creators = [] }) {
  const cards = features.filter((f) => f.is_visible !== false);

  return (
    <section className="cc-sec" id="funciones">
      <div className="cc-wrap">
        <div className="cc-sec-head" data-reveal>
          {section?.eyebrow && <span className="cc-eyebrow">{section.eyebrow}</span>}
          <h2 className="cc-h2">{section?.title}</h2>
          {section?.subtitle && <p className="cc-lead">{section.subtitle}</p>}
        </div>

        <div className="cc-bento">
          {cards.map((card, i) => (
            <article
              key={card.id || `${card.title}-${i}`}
              className={`cc-card cc-card--${card.size || "md"}`}
              data-reveal
            >
              {card.image_url ? (
                <div className="cc-card__visual" style={{ padding: 0 }}>
                  <img
                    src={card.image_url}
                    alt=""
                    loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.75 }}
                  />
                </div>
              ) : (
                <div className="cc-card__visual">
                  <FeatureVisual visual={card.visual} creators={creators} />
                </div>
              )}

              <span className={`cc-card__badge ${card.badge === "soon" ? "cc-card__badge--soon" : ""}`}>
                {card.badge === "soon" ? "Próximamente" : "Disponible"}
              </span>

              <div>
                <h3 className="cc-card__title">{card.title}</h3>
                {card.support_line && <p className="cc-card__sub">{card.support_line}</p>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}