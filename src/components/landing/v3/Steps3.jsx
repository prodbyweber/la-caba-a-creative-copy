import React from "react";
import { STEPS } from "./constants";

export default function Steps3() {
  return (
    <section className="ccl-snap ccl-snap--dark" id="metodo">
      <div className="ccl-wrap ccl-snap__inner">
        <span className="ccl-eyebrow">Cómo funciona</span>
        <h2 className="ccl-display ccl-h2" style={{ marginTop: 12 }}>
          Cuatro pasos en la cabaña.
        </h2>
        <p className="ccl-small">Desliza para recorrerlos.</p>

        <div className="ccl-rail">
          {STEPS.map((step) => (
            <article key={step.num} className="ccl-step">
              <span className="ccl-step__num">{step.num}</span>
              <div>
                <h3 className="ccl-step__title">{step.title}</h3>
                <p className="ccl-step__text">{step.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}