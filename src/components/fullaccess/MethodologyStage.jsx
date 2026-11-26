import React from "react";
import StageFusion from "@/components/fullaccess/StageFusion";
import StageStudio from "@/components/fullaccess/StageStudio";
import StageArtists from "@/components/fullaccess/StageArtists";

export default function MethodologyStage({ stage, studioVideoUrl, artists }) {
  return (
    <article className="fa-mstage">
      <span className="fa-mstage__num">
        {stage.num} · {stage.key}
      </span>
      <h3 className="fa-display fa-mstage__title">{stage.title}</h3>
      <p className="fa-mstage__p">{stage.text}</p>

      <ul className="fa-mstage__items">
        {stage.items.map((item) => (
          <li className="fa-mstage__item" key={item}>
            {item}
          </li>
        ))}
      </ul>

      <div className="fa-mstage__media">
        {stage.media === "fusion" ? <StageFusion /> : null}
        {stage.media === "studio" && studioVideoUrl ? <StageStudio url={studioVideoUrl} /> : null}
        {stage.media === "artists" ? <StageArtists artists={artists} /> : null}
      </div>

      {stage.result ? (
        <div className="fa-mstage__result">
          <span className="fa-eyebrow">RESULTADO</span>
          <p>{stage.result}</p>
        </div>
      ) : null}
    </article>
  );
}