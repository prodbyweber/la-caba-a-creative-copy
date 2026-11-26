import React from "react";
import MethodologyStage from "@/components/fullaccess/MethodologyStage";
import {
  METHOD_STAGES,
  METHOD_TITLE,
  METHOD_CLOSING,
  METHOD_NOTE,
} from "@/lib/methodologyStages";

export default function Methodology({ settings = {} }) {
  return (
    <section className="fa-method" id="metodologia">
      <div className="fa-wrap">
        <div className="fa-sec-head">
          <span className="fa-eyebrow">Metodología</span>
          <h2 className="fa-display fa-h2">{METHOD_TITLE}</h2>
        </div>

        <div className="fa-mstages">
          {METHOD_STAGES.map((stage) => (
            <MethodologyStage
              key={stage.num}
              stage={stage}
              studioUrl={settings.studio_video_url}
            />
          ))}
        </div>

        <p className="fa-method__closing">{METHOD_CLOSING}</p>
        <p className="fa-method__note">{METHOD_NOTE}</p>
      </div>
    </section>
  );
}