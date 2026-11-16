import React from "react";

export default function AboutSection({ section, settings }) {
  const photo = settings?.weber_photo_url;
  const bg = settings?.weber_bg_url;

  return (
    <section className="cc-sec" id="weber">
      <div className="cc-wrap">
        <div className="cc-about__card" data-reveal>
          {bg && <img className="cc-about__bg" src={bg} alt="" loading="lazy" />}
          <div className="cc-about__veil" />

          <div className="cc-about__grid">
            <div className="cc-about__photo">
              {photo ? (
                <img src={photo} alt={`Retrato de ${settings?.weber_name || "Weber"}`} loading="lazy" />
              ) : bg ? (
                <img src={bg} alt="" loading="lazy" />
              ) : null}
            </div>

            <div>
              {section?.eyebrow && <span className="cc-eyebrow">{section.eyebrow}</span>}
              <h2 className="cc-h2">{section?.title}</h2>
              <blockquote className="cc-about__quote">“{settings?.weber_line}”</blockquote>
              <p className="cc-card__sub" style={{ marginTop: 14 }}>
                {settings?.weber_name || "Weber"} · Productor y director creativo. Universal Music ·
                Warner Music Spain · Magnus Media.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}