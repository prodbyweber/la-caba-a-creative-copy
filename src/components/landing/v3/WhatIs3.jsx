import React from "react";
import { MINI } from "./constants";
import BrandLogos3 from "./BrandLogos3";

export default function WhatIs3() {
  return (
    <section className="ccl-snap ccl-snap--dark" id="casa">
      <div className="ccl-wrap ccl-snap__inner">
        <span className="ccl-eyebrow">Qué es Cabaña</span>

        <h2 className="ccl-display ccl-h2" style={{ marginTop: 12 }}>
          Tu música, con estructura.
        </h2>

        <p className="ccl-lead">
          Cabaña es el lugar donde un artista pasa de canciones sueltas a un catálogo sólido:
          producción musical, mezcla, master y los recursos para lanzarlo.
        </p>

        <div className="ccl-mini">
          {MINI.map((item) => (
            <div key={item.title} className="ccl-mini__card">
              <b>{item.title}</b>
              <span>{item.text}</span>
            </div>
          ))}
        </div>

        <BrandLogos3 />
      </div>
    </section>
  );
}