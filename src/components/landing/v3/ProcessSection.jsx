import React from "react";
import { isVideoFile } from "@/lib/landingMedia";
import AmbientVideo from "./AmbientVideo";

export default function ProcessSection({ section, steps = [] }) {
  const list = steps.filter((s) => s.is_visible !== false);

  return (
    <div className="ccl-stack" id="proceso">
      <div className="ccl-wrap ccl-stack__intro">
        {section?.eyebrow && <span className="ccl-eyebrow">{section.eyebrow}</span>}
        <h2 className="ccl-display ccl-h2" style={{ marginTop: 12 }}>
          {section?.title}
        </h2>
        {section?.subtitle && <p className="ccl-small">{section.subtitle}</p>}
      </div>

      {list.map((step, i) => (
        <article className="ccl-stack__item" key={step.id || step.title}>
          <div className="ccl-proc">
            <div className="ccl-media">
              {isVideoFile(step.video_url) ? (
                <AmbientVideo src={step.video_url} poster={step.image_url} />
              ) : step.image_url ? (
                <img className="ccl-media__el" src={step.image_url} alt="" loading="lazy" />
              ) : null}
              <span className="ccl-media__veil" />
            </div>

            <div className="ccl-wrap ccl-proc__body">
              <span className="ccl-proc__num">{step.num || `0${i + 1}`}</span>
              <h3 className="ccl-display ccl-proc__title">{step.title}</h3>
              <p className="ccl-proc__text">{step.text}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}