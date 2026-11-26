import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ArtistCard from "@/components/fullaccess/ArtistCard";
import { STAGE3_SLIDES } from "@/lib/stage3Slides";

const AUTO_MS = 5200;
const HOLD_MS = 9000;

const FALLBACK = STAGE3_SLIDES.map((slide, index) => ({
  id: `slide-${index}`,
  name: slide.name,
  image_url: slide.src,
  credit: "",
  spotify_url: "",
}));

const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Carrusel horizontal de artistas y proyectos de la etapa Lanzar. */
export default function StageArtists({ artists = [] }) {
  const list = artists.length ? artists : FALLBACK;
  const railRef = useRef(null);
  const holdRef = useRef(0);
  const [index, setIndex] = useState(0);

  const goTo = (next, manual = false) => {
    const rail = railRef.current;
    if (!rail) return;
    const target = Math.max(0, Math.min(list.length - 1, next));
    const child = rail.children[target];
    if (!child) return;
    if (manual) holdRef.current = Date.now() + HOLD_MS;
    setIndex(target);
    rail.scrollTo({
      left: child.offsetLeft - rail.offsetLeft,
      behavior: prefersReduced() ? "auto" : "smooth",
    });
  };

  useEffect(() => {
    if (list.length < 2 || prefersReduced()) return undefined;
    const timer = setInterval(() => {
      if (Date.now() < holdRef.current) return;
      const rail = railRef.current;
      if (!rail) return;
      setIndex((prev) => {
        const next = (prev + 1) % list.length;
        const child = rail.children[next];
        if (child) {
          rail.scrollTo({
            left: child.offsetLeft - rail.offsetLeft,
            behavior: "smooth",
          });
        }
        return next;
      });
    }, AUTO_MS);
    return () => clearInterval(timer);
  }, [list.length]);

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
    <div className="fa-acarousel">
      <div className="fa-acarousel__head">
        <span className="fa-eyebrow">Artistas y proyectos</span>
        <div className="fa-acarousel__arrows">
          <button
            type="button"
            className="fa-acarousel__arrow"
            onClick={() => goTo(index - 1, true)}
            aria-label="Anterior"
          >
            <ChevronLeft size={17} />
          </button>
          <button
            type="button"
            className="fa-acarousel__arrow"
            onClick={() => goTo(index + 1, true)}
            aria-label="Siguiente"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>

      <div
        className="fa-acarousel__rail"
        ref={railRef}
        onScroll={onScroll}
        onPointerDown={() => {
          holdRef.current = Date.now() + HOLD_MS;
        }}
      >
        {list.map((artist, i) => (
          <div className="fa-acarousel__cell" key={artist.id || artist.name}>
            <ArtistCard artist={artist} active={i === index} />
          </div>
        ))}
      </div>

      {list.length > 1 ? (
        <div className="fa-acarousel__dots">
          {list.map((artist, i) => (
            <button
              type="button"
              key={`dot-${artist.id || artist.name}`}
              className={`fa-acarousel__dot${i === index ? " is-on" : ""}`}
              onClick={() => goTo(i, true)}
              aria-label={artist.name}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}