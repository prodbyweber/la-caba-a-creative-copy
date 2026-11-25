import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { STAGE3_SLIDES } from "@/lib/stage3Slides";

const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Etapa 3: una imagen horizontal completa por panel, sin recortes. */
export default function StageArtists() {
  const railRef = useRef(null);
  const [index, setIndex] = useState(0);

  const goTo = (next) => {
    const rail = railRef.current;
    if (!rail) return;
    const target = rail.children[Math.max(0, Math.min(STAGE3_SLIDES.length - 1, next))];
    if (!target) return;
    rail.scrollTo({
      left: target.offsetLeft - rail.offsetLeft,
      behavior: prefersReduced() ? "auto" : "smooth",
    });
  };

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

  return (
    <div className="fa-shot">
      <div className="fa-shot__rail" ref={railRef} onScroll={onScroll}>
        {STAGE3_SLIDES.map((slide) => (
          <figure className="fa-shot__item" key={slide.src}>
            <img src={slide.src} alt={slide.name} loading="lazy" />
          </figure>
        ))}
      </div>

      <button
        type="button"
        className="fa-shot__arrow fa-shot__arrow--prev"
        onClick={() => goTo(index - 1)}
        aria-label="Anterior"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        type="button"
        className="fa-shot__arrow fa-shot__arrow--next"
        onClick={() => goTo(index + 1)}
        aria-label="Siguiente"
      >
        <ChevronRight size={18} />
      </button>

      <div className="fa-shot__dots">
        {STAGE3_SLIDES.map((slide, i) => (
          <button
            type="button"
            key={slide.src}
            className={`fa-shot__dot${i === index ? " is-on" : ""}`}
            onClick={() => goTo(i)}
            aria-label={slide.name}
          />
        ))}
      </div>
    </div>
  );
}