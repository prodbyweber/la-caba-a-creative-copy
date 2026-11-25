import React from "react";
import MethodologyStage from "@/components/fullaccess/MethodologyStage";
import { METHOD_STAGES, METHOD_CONNECTION, METHOD_RESULT } from "@/lib/methodologyStages";

export default function Methodology({ studioVideoUrl, images }) {
  return (
    <section className="fa-method" id="metodologia">
      <div className="fa-wrap">
        <div className="fa-sec-head">
          <span className="fa-eyebrow">Metodología</span>
          <h2 className="fa-display fa-h2">Las tres etapas de Cabaña Full Access</h2>
        </div>

        <div className="fa-mstages">
          {METHOD_STAGES.map((stage) => (
            <MethodologyStage
              key={stage.num}
              stage={stage}
              studioVideoUrl={studioVideoUrl}
              images={images}
            />
          ))}
        </div>

        <div className="fa-connect">
          <span className="fa-connect__title">Cómo se conecta toda la metodología</span>
          <div className="fa-connect__grid">
            {METHOD_CONNECTION.map((item) => (
              <div className="fa-connect__item" key={item.title}>
                <b>{item.title}</b>
                <strong>{item.sub}</strong>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
          <p className="fa-connect__final">{METHOD_RESULT}</p>
        </div>
      </div>
    </section>
  );
}