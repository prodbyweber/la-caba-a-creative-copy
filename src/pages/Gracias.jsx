import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

function CalendlyModal({ onClose }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.88)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "16px",
        }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.28, ease: EASE }}
          onClick={e => e.stopPropagation()}
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "680px",
            background: "#080808",
            borderRadius: "18px",
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: "12px", right: "12px", zIndex: 10,
              width: 32, height: 32, borderRadius: "50%",
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#f0ede8",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
              <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
          <iframe
            src="https://calendly.com/hola-cabanacreative/creadores?embed_type=Inline&hide_gdpr_banner=1&hide_event_type_details=1&hide_landing_page_details=1&background_color=080808&text_color=f0ede8&primary_color=ff4300"
            width="100%"
            height="600"
            frameBorder="0"
            title="Agendar videollamada"
            style={{ display: "block" }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function Gracias() {
  const [calendlyOpen, setCalendlyOpen] = useState(false);

  return (
    <div style={{
      minHeight: "100dvh",
      background: "#080808",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "clamp(48px, 10vw, 96px) clamp(24px, 6vw, 48px)",
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    }}>
      <div style={{ maxWidth: "680px", width: "100%" }}>

        {/* Bloque 1 — Texto */}
        <motion.div
          initial={{ opacity: 0, y: 32, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, ease: EASE }}
          style={{ textAlign: "center", marginBottom: "clamp(24px, 5vw, 40px)" }}
        >
          <p style={{
            fontSize: "clamp(1rem, 3.5vw, 1.6rem)",
            fontWeight: 700,
            color: "#f0ede8",
            margin: "0 0 8px",
            lineHeight: 1.3,
          }}>
            ¡Gracias, hemos recibido tu solicitud!
          </p>
          <p style={{
            fontSize: "clamp(0.9rem, 3vw, 1.3rem)",
            fontWeight: 400,
            color: "rgba(240,237,232,0.55)",
            margin: "0 0 10px",
            lineHeight: 1.3,
          }}>
            Eres exactamente el perfil con el que trabajamos.
          </p>
          <p style={{
            fontSize: "clamp(0.88rem, 2.8vw, 1.4rem)",
            fontWeight: 900,
            color: "#ff5833",
            margin: 0,
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}>
            Estás a punto de entrar a La Cabaña.
          </p>
        </motion.div>

        {/* Separador */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
          style={{
            height: "1px",
            background: "rgba(255,255,255,0.08)",
            marginBottom: "clamp(28px, 6vw, 48px)",
            transformOrigin: "left",
          }}
        />

        {/* Bloque 2 — Video */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
          style={{ marginBottom: "clamp(28px, 6vw, 48px)" }}
        >
          <p style={{
            fontSize: "clamp(1rem, 3vw, 1.4rem)",
            fontWeight: 700,
            color: "#f0ede8",
            margin: "0 0 6px",
            letterSpacing: "-0.01em",
          }}>
            Mira El Mapa antes de agendar tu videollamada.
          </p>
          <p style={{
            fontSize: "clamp(0.75rem, 2vw, 0.9rem)",
            fontWeight: 400,
            color: "rgba(240,237,232,0.4)",
            margin: "0 0 16px",
          }}>
            5 minutos para entender cómo trabajamos.
          </p>
          <div style={{ position: "relative", width: "100%", paddingBottom: "56.25%", background: "#000", borderRadius: "12px", overflow: "hidden" }}>
            <iframe
              src="https://www.youtube.com/embed/im6BfAvTsLA?rel=0&modestbranding=1&playsinline=1"
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
              title="El Mapa"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </motion.div>

        {/* Bloque 3 — CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45, ease: EASE }}
          style={{ display: "flex", justifyContent: "center" }}
        >
          <button
            onClick={() => setCalendlyOpen(true)}
            style={{
              background: "#ff5833",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "clamp(14px, 2.5vw, 16px) clamp(24px, 4vw, 40px)",
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontWeight: 900,
              fontSize: "clamp(0.85rem, 2vw, 1rem)",
              cursor: "pointer",
              transition: "background 0.2s ease",
              width: "100%",
              maxWidth: "340px",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#e04a28"}
            onMouseLeave={e => e.currentTarget.style.background = "#ff5833"}
          >
            Agendar videollamada →
          </button>
        </motion.div>
      </div>

      {calendlyOpen && <CalendlyModal onClose={() => setCalendlyOpen(false)} />}
    </div>
  );
}