import React from "react";
import { isVideoFile } from "@/lib/landingMedia";
import AmbientVideo from "./AmbientVideo";
import Counter from "./Counter";

const figureFormat = (n) => Number(n).toLocaleString("en-US", { maximumFractionDigits: 1 });

function Figure({ item }) {
  const facts = (item.facts || []).filter(Boolean).slice(0, 3);
  const hasFigure = item.figure_text || Number(item.figure_value) > 0;
  const source = [item.source, item.source_year].filter(Boolean).join(" · ");

  if (!hasFigure && !item.figure_label && facts.length === 0 && !source) return null;

  return (
    <>
      <div className="ccl-gfig">
        <span className="ccl-gfig__tag">Dato global</span>
        {hasFigure && (
          <div className="ccl-gfig__value">
            {item.figure_text ? (
              item.figure_text
            ) : (
              <Counter
                value={item.figure_value}
                prefix={item.figure_prefix || ""}
                suffix={item.figure_suffix || ""}
                format={figureFormat}
              />
            )}
          </div>
        )}
        {item.figure_label && <span className="ccl-gfig__label">{item.figure_label}</span>}
        {item.figure_note && <span className="ccl-gfig__note">{item.figure_note}</span>}
      </div>

      {facts.length > 0 && (
        <>
          <span className="ccl-gcard__dotted" />
          <ul className="ccl-gfacts">
            {facts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </>
      )}

      {source && <span className="ccl-gsrc">Fuente: {source}</span>}
    </>
  );
}

export default function GenresStack({ section, items = [] }) {
  const list = items.filter((i) => i.is_visible !== false);
  const main = list.filter((i) => !i.is_fusion);
  const fusion = list.filter((i) => i.is_fusion);

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

        {main.map((item) => (
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
                <h2 className="ccl-display ccl-gcard__name">{item.name}</h2>
                {item.subgenres && <p className="ccl-gcard__sub">{item.subgenres}</p>}
                <Figure item={item} />
              </div>
            </div>
          </article>
        ))}
      </div>

      {fusion.length > 0 && (
        <div className="ccl-fusion">
          <div className="ccl-wrap">
            <span className="ccl-eyebrow">Fusion</span>
            <div className="ccl-fusion__rail">
              {fusion.map((item) => (
                <span className="ccl-fusion__card" key={item.id || item.key || item.name}>
                  {item.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}