import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function StartNav() {
  const [textVisible, setTextVisible] = useState(true);
  const [showCta, setShowCta] = useState(false);

  useEffect(() => {
    const aboutEl = document.getElementById("about");
    if (!aboutEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Ocultar texto cuando la sección about o inferior es visible
        setTextVisible(!entry.isIntersecting);
        // Mostrar CTA cuando se hace scroll past hero (about es visible)
        setShowCta(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(aboutEl);
    return () => observer.disconnect();
  }, []);

  const handleSolicitarPlaza = () => {
    window.dispatchEvent(new CustomEvent("open-application-modal"));
  };

  return (
    <>
      {/* Fixed nav bar */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between"
        style={{ 
          padding: "clamp(20px, 4vw, 32px) clamp(24px, 6vw, 56px)",
          pointerEvents: "all",
          maxWidth: "1920px",
          margin: "0 auto",
          left: 0,
          right: 0,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {/* Logo — same style as LandingNav */}
        <a
          href="/"
          className="flex items-center select-none"
          style={{ textDecoration: "none", gap: "clamp(8px, 1.5vw, 14px)" }}
          onClick={() => {
            const splash = document.getElementById("cabana-splash");
            if (splash) {
              splash.style.display = "none";
            }
          }}
        >
          <img
            src="https://media.base44.com/images/public/6966ddf48947f217e81ea27c/6b7c4002a_Titulo.png"
            alt=""
            style={{ height: "clamp(2rem, 5vw, 3rem)", width: "auto" }}
          />
          <AnimatePresence>
            {textVisible && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 900, lineHeight: 1, display: "flex", flexDirection: "column" }}
              >
                <span style={{ letterSpacing: "-0.04em", display: "inline-flex", alignItems: "flex-start", lineHeight: 1, color: "#ff5833", fontWeight: 900, fontSize: "clamp(1rem, 2.5vw, 1.4rem)" }}>
                  Cabaña<sup style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.5em", fontWeight: 400, marginLeft: "3px", verticalAlign: "super" }}>®</sup>
                </span>
                <span style={{ letterSpacing: "-0.04em", display: "block", lineHeight: 1, color: "white", fontWeight: 900, fontSize: "clamp(1rem, 2.5vw, 1.4rem)" }}>Creative</span>
              </motion.div>
            )}
          </AnimatePresence>
        </a>

        {/* CTA Button — Desktop only, appears on scroll */}
        <AnimatePresence>
          {showCta && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={handleSolicitarPlaza}
              style={{
                display: "none",
                fontFamily: "'Helvetica Neue', sans-serif",
                fontWeight: 700,
                fontSize: "0.85rem",
                letterSpacing: "0.01em",
                background: "#ff5833",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "11px 20px",
                cursor: "pointer",
                transition: "background 0.2s ease, transform 0.2s ease",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#e04a28"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#ff5833"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              Solicitar plaza →
            </motion.button>
          )}
        </AnimatePresence>

        <style>{`
          @media (min-width: 768px) {
            button[style*="display: none"] {
              display: flex !important;
            }
          }
          @media (min-width: 1280px) {
            header[style*="max-width"] {
              padding-left: 56px !important;
              padding-right: 56px !important;
            }
          }
        `}</style>

      </motion.header>
    </>
  );
}