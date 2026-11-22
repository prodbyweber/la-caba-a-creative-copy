import React, { useEffect, useMemo, useRef, useState } from "react";
import { makeCombo } from "@/lib/fusionCombos";

const SLOTS = 3;
const SWAP_MS = 4200;

const buildSlots = (images, count = SLOTS) => {
  const used = new Set();
  const next = [];
  for (let i = 0; i < count; i += 1) {
    const combo = makeCombo({ exclude: used, images });
    if (!combo) break;
    used.add(combo.key);
    next.push(combo);
  }
  return next;
};

/** Tarjetas cinemáticas con combinaciones de dos géneros y su mood. */
export default function FusionCards({ items = [] }) {
  const images = useMemo(
    () => items.filter((item) => item.image_url).map((item) => item.image_url),
    [items]
  );
  const imagesRef = useRef(images);
  imagesRef.current = images;

  const [slots, setSlots] = useState(() => buildSlots(images));

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    let cursor = 0;
    const timer = setInterval(() => {
      setSlots((prev) => {
        const used = new Set(prev.map((slot) => slot.key));
        const combo = makeCombo({ exclude: used, images: imagesRef.current });
        if (!combo) return prev;
        const next = [...prev];
        next[cursor % next.length] = combo;
        cursor += 1;
        return next;
      });
    }, SWAP_MS);

    return () => clearInterval(timer);
  }, []);

  if (!slots.length) return null;

  return (
    <div className="ccl-fusion">
      <div className="ccl-wrap">
        <span className="ccl-eyebrow">Fusion</span>
        <div className="ccl-fusion__grid">
          {slots.map((item, i) => (
            <article
              className="ccl-fcard"
              key={`slot-${i}`}
              style={{ "--tint": item.tint || "#ff5833", "--accent": item.accent || "#ff5833" }}
            >
              {item.image_url && (
                <img
                  key={item.key}
                  className="ccl-fcard__img"
                  src={item.image_url}
                  alt=""
                  loading="lazy"
                />
              )}
              <span className="ccl-fcard__tint" aria-hidden="true" />
              <span className="ccl-fcard__veil" aria-hidden="true" />

              <div className="ccl-fcard__body" key={item.key}>
                <h3 className="ccl-fcard__name">{item.name}</h3>
                <div className="ccl-fcard__fig">
                  <span className="ccl-fcard__value">{item.mood}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}