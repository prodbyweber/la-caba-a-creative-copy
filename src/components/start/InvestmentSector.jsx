import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function InvestmentSector() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      style={{
        background: "#080808",
        padding: "clamp(80px, 10vw, 120px) clamp(24px, 6vw, 56px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle bg gradient */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "200px",
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(255,88,51,0.04) 0%, transparent 70%)",
        }}
      />

      <div style={{ maxWidth: "720px", position: "relative", zIndex: 1 }}>
        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: 0.8,
            delay: 0.1,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontWeight: 900,
            fontSize: "clamp(1.8rem, 4.5vw, 3.2rem)",
            letterSpacing: "-0.04em",
            lineHeight: 0.95,
            color: "#f0ede8",
            marginBottom: "clamp(24px, 4vw, 40px)",
            maxWidth: "640px",
          }}
        >
          Invierte en un sector que nunca deja de crecer.
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: 0.7,
            delay: 0.2,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontWeight: 300,
            fontSize: "clamp(0.85rem, 1.5vw, 1rem)",
            color: "rgba(240,237,232,0.52)",
            lineHeight: 1.65,
            margin: 0,
            maxWidth: "600px",
          }}
        >
          La música no depende de bolsas ni ciclos económicos, y la gente nunca
          deja de escucharla. Once años consecutivos de crecimiento. $31.700M en
          ingresos globales en 2025. El momento es ahora.
        </motion.p>
      </div>
    </section>
  );
}