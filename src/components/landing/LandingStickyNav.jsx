import React from "react";
import { useNavigate } from "react-router-dom";
import useActiveSection from "@/components/start/useActiveSection";

const NAV_ITEMS = [
  { key: "hero",     label: "Inicio" },
  { key: "artists",  label: "Creadores" },
  { key: "about",    label: "Quiénes Somos" },
  { key: "choose",   label: "Reservar" },
];

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  if (id === "choose") {
    el.scrollIntoView({ behavior: "smooth", block: "end" });
  } else {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

export default function LandingStickyNav() {
  const active = useActiveSection();
  const isChooseSection = active === "choose";
  const navigate = useNavigate();

  return (
    <nav
      style={{
        position: "fixed",
        bottom: `${typeof window !== "undefined" && window.innerWidth >= 768 ? "clamp(30px, 3vw, 60px)" : "max(calc(65px + env(safe-area-inset-bottom, 0px) + 12px), clamp(28px, 5vw, 48px))"}`,
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
        const shouldShow = isChooseSection ? isChoose : true;

        if (!shouldShow) return null;

        return (
          <div key={item.key} style={{ overflow: "hidden" }}>
            <button
              onClick={() => isChoose ? navigate("/reservas") : scrollTo(item.key)}
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
              {isActive && isChoose && (
                <span style={{ fontSize: "0.7em", opacity: 0.7 }}>
                  {isChooseSection ? "←" : "→"}
                </span>
              )}
            </button>
          </div>
        );
      })}
    </nav>
  );
}