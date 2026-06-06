import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function MarcasHero() {
  const handleClick = () => {
    window.dispatchEvent(new CustomEvent("open-application-modal"));
  };

  return (
    <section style={{
      position: "relative",
      padding: "60px 24px 40px",
      paddingTop: "80px",
      maxWidth: "1200px",
      margin: "0 auto",
      minHeight: "100dvh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    }}>
      {/* Supratítulo */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          fontSize: "clamp(10px, 2vw, 12px)",
          fontWeight: 700,
          color: "#ff5833",
          textTransform: "uppercase",
          letterSpacing: "0.22em",
          marginBottom: "16px",
          fontFamily: "'Helvetica Neue', sans-serif",
        }}
      >
        LA AGENCIA
      </motion.p>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        style={{
          fontSize: "clamp(36px, 7.5vw, 96px)",
          fontWeight: 900,
          lineHeight: 1.15,
          marginBottom: "20px",
          letterSpacing: "-0.02em",
          fontFamily: "'Helvetica Neue', sans-serif",
        }}
      >
        Tu marca necesita hablarle a la Gen Z.
        <br />
        Nosotros sabemos cómo.
      </motion.h1>

      {/* Subtítulo */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{
          fontSize: "clamp(14px, 2vw, 18px)",
          color: "rgba(240,237,232,0.5)",
          maxWidth: "700px",
          lineHeight: 1.7,
          marginBottom: "32px",
          fontFamily: "'Helvetica Neue', sans-serif",
        }}
      >
        Contenido que no parece publicidad. Música que mueve emociones. Estrategia que convierte. Somos la única agencia creativa que también produce música para tu marca.
      </motion.p>

      {/* CTA Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        onClick={handleClick}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "12px",
          padding: "14px 24px",
          background: "#ff5833",
          color: "white",
          border: "none",
          borderRadius: "9px",
          fontWeight: 700,
          fontSize: "14px",
          cursor: "pointer",
          transition: "all 0.2s",
          fontFamily: "'Helvetica Neue', sans-serif",
          width: "fit-content",
          marginBottom: "40px",
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
        Quiero trabajar con Cabaña
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </motion.button>

      {/* Data Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "16px",
          marginTop: "40px",
        }}
      >
        {[
          { label: "Método de trabajo", value: "Presencial · Online" },
          { label: "Audiencia", value: "Gen Z · 1997–2012" },
          { label: "Mercado", value: "Europa" },
          { label: "Sectores", value: "Moda · Belleza · Bebidas · Eventos · Audio" },
        ].map((card, i) => (
          <div
            key={i}
            style={{
              background: "#141414",
              borderRadius: "12px",
              padding: "20px",
              borderLeft: "2px solid #ff5833",
            }}
          >
            <p style={{
              fontSize: "10px",
              fontWeight: 700,
              color: "rgba(240,237,232,0.35)",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              marginBottom: "8px",
              fontFamily: "'Helvetica Neue', sans-serif",
            }}>
              {card.label}
            </p>
            <p style={{
              fontSize: "14px",
              fontWeight: 700,
              fontFamily: "'Helvetica Neue', sans-serif",
            }}>
              {card.value}
            </p>
          </div>
        ))}
      </motion.div>
    </section>
  );
}