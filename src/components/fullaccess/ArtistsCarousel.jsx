import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { STAGE3_SLIDES } from "@/lib/stage3Slides";

const AUTO_MS = 5000;

const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Artistas que confiaron en nosotros: una imagen horizontal completa por paso,
 * con scroll-snap, flechas en escritorio y avance automático.
 */
export default function ArtistsCarousel({ artists, settings = {} }) {
  const railRef = useRef(null);
  const touchRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [held, setHeld] = useState(false);

  const slides =
    artists && artists.length
      ? artists.filter((item) => item.is_visible !== false)
      : STAGE3_SLIDES.map((slide) => ({ name: slide.name, image_url: slide.src }));

  const total = slides.length;
  const autoplay = settings.artists_autoplay !== false;

  const goTo = useCallback(
    (next) => {
      const rail = railRef.current;
      if (!rail || !total) return;
      const target = ((next % total) + total) % total;
      const child = rail.children[target];
      if (!child) return;
      rail.scrollTo({
        left: child.offsetLeft - rail.offsetLeft,
        behavior: prefersReduced() ? "auto" : "smooth",
      });
      setIndex(target);
    },
    [total]
  );

  const onScroll = () => {
    const rail = railRef.current;
    if (!rail) return;
    const center = rail.scrollLeft + rail.clientWidth / 2;
    let closest = 0;
    let best = Infinity;
    Array.from(rail.children).forEach((child, i) => {
      const middle = child.offsetLeft - rail.offsetLeft + child.clientWidth / 2;
      const distance = Math.abs(middle - center);
      if (distance < best) {
        best = distance;
        closest = i;
      }
    });
    setIndex(closest);
  };

  useEffect(() => {
    if (!total || held || !autoplay || prefersReduced()) return undefined;
    const timer = setInterval(() => goTo(index + 1), AUTO_MS);
    return () => clearInterval(timer);
  }, [index, held, autoplay, total, goTo]);

  const onTouchStart = (event) => {
    touchRef.current = event.touches[0].clientX;
    setHeld(true);
  };

  const onTouchEnd = (event) => {
    const start = touchRef.current;
    if (start !== null) {
      const delta = event.changedTouches[0].clientX - start;
      if (Math.abs(delta) > 40) goTo(index + (delta < 0 ? 1 : -1));
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
        className="fa-artcar"
        onMouseEnter={() => setHeld(true)}
        onMouseLeave={() => setHeld(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="fa-artcar__rail" ref={railRef} onScroll={onScroll}>
          {slides.map((slide, i) => (
            <figure className="fa-artcar__item" key={`${slide.image_url}-${i}`}>
              <img src={slide.image_url} alt={slide.name || ""} loading="lazy" />
            </figure>
          ))}
        </div>

        <button
          type="button"
          className="fa-artcar__arrow fa-artcar__arrow--prev"
          onClick={() => goTo(index - 1)}
          aria-label="Anterior"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          className="fa-artcar__arrow fa-artcar__arrow--next"
          onClick={() => goTo(index + 1)}
          aria-label="Siguiente"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {total > 1 ? (
        <div className="fa-artcar__dots">
          {slides.map((slide, i) => (
            <button
              type="button"
              key={`${slide.image_url}-dot-${i}`}
              className={`fa-artcar__dot${i === index ? " is-on" : ""}`}
              onClick={() => goTo(i)}
              aria-label={slide.name || `Artista ${i + 1}`}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}