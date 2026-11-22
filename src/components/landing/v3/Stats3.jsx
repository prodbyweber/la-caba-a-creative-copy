import React, { useEffect, useRef, useState } from "react";
import { STATS } from "./constants";

const ZERO = () => STATS.map((s) => (s.value === null ? null : 0));

function formatValue(value, prefix) {
  if (value === null || value === undefined) return "";
  if (value >= 1000000) {
    const m = value / 1000000;
    return `${prefix}${m >= 10 || Number.isInteger(m) ? Math.round(m) : m.toFixed(1)}M`;
  }
  if (value >= 1000) {
    const k = value / 1000;
    return `${prefix}${k >= 10 || Number.isInteger(k) ? Math.round(k) : k.toFixed(1)}K`;
  }
  return `${prefix}${Math.round(value)}`;
}

export default function Stats3() {
  const ref = useRef(null);
  const [values, setValues] = useState(ZERO);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;

    const animate = () => {
      const duration = 1400;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setValues(STATS.map((s) => (s.value === null ? null : s.value * eased)));
        if (p < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && entry.intersectionRatio > 0.45) {
          if (frame) cancelAnimationFrame(frame);
          if (reduce) setValues(STATS.map((s) => s.value));
          else animate();
        } else if (!entry.isIntersecting) {
          if (frame) cancelAnimationFrame(frame);
          frame = 0;
          setValues(ZERO());
        }
      },
      { threshold: [0, 0.45, 0.8] }
    );

    io.observe(el);
    return () => {
      io.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="ccl-snap ccl-snap--cream" id="cifras" ref={ref}>
      <div className="ccl-wrap ccl-snap__inner">
        <span className="ccl-eyebrow">Cabaña en cifras</span>
        <h2 className="ccl-display ccl-h2" style={{ marginTop: 12 }}>
          Números de la casa.
        </h2>

        <div className="ccl-stats">
          {STATS.map((stat, i) => (
            <div key={stat.label} className="ccl-stat">
              <div className="ccl-stat__value">
                {stat.text ? stat.text : formatValue(values[i], stat.prefix)}
              </div>
              <div className="ccl-stat__label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}