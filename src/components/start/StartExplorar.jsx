import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import StartExplorarBlock from "./StartExplorarBlock";

export default function StartExplorar({ showButton = true }) {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-60px" });

  return (
    <section
      id="explorar"
      ref={sectionRef}
      style={{
        position: "relative",
        width: "100%",
        background: "#0a0a0b",
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "clamp(60px, 8vw, 100px) clamp(24px, 6vw, 56px) clamp(60px, 8vw, 100px)",
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "700px", height: "300px", pointerEvents: "none",
        background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(255,88,51,0.05) 0%, transparent 70%)"
      }} />

      {/* Label + headline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{ marginBottom: "clamp(24px, 4vw, 40px)", position: "relative", zIndex: 1 }}
      >
        <p style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontWeight: 700, fontSize: "10px", letterSpacing: "0.35em",
          textTransform: "uppercase", color: "#ff5833",
          marginBottom: "clamp(10px, 1.5vw, 16px)",
        }}>
          Explorar
        </p>
        <h2 style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontWeight: 900,
          fontSize: "clamp(1.8rem, 5vw, 3.5rem)",
          letterSpacing: "-0.04em",
          lineHeight: 0.9,
          color: "#f0ede8",
          marginBottom: "clamp(12px, 2vw, 20px)",
        }}>
          Atrévete a explorar
        </h2>
        <p style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontWeight: 300,
          fontSize: "clamp(0.75rem, 1.4vw, 0.95rem)",
          color: "rgba(240,237,232,0.5)",
          maxWidth: "480px",
          lineHeight: 1.6,
        }}>
          Curamos música, films y contenido audiovisual con criterio.
        </p>
      </motion.div>

      {/* Filas de contenido funcional */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: "relative", zIndex: 1, marginBottom: "clamp(28px, 4vw, 40px)" }}
      >
        <StartExplorarBlock />
      </motion.div>

      {/* CTA Button */}
      {showButton && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "center", marginTop: "clamp(12px, 2vw, 24px)" }}
        >
          <button
            onClick={() => window.location.href = "/Explorar"}
            style={{
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontWeight: 900,
              fontSize: "clamp(1rem, 2vw, 1.3rem)",
              letterSpacing: "-0.02em",
              background: "rgba(240,237,232,0.08)",
              color: "#f0ede8",
              border: "1.5px solid rgba(240,237,232,0.3)",
              padding: "clamp(14px, 2.5vw, 20px) clamp(40px, 7vw, 60px)",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(240,237,232,0.12)";
              e.currentTarget.style.borderColor = "rgba(240,237,232,0.5)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(240,237,232,0.08)";
              e.currentTarget.style.borderColor = "rgba(240,237,232,0.3)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Acceder
          </button>
        </motion.div>
      )}
    </section>
  );
}