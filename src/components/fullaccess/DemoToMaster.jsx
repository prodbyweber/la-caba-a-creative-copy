import React from "react";
import DemoCard from "@/components/fullaccess/DemoCard";

export default function DemoToMaster({ settings, demos }) {
  const complete = (demos || []).filter((demo) => demo.demo_audio_url && demo.master_audio_url);

  return (
    <section className="fa-sec fa-sec--line" id="demo-master">
      <div className="fa-wrap">
        <div className="fa-sec-head">
          <span className="fa-eyebrow">Antes y después</span>
          <h2 className="fa-display fa-h2">{settings.demo_title}</h2>
          <p className="fa-lead">{settings.demo_subtitle}</p>
        </div>

        {complete.length > 0 ? (
          <div className="fa-demos">
            {complete.map((demo) => (
              <DemoCard key={demo.id} demo={demo} />
            ))}
          </div>
        ) : (
          <p className="fa-demo__empty">
            Estamos preparando los ejemplos con su demo y su master final. Se publican desde el
            panel de Full Access en cuanto los audios estén disponibles.
          </p>
        )}
      </div>
    </section>
  );
}