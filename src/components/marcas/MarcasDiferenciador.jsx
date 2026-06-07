import React from "react";
import { motion } from "framer-motion";
import { Music, Play, Zap, Film } from "lucide-react";

export default function MarcasDiferenciador() {
  return (
    <section style={{
      padding: "80px 24px",
      maxWidth: "1200px",
      margin: "0 auto",
    }}>
      {/* Supratítulo */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
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
        LO QUE NOS HACE DISTINTOS
      </motion.p>

      {/* Headline */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        style={{
          fontSize: "clamp(28px, 5vw, 60px)",
          fontWeight: 900,
          lineHeight: 1.2,
          marginBottom: "24px",
          letterSpacing: "-0.02em",
          fontFamily: "'Helvetica Neue', sans-serif",
        }}
      >
        Somos la única agencia creativa que produce música para tu marca.
      </motion.h2>

      {/* Subtítulo */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{
          fontSize: "clamp(14px, 2vw, 18px)",
          color: "rgba(240,237,232,0.5)",
          maxWidth: "800px",
          lineHeight: 1.7,
          marginBottom: "48px",
          fontFamily: "'Helvetica Neue', sans-serif",
        }}
      >
        Las grandes marcas lo saben desde siempre — la música mueve emociones, genera recuerdo y vende. Nosotros lo llevamos al siguiente nivel: componemos el jingle, el sonido y la identidad sonora que tu marca necesita para conectar de verdad.
      </motion.p>

      {/* Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "24px",
      }}>
        {[
          {
            icon: Film,
            title: "Contenido Audiovisual Premium",
            desc: "Producimos contenido audiovisual de alto nivel para Instagram, TikTok y YouTube. Reels y vídeo vertical que genera comunidad, contenido horizontal con enfoque premium y producciones largas para YouTube — porque el vídeo largo es el que realmente conecta y construye marca a largo plazo.",
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
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 * (i + 3) }}
            style={{
              background: card.featured ? "rgba(255,88,51,0.08)" : "#141414",
              borderRadius: "12px",
              padding: "28px",
              borderLeft: card.featured ? "3px solid #ff5833" : "2px solid #ff5833",
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
            }}>
              {card.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}