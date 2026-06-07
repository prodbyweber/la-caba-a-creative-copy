import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

const CHECK = (
  <svg width="14" height="11" viewBox="0 0 14 11" fill="none" style={{ flexShrink: 0, marginTop: 3 }}>
    <path d="M1 5.5L5 9.5L13 1.5" stroke="#ff5833" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PLANS = [
  {
    name: "Plan Cabaña Creative",
    tagline: "Desarrollo artístico completo",
    badge: "Experiencia completa",
    items: [
      "Producción musical profesional",
      "Videoclip o mini-film",
      "Identidad visual y branding",
      "Fotografía editorial y portadas",
      "Contenido para redes sociales",
      "Estrategia y plan de lanzamiento",
      "Campañas de marketing",
      "Mentoría y dirección artística",
      "Acceso a plataforma Cabaña Creative",
    ],
    cta: "Solicitar plaza",
    featured: true,
  },
];

export default function PricingPlans() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const scrollToContact = () => {
    window.dispatchEvent(new CustomEvent("open-application-modal"));
  };

  return (
    <section
      id="planes"
      ref={ref}
      style={{
        background: "#080808",
        padding: "clamp(30px, 4vw, 60px) clamp(24px, 6vw, 56px) clamp(60px, 8vw, 120px)",
        position: "relative",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6 }}
        style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 700, fontSize: "9px", letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(240,237,232,0.3)", marginBottom: "clamp(12px, 2vw, 20px)" }}
      >
        Planes
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontWeight: 900,
          fontSize: "clamp(1.8rem, 3.5vw, 3.2rem)",
          letterSpacing: "-0.04em",
          lineHeight: 0.95,
          color: "#f0ede8",
          marginBottom: "clamp(12px, 2vw, 16px)",
          maxWidth: "100%",
          wordBreak: "break-word",
          overflowWrap: "break-word",
        }}
      >
        Programa integral de desarrollo artístico
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.7, delay: 0.2 }}
        style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 300, fontSize: "clamp(0.82rem, 1.4vw, 0.95rem)", color: "rgba(240,237,232,0.4)", lineHeight: 1.6, marginBottom: "clamp(36px, 5vw, 60px)", maxWidth: "520px" }}
      >
        Todo lo que necesitas para lanzar tu carrera con estructura profesional.
      </motion.p>

      <style>{`
        .plans-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: clamp(14px, 2vw, 20px);
          max-width: 640px;
          margin: 0 auto;
        }
      `}</style>

      <div className="plans-grid">
        {PLANS.map((plan, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.75, delay: 0.2 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: plan.featured ? "#131313" : "#0e0e0e",
              borderRadius: "16px",
              padding: "clamp(24px, 3.5vw, 40px)",
              border: plan.featured ? "1px solid rgba(255,88,51,0.25)" : "1px solid rgba(255,255,255,0.05)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Featured glow */}
            {plan.featured && (
              <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "80%", height: "1px", background: "linear-gradient(to right, transparent, rgba(255,88,51,0.5), transparent)" }} />
            )}

            {/* Badge */}
            {plan.badge && (
              <div style={{ marginBottom: "16px" }}>
                <span style={{ display: "inline-block", background: "rgba(255,88,51,0.12)", border: "1px solid rgba(255,88,51,0.28)", borderRadius: 99, padding: "4px 12px", fontSize: "9px", fontWeight: 800, color: "#ff5833", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'Helvetica Neue', sans-serif" }}>{plan.badge}</span>
              </div>
            )}

            <h3 style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 900, fontSize: "clamp(1.2rem, 2vw, 1.5rem)", letterSpacing: "-0.035em", color: "#f0ede8", marginBottom: "8px", lineHeight: 1.15 }}>{plan.name}</h3>
            <p style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 300, fontSize: "clamp(0.78rem, 1.2vw, 0.88rem)", color: "rgba(240,237,232,0.4)", lineHeight: 1.5, marginBottom: "24px" }}>{plan.tagline}</p>

            {/* Divider */}
            <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", marginBottom: "24px" }} />

            {/* Feature list */}
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {plan.items.map((item, j) => (
                <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  {CHECK}
                  <span style={{ fontFamily: "'Helvetica Neue', sans-serif", fontSize: "clamp(0.78rem, 1.2vw, 0.88rem)", color: "rgba(240,237,232,0.7)", lineHeight: 1.45 }}>{item}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <button
              onClick={scrollToContact}
              style={{
                width: "100%",
                fontFamily: "'Helvetica Neue', sans-serif",
                fontWeight: 900,
                fontSize: "clamp(0.82rem, 1.3vw, 0.92rem)",
                background: plan.featured ? "#ff5833" : "transparent",
                color: plan.featured ? "#fff" : "rgba(240,237,232,0.6)",
                border: plan.featured ? "none" : "1px solid rgba(255,255,255,0.15)",
                borderRadius: "8px",
                padding: "13px 20px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = plan.featured ? "#e04a28" : "rgba(255,255,255,0.06)";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = plan.featured ? "#ff5833" : "transparent";
                e.currentTarget.style.color = plan.featured ? "#fff" : "rgba(240,237,232,0.6)";
              }}
            >
              {plan.cta} →
            </button>
          </motion.div>
        ))}
      </div>

    </section>
  );
}