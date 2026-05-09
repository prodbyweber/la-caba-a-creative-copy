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

        <motion.h2
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontWeight: 900,
            fontSize: "clamp(2rem, 5vw, 4rem)",
            letterSpacing: "-0.03em",
            lineHeight: 1.0,
            color: "#f0ede8",
            marginBottom: "clamp(24px, 5vw, 48px)",
          }}
        >
          Creamos experiencias visuales y sonoras con dirección creativa.
        </motion.h2>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
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