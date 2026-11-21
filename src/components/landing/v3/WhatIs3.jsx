import React from "react";
import { MINI } from "./constants";

export default function WhatIs3() {
  return (
    <section className="ccl-snap ccl-snap--dark" id="casa">
      <div className="ccl-wrap ccl-snap__inner">
        <span className="ccl-eyebrow">El estudio</span>

        <h2 className="ccl-display ccl-h2" style={{ marginTop: 12 }}>
          Aquí se hace la música.
        </h2>

        <p className="ccl-lead">
          Producción, mezcla y master en la misma cabaña. Un artista pasa de canciones sueltas a un
          catálogo sólido, canción a canción.
        </p>

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