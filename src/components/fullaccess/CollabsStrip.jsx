import React from "react";

export default function CollabsStrip({ title, logos }) {
  if (!logos?.length) return null;

  return (
    <section className="fa-sec--tight">
      <div className="fa-wrap" style={{ paddingBottom: 18 }}>
        <span className="fa-micro">{title}</span>
      </div>
      <div className="fa-collabs">
        <div className="fa-collabs__track">
          {[...logos, ...logos].map((logo, index) => (
            <div className="fa-collabs__cell" key={`${logo}-${index}`}>
              <img src={logo} alt="Colaboración" loading="lazy" draggable={false} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}