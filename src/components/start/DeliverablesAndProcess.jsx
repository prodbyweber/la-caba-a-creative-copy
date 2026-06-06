import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

const PILLARS = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M4 4h16M4 12h16M4 20h16" stroke="#ff5833" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="8" cy="4" r="2" fill="#ff5833"/>
        <circle cx="12" cy="12" r="2" fill="#ff5833"/>
        <circle cx="16" cy="20" r="2" fill="#ff5833"/>
      </svg>
    ),
    title: "Identidad Visual",
    desc: "Branding completo: logotipo, paleta de color, tipografía y manual de estilo adaptado a tu proyecto.",
    accent: "#ff5833",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8" stroke="#ff5833" strokeWidth="2"/>
        <circle cx="12" cy="12" r="3" fill="#ff5833"/>
        <path d="M12 4v2M12 18v2M4 12h2M18 12h2" stroke="#ff5833" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: "Producción Musical",
    desc: "Dirección artística, grabación, producción, mezcla y mastering de al menos un single, EP o álbum.",
    accent: "#ff5833",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="#ff5833" strokeWidth="2"/>
        <circle cx="12" cy="12" r="4" stroke="#ff5833" strokeWidth="2"/>
        <path d="M12 8v8M8 12h8" stroke="#ff5833" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: "Contenido Audiovisual",
    desc: "Visuales oficiales, reels y shorts para redes, fotografía editorial y contenido de backstudio.",
    accent: "#ff5833",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 2v6M12 16v6M4 12h6M14 12h6" stroke="#ff5833" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="12" cy="12" r="3" fill="#ff5833"/>
      </svg>
    ),
    title: "Campaña & Distribución",
    desc: "Distribución en plataformas digitales, estrategia de contenido y plan de lanzamiento coordinado.",
    accent: "#ff5833",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Primera reunión",
    desc: "Entendemos tu visión, diagnosticamos tu proyecto y definimos objetivos concretos.",
  },
  {
    num: "02",
    title: "Tu plan artístico",
    desc: "Diseñamos un plan personalizado con calendario, entregables y equipo asignado.",
  },
  {
    num: "03",
    title: "Lo hacemos real",
    desc: "Ejecutamos, producimos y te acompañamos en cada fase del desarrollo artístico.",
  },
];

export default function DeliverablesAndProcess() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="plan"
      ref={ref}
      style={{
        background: "#0a0a0a",
        padding: "clamp(80px, 10vw, 120px) clamp(24px, 6vw, 56px)",
        position: "relative",
      }}
    >
      {/* Section label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6 }}
        style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 700, fontSize: "9px", letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(240,237,232,0.3)", marginBottom: "clamp(12px, 2vw, 20px)" }}
      >
        Qué incluye el plan
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontWeight: 900,
          fontSize: "clamp(1.8rem, 4.5vw, 3.2rem)",
          letterSpacing: "-0.04em",
          lineHeight: 0.95,
          color: "#f0ede8",
          marginBottom: "clamp(36px, 5vw, 60px)",
          maxWidth: "560px",
        }}
      >
        Cuatro pilares. Un solo equipo. Todo alineado.
      </motion.h2>

      {/* Pillars grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "clamp(10px, 1.5vw, 16px)",
        marginBottom: "clamp(72px, 10vw, 100px)",
      }}>
        {PILLARS.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: "#111",
              borderRadius: "14px",
              padding: "clamp(20px, 2.5vw, 30px)",
              borderLeft: `3px solid ${p.accent}`,
              border: `1px solid rgba(255,255,255,0.04)`,
              borderLeftColor: p.accent,
              borderLeftWidth: 3,
              position: "relative",
            }}
          >
            <div style={{ marginBottom: "14px", color: "#ff5833" }}>{p.icon}</div>
            <h3 style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 900, fontSize: "clamp(0.95rem, 1.6vw, 1.1rem)", letterSpacing: "-0.03em", color: "#f0ede8", marginBottom: "8px", lineHeight: 1.2 }}>{p.title}</h3>
            <p style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 300, fontSize: "clamp(0.78rem, 1.2vw, 0.88rem)", color: "rgba(240,237,232,0.45)", lineHeight: 1.6, margin: 0 }}>{p.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* How it works — 3 steps */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.5 }}
        style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 700, fontSize: "9px", letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(240,237,232,0.3)", marginBottom: "clamp(28px, 4vw, 44px)" }}
      >
        Cómo funciona
      </motion.p>

      <style>{`
        .steps-row {
          display: flex;
          flex-direction: column;
          gap: 0;
          position: relative;
        }
        @media (min-width: 640px) {
          .steps-row {
            flex-direction: row;
            gap: 0;
            align-items: flex-start;
          }
          .step-item {
            flex: 1;
            position: relative;
          }
          .step-item:not(:last-child)::after {
            content: '';
            position: absolute;
            top: 22px;
            left: calc(50% + 20px);
            width: calc(100% - 40px);
            height: 1px;
            background: rgba(255,255,255,0.06);
          }
        }
        .step-item {
          display: flex;
          gap: 16px;
          padding: clamp(16px, 2.5vw, 24px) clamp(16px, 2vw, 24px);
          position: relative;
        }
        .step-item:not(:last-child) {
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        @media (min-width: 640px) {
          .step-item {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }
          .step-item:not(:last-child) {
            border-bottom: none;
          }
        }
      `}</style>

      <div className="steps-row">
        {STEPS.map((s, i) => (
          <motion.div
            key={i}
            className="step-item"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.55 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 900, fontSize: "clamp(2.2rem, 5vw, 3.5rem)", color: "rgba(255,88,51,0.15)", letterSpacing: "-0.04em", lineHeight: 1, flexShrink: 0, width: "clamp(60px, 8vw, 80px)" }}>{s.num}</div>
            <div>
              <h4 style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 900, fontSize: "clamp(1rem, 1.6vw, 1.1rem)", color: "#f0ede8", letterSpacing: "-0.03em", marginBottom: "8px", lineHeight: 1.2 }}>{s.title}</h4>
              <p style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 300, fontSize: "clamp(0.78rem, 1.2vw, 0.88rem)", color: "rgba(240,237,232,0.45)", lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA inline */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.85 }}
        style={{ marginTop: "clamp(36px, 5vw, 52px)", display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center" }}
      >
        <button
          onClick={() => { window.dispatchEvent(new CustomEvent("open-application-modal")); }}
          style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 900, fontSize: "clamp(0.82rem, 1.3vw, 0.92rem)", background: "#ff5833", color: "#fff", border: "none", borderRadius: "8px", padding: "13px 28px", cursor: "pointer", transition: "background 0.2s ease" }}
          onMouseEnter={e => e.currentTarget.style.background = "#e04a28"}
          onMouseLeave={e => e.currentTarget.style.background = "#ff5833"}
        >
          Quiero mi plan →
        </button>
        <span style={{ fontFamily: "'Helvetica Neue', sans-serif", fontSize: "11px", color: "rgba(240,237,232,0.22)" }}>Acceso limitado</span>
      </motion.div>
    </section>
  );
}