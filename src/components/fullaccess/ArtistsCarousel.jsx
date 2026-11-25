import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ARTIST_SLIDES } from "@/lib/startArtistSlides";
import DemoMasterRow from "@/components/fullaccess/DemoMasterRow";

const AUTO_MS = 5200;

export default function ArtistsCarousel({ artists, settings = {}, demos = [] }) {
  const [index, setIndex] = useState(0);
  const [held, setHeld] = useState(false);
  const touchRef = useRef(null);

  const slides =
    artists && artists.length
      ? artists.filter((item) => item.is_visible !== false)
      : ARTIST_SLIDES.map((slide) => ({ name: slide.alt, image_url: slide.src }));

  const total = slides.length;

  const go = useCallback(
    (next) => setIndex(((next % total) + total) % total),
    [total]
  );

  useEffect(() => {
    if (!total || held) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const timer = setInterval(() => setIndex((prev) => (prev + 1) % total), AUTO_MS);
    return () => clearInterval(timer);
  }, [held, total]);

  const onTouchStart = (event) => {
    touchRef.current = event.touches[0].clientX;
    setHeld(true);
  };

  const onTouchEnd = (event) => {
    const start = touchRef.current;
    if (start !== null) {
      const delta = event.changedTouches[0].clientX - start;
      if (Math.abs(delta) > 40) go(index + (delta < 0 ? 1 : -1));
    }
    touchRef.current = null;
    setHeld(false);
  };

  return (
    <section className="fa-artists">
      <div className="fa-wrap">
        <div className="fa-artists__head">
          <span className="fa-eyebrow">{settings.artists_eyebrow || "Respaldo"}</span>
          <h2 className="fa-display fa-artists__title">
            {settings.artists_title || "Artistas que confiaron en nosotros."}
          </h2>
        </div>
      </div>

      <div
        className="fa-artists__viewport"
        onMouseEnter={() => setHeld(true)}
        onMouseLeave={() => setHeld(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="fa-artists__track" style={{ transform: `translateX(-${index * 100}%)` }}>
          {slides.map((slide, i) => (
            <div className="fa-artists__slide" key={`${slide.image_url}-${i}`}>
              <figure className={`fa-artists__card${i === index ? " is-on" : ""}`}>
                <img src={slide.image_url} alt={slide.name} loading="lazy" />
              </figure>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="fa-artists__arrow fa-artists__arrow--prev"
          onClick={() => go(index - 1)}
          aria-label="Anterior"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          className="fa-artists__arrow fa-artists__arrow--next"
          onClick={() => go(index + 1)}
          aria-label="Siguiente"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="fa-artists__dots">
        {slides.map((slide, i) => (
          <button
            type="button"
            key={`${slide.image_url}-dot-${i}`}
            className={`fa-artists__dot${i === index ? " is-on" : ""}`}
            onClick={() => go(i)}
            aria-label={slide.name}
          />
        ))}
      </div>

      <DemoMasterRow eyebrow={settings.demo_eyebrow} projects={demos} />
    </section>
  );
}