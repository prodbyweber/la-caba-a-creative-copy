import React, { useEffect, useRef, useState } from "react";
import { DEFAULT_STATS } from "@/lib/homeDefaults";

function formatValue(value, prefix = "", suffix = "") {
  if (value === null || value === undefined) return "";
  if (value >= 1000000) {
    const m = value / 1000000;
    return `${prefix}${m >= 10 || Number.isInteger(m) ? Math.round(m) : m.toFixed(1)}M${suffix}`;
  }
  if (value >= 1000) {
    const k = value / 1000;
    return `${prefix}${k >= 10 || Number.isInteger(k) ? Math.round(k) : k.toFixed(1)}K${suffix}`;
  }
  return `${prefix}${Math.round(value)}${suffix}`;
}

const TONES = ["orange", "ink", "line"];

/** Cifras de la casa: tarjetas de color sobre fondo claro, justo tras el hero. */
export default function Stats3({ section, stats = [] }) {
  const list = (stats.length ? stats : DEFAULT_STATS).filter((s) => s.is_visible !== false);
  const ref = useRef(null);
  const [values, setValues] = useState(() => list.map(() => 0));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const finish = () => setValues(list.map((s) => s.value || 0));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;

    const animate = () => {
      const duration = 1400;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setValues(list.map((s) => (s.value || 0) * eased));
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
  }, [list.length]);

  return (
    <section className="ccl-snap ccl-snap--cream ccl-stats3" id="cifras" ref={ref}>
      <div className="ccl-wrap ccl-snap__inner">
        {section?.eyebrow && <span className="ccl-eyebrow">{section.eyebrow}</span>}
        <h2 className="ccl-display ccl-h2" style={{ marginTop: 12 }}>
          {section?.title || "Números de la casa."}
        </h2>

        <div className="ccl-stats3__grid">
          {list.map((stat, i) => (
            <div key={stat.id || stat.label} className={`ccl-statcard ccl-statcard--${TONES[i % 3]}`}>
              <div className="ccl-statcard__value">{formatValue(values[i], stat.prefix, stat.suffix)}</div>
              <div className="ccl-statcard__label">{stat.label}</div>
            </div>
          ))}
        </div>

        {section?.subtitle && <p className="ccl-small">{section.subtitle}</p>}
      </div>
    </section>
  );
}