import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import StartBrandsCarousel from "./StartBrandsCarousel";

export default function StartWhatWeDo() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const brandsRef = useRef(null);
  const brandsInView = useInView(brandsRef, { once: true, margin: "-100px" });

  return (
    <>
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

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "clamp(16px, 3vw, 28px)",
            marginBottom: "clamp(24px, 5vw, 48px)",
            maxWidth: "720px",
          }}
        >
          {[
            "Fundada en 2020 en Venezuela y actualmente con base en Madrid, España, Cabaña Creative nace con la visión de conectar a una nueva generación de creadores independientes a través de la música, el cine, la moda y la cultura.",
            "Hoy, se ha consolidado como una plataforma creativa donde convergen influencias latinas, afro y contemporáneas de la escena europea, desarrollando proyectos con identidad, dirección artística y una estética moderna y cinematográfica.",
            "Creemos en las grandes ideas, en los jóvenes soñadores y en quienes siguen creando incluso cuando todo parece imposible.",
          ].map((p, i) => (
            <p
              key={i}
              style={{
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontWeight: 900,
                fontSize: i === 0
                  ? "clamp(1rem, 2.2vw, 1.5rem)"
                  : "clamp(0.8rem, 1.4vw, 1rem)",
                lineHeight: 1.45,
                letterSpacing: i === 0 ? "-0.03em" : "-0.015em",
                color: i === 0 ? "#f0ede8" : "rgba(240,237,232,0.6)",
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

    {/* Brands Carousel Section */}
    <section
      id="brands-carousel"
      ref={brandsRef}
      style={{
        position: "relative",
        width: "100%",
        minHeight: "auto",
        background: "#0c0c0c",
        padding: "clamp(60px, 12vw, 120px) clamp(24px, 8vw, 100px)",
        overflow: "hidden",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={brandsInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{ marginBottom: "clamp(40px, 8vw, 60px)" }}
      >
        <p
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontWeight: 700,
            fontSize: "10px",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "rgba(240,237,232,0.3)",
            margin: 0,
            marginBottom: "clamp(20px, 4vw, 32px)",
          }}
        >
          Marcas con las que hemos colaborado
        </p>
        <p
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontWeight: 300,
            fontSize: "clamp(0.8rem, 1.6vw, 0.95rem)",
            color: "rgba(240,237,232,0.5)",
            lineHeight: 1.5,
            maxWidth: "600px",
            margin: 0,
          }}
        >
          Trabajamos con marcas líderes en cultura, moda y tecnología para crear experiencias únicas.
        </p>
      </motion.div>

      <div style={{ overflow: "hidden" }}>
        {brandsInView && <StartBrandsCarousel />}
      </div>
    </section>
    </>
  );
}