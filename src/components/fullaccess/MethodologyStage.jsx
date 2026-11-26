import React from "react";
import StageGenres from "@/components/fullaccess/StageGenres";
import StageVideo from "@/components/fullaccess/StageVideo";
import StageArtists from "@/components/fullaccess/StageArtists";

export default function MethodologyStage({ stage }) {
  return (
    <article className="fa-mstage">
      <span className="fa-mstage__num">
        {stage.num} · {stage.key}
      </span>
      <h3 className="fa-display fa-mstage__title">{stage.title}</h3>

      <ul className="fa-mstage__items">
        {stage.items.map((item) => (
          <li className="fa-mstage__item" key={item}>
            <span className="fa-mstage__item-body">{item}</span>
          </li>
        ))}
      </ul>

      <div className="fa-mstage__media">
        {stage.media === "fusion" ? <StageGenres /> : null}
        {stage.media === "youtube" ? <StageVideo youtubeId={stage.youtubeId} /> : null}
        {stage.media === "artists" ? <StageArtists /> : null}
      </div>

      {stage.result ? (
        <div className="fa-mstage__result">
          <b>Resultado</b>
          <span>{stage.result}</span>
        </div>
      ) : null}
    </article>
  );
}