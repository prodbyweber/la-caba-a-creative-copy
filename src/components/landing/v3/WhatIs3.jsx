import React from "react";
import { MINI } from "./constants";

const CREDITS = [
  "Producción musical",
  "Composición",
  "Mezcla",
  "Master",
  "Dirección creativa",
  "Desarrollo de catálogo",
];

export default function WhatIs3() {
  return (
    <section className="ccl-snap ccl-snap--dark" id="casa">
      <div className="ccl-wrap ccl-snap__inner">
        <span className="ccl-eyebrow">Quién soy</span>

        <h2 className="ccl-display ccl-h2" style={{ marginTop: 12 }}>
          Weber. Productor musical.
        </h2>

        <p className="ccl-lead">
          Cabaña Creative es mi estudio: el lugar donde un artista pasa de canciones sueltas a un
          catálogo con identidad. Yo pongo la producción, la mezcla y el master. Tú pones la voz.
        </p>

        <div className="ccl-credits">
          <span className="ccl-credits__label">Créditos</span>
          <div className="ccl-credits__row">
            {CREDITS.map((item) => (
              <span key={item} className="ccl-credits__chip">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="ccl-mini">
          {MINI.map((item) => (
            <div key={item.title} className="ccl-mini__card">
              <b>{item.title}</b>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}