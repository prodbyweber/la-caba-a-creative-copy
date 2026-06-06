import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ITEMS = [
  {
    title: "Sesión de Exploración",
    text: "Antes de cualquier compromiso, nos sentamos contigo. En este meeting gratuito descubrimos tu proyecto, tu visión y tu momento actual. Aterrizamos ideas, detectamos qué necesitas y definimos si Cabaña es el equipo adecuado para llevarlo a cabo. Sin presión. Sin coste.",
    badge: "Acceso limitado",
  },
  {
    title: "Identidad",
    text: "Aquí descubrimos quién eres como artista. Definimos tu línea creativa, los géneros musicales que te representan y sus combinaciones, el estilo de tus letras y las referencias visuales que comunican tu arte. La base sobre la que todo lo demás se construye con coherencia.",
  },
  {
    title: "Producción Musical",
    text: "Con la identidad definida, el sonido tiene dirección. Trabajamos contigo en la composición y producción de tus temas — contamos también con un compositor de sesión para artistas que necesitan apoyo en el proceso creativo. Desarrollamos cada canción sabiendo exactamente qué historia tiene que contar.",
  },
  {
    title: "Contenido Audiovisual",
    text: "La imagen en movimiento que hace real tu proyecto. Producimos videoclips, documentales cortos y contenido para redes — rodado y editado con tu identidad ya construida. Nada improvisado. Todo con criterio visual y narrativo.",
  },
  {
    title: "Campañas de Marketing",
    text: "Con todo listo, lo hacemos visible. Diseñamos y ejecutamos campañas en Meta y otras plataformas con la identidad, el sonido y la imagen alineados. Sin quemar presupuesto en contenido que no convierte.",
  },
];

function AccordionItem({ item, isOpen, onToggle }) {
  return (
    <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          padding: "24px 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontWeight: 700,
          fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)",
          color: "#f0ede8",
          lineHeight: 1.25,
          flex: 1,
        }}>
          {item.title}
        </span>
        <div style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          background: "#ff5833",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "background 0.2s ease",
        }}>
          <span style={{
            color: "#fff",
            fontSize: "22px",
            fontWeight: 300,
            lineHeight: 1,
            userSelect: "none",
            marginTop: isOpen ? "0" : "-1px",
          }}>
            {isOpen ? "−" : "+"}
          </span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ paddingBottom: "28px" }}>
              <p style={{
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontWeight: 300,
                fontSize: "clamp(0.9rem, 1.5vw, 1rem)",
                color: "#aaaaaa",
                lineHeight: 1.7,
                margin: 0,
              }}>
                {item.text}
              </p>
              {item.badge && (
                <span style={{
                  display: "inline-block",
                  marginTop: "16px",
                  background: "rgba(255,88,51,0.12)",
                  border: "1px solid rgba(255,88,51,0.3)",
                  borderRadius: "20px",
                  padding: "4px 12px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#ff5833",
                  fontFamily: "'Helvetica Neue', sans-serif",
                }}>
                  {item.badge}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HowItWorksAccordion() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section style={{
      background: "#080808",
      padding: "clamp(80px, 10vw, 120px) clamp(20px, 6vw, 56px)",
      borderTop: "1px solid rgba(255,255,255,0.04)",
    }}>
      <div style={{ maxWidth: "760px", margin: "0 auto" }}>
        <p style={{
          fontFamily: "'Helvetica Neue', sans-serif",
          fontWeight: 700,
          fontSize: "9px",
          letterSpacing: "0.35em",
          textTransform: "uppercase",
          color: "rgba(240,237,232,0.3)",
          marginBottom: "clamp(12px, 2vw, 20px)",
        }}>
          El proceso
        </p>
        <h2 style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontWeight: 900,
          fontSize: "clamp(1.8rem, 4.5vw, 3.2rem)",
          letterSpacing: "-0.04em",
          lineHeight: 0.95,
          color: "#f0ede8",
          marginBottom: "clamp(40px, 6vw, 64px)",
        }}>
          ¿Cómo funciona el plan?
        </h2>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          {ITEMS.map((item, i) => (
            <AccordionItem
              key={i}
              item={item}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}