import React, { useEffect, useState } from "react";

const SLIDE_MS = 500;

/** Palabra que se reemplaza por otra con un deslizamiento cada 0,5 s. */
export default function RotatingWord({ words, className = "" }) {
  const list = Array.isArray(words) && words.length ? words : [""];
  const [index, setIndex] = useState(0);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
  }, []);

  useEffect(() => {
    if (reduce || list.length < 2) return undefined;
    const timer = setInterval(() => setIndex((v) => (v + 1) % list.length), SLIDE_MS);
    return () => clearInterval(timer);
  }, [list.length, reduce]);

  const word = list[index % list.length];

  return (
    <span className={className}>
      <span key={`${word}-${index}`} className="ccl-rot__word">
        {word}
      </span>
    </span>
  );
}