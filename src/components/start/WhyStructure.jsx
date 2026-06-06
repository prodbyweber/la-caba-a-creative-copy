import React, { useRef } from "react";
import { useInView } from "framer-motion";
import { motion } from "framer-motion";

const CARDS = [
  {
    icon: "📡",
    title: "Una identidad clara construye audiencia real",
    desc: "Cuando tu imagen, tu música y tu contenido hablan el mismo idioma, la gente no solo escucha — se queda. Una dirección creativa coherente convierte oyentes en comunidad y seguidores en fans que te siguen a donde vayas.",
  },
  {
    icon: "📈",
    title: "Tu música trabajando por ti en todas las plataformas",
    desc: "Spotify, Apple Music, YouTube, TikTok — cada plataforma es una fuente de ingresos si el proyecto está bien construido. Con un plan integral activas regalías, sincronizaciones, contenido monetizable y campañas que convierten streams en dinero real.",
  },
  {
    icon: "🤝",
    title: "Un proyecto sólido atrae inversores y abre puertas a las Majors",
    desc: "Los inversores y los sellos no fichan talento suelto — fichan proyectos con estructura. Con una identidad definida, un catálogo producido y una campaña funcionando, tienes lo que cualquier Major o fondo de inversión musical necesita ver antes de firmar.",
  },
];

export default function WhyStructure() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const scrollToContact = () => {
    const el = document.getElementById("contacto");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section ref={ref} style={{ background: "#080808", padding: "clamp(56px, 8vw, 96px) clamp(20px, 6vw, 56px)" }}>
      <style>{`
        .why-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 40px;
        }
        @media (min-width: 768px) {
          .why-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
          }
        }
      `}</style>

      <div style={{ maxWidth: "840px", margin: "0 auto" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p style={{
            fontFamily: "'Helvetica Neue', sans-serif",
            fontSize: "clamp(0.78rem, 1.2vw, 0.88rem)",
            fontWeight: 500,
            color: "rgba(240,237,232,0.38)",
            letterSpacing: "0.04em",
            margin: "0 0 12px",
          }}>
            ¿Por qué construir tu proyecto con estructura?
          </p>
          <h2 style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontWeight: 900,
            fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            color: "#f0ede8",
            margin: 0,
          }}>
            Los artistas que crecen no tienen más talento. Tienen un plan.
          </h2>
        </motion.div>

        {/* Cards */}
        <div className="why-grid">
          {CARDS.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: 0.15 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background: "#141414",
                borderRadius: "12px",
                padding: "28px 24px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <span style={{ fontSize: "28px", lineHeight: 1 }}>{card.icon}</span>
              <p style={{
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontWeight: 700,
                fontSize: "clamp(1rem, 1.6vw, 1.1rem)",
                color: "#f0ede8",
                margin: 0,
                lineHeight: 1.25,
              }}>
                {card.title}
              </p>
              <p style={{
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontWeight: 400,
                fontSize: "clamp(0.85rem, 1.3vw, 0.9rem)",
                color: "#aaaaaa",
                margin: 0,
                lineHeight: 1.7,
              }}>
                {card.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: "center", marginTop: "40px" }}
        >
          <button
            onClick={scrollToContact}
            style={{
              fontFamily: "'Helvetica Neue', sans-serif",
              fontWeight: 700,
              fontSize: "0.95rem",
              background: "transparent",
              color: "#f0ede8",
              border: "1px solid rgba(240,237,232,0.25)",
              borderRadius: "100px",
              padding: "14px 32px",
              cursor: "pointer",
              transition: "border-color 0.2s, color 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#ff5833"; e.currentTarget.style.color = "#ff5833"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(240,237,232,0.25)"; e.currentTarget.style.color = "#f0ede8"; }}
          >
            Quiero construir mi proyecto →
          </button>
        </motion.div>
      </div>
    </section>
  );
}