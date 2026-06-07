import React from "react";
import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 48, filter: "blur(8px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: EASE, delay },
});

export default function MarcasSectores() {
  const sectores = [
    "Moda y Streetwear",
    "Calzado",
    "Bebidas",
    "Belleza y Cosmética",
    "Audio y Tecnología",
    "Marca Personal",
    "Eventos y Conciertos",
    "Hostelería",
  ];

  return (
    <section style={{
      padding: "clamp(60px, 8vw, 80px) clamp(24px, 6vw, 56px)",
      maxWidth: "1440px",
      margin: "0 auto",
      width: "100%",
      boxSizing: "border-box",
    }}>
      {/* Supratítulo */}
      <motion.p {...fadeUp(0)} style={{
        fontSize: "clamp(10px, 2vw, 12px)",
        fontWeight: 700,
        color: "#ff5833",
        textTransform: "uppercase",
        letterSpacing: "0.22em",
        marginBottom: "16px",
        fontFamily: "'Helvetica Neue', sans-serif",
      }}>
        CON QUIÉN TRABAJAMOS
      </motion.p>

      {/* Headline */}
      <motion.h2 {...fadeUp(0.08)} style={{
        fontSize: "clamp(28px, 4vw, 60px)",
        fontWeight: 900,
        lineHeight: 1.2,
        marginBottom: "48px",
        letterSpacing: "-0.02em",
        fontFamily: "'Helvetica Neue', sans-serif",
        maxWidth: "100%",
        wordBreak: "break-word",
        overflowWrap: "break-word",
      }}>
        Marcas que quieren conectar con la generación más influyente del mercado.
      </motion.h2>

      {/* Tags */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", maxWidth: "100%" }}>
        {sectores.map((sector, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 24, scale: 0.88, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45, ease: EASE, delay: 0.05 + i * 0.055 }}
            style={{
              padding: "12px 20px",
              border: "2px solid #ff5833",
              color: "#ff5833",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: 600,
              background: "rgba(255,88,51,0.08)",
              fontFamily: "'Helvetica Neue', sans-serif",
            }}
          >
            {sector}
          </motion.span>
        ))}
      </div>
    </section>
  );
}