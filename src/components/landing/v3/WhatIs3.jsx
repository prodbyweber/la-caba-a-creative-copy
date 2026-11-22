import React from "react";
import NetflixCard from "./NetflixCard";

/** Quién soy: nombre, mini bio y el vídeo justo debajo. */
export default function WhatIs3() {
  return (
    <section className="ccl-snap ccl-snap--dark" id="casa">
      <div className="ccl-wrap ccl-snap__inner">
        <span className="ccl-eyebrow">Quién soy</span>

        <h2 className="ccl-display ccl-h2" style={{ marginTop: 12 }}>
          Santiago Weber
        </h2>

        <p className="ccl-lead">
          Productor musical y fundador de Cabaña Creative. Llevo años convirtiendo canciones sueltas
          en catálogos con identidad: composición, producción, mezcla y master. Yo pongo el sonido.
          Tú pones la voz.
        </p>

        <div className="ccl-casa__video">
          <NetflixCard />
        </div>
      </div>
    </section>
  );
}