import React from "react";
import { STEPS } from "./constants";

export default function Method3({ section }) {
  return (
    <section className="ccl-sec" id="metodo">
      <div className="ccl-wrap">
        <div className="ccl-method__layout">
          <div className="ccl-method__aside" data-reveal>
            <span className="ccl-eyebrow">Cómo funciona</span>
            <h2 className="ccl-h2">{section?.title || "Cinco etapas, un solo proyecto."}</h2>
            <p className="ccl-lead">
              {section?.subtitle ||
                "Un método de trabajo que ordena la identidad, el sonido y la estrategia antes de lanzar."}
            </p>
          </div>

          <div className="ccl-method">
            {STEPS.map((step) => (
              <div key={step.num} className="ccl-step" data-reveal>
                <span className="ccl-step__num">{step.num}</span>
                <div>
                  <h3 className="ccl-step__title">{step.title}</h3>
                  <p className="ccl-step__text">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}