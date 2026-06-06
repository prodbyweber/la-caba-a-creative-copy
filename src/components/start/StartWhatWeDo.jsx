import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function StartWhatWeDo() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="about"
      ref={ref}
      style={{
        position: "relative",
        width: "100%",
        minHeight: "560px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0c0c0c",
        overflow: "hidden",
        padding: "clamp(32px, 5vw, 64px) clamp(24px, 8vw, 100px)",
      }}
    >
      {/* Subtle background texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 80% 60% at 80% 50%, rgba(240,237,232,0.02) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: "720px", width: "100%", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: "clamp(16px, 3vw, 24px)" }}>
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontWeight: 700,
            fontSize: "9px",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "rgba(240,237,232,0.35)",
            margin: 0,
          }}
        >
          Quiénes Somos
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "clamp(10px, 2vw, 16px)",
            maxWidth: "720px",
          }}
        >
          {[
            "Cabaña Creative es una compañía de producción creativa y sello discográfico con base en Madrid, España.",
            "Fundada en 2020 en Venezuela y actualmente con base en Madrid, España, Cabaña Creative nace con la visión de conectar a una nueva generación de creadores independientes a través de la música, el cine, la moda y la cultura.",
            "Hoy, se ha consolidado como una plataforma creativa donde convergen influencias latinas, afro y contemporáneas de la escena europea, desarrollando proyectos con identidad y dirección artística.",
            "Creemos en las grandes ideas, en los jóvenes soñadores y en quienes siguen creando incluso cuando todo parece imposible.",
          ].map((p, i) => (
            <p
              key={i}
              style={{
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontWeight: 900,
                fontSize: i === 0 || i === 1
                  ? "clamp(0.9rem, 1.8vw, 1.2rem)"
                  : "clamp(0.72rem, 1.2vw, 0.88rem)",
                lineHeight: 1.38,
                letterSpacing: i === 0 || i === 1 ? "-0.025em" : "-0.01em",
                color: i === 0 || i === 1 ? "#f0ede8" : "rgba(240,237,232,0.65)",
                margin: 0,
              }}
            >
              {p}
            </p>
          ))}
        </motion.div>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{
            height: "1px",
            background: "rgba(240,237,232,0.12)",
            transformOrigin: "left",
            maxWidth: "160px",
          }}
        />

      </div>
    </section>
  );
}