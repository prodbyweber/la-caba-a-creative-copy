import React from "react";
import { motion } from "framer-motion";
import { Music, Play, Zap, Film } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 52, filter: "blur(10px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.58, ease: EASE, delay },
});

export default function MarcasDiferenciador() {
  const cards = [
    {
      icon: Film,
      title: "Contenido Audiovisual Premium",
      desc: "Producimos contenido audiovisual premium para Instagram, TikTok y YouTube.\n\nContenido que genera comunidad. Enfoque premium en cada producción. Vídeos largos para YouTube porque es el que realmente conecta y construye marca a largo plazo.",
      featured: true,
    },
    {
      icon: Play,
      title: "Publicidad que no parece publicidad",
      desc: "Los jóvenes odian los anuncios. Nosotros creamos contenido orgánico, UGC y paid media que se consume como entretenimiento y convierte como publicidad.",
    },
    {
      icon: Zap,
      title: "Talento joven para marcas con trayectoria",
      desc: "Contamos con creadores, modelos y artistas dispuestos a posicionar tu producto. Energía nueva para marcas que quieren llegar más lejos.",
    },
    {
      icon: Music,
      title: "Música que vende",
      desc: "Producimos el sonido de tu marca — jingles, identidad sonora y música original para campañas. Comunicamos a través del audio como lo hacen las grandes.",
    },
  ];

  return (
    <section style={{
      padding: "80px 24px",
      maxWidth: "1200px",
      margin: "0 auto",
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
        LO QUE NOS HACE DISTINTOS
      </motion.p>

      <motion.h2 {...fadeUp(0.07)} style={{
        fontSize: "clamp(28px, 5vw, 60px)",
        fontWeight: 900,
        lineHeight: 1.2,
        marginBottom: "24px",
        letterSpacing: "-0.02em",
        fontFamily: "'Helvetica Neue', sans-serif",
      }}>
        Somos la única agencia creativa que produce música para tu marca.
      </motion.h2>

      <motion.p {...fadeUp(0.14)} style={{
        fontSize: "clamp(14px, 2vw, 18px)",
        color: "rgba(240,237,232,0.5)",
        maxWidth: "800px",
        lineHeight: 1.7,
        marginBottom: "48px",
        fontFamily: "'Helvetica Neue', sans-serif",
      }}>
        Las grandes marcas lo saben desde siempre — la música mueve emociones, genera recuerdo y vende. Nosotros lo llevamos al siguiente nivel: componemos el jingle, el sonido y la identidad sonora que tu marca necesita para conectar de verdad.
      </motion.p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "24px",
      }}>
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 48, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.52, ease: EASE, delay: 0.06 + i * 0.09 }}
            style={{
              background: card.featured ? "rgba(255,88,51,0.08)" : "#141414",
              borderRadius: "12px",
              padding: "28px",
              border: card.featured ? "1.5px solid rgba(255,88,51,0.5)" : undefined,
              borderLeft: card.featured ? "3px solid #ff5833" : "2px solid rgba(255,88,51,0.3)",
            }}
          >
            {card.featured && (
              <span style={{
                display: "inline-block",
                background: "#ff5833",
                color: "#fff",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                borderRadius: "20px",
                padding: "3px 10px",
                marginBottom: "14px",
                fontFamily: "'Helvetica Neue', sans-serif",
              }}>
                Nuestro core
              </span>
            )}
            <card.icon
              size={card.featured ? 36 : 32}
              color="#ff5833"
              strokeWidth={1.5}
              style={{ marginBottom: "16px", display: "block" }}
            />
            <h3 style={{
              fontSize: card.featured ? "22px" : "18px",
              fontWeight: 700,
              marginBottom: "12px",
              fontFamily: "'Helvetica Neue', sans-serif",
            }}>
              {card.title}
            </h3>
            <p style={{
              fontSize: "14px",
              color: "rgba(240,237,232,0.5)",
              lineHeight: 1.6,
              fontFamily: "'Helvetica Neue', sans-serif",
              whiteSpace: "pre-line",
            }}>
              {card.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}