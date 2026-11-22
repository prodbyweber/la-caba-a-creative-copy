import React, { useEffect, useMemo, useState } from "react";

const DEFAULT_HOLD = 2000;
const DEFAULT_FINAL_HOLD = 3500;

/** Ordena y limpia los cuadros guardados en el admin. */
export function normalizeFrames(frames) {
  return (Array.isArray(frames) ? frames : [])
    .filter((f) => f && (f.word || f.top))
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/**
 * Texto animado del hero: los cuadros 1..n comparten la primera línea y solo
 * cambia la palabra en naranja (sale arriba, entra desde abajo); el último
 * cuadro sustituye el bloque por el nombre grande de la casa.
 */
export default function HeroRotator({
  frames = [],
  finalTop = "La",
  finalWord = "Cabaña",
  finalHold = DEFAULT_FINAL_HOLD,
  subtitle = "",
  eyebrow = "",
  lead = "",
}) {
  const list = useMemo(() => normalizeFrames(frames), [frames]);
  const [reduce, setReduce] = useState(false);
  const [step, setStep] = useState(0);
  const [snap, setSnap] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const onChange = (event) => setReduce(event.matches);
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
    };
  }, []);

  const total = list.length;
  const isFinal = step >= total;

  useEffect(() => {
    if (reduce || total === 0) return undefined;
    const hold = isFinal
      ? finalHold || DEFAULT_FINAL_HOLD
      : list[step]?.hold_ms || DEFAULT_HOLD;

    const timer = setTimeout(() => {
      if (isFinal) {
        setSnap(true);
        setStep(0);
        setTimeout(() => setSnap(false), 80);
      } else {
        setStep((v) => v + 1);
      }
    }, hold);

    return () => clearTimeout(timer);
  }, [step, isFinal, total, finalHold, reduce, list]);

  if (total === 0) return null;

  if (reduce) {
    const last = list[total - 1];
    return (
      <>
        {eyebrow ? <p className="ccl-hero5__eyebrow">{eyebrow}</p> : null}
        <div className="ccl-hero5__stage">
          <p className="ccl-display ccl-hero5__line">
            {last.top} <span className="ccl-hero5__rot">{last.prefix} {last.word}</span>
          </p>
        </div>
        {lead ? (
          <div className="ccl-hero5__notes">
            <p className="ccl-hero5__note">{lead}</p>
          </div>
        ) : null}
      </>
    );
  }

  const current = list[Math.min(step, total - 1)];
  const offset = (100 / total) * Math.min(step, total - 1);

  return (
    <>
      {eyebrow ? <p className="ccl-hero5__eyebrow">{eyebrow}</p> : null}

      <div className="ccl-hero5__stage">
        <div className={`ccl-hero5__seq${isFinal ? " is-off" : ""}`} aria-hidden="true">
          <span className="ccl-display ccl-hero5__line">{current.top}</span>
          <span className="ccl-display ccl-hero5__line ccl-hero5__line--word">
            <span className="ccl-hero5__prefix">{current.prefix}</span>
            <span className="ccl-hero5__window">
              <span
                className={`ccl-hero5__track${snap ? " is-snap" : ""}`}
                style={{ transform: `translateY(-${offset}%)` }}
              >
                {list.map((frame, i) => (
                  <span key={`${frame.word}-${i}`} className="ccl-hero5__word">
                    {frame.word}
                  </span>
                ))}
              </span>
            </span>
          </span>
        </div>

        <div className={`ccl-hero5__final${isFinal ? " is-on" : ""}`} aria-hidden="true">
          <span className="ccl-display ccl-hero5__final-top">{finalTop}</span>
          <span className="ccl-display ccl-hero5__final-word">{finalWord}</span>
        </div>
      </div>

      {lead || subtitle ? (
        <div className="ccl-hero5__notes">
          {lead ? (
            <p className={`ccl-hero5__note${isFinal ? " is-off" : ""}`}>{lead}</p>
          ) : null}
          {subtitle ? (
            <p className={`ccl-hero5__note ccl-hero5__note--final${isFinal ? " is-on" : ""}`}>
              {subtitle}
            </p>
          ) : null}
        </div>
      ) : null}
    </>
  );
}