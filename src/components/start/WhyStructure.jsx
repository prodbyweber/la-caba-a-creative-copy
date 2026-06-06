import React, { useRef } from "react";
import { useInView } from "framer-motion";
import { motion } from "framer-motion";
import { Users, TrendingUp, Landmark } from "lucide-react";

const CARDS = [
  {
    Icon: Users,
    title: "Una identidad clara construye audiencia real",
    desc: "Cuando tu imagen y tu música hablan el mismo idioma, los oyentes se convierten en comunidad.",
  },
  {
    Icon: TrendingUp,
    title: "Tu música trabajando por ti en todas las plataformas",
    desc: "Spotify, Apple Music, YouTube, TikTok — un proyecto bien construido activa múltiples fuentes de ingresos.",
  },
  {
    Icon: Landmark,
    title: "Un proyecto sólido atrae inversores y abre puertas",
    desc: "Los sellos y los fondos no fichan talento suelto. Fichan proyectos con estructura.",
  },
];

export default function WhyStructure() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const scrollToContact = () => {
    window.dispatchEvent(new CustomEvent("open-application-modal"));
  };

  return (
    <section ref={ref} style={{ background: "#080808", padding: "clamp(56px, 8vw, 96px) clamp(20px, 6vw, 56px)" }}>
      <style>{`
        .why-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-top: 40px;
        }
        @media (min-width: 768px) {
          .why-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 28px;
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
          <h2 style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontWeight: 900,
            fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
            color: "#f0ede8",
            margin: "0 0 16px",
          }}>
            Invierte en un sector que nunca deja de crecer.
          </h2>
          <p style={{
            fontFamily: "'Helvetica Neue', sans-serif",
            fontWeight: 300,
            fontSize: "clamp(0.85rem, 1.4vw, 0.95rem)",
            color: "rgba(240,237,232,0.5)",
            lineHeight: 1.65,
            margin: 0,
            maxWidth: "580px",
          }}>
            La música no depende de bolsas ni ciclos económicos, y la gente nunca deja de escucharla. Once años consecutivos de crecimiento. $31.700M en ingresos globales en 2025. El momento es ahora.
          </p>
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
                padding: "28px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <card.Icon size={28} stroke="#FF5833" strokeWidth={1.5} />
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