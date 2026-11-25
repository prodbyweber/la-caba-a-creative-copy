import React from "react";
import MethodologyStage from "@/components/fullaccess/MethodologyStage";
import { METHOD_STAGES, METHOD_RESULT } from "@/lib/methodologyStages";

export default function Methodology({ studioVideoUrl }) {
  return (
    <section className="fa-method" id="metodologia">
      <div className="fa-wrap">
        <div className="fa-sec-head">
          <span className="fa-eyebrow">Metodología</span>
          <h2 className="fa-display fa-h2">Las tres etapas de Cabaña Full Access</h2>
        </div>

        <div className="fa-mstages">
          {METHOD_STAGES.map((stage) => (
            <MethodologyStage key={stage.num} stage={stage} studioVideoUrl={studioVideoUrl} />
          ))}
        </div>

        <div className="fa-result">
          <span className="fa-eyebrow">RESULTADO</span>
          <p className="fa-result__text">{METHOD_RESULT.text}</p>
          <p className="fa-result__philosophy">{METHOD_RESULT.philosophy}</p>
          <p className="fa-result__note">{METHOD_RESULT.note}</p>
        </div>
      </div>
    </section>
  );
}