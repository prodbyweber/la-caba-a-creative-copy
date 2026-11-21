import React, { useEffect, useRef, useState } from "react";

export function formatCompact(value) {
  const n = Number(value) || 0;
  if (n >= 1000000) {
    const m = n / 1000000;
    return `${m >= 10 || Number.isInteger(m) ? Math.round(m) : m.toFixed(1)}M`;
  }
  if (n >= 1000) {
    const k = n / 1000;
    return `${k >= 10 || Number.isInteger(k) ? Math.round(k) : k.toFixed(1)}K`;
  }
  return `${Math.round(n)}`;
}

/** Cifra que cuenta hasta su valor cuando entra en pantalla. */
export default function Counter({ value = 0, prefix = "", suffix = "", className = "" }) {
  const ref = useRef(null);
  const [n, setN] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        if (reduce) {
          setN(Number(value) || 0);
          return;
        }
        const start = performance.now();
        const duration = 1500;
        const tick = (now) => {
          const p = Math.min((now - start) / duration, 1);
          setN((Number(value) || 0) * (1 - Math.pow(1 - p, 3)));
          if (p < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );

    io.observe(el);
    return () => {
      io.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatCompact(n)}
      {suffix}
    </span>
  );
}