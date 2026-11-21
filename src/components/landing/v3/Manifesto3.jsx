import React from "react";
import { isVideoFile } from "@/lib/landingMedia";
import { AREAS } from "./constants";

const TONES = ["orange", "dark", "dark", "cream"];

export default function Manifesto3({ section, features = [], settings }) {
  const journey = settings?.journey_media_url || "";
  const fromModel = features
    .filter((f) => f.is_visible !== false)
    .map((f, i) => ({
      num: String(i + 1).padStart(2, "0"),
      title: f.title,
      text: f.support_line,
      tone: TONES[i % TONES.length],
    }));
  const areas = fromModel.length ? fromModel : AREAS;

  return (
    <>
      <section className="ccl-sec" id="servicios">
        <div className="ccl-wrap">
          <div data-reveal>
            <span className="ccl-eyebrow">Qué es Cabaña Creative</span>
            <h2 className="ccl-h2">{section?.title || "No hacemos canciones. Construimos proyectos."}</h2>
            <p className="ccl-mani__statement">
              Somos una <em>compañía de producción musical</em> y desarrollo creativo. Trabajamos con
              artistas que quieren construir un sonido propio, un catálogo coherente y una carrera con
              dirección.
            </p>
          </div>

          <div className="ccl-areas">
            {areas.map((area) => (
              <article
                key={area.num}
                data-reveal
                className={`ccl-area ${area.tone === "orange" ? "ccl-area--orange" : ""} ${
                  area.tone === "cream" ? "ccl-area--cream" : ""
                }`}
              >
                <span className="ccl-area__num">{area.num}</span>
                <div>
                  <h3 className="ccl-area__title">{area.title}</h3>
                  <p className="ccl-area__text">{area.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ccl-band" id="nosotros">
        {isVideoFile(journey) ? (
          <video className="ccl-band__bg" src={journey} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" />
        ) : settings?.weber_bg_url ? (
          <img className="ccl-band__bg" src={settings.weber_bg_url} alt="" aria-hidden="true" />
        ) : null}
        <div className="ccl-band__veil" />
        <div className="ccl-wrap ccl-band__inner">
          <div data-reveal>
            <span className="ccl-eyebrow">Nuestro origen</span>
            <h3 className="ccl-band__title">
              Fundada en Venezuela en 2020. Con base en Madrid.
            </h3>
            <div className="ccl-band__meta">
              <span className="ccl-band__pill">Estudio propio</span>
              <span className="ccl-band__pill">Catálogo musical</span>
              <span className="ccl-band__pill">Red de creadores</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}