import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const LOGO = "https://media.base44.com/images/public/6966ddf48947f217e81ea27c/6b7c4002a_Titulo.png";

// Navbar cinematográfico para /access.
// Transparente sobre el hero, fondo translúcido al hacer scroll.
// Izquierda: marca. Derecha: ACCESO + REGÍSTRATE.
export default function AccessNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? "rgba(8,8,8,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "1px solid transparent",
      }}
    >
      <div className="flex items-center justify-between px-5 sm:px-10 h-16">
        {/* Marca */}
        <Link to="/access" className="flex items-center gap-2.5 group">
          <img
            src={LOGO}
            alt="Cabaña Creative"
            className="h-9 w-auto opacity-90 group-hover:opacity-100 transition-opacity"
          />
        </Link>

        {/* Acciones */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/login"
            className="px-4 sm:px-5 py-2 rounded-full text-[11px] sm:text-xs font-semibold tracking-wide text-white/80 hover:text-white transition-colors"
            style={{ fontFamily: "'Helvetica Neue', sans-serif" }}
          >
            ACCESO
          </Link>
          <Link
            to="/register"
            className="px-4 sm:px-5 py-2 rounded-full text-[11px] sm:text-xs font-bold text-black transition-all hover:scale-[1.04]"
            style={{
              background: "white",
              fontFamily: "'Helvetica Neue', sans-serif",
              letterSpacing: "0.04em",
            }}
          >
            REGÍSTRATE
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}