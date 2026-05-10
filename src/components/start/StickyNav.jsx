import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useActiveSection, { SECTIONS } from "./useActiveSection";

const NAV_ITEMS = [
  { key: "hero",     label: "Inicio" },
  { key: "explorar", label: "Explorar" },
  { key: "about",    label: "Quiénes Somos" },
  { key: "artists",  label: "Creadores" },
  { key: "choose",   label: "Comenzar" },
];

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

export default function StickyNav() {
  const active = useActiveSection();
  const isChooseSection = active === "choose";
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => setPanelOpen(e.detail.open);
    window.addEventListener("choose-panel-change", handler);
    return () => window.removeEventListener("choose-panel-change", handler);
  }, []);

  const hidden = isChooseSection && panelOpen;

  return (
    <AnimatePresence>
      {!hidden && (
    <motion.nav
      initial={{ opacity: 0, x: isChooseSection ? 12 : -12 }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      exit={{ opacity: 0, x: isChooseSection ? 12 : -12, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: active === "hero" && !panelOpen ? 1.2 : 0 }}
      style={{
        position: "fixed",
        bottom: "clamp(28px, 5vw, 48px)",
        left: isChooseSection ? "auto" : "clamp(20px, 5vw, 48px)",
        right: isChooseSection ? "clamp(20px, 5vw, 48px)" : "auto",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        gap: "0",
        alignItems: isChooseSection ? "flex-end" : "flex-start",
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
              color: isChoose
                ? "#ff5833"
                : isActive
                  ? "#f0ede8"
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
              textAlign: isChooseSection ? "right" : "left",
              flexDirection: isChooseSection ? "row-reverse" : "row",
              textShadow: isActive ? "0 1px 8px rgba(0,0,0,0.6)" : "none",
            }}
          >
            {item.label}
            {isActive && (
              <motion.span
                initial={{ opacity: 0, x: isChooseSection ? 4 : -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                style={{ fontSize: "0.7em", opacity: 0.7 }}
              >
                {isChooseSection ? "←" : "→"}
              </motion.span>
            )}
          </button>
        );
      })}
    </motion.nav>
      )}
    </AnimatePresence>
  );
}