import React from "react";
import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

export default function MarcasManifiesto() {
  const handleClick = () => {
    window.dispatchEvent(new CustomEvent("open-application-modal"));
  };

  return (
    <section style={{
      background: "#ff5833",
      padding: "80px 24px",
      minHeight: "60dvh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{ maxWidth: "800px", textAlign: "center" }}>
        <motion.h2
          initial={{ opacity: 0, y: 60, filter: "blur(12px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, ease: EASE }}
          style={{
            fontSize: "clamp(36px, 8vw, 80px)",
            fontWeight: 900,
            lineHeight: 1.15,
            marginBottom: "24px",
            color: "white",
            letterSpacing: "-0.02em",
            fontFamily: "'Helvetica Neue', sans-serif",
          }}
        >
          Revoluciona en el mercado europeo.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.58, ease: EASE, delay: 0.1 }}
          style={{
            fontSize: "clamp(14px, 2.5vw, 20px)",
            color: "rgba(255,255,255,0.9)",
            lineHeight: 1.7,
            marginBottom: "32px",
            fontFamily: "'Helvetica Neue', sans-serif",
          }}
        >
          Hoy cualquier marca debería crear contenido artístico para ir más allá. Nosotros lo entendemos. Conocemos las claves. Únete a esta nueva etapa.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 30, scale: 0.92, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.18 }}
          onClick={handleClick}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
            padding: "14px 28px",
            background: "white",
            color: "#ff5833",
            border: "none",
            borderRadius: "9px",
            fontWeight: 700,
            fontSize: "14px",
            cursor: "pointer",
            transition: "all 0.2s",
            fontFamily: "'Helvetica Neue', sans-serif",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.9)";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "white";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          Hablemos
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </motion.button>
      </div>
    </section>
  );
}