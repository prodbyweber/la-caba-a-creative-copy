import React, { useEffect, useMemo, useRef, useState } from "react";

const SLOTS = 3;
const SWAP_MS = 4200;

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const figureOf = (item) => {
  if (item.figure_text) return item.figure_text;
  if (!Number(item.figure_value)) return "";
  const value = Number(item.figure_value).toLocaleString("en-US", { maximumFractionDigits: 1 });
  return `${item.figure_prefix || ""}${value}${item.figure_suffix || ""}`;
};

/** Tarjetas cinemáticas que van rotando géneros al azar del catálogo. */
export default function FusionCards({ items = [] }) {
  const pool = useMemo(() => items, [items]);
  const poolRef = useRef(pool);
  poolRef.current = pool;

  const [slots, setSlots] = useState([]);

  useEffect(() => {
    setSlots(shuffle(poolRef.current).slice(0, SLOTS));
  }, [pool.length]);

  useEffect(() => {
    if (poolRef.current.length <= SLOTS) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    let cursor = 0;
    const timer = setInterval(() => {
      setSlots((prev) => {
        const visible = new Set(prev.map((p) => p.key));
        const rest = poolRef.current.filter((p) => !visible.has(p.key));
        if (!rest.length) return prev;
        const next = [...prev];
        next[cursor % next.length] = rest[Math.floor(Math.random() * rest.length)];
        cursor += 1;
        return next;
      });
    }, SWAP_MS);

    return () => clearInterval(timer);
  }, [pool.length]);

  if (slots.length === 0) return null;

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
              <span className="ccl-fcard__idx">{String(i + 1).padStart(2, "0")}</span>

              <div className="ccl-fcard__body" key={item.key}>
                <h3 className="ccl-fcard__name">{item.name}</h3>
                {item.subgenres && <p className="ccl-fcard__sub">{item.subgenres}</p>}
                {(figureOf(item) || item.figure_label) && (
                  <div className="ccl-fcard__fig">
                    {figureOf(item) && <span className="ccl-fcard__value">{figureOf(item)}</span>}
                    {item.figure_label && <span className="ccl-fcard__label">{item.figure_label}</span>}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}