import React from "react";
import { isVideoFile } from "@/lib/landingMedia";
import AmbientVideo from "./AmbientVideo";
import Counter, { formatCompact } from "./Counter";

function Facts({ item }) {
  return (
    <div className="ccl-gcard__facts">
      <div>
        <span className="ccl-gcard__fact-value">{formatCompact(item.songs)}</span>
        <span className="ccl-gcard__fact-label">Canciones</span>
      </div>
      <div>
        <span className="ccl-gcard__fact-value">{formatCompact(item.likes)}</span>
        <span className="ccl-gcard__fact-label">Likes</span>
      </div>
      <div>
        <span className="ccl-gcard__fact-value">{formatCompact(item.reach)}</span>
        <span className="ccl-gcard__fact-label">Alcance</span>
      </div>
    </div>
  );
}

export default function GenresStack({ section, items = [] }) {
  const list = items.filter((i) => i.is_visible !== false);

  return (
    <div className="ccl-stack" id="generos">
      <div className="ccl-wrap ccl-stack__intro">
        {section?.eyebrow && <span className="ccl-eyebrow">{section.eyebrow}</span>}
        <h2 className="ccl-display ccl-h2" style={{ marginTop: 12 }}>
          {section?.title}
        </h2>
        {section?.subtitle && <p className="ccl-small">{section.subtitle}</p>}
      </div>

      {list.map((item, i) => (
        <article className="ccl-stack__item" key={item.id || item.key || item.name}>
          <div
            className="ccl-gcard"
            style={{ "--tint": item.tint || "#ff5833", "--accent": item.accent || "#ff5833" }}
          >
            <div className="ccl-media">
              {isVideoFile(item.video_url) ? (
                <AmbientVideo src={item.video_url} poster={item.image_url} />
              ) : item.image_url ? (
                <img className="ccl-media__el" src={item.image_url} alt="" loading="lazy" />
              ) : null}
              <span className="ccl-media__tint" />
              <span className="ccl-media__veil" />
            </div>

            <div className="ccl-wrap ccl-gcard__body">
              <span className="ccl-gcard__label">{item.label || "Artistas · Catálogo"}</span>
              <h2 className="ccl-display ccl-gcard__name">{item.name}</h2>
              <span className="ccl-gcard__mini">Sonido</span>
              <p className="ccl-gcard__desc">{item.description}</p>

              <div className="ccl-gcard__count">
                <Counter value={item.plays || 0} className="ccl-gcard__plays" />
                <span className="ccl-gcard__plays-label">reproducciones</span>
              </div>

              <span className="ccl-gcard__dotted" />
              <Facts item={item} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}