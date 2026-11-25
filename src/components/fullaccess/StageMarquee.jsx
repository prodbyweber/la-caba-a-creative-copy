import React, { useState } from "react";
import { ARTIST_SLIDES } from "@/lib/startArtistSlides";

export default function StageMarquee() {
  const [held, setHeld] = useState(false);
  const items = [...ARTIST_SLIDES, ...ARTIST_SLIDES];

  return (
    <div
      className={`fa-marquee${held ? " is-held" : ""}`}
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onTouchStart={() => setHeld(true)}
      onTouchEnd={() => setHeld(false)}
    >
      <div className="fa-marquee__track">
        {items.map((slide, index) => (
          <div className="fa-marquee__item" key={`${slide.src}-${index}`}>
            <img
              src={slide.src}
              alt={index < ARTIST_SLIDES.length ? slide.alt : ""}
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}