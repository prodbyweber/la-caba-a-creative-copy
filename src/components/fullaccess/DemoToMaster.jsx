import React from "react";
import DemoCard from "@/components/fullaccess/DemoCard";

export default function DemoToMaster({ settings, demos }) {
  return (
    <section className="fa-sec fa-sec--line" id="demo-master">
      <div className="fa-wrap">
        <div className="fa-sec-head">
          <span className="fa-eyebrow">Proof of work</span>
          <h2 className="fa-display fa-h2">{settings.demo_title}</h2>
          <p className="fa-lead">{settings.demo_subtitle}</p>
        </div>

        {demos.length > 0 ? (
          <div className="fa-demos">
            {demos.map((demo) => (
              <DemoCard key={demo.id} demo={demo} />
            ))}
          </div>
        ) : (
          <p className="fa-demo__empty">
            Los ejemplos de demo y master se publican desde el panel de administración en cuanto
            estén disponibles los audios reales.
          </p>
        )}
      </div>
    </section>
  );
}