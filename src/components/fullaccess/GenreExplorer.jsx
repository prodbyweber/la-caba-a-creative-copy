import React from "react";
import { GENRES } from "@/components/landing/v3/constants";

const FUSIONS = [
  { a: "Afro House", b: "R&B", mood: "Cálido, nocturno, con pulso de pista" },
  { a: "Jersey Club", b: "Afro", mood: "Ritmo cortado y energía alta" },
  { a: "House", b: "UK Garage", mood: "Groove con swing y espacio" },
  { a: "R&B", b: "Electronic", mood: "Texturas, aire y silencio" },
  { a: "Latin Pop", b: "Afro House", mood: "Melodía directa sobre pulso orgánico" },
  { a: "Trap", b: "Alternative R&B", mood: "Oscuro, atmosférico, íntimo" },
];

export default function GenreExplorer() {
  return (
    <div className="fa-genres">
      <div className="fa-genres__row">
        {GENRES.map((genre) => (
          <article className="fa-genre" key={genre.name}>
            <span className="fa-genre__tint" aria-hidden="true" />
            <h4 className="fa-genre__name">{genre.name}</h4>
            <p className="fa-genre__sub">{genre.sub}</p>
          </article>
        ))}
      </div>

      <div className="fa-fusions">
        <span className="fa-micro">Genre fusions</span>
        <p className="fa-fusions__intro">
          Combinaciones que usamos para buscar una dirección propia. Son propuestas creativas, no
          géneros oficiales.
        </p>
        <div className="fa-fusions__grid">
          {FUSIONS.map((fusion) => (
            <article className="fa-fusion" key={`${fusion.a}-${fusion.b}`}>
              <div className="fa-fusion__pair">
                <span>{fusion.a}</span>
                <b>+</b>
                <span>{fusion.b}</span>
              </div>
              <p className="fa-fusion__mood">{fusion.mood}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}