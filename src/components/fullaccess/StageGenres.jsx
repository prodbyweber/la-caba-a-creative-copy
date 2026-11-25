import React from "react";

const CARDS = [
  {
    name: "House",
    sub: "Afro House · Tech House · Melodic House · Latin House",
    tint: "#22c1d6",
    accent: "#7ae6f3",
  },
  { name: "R&B + Afrobeats", sub: "Oscuro", tint: "#8a6cf0", accent: "#c9b8ff" },
  { name: "Latin Urban + Hip Hop", sub: "Festivo", tint: "#ff5833", accent: "#ffcfc2" },
  { name: "Pop + Trap", sub: "", tint: "#e0b354", accent: "#ffdca8" },
];

export default function StageGenres({ images = [] }) {
  return (
    <div className="fa-gcards">
      {CARDS.map((card, index) => {
        const image = images.length ? images[index % images.length] : "";
        return (
          <article
            className="fa-gcard"
            key={card.name}
            style={{ "--tint": card.tint, "--accent": card.accent }}
          >
            {image ? <img src={image} alt="" loading="lazy" /> : null}
            <span className="fa-gcard__tint" aria-hidden="true" />
            <span className="fa-gcard__veil" aria-hidden="true" />
            <div className="fa-gcard__body">
              <h3 className="fa-gcard__name">{card.name}</h3>
              <span className="fa-gcard__rule" aria-hidden="true" />
              {card.sub ? <span className="fa-gcard__sub">{card.sub}</span> : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}