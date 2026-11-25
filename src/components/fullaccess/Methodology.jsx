import React from "react";
import StageGenres from "@/components/fullaccess/StageGenres";
import StageStudio from "@/components/fullaccess/StageStudio";
import StageMarquee from "@/components/fullaccess/StageMarquee";

const STAGES = [
  {
    key: "explorar",
    num: "01",
    title: "Explorar",
    sub: "Identidad",
    text: "Exploramos el sonido con los géneros que representan tu identidad sonora.",
  },
  {
    key: "descubrir",
    num: "02",
    title: "Descubrir",
    sub: "Estudio",
    text: "Dentro del estudio, el proceso completo: de la idea a la canción terminada.",
  },
  {
    key: "lanzar",
    num: "03",
    title: "Lanzar",
    sub: "Mercado",
    text: "Lleva tu catálogo al mercado con un plan de lanzamiento.",
  },
];

export default function Methodology({ settings, studioVideoUrl, images }) {
  return (
    <section className="fa-method" id="metodologia">
      <div className="fa-wrap">
        <div className="fa-sec-head">
          <span className="fa-eyebrow">Metodología</span>
          <h2 className="fa-display fa-h2">{settings.method_title}</h2>
        </div>

        <div className="fa-mstages">
          {STAGES.map((stage) => (
            <article className="fa-mstage" key={stage.key}>
              <div>
                <span className="fa-mstage__label">Etapa {stage.num}</span>
                <h3 className="fa-display fa-mstage__title">{stage.title}</h3>
                <span className="fa-mstage__rule" aria-hidden="true" />
                <span className="fa-mstage__sub">{stage.sub}</span>
                <p className="fa-mstage__text">{stage.text}</p>
              </div>

              <div className="fa-mstage__media">
                {stage.key === "explorar" ? <StageGenres images={images} /> : null}
                {stage.key === "descubrir" ? <StageStudio url={studioVideoUrl} /> : null}
                {stage.key === "lanzar" ? <StageMarquee /> : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}