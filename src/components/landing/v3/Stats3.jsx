import React, { useEffect, useRef, useState } from "react";
import { STATS } from "./constants";

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
  const [values, setValues] = useState(() => STATS.map((s) => (s.value === null ? null : 0)));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const finish = () => setValues(STATS.map((s) => s.value));
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
        if (!entries[0].isIntersecting) return;
        if (reduce) finish();
        else animate();
        io.disconnect();
      },
      { threshold: 0.3 }
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