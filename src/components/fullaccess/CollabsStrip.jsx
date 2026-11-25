import React from "react";

export default function CollabsStrip({ lead, logos }) {
  if (!logos?.length) return null;

  return (
    <section className="fa-collabs-sec">
      <div className="fa-wrap">
        <span className="fa-eyebrow">{lead || "Programa de desarrollo artístico"}</span>
      </div>

      <div className="fa-collabs">
        <div className="fa-collabs__track">
          {[0, 1].map((group) => (
            <div className="fa-collabs__group" key={group} aria-hidden={group === 1}>
              {logos.map((logo, index) => (
                <div className="fa-collabs__cell" key={`${group}-${logo}-${index}`}>
                  <img src={logo} alt="Marca colaboradora" loading="lazy" draggable={false} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}