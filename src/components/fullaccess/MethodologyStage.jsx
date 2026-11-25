import React from "react";
import StageFusion from "@/components/fullaccess/StageFusion";
import StageStudio from "@/components/fullaccess/StageStudio";
import StageArtists from "@/components/fullaccess/StageArtists";

export default function MethodologyStage({ stage, studioVideoUrl }) {
  return (
    <article className="fa-mstage">
      <span className="fa-mstage__num">
        {stage.num} · {stage.key}
      </span>
      <h3 className="fa-display fa-mstage__title">{stage.title}</h3>
      <p className="fa-mstage__p">{stage.text}</p>

      <span className="fa-mstage__label">Elementos de esta etapa:</span>
      <ul className="fa-mstage__items">
        {stage.items.map((item) => (
          <li className="fa-mstage__item" key={item.title}>
            <span className="fa-mstage__item-body">
              <span>
                <b>{item.title}:</b> {item.text}
              </span>
            </span>
          </li>
        ))}
      </ul>

      <div className="fa-mstage__media">
        {stage.media === "fusion" ? <StageFusion /> : null}
        {stage.media === "studio" && studioVideoUrl ? (
          <StageStudio url={studioVideoUrl} />
        ) : null}
        {stage.media === "artists" ? <StageArtists /> : null}
      </div>
    </article>
  );
}