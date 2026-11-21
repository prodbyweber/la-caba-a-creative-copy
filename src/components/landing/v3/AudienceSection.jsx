import React from "react";

export default function AudienceSection({ section, items = [] }) {
  const list = items.filter((i) => i.is_visible !== false);

  return (
    <section className="ccl-snap ccl-snap--dark" id="audiencia">
      <div className="ccl-wrap ccl-snap__inner">
        {section?.eyebrow && <span className="ccl-eyebrow">{section.eyebrow}</span>}
        <h2 className="ccl-display ccl-h2" style={{ marginTop: 12 }}>
          {section?.title}
        </h2>
        {section?.subtitle && <p className="ccl-lead">{section.subtitle}</p>}

        <div className="ccl-rail">
          {list.map((item, i) => (
            <article className="ccl-aud" key={item.id || item.title}>
              <div className="ccl-media">
                {item.image_url && (
                  <img className="ccl-media__el" src={item.image_url} alt="" loading="lazy" />
                )}
                <span className="ccl-media__tint" style={{ "--tint": i === 1 ? "#ff5833" : "#0b0b0b" }} />
                <span className="ccl-media__veil" />
              </div>
              <div className="ccl-aud__body">
                <span className="ccl-aud__index">0{i + 1}</span>
                <h3 className="ccl-aud__title">{item.title}</h3>
                <p className="ccl-aud__text">{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}