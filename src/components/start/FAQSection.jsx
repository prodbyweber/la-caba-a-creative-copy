import React, { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

const FAQS = [
  {
    q: "¿Cuánto dura el proceso?",
    a: "El Plan Pro Trimestre tiene una duración de 3 meses con calendario definido desde el inicio. El Plan Inicio depende del alcance, normalmente entre 3 y 6 semanas desde el arranque.",
  },
  {
    q: "¿Necesito tener experiencia previa?",
    a: "No. Trabajamos tanto con artistas que acaban de empezar como con creadores que buscan dar un salto de calidad. Lo importante es tu visión y tus ganas de construir algo con estructura.",
  },
  {
    q: "¿Qué estilos musicales trabajáis?",
    a: "Géneros urbanos, pop, R&B, indie, electrónica, afro y fusiones contemporáneas. Somos agnósticos del género si el artista tiene visión creativa definida.",
  },
  {
    q: "¿Cómo es el proceso de selección?",
    a: "Solicitas información, agendamos una primera reunión sin compromiso, y si el proyecto encaja, diseñamos el plan juntos. Solo aceptamos un número limitado de artistas por convocatoria para garantizar calidad.",
  },
  {
    q: "¿Qué pasa si ya tengo producción propia?",
    a: "Perfecto. Podemos complementar tu proceso existente o construir a partir de lo que ya tienes. El foco siempre está en construir una identidad sólida y una estrategia que funcione a largo plazo.",
  },
  {
    q: "¿Están los precios disponibles online?",
    a: "No publicamos tarifas fijas porque cada plan es personalizado según el artista, sus objetivos y el alcance del proyecto. Escríbenos y en menos de 24h tienes una propuesta adaptada.",
  },
];

function FAQItem({ item, isOpen, onToggle }) {
  return (
    <div
      style={{
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        overflow: "hidden",
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          padding: "clamp(18px, 2.5vw, 24px) 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontWeight: 700,
          fontSize: "clamp(0.9rem, 1.6vw, 1.05rem)",
          color: isOpen ? "#f0ede8" : "rgba(240,237,232,0.75)",
          letterSpacing: "-0.025em",
          lineHeight: 1.3,
          transition: "color 0.2s ease",
        }}>
          {item.q}
        </span>
        <div style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          background: isOpen ? "rgba(255,88,51,0.1)" : "transparent",
          borderColor: isOpen ? "rgba(255,88,51,0.3)" : "rgba(255,255,255,0.12)",
          transition: "all 0.25s ease",
        }}>
          <motion.span
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{
              display: "block",
              fontSize: "16px",
              lineHeight: 1,
              color: isOpen ? "#ff5833" : "rgba(240,237,232,0.4)",
              fontWeight: 300,
              marginTop: "-1px",
            }}
          >
            +
          </motion.span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <p style={{
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontWeight: 300,
              fontSize: "clamp(0.82rem, 1.35vw, 0.95rem)",
              color: "rgba(240,237,232,0.5)",
              lineHeight: 1.7,
              paddingBottom: "clamp(16px, 2.5vw, 24px)",
              margin: 0,
            }}>
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState(null);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="faq"
      ref={ref}
      style={{
        background: "#0a0a0a",
        padding: "clamp(80px, 10vw, 120px) clamp(24px, 6vw, 56px)",
      }}
    >
      <div style={{ maxWidth: "720px" }}>
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 700, fontSize: "9px", letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(240,237,232,0.3)", marginBottom: "clamp(12px, 2vw, 20px)" }}
        >
          Preguntas frecuentes
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
            marginBottom: "clamp(36px, 5vw, 56px)",
          }}
        >
          Todo lo que necesitas saber
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {FAQS.map((faq, i) => (
            <FAQItem
              key={i}
              item={faq}
              isOpen={openIdx === i}
              onToggle={() => setOpenIdx(openIdx === i ? null : i)}
            />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.45 }}
          style={{ marginTop: "clamp(32px, 5vw, 48px)", display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center" }}
        >
          <span style={{ fontFamily: "'Helvetica Neue', sans-serif", fontSize: "clamp(0.8rem, 1.3vw, 0.9rem)", color: "rgba(240,237,232,0.35)" }}>¿Tienes más dudas?</span>
          <a
            href="mailto:hola@cabanacreative.es"
            style={{ fontFamily: "'Helvetica Neue', sans-serif", fontSize: "clamp(0.8rem, 1.3vw, 0.9rem)", fontWeight: 600, color: "#ff5833", textDecoration: "none", transition: "opacity 0.2s ease" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            hola@cabanacreative.es →
          </a>
        </motion.div>
      </div>
    </section>
  );
}