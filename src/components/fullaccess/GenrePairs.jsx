import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { makeCombo } from "@/lib/fusionCombos";

const SWAP_MS = 3200;

export default function GenrePairs() {
  const [pair, setPair] = useState(() => makeCombo());

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const timer = setInterval(() => {
      setPair((prev) => makeCombo({ exclude: new Set(prev ? [prev.key] : []) }) || prev);
    }, SWAP_MS);
    return () => clearInterval(timer);
  }, []);

  if (!pair) return null;

  return (
    <div
      className="fa-pair"
      style={{ "--tint": pair.tint || "#ff5833", "--accent": pair.accent || "#ffb4a2" }}
    >
      <span className="fa-pair__glow" aria-hidden="true" />
      <div className="fa-pair__txt">
        <AnimatePresence mode="wait">
          <motion.span
            key={pair.key}
            className="fa-pair__name"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {pair.name}
          </motion.span>
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <motion.span
            key={`${pair.key}-mood`}
            className="fa-pair__mood"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            {pair.mood}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}