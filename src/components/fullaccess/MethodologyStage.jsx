import React from "react";
import StageGenres from "@/components/fullaccess/StageGenres";
import StageStudio from "@/components/fullaccess/StageStudio";
import StageArtists from "@/components/fullaccess/StageArtists";

export default function MethodologyStage({ stage, studioVideoUrl, images }) {
  return (
    <article className="fa-mstage">
      <span className="fa-mstage__num">Etapa {stage.num}</span>
      <h3 className="fa-display fa-mstage__title">{stage.title}</h3>

      <div className="fa-mstage__block">
        <span className="fa-mstage__label">Objetivo</span>
        <p className="fa-mstage__p">{stage.objective}</p>
      </div>

      <div className="fa-mstage__block">
        {stage.intro.map((paragraph) => (
          <p className="fa-mstage__p" key={paragraph.slice(0, 24)}>
            {paragraph}
          </p>
        ))}
      </div>

      <ul className={`fa-mstage__items${stage.numbered ? " is-numbered" : ""}`}>
        {stage.items.map((item, i) => (
          <li className="fa-mstage__item" key={item.title}>
            <span className="fa-mstage__item-body">
              {stage.numbered ? <span className="fa-mstage__idx">{i + 1}</span> : null}
              <span>
                <b>{item.title}:</b> {item.text}
              </span>
            </span>
          </li>
        ))}
      </ul>

      {stage.flowCamp ? (
        <div className="fa-mstage__sub-block">
          <span className="fa-mstage__sub-title">Flow Camp</span>
          <p className="fa-mstage__p">{stage.flowCamp}</p>
        </div>
      ) : null}

      <div className="fa-mstage__block">
        <span className="fa-mstage__label">¿Qué se consigue?</span>
        <p className="fa-mstage__p">{stage.resultQuestion}</p>
      </div>

      <div className="fa-mstage__result">
        <b>Resultado de la etapa</b>
        <span>{stage.result}</span>
      </div>

      {stage.note ? <p className="fa-mstage__note">{stage.note}</p> : null}

      <div className="fa-mstage__media">
        {stage.media === "genres" ? <StageGenres images={images} /> : null}
        {stage.media === "studio" ? <StageStudio url={studioVideoUrl} /> : null}
        {stage.media === "artists" ? <StageArtists /> : null}
      </div>
    </article>
  );
}