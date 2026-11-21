import React from "react";
import Counter from "./Counter";

export default function CommunitySection({ section, creators = [], stats = [] }) {
  const list = creators.filter((c) => c.is_public !== false && c.name);
  const statsList = stats.filter((s) => s.is_visible !== false);
  const loop = list.length ? [...list, ...list] : [];

  return (
    <section className="ccl-snap ccl-snap--dark" id="comunidad">
      <div className="ccl-wrap ccl-snap__inner">
        {section?.eyebrow && <span className="ccl-eyebrow">{section.eyebrow}</span>}
        <h2 className="ccl-display ccl-h2" style={{ marginTop: 12 }}>
          {section?.title}
        </h2>
        {section?.subtitle && <p className="ccl-lead">{section.subtitle}</p>}

        {loop.length > 0 && (
          <div className="ccl-marq">
            <div className="ccl-marq__track">
              {loop.map((creator, i) => (
                <article className="ccl-comm" key={`${creator.id || creator.name}-${i}`}>
                  <div className="ccl-media">
                    {(creator.photo_url || creator.cover_url) && (
                      <img
                        className="ccl-media__el"
                        src={creator.photo_url || creator.cover_url}
                        alt={creator.name}
                        loading="lazy"
                      />
                    )}
                    <span className="ccl-media__veil" />
                  </div>
                  <div className="ccl-comm__body">
                    <h3 className="ccl-comm__name">{creator.name}</h3>
                    <span className="ccl-comm__genre">{creator.genre || "Artista"}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {statsList.length > 0 && (
          <div className="ccl-comm__stats">
            {statsList.map((stat) => (
              <div className="ccl-comm__stat" key={stat.id || stat.label}>
                <Counter
                  value={stat.value || 0}
                  prefix={stat.prefix || ""}
                  suffix={stat.suffix || ""}
                  className="ccl-comm__stat-value"
                />
                <span className="ccl-comm__stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        )}

        {section?.body && <p className="ccl-small ccl-comm__note">{section.body}</p>}
      </div>
    </section>
  );
}