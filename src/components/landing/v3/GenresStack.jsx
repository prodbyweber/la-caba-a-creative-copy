import React from "react";
import { Music2 } from "lucide-react";
import { isVideoFile } from "@/lib/landingMedia";
import AmbientVideo from "./AmbientVideo";

function GlobalData({ item }) {
  if (!item.global_data && !item.global_source) return null;
  return (
    <div className="ccl-gcard__global">
      <span className="ccl-gcard__global-tag">Dato global</span>
      {item.global_data && <p className="ccl-gcard__global-data">{item.global_data}</p>}
      {item.global_source && <span className="ccl-gcard__global-src">Fuente: {item.global_source}</span>}
    </div>
  );
}

export default function GenresStack({ section, items = [], fusion = [] }) {
  const list = items.filter((i) => i.is_visible !== false);
  const fusionList = fusion.filter((i) => i.is_visible !== false);

  return (
    <>
      <div className="ccl-stack" id="generos">
        <div className="ccl-wrap ccl-stack__intro">
          {section?.eyebrow && <span className="ccl-eyebrow">{section.eyebrow}</span>}
          <h2 className="ccl-display ccl-h2" style={{ marginTop: 12 }}>
            {section?.title}
          </h2>
          {section?.subtitle && <p className="ccl-small">{section.subtitle}</p>}
        </div>

        {list.map((item) => (
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
                <GlobalData item={item} />
              </div>
            </div>
          </article>
        ))}
      </div>

      {fusionList.length > 0 && (
        <section className="ccl-fusion" id="fusion">
          <div className="ccl-wrap">
            <span className="ccl-eyebrow">Fusion</span>
            <h3 className="ccl-display ccl-fusion__title">{section?.body || "Fusion"}</h3>

            <div className="ccl-fusion__grid">
              {fusionList.map((item) => (
                <article
                  className="ccl-fusioncard"
                  key={item.id || item.name}
                  style={{ "--accent": item.accent || "#ff5833" }}
                >
                  <span className="ccl-fusioncard__icon">
                    <Music2 size={16} />
                  </span>
                  <div className="ccl-fusioncard__body">
                    <h4 className="ccl-fusioncard__name">{item.name}</h4>
                    {item.description && <p className="ccl-fusioncard__desc">{item.description}</p>}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}