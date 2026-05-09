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
        height: "100dvh",
        minHeight: "500px",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        background: "#0c0c0c",
        overflow: "hidden",
        padding: "0 clamp(24px, 8vw, 100px)",
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

      <div style={{ maxWidth: "760px", position: "relative", zIndex: 1 }}>
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontWeight: 700,
            fontSize: "10px",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "rgba(240,237,232,0.3)",
            marginBottom: "clamp(20px, 4vw, 40px)",
          }}
        >
          Quiénes Somos
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontWeight: 900,
            fontSize: "clamp(1.3rem, 2.8vw, 2.2rem)",
            lineHeight: 1.2,
            letterSpacing: "-0.035em",
            color: "#f0ede8",
            marginBottom: "clamp(24px, 5vw, 48px)",
            maxWidth: "760px",
          }}
        >
          Cabaña Creative es una compañía de producción creativa y sello discográfico con base en Madrid. Fundada en 2020 en Venezuela, surge con la intención de conectar con una nueva generación de creadores independientes a través de la música, la narrativa visual y la cultura. Lo que comenzó como una visión impulsada por crear oportunidades para talentos emergentes en Latinoamérica, evolucionó hasta convertirse en una compañía de producción creativa y sello discográfico con base en Madrid. Hoy, Cabaña Creative reúne música, moda y producción audiovisual dentro de una estética moderna influenciada por la cultura latina y afro, incorporando matices y tendencias contemporáneas de la escena europea. En una industria cada vez más saturada, buscamos crear proyectos con identidad, claridad y dirección artística, dando espacio a creadores con visión para expresarse de manera auténtica. Creemos en los jóvenes con grandes sueños, en las ideas que nacen desde la pasión y en las personas que siguen creando incluso cuando todo parece imposible. Esa energía es el combustible que mueve todo lo que hacemos.
        </motion.p>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 1, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{
            height: "1px",
            background: "rgba(240,237,232,0.12)",
            transformOrigin: "left",
            maxWidth: "200px",
          }}
        />
      </div>
    </section>
  );
}