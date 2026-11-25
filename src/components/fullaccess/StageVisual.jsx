import React from "react";
import GenreExplorer from "@/components/fullaccess/GenreExplorer";

const TIMELINE = ["Catálogo", "Concepto", "Calendario", "Lanzamiento"];

export default function StageVisual({ stage }) {
  const video = stage.video_url;
  const image = stage.image_url;

  if (stage.key === "explorar" || stage.num === "01") {
    return <GenreExplorer />;
  }

  if (stage.key === "lanzar" || stage.num === "03") {
    return (
      <div className="fa-launch">
        {video ? (
          <video className="fa-loop" src={video} poster={image || undefined} autoPlay muted loop playsInline />
        ) : image ? (
          <img className="fa-loop" src={image} alt="" loading="lazy" />
        ) : null}
        <div className="fa-launch__line">
          {TIMELINE.map((step, index) => (
            <span className="fa-launch__step" key={step}>
              <b>{String(index + 1).padStart(2, "0")}</b>
              {step}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (video) {
    return (
      <video className="fa-loop" src={video} poster={image || undefined} autoPlay muted loop playsInline />
    );
  }

  if (image) return <img className="fa-loop" src={image} alt="" loading="lazy" />;

  return null;
}