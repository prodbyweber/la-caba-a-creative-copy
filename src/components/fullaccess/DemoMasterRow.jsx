import React from "react";
import DemoMasterCard from "@/components/fullaccess/DemoMasterCard";

/** Demo & Master: solo se muestran proyectos con demo y master reales. */
export default function DemoMasterRow({ eyebrow, projects = [] }) {
  const list = projects.filter(
    (item) => item.is_visible !== false && item.demo_audio_url && item.master_audio_url
  );

  return (
    <div className="fa-dm">
      <div className="fa-wrap">
        <h2 className="fa-display fa-h2 fa-dm__title">{eyebrow || "Demo & master"}</h2>
      </div>

      {list.length > 0 ? (
        <div className="fa-dm__rail">
          {list.map((item) => (
            <DemoMasterCard key={item.id || item.artist} demo={item} />
          ))}
        </div>
      ) : (
        <div className="fa-wrap">
          <p className="fa-dm__empty">
            Estamos preparando los ejemplos con su demo y su master final.
          </p>
        </div>
      )}
    </div>
  );
}