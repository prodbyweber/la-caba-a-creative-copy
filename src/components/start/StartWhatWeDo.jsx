import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import StartBrandsCarousel from "./StartBrandsCarousel";

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
        height: "100dvh",
        minHeight: "500px",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        background: "#0c0c0c",
        overflow: "hidden",
        overflowY: "auto",
        padding: "clamp(40px, 6vw, 80px) clamp(24px, 8vw, 100px) 0",
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

      <div style={{ maxWidth: "720px", width: "100%", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: "clamp(20px, 4vw, 32px)" }}>
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
            marginBottom: "8px",
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
            gap: "clamp(12px, 2.5vw, 20px)",
            maxWidth: "720px",
          }}
        >
          {[
            "Cabaña Creative es una compañía de producción creativa y sello discográfico con base en Madrid, España.",
            "Fundada en 2020 en Venezuela, nace con la visión de conectar a una nueva generación de creadores independientes a través de la música, el cine, la moda y la cultura.",
            "Hoy, se ha consolidado como una plataforma creativa donde convergen influencias latinas, afro y contemporáneas de la escena europea, desarrollando proyectos con identidad, dirección artística y una estética moderna y cinematográfica.",
            "Creemos en las grandes ideas, en los jóvenes soñadores y en quienes siguen creando",
          ].map((p, i) => (
            <p
              key={i}
              style={{
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontWeight: 900,
                fontSize: i === 0 || i === 1
                  ? "clamp(1rem, 2vw, 1.3rem)"
                  : "clamp(0.75rem, 1.3vw, 0.95rem)",
                lineHeight: 1.4,
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
          transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            height: "1px",
            background: "rgba(240,237,232,0.15)",
            transformOrigin: "left",
            maxWidth: "180px",
          }}
        />

        {/* Brands Carousel */}
        <StartBrandsCarousel />
      </div>
    </section>
  );
}