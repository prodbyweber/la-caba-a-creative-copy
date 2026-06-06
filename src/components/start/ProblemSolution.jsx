import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

const AudioIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff5833" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

const IdentityIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff5833" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    <path d="M16 3.5c1.5.5 2.5 2 2.5 3.5S17.5 9.5 16 10" />
  </svg>
);

const StructureIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff5833" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
    <path d="M8 14h2M14 14h2M8 18h2M14 18h2" />
  </svg>
);

const PROBLEMS = [
  {
    Icon: AudioIcon,
    label: "Sin calidad, sin mercado",
    title: "Crees que suenas bien. El mercado tiene otro nivel.",
    desc: "La producción musical comercial actual tiene un estándar técnico muy alto. Un mal mix, una voz mal grabada o un beat genérico te deja fuera antes de que alguien te escuche dos veces. La calidad de audio no es un detalle — es tu producto.",
  },
  {
    Icon: IdentityIcon,
    label: "Sin identidad, sin conexión",
    title: "Tienes talento, pero no marca.",
    desc: "Tu imagen visual no comunica quién eres. Cambias de estética con cada proyecto y no conectas emocionalmente con tu público. En un mercado saturado, quien no tiene una identidad clara simplemente no existe.",
  },
  {
    Icon: StructureIcon,
    label: "Sin estructura, sin trascendencia",
    title: "Produces, pero sin plan.",
    desc: "Las ideas se acumulan pero el plan no existe. Sin calendario editorial, sin estrategia de lanzamiento, sin distribución: el trabajo no llega a quien tiene que llegar. El talento sin estructura no escala.",
  },
];

const SOLUTIONS = [
  "Un plan trimestral con entregables reales y propios",
  "Dirección artística integral bajo un solo equipo creativo",
  "Música, visual, contenido y distribución alineados",
];

export default function ProblemSolution() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="problema"
      ref={ref}
      style={{
        background: "#080808",
        padding: "clamp(80px, 10vw, 120px) clamp(24px, 6vw, 56px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle bg gradient */}
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "600px", height: "200px", pointerEvents: "none", background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(255,88,51,0.04) 0%, transparent 70%)" }} />

      {/* Label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6 }}
        style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 700, fontSize: "9px", letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(240,237,232,0.3)", marginBottom: "clamp(12px, 2vw, 20px)" }}
      >
        El problema
      </motion.p>

      {/* Headline */}
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
          marginBottom: "clamp(40px, 6vw, 64px)",
          maxWidth: "640px",
        }}
      >
        La mayoría de artistas independientes necesitan un plan.
      </motion.h2>

      {/* Problem cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "clamp(12px, 2vw, 20px)",
        marginBottom: "clamp(48px, 7vw, 80px)",
      }}>
        {PROBLEMS.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: "#111",
              borderRadius: "14px",
              padding: "clamp(20px, 3vw, 32px)",
              border: "1px solid rgba(255,255,255,0.05)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ marginBottom: "14px" }}><p.Icon /></div>
            <span style={{ display: "inline-block", fontSize: "9px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,88,51,0.6)", marginBottom: "8px", fontFamily: "'Helvetica Neue', sans-serif" }}>{p.label}</span>
            <h3 style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 900, fontSize: "clamp(1rem, 1.8vw, 1.2rem)", letterSpacing: "-0.03em", color: "#f0ede8", marginBottom: "10px", lineHeight: 1.15 }}>{p.title}</h3>
            <p style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 300, fontSize: "clamp(0.8rem, 1.3vw, 0.9rem)", color: "rgba(240,237,232,0.45)", lineHeight: 1.6, margin: 0 }}>{p.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Divider → Solución */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={inView ? { opacity: 1, scaleX: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ height: "1px", background: "rgba(255,88,51,0.2)", marginBottom: "clamp(36px, 5vw, 56px)", transformOrigin: "left" }}
      />

      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.6 }}
        style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 700, fontSize: "9px", letterSpacing: "0.35em", textTransform: "uppercase", color: "#ff5833", marginBottom: "clamp(20px, 3vw, 32px)" }}
      >
        La solución
      </motion.p>

      <div style={{ display: "flex", flexDirection: "column", gap: "clamp(14px, 2.5vw, 20px)" }}>
        {SOLUTIONS.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -16 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.65 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}
          >
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(255,88,51,0.15)", border: "1px solid rgba(255,88,51,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
              <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#ff5833" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <p style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 700, fontSize: "clamp(0.95rem, 1.8vw, 1.1rem)", color: "#f0ede8", letterSpacing: "-0.02em", margin: 0, lineHeight: 1.3 }}>{s}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}