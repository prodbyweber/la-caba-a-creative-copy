import React from "react";
import { isVideoFile } from "@/lib/landingMedia";
import AmbientVideo from "./AmbientVideo";

export default function StudioSection({ section, cards = [] }) {
  const list = cards.filter((c) => c.is_visible !== false);

  return (
    <section className="ccl-snap ccl-snap--dark" id="estudio">
      <div className="ccl-wrap ccl-snap__inner">
        {section?.eyebrow && <span className="ccl-eyebrow">{section.eyebrow}</span>}
        <h2 className="ccl-display ccl-h2" style={{ marginTop: 12 }}>
          {section?.title}
        </h2>
        {section?.subtitle && <p className="ccl-lead">{section.subtitle}</p>}

        <div className="ccl-rail">
          {list.map((card) => (
            <article className="ccl-studio" key={card.id || card.title}>
              <div className="ccl-media">
                {isVideoFile(card.video_url) ? (
                  <AmbientVideo src={card.video_url} poster={card.image_url} />
                ) : card.image_url ? (
                  <img className="ccl-media__el" src={card.image_url} alt="" loading="lazy" />
                ) : null}
                <span className="ccl-media__veil" />
              </div>
              <h3 className="ccl-studio__title">{card.title}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}