import React from "react";
import StageGenres from "@/components/fullaccess/StageGenres";
import StageStudio from "@/components/fullaccess/StageStudio";
import StageVideo from "@/components/fullaccess/StageVideo";

/** Un bloque compacto por etapa: etiqueta, titular, frase y tres puntos clave. */
export default function MethodologyStage({ stage, studioUrl }) {
  return (
    <article className="fa-mstage">
      <h3 className="fa-display fa-mstage__title">{stage.title}</h3>
      <p className="fa-mstage__p">{stage.text}</p>

      {stage.items?.length ? (
        <div className="fa-mstage__chips">
          {stage.items.map((item) => (
            <span className="fa-chip" key={item}>
              {item}
            </span>
          ))}
        </div>
      ) : null}

      {stage.media === "genres" ? (
        <div className="fa-mstage__media">
          <StageGenres />
        </div>
      ) : null}

      {stage.media === "studio" ? (
        <div className="fa-mstage__media">
          {studioUrl ? <StageStudio url={studioUrl} /> : <StageVideo youtubeId={stage.youtubeId} />}
        </div>
      ) : null}
    </article>
  );
}