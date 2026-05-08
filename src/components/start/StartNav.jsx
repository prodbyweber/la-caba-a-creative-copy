import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MENU_ITEMS = [
  { label: "Quiénes Somos", href: "#about" },
  { label: "Artistas / Creadores", href: "#artists" },
  { label: "Marcas", href: "#brands" },
  { label: "Elige tu Camino", href: "#choose" },
  { label: "Work With Us", href: "#cta" },
];

export default function StartNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNav = (e, href) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      setMenuOpen(false);
      setTimeout(() => {
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, menuOpen ? 400 : 0);
    } else {
      setMenuOpen(false);
    }
  };

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      {/* Fixed nav bar */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between"
        style={{ padding: "clamp(20px, 4vw, 32px) clamp(24px, 6vw, 56px)", pointerEvents: "all" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {/* Logo — same style as LandingNav */}
        <a
          href="/start"
          className="flex items-center gap-2 select-none"
          style={{ textDecoration: "none" }}
        >
          <div style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 900, lineHeight: 1, display: "flex", flexDirection: "column" }}>
            <span style={{ letterSpacing: "-0.04em", display: "inline-flex", alignItems: "flex-start", lineHeight: 1, color: "#ff5833", fontWeight: 900, fontSize: "1.1rem" }}>
              Cabaña<sup style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.55rem", fontWeight: 400, marginLeft: "3px", verticalAlign: "top", position: "relative", top: "2px" }}>®</sup>
            </span>
            <span style={{ letterSpacing: "-0.04em", display: "block", lineHeight: 1, color: "white", fontWeight: 900, fontSize: "1.1rem" }}>Creative</span>
          </div>
        </a>

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Menu"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "5px",
            alignItems: "flex-end",
          }}
        >
          <motion.span
            animate={menuOpen ? { rotate: 45, y: 7, width: "24px" } : { rotate: 0, y: 0, width: "24px" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: "block", height: "1.5px", background: "#f0ede8", borderRadius: "2px", transformOrigin: "center" }}
          />
          <motion.span
            animate={menuOpen ? { opacity: 0, x: 8 } : { opacity: 1, x: 0, width: "16px" }}
            transition={{ duration: 0.2 }}
            style={{ display: "block", height: "1.5px", background: "#f0ede8", borderRadius: "2px", width: "16px" }}
          />
          <motion.span
            animate={menuOpen ? { rotate: -45, y: -7, width: "24px" } : { rotate: 0, y: 0, width: "24px" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: "block", height: "1.5px", background: "#f0ede8", borderRadius: "2px", transformOrigin: "center" }}
          />
        </button>
      </motion.header>

      {/* Fullscreen overlay menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[99] flex flex-col justify-center"
            style={{
              background: "rgba(8,8,8,0.97)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
            }}
            onClick={() => setMenuOpen(false)}
          >
            <nav
              className="flex flex-col"
              style={{ padding: "0 clamp(32px, 8vw, 80px)" }}
              onClick={e => e.stopPropagation()}
            >
              {MENU_ITEMS.map((item, i) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  onClick={e => handleNav(e, item.href)}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ x: 8, color: "#ffffff" }}
                  style={{
                    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                    fontWeight: 900,
                    fontSize: "clamp(2rem, 6vw, 4.5rem)",
                    letterSpacing: "-0.03em",
                    color: "rgba(240,237,232,0.55)",
                    textDecoration: "none",
                    lineHeight: 1.1,
                    paddingBottom: "clamp(12px, 2.5vw, 24px)",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    marginBottom: "clamp(12px, 2.5vw, 24px)",
                    display: "block",
                    transition: "color 0.2s ease",
                  }}
                >
                  {item.label}
                </motion.a>
              ))}
            </nav>

            {/* Close hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5 }}
              style={{
                position: "absolute",
                bottom: "clamp(24px, 5vw, 48px)",
                left: "clamp(32px, 8vw, 80px)",
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "#f0ede8",
              }}
            >
              Esc para cerrar
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}