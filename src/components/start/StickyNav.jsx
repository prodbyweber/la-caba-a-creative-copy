import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import useActiveSection, { SECTIONS } from "./useActiveSection";

const NAV_ITEMS = [
  { key: "hero",     label: "Inicio" },
  { key: "explorar", label: "Explorar" },
  { key: "artists",  label: "Creadores" },
  { key: "about",    label: "Quiénes Somos" },
  { key: "choose",   label: "Comenzar" },
];

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

export default function StickyNav({ showMoreInfo = false }) {
  const active = useActiveSection();
  const isChooseSection = active === "choose";
  const navigate = useNavigate();
  const [panelOpen, setPanelOpen] = useState(false);

  const [storiesOpen, setStoriesOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => setPanelOpen(e.detail.open);
    window.addEventListener("choose-panel-change", handler);
    return () => window.removeEventListener("choose-panel-change", handler);
  }, []);

  useEffect(() => {
    const handler = (e) => setStoriesOpen(e.detail.open);
    window.addEventListener("stories-panel-change", handler);
    return () => window.removeEventListener("stories-panel-change", handler);
  }, []);

  const hidden = (isChooseSection && panelOpen) || storiesOpen;

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
        bottom: "max(calc(65px + env(safe-area-inset-bottom, 0px) + 12px), clamp(28px, 5vw, 48px))",
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
          <React.Fragment key={item.key}>
            <button
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

            {/* Botón Más información — solo en Landing y en sección "Comenzar" */}
            {showMoreInfo && isChoose && isActive && (
              <motion.button
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                onClick={() => navigate("/start")}
                style={{
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                  fontWeight: 900,
                  fontSize: "clamp(0.7rem, 1.6vw, 0.85rem)",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  background: "#ff5833",
                  color: "#fff",
                  border: "none",
                  borderRadius: "99px",
                  padding: "8px 20px",
                  cursor: "pointer",
                  marginTop: "clamp(6px, 1.5vw, 12px)",
                  alignSelf: isChooseSection ? "flex-end" : "flex-start",
                  transition: "background 0.2s ease",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#e04a20"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#ff5833"; }}
              >
                Más información →
              </motion.button>
            )}
          </React.Fragment>
        );
      })}
    </motion.nav>
      )}
    </AnimatePresence>
  );
}