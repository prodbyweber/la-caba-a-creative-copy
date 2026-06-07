import React from "react";
import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

export default function MarcasContacto() {
  const handleClick = () => {
    window.dispatchEvent(new CustomEvent("open-application-modal"));
  };

  return (
    <section style={{
      padding: "80px 24px",
      maxWidth: "1200px",
      margin: "0 auto",
      textAlign: "center",
    }}>
      <motion.h2
        initial={{ opacity: 0, y: 60, filter: "blur(12px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.65, ease: EASE }}
        style={{
          fontSize: "clamp(28px, 5vw, 60px)",
          fontWeight: 900,
          lineHeight: 1.2,
          marginBottom: "24px",
          letterSpacing: "-0.02em",
          fontFamily: "'Helvetica Neue', sans-serif",
        }}
      >
        ¿List@ para conectar con la Gen Z?
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 36, filter: "blur(8px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.55, ease: EASE, delay: 0.1 }}
        style={{
          fontSize: "clamp(14px, 2vw, 18px)",
          color: "rgba(240,237,232,0.5)",
          maxWidth: "600px",
          margin: "0 auto 32px",
          lineHeight: 1.7,
          fontFamily: "'Helvetica Neue', sans-serif",
        }}
      >
        Una videollamada con nuestro equipo para aterrizar tu proyecto.
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 28, scale: 0.9, filter: "blur(6px)" }}
        whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.18 }}
        onClick={handleClick}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "12px",
          padding: "14px 28px",
          background: "#ff5833",
          color: "white",
          border: "none",
          borderRadius: "9px",
          fontWeight: 700,
          fontSize: "14px",
          cursor: "pointer",
          transition: "all 0.2s",
          fontFamily: "'Helvetica Neue', sans-serif",
          marginBottom: "24px",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#e04a28";
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#ff5833";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        Solicitar reunión
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </motion.button>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.28 }}
        style={{
          fontSize: "12px",
          color: "rgba(240,237,232,0.3)",
          fontFamily: "'Helvetica Neue', sans-serif",
        }}
      >
        Respuesta en menos de 24h · Plazas limitadas
      </motion.p>
    </section>
  );
}