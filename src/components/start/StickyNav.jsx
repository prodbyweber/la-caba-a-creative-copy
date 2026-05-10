import React from "react";
import { motion } from "framer-motion";
import useActiveSection, { SECTIONS } from "./useActiveSection";

const NAV_ITEMS = [
  { key: "hero",    label: "Inicio" },
  { key: "about",   label: "Quiénes Somos" },
  { key: "artists", label: "Artistas" },
  { key: "brands",  label: "Marcas" },
  { key: "choose",  label: "Comenzar" },
];

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

export default function StickyNav() {
  const active = useActiveSection();

  return (
    <motion.nav
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "fixed",
        bottom: "clamp(28px, 5vw, 48px)",
        left: "clamp(20px, 5vw, 48px)",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        gap: "0",
        alignItems: "flex-start",
        pointerEvents: "all",
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = active === item.key;
        const isChoose = item.key === "choose";

        return (
          <button
            key={item.key}
            onClick={() => scrollTo(item.key)}
            style={{
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontWeight: 900,
              fontSize: isActive ? "clamp(1.4rem, 4vw, 2.4rem)" : "clamp(1rem, 2.8vw, 1.6rem)",
              letterSpacing: "-0.025em",
              color: isActive
                ? (isChoose ? "#ff5833" : "#f0ede8")
                : isChoose
                  ? "rgba(255,88,51,0.45)"
                  : "rgba(240,237,232,0.38)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              lineHeight: 1.2,
              paddingBottom: "clamp(2px, 0.5vw, 5px)",
              marginBottom: "clamp(1px, 0.4vw, 4px)",
              display: "flex",
              alignItems: "center",
              gap: isActive ? "10px" : "0px",
              transition: "font-size 0.35s ease, color 0.35s ease, gap 0.35s ease",
              textAlign: "left",
              textShadow: isActive ? "0 1px 8px rgba(0,0,0,0.6)" : "none",
            }}
          >
            {item.label}
            {isActive && (
              <motion.span
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                style={{ fontSize: "0.7em", opacity: 0.7 }}
              >
                →
              </motion.span>
            )}
          </button>
        );
      })}
    </motion.nav>
  );
}