import React from "react";
import MethodologyStage from "@/components/fullaccess/MethodologyStage";
import DemoMasterRow from "@/components/fullaccess/DemoMasterRow";
import { METHOD_STAGES } from "@/lib/methodologyStages";

export default function Methodology({ studioVideoUrl, demos = [], demoEyebrow, artists = [] }) {
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
              artists={artists}
            />
          ))}
        </div>
      </div>

      <DemoMasterRow eyebrow={demoEyebrow} projects={demos} />
    </section>
  );
}