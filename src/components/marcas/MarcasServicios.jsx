import React from "react";
import { motion } from "framer-motion";
import { Zap, Clapperboard, Users, Target } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 52, filter: "blur(10px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.58, ease: EASE, delay },
});

export default function MarcasServicios() {
  const servicios = [
    {
      icon: Zap,
      title: "Branding y Estrategia",
      desc: "Identidad de marca, landing pages, estrategia de contenido y posicionamiento en el mercado europeo.",
    },
    {
      icon: Clapperboard,
      title: "Producción de Contenido",
      desc: "Creamos la narrativa de tu marca — contenido cinematográfico orgánico y de venta directa para campañas de paid media audiovisual. Cada pieza, pensada para impactar.",
    },
    {
      icon: Users,
      title: "Contenido UGC",
      desc: "Creadores reales, situaciones reales. Contenido que conecta con la Gen Z porque no parece publicidad.",
    },
    {
      icon: Target,
      title: "Paid Media",
      desc: "Campañas en Meta y YouTube Ads con estrategia, segmentación y creatividades que convierten. Sin quemar presupuesto.",
    },
  ];

  return (
    <section style={{
      padding: "clamp(60px, 8vw, 80px) clamp(24px, 6vw, 56px)",
      maxWidth: "1440px",
      margin: "0 auto",
      width: "100%",
      boxSizing: "border-box",
    }}>
      <motion.p {...fadeUp(0)} style={{
        fontSize: "clamp(10px, 2vw, 12px)",
        fontWeight: 700,
        color: "#ff5833",
        textTransform: "uppercase",
        letterSpacing: "0.22em",
        marginBottom: "16px",
        fontFamily: "'Helvetica Neue', sans-serif",
      }}>
        NUESTROS SERVICIOS
      </motion.p>

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
        Todo lo que tu marca necesita para dominar el mercado joven.
      </motion.h2>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "24px",
        width: "100%",
        maxWidth: "100%",
      }}>
        <style>{`
          @media (min-width: 1280px) {
            [data-servicios-grid] { grid-template-columns: repeat(2, 1fr) !important; }
          }
          @media (min-width: 1600px) {
            [data-servicios-grid] { grid-template-columns: repeat(4, 1fr) !important; }
          }
        `}</style>
        {servicios.map((servicio, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 50, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.52, ease: EASE, delay: 0.05 + i * 0.1 }}
            style={{
              background: "#141414",
              borderRadius: "12px",
              padding: "28px",
              borderLeft: "2px solid #ff5833",
            }}
          >
            <servicio.icon
              size={32}
              color="#ff5833"
              strokeWidth={1.5}
              style={{ marginBottom: "16px" }}
            />
            <h3 style={{
              fontSize: "18px",
              fontWeight: 700,
              marginBottom: "12px",
              fontFamily: "'Helvetica Neue', sans-serif",
            }}>
              {servicio.title}
            </h3>
            <p style={{
              fontSize: "14px",
              color: "rgba(240,237,232,0.5)",
              lineHeight: 1.6,
              fontFamily: "'Helvetica Neue', sans-serif",
            }}>
              {servicio.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}