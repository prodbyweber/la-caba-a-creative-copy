import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar } from "lucide-react";
import MailerLiteEmbed from "@/components/start/MailerLiteEmbed";

const CALENDLY_URL = "https://calendly.com/hola-cabanacreative/creadores?primary_color=ff5833&hide_gdpr_banner=0&background_color=080808&text_color=f0ede8&hide_event_type_details=1";
// Tiempo de espera estimado para recibir el correo de confirmación (ms)
const VERIFICATION_WAIT_MS = 12000;

export default function DiscoverySessionModal({ open, onClose }) {
  const [step, setStep] = useState("email"); // "email" | "loading" | "calendar"
  const [calendlyLoaded, setCalendlyLoaded] = useState(false);
  const waitTimer = useRef(null);

  // Reset al cerrar
  useEffect(() => {
    if (!open) {
      setStep("email");
      setCalendlyLoaded(false);
      if (waitTimer.current) { clearTimeout(waitTimer.current); waitTimer.current = null; }
    }
  }, [open]);

  // Bloquear scroll del body
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Cerrar con Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Manejar envío exitoso del formulario MailerLite
  const handleMailerLiteSuccess = () => {
    setStep("loading");
    waitTimer.current = setTimeout(() => {
      setStep("calendar");
    }, VERIFICATION_WAIT_MS);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="discovery-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "rgba(0,0,0,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
        }}
      >
        <motion.div
          key="discovery-panel"
          initial={{ opacity: 0, y: 32, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.97 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "460px",
            maxHeight: "92dvh",
            borderRadius: "16px",
            overflow: "hidden",
            background: "#0f0f0f",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.8)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "rgba(0,0,0,0.7)",
              border: "1px solid rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 10,
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.9)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.7)"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <AnimatePresence mode="wait">
            {/* ── STEP: EMAIL (MailerLite embedded form) ── */}
            {step === "email" && (
              <motion.div
                key="step-email"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{ padding: "clamp(28px, 4vw, 40px) clamp(20px, 4vw, 28px)" }}
              >
                <p style={{
                  fontFamily: "'Helvetica Neue', sans-serif",
                  fontSize: "9px",
                  fontWeight: 700,
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "#ff5833",
                  margin: "0 0 10px 0",
                }}>
                  Sesión de descubrimiento
                </p>

                <h3 style={{
                  fontFamily: "'Helvetica Neue', sans-serif",
                  fontWeight: 900,
                  fontSize: "clamp(1.2rem, 3vw, 1.5rem)",
                  letterSpacing: "-0.03em",
                  color: "#f0ede8",
                  margin: "0 0 8px 0",
                  lineHeight: 1.15,
                }}>
                  Confirma tu correo
                </h3>

                {/* ── MailerLite embedded form ── */}
                <MailerLiteEmbed onSuccess={handleMailerLiteSuccess} />
              </motion.div>
            )}

            {/* ── STEP: LOADING ── */}
            {step === "loading" && (
              <motion.div
                key="step-loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{
                  padding: "clamp(48px, 6vw, 64px) clamp(24px, 4vw, 36px)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  minHeight: "420px",
                }}
              >
                {/* Spinner minimalista */}
                <div style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  border: "2px solid rgba(255,88,51,0.2)",
                  borderTopColor: "#ff5833",
                  animation: "spin 0.8s linear infinite",
                  marginBottom: "28px",
                }} />

                <p style={{
                  fontFamily: "'Helvetica Neue', sans-serif",
                  fontSize: "9px",
                  fontWeight: 700,
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "#ff5833",
                  margin: "0 0 12px 0",
                }}>
                  Verificando correo
                </p>

                <h3 style={{
                  fontFamily: "'Helvetica Neue', sans-serif",
                  fontWeight: 900,
                  fontSize: "clamp(1.1rem, 2.5vw, 1.3rem)",
                  letterSpacing: "-0.03em",
                  color: "#f0ede8",
                  margin: "0 0 10px 0",
                  lineHeight: 1.2,
                }}>
                  Esperando confirmación
                </h3>

                <p style={{
                  fontFamily: "'Helvetica Neue', sans-serif",
                  fontWeight: 300,
                  fontSize: "clamp(0.8rem, 1.4vw, 0.88rem)",
                  color: "rgba(240,237,232,0.4)",
                  lineHeight: 1.6,
                  margin: "0",
                  maxWidth: "320px",
                }}>
                  Hemos enviado el correo de confirmación. Revisa tu bandeja de entrada o la carpeta de spam mientras habilitamos el calendario.
                </p>

                {/* Indicador sutil de progreso */}
                <div style={{
                  marginTop: "32px",
                  width: "120px",
                  height: "2px",
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: "1px",
                  overflow: "hidden",
                }}>
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                      width: "40%",
                      height: "100%",
                      background: "rgba(255,88,51,0.6)",
                      borderRadius: "1px",
                    }}
                  />
                </div>
              </motion.div>
            )}

            {/* ── STEP: CALENDAR ── */}
            {step === "calendar" && (
              <motion.div
                key="step-calendar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}
              >
                {/* Header */}
                <div style={{
                  padding: "clamp(20px, 3vw, 28px) clamp(20px, 3vw, 32px)",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  flexShrink: 0,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                    <div style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "8px",
                      background: "rgba(255,88,51,0.1)",
                      border: "1px solid rgba(255,88,51,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <Calendar size={14} color="#ff5833" />
                    </div>
                    <p style={{
                      fontFamily: "'Helvetica Neue', sans-serif",
                      fontSize: "9px",
                      fontWeight: 700,
                      letterSpacing: "0.3em",
                      textTransform: "uppercase",
                      color: "#ff5833",
                      margin: 0,
                    }}>
                      Correo confirmado
                    </p>
                  </div>
                  <h3 style={{
                    fontFamily: "'Helvetica Neue', sans-serif",
                    fontWeight: 900,
                    fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)",
                    letterSpacing: "-0.03em",
                    color: "#f0ede8",
                    margin: 0,
                    lineHeight: 1.15,
                  }}>
                    Agenda tu reunión con nosotros
                  </h3>
                </div>

                {/* Calendly iframe */}
                <div style={{ width: "100%", position: "relative", flex: 1, minHeight: "480px" }}>
                  {!calendlyLoaded && (
                    <div style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#0f0f0f",
                      zIndex: 1,
                    }}>
                      <div style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        border: "2px solid #ff5833",
                        borderTopColor: "transparent",
                        animation: "spin 0.7s linear infinite",
                      }} />
                    </div>
                  )}
                  <iframe
                    src={CALENDLY_URL}
                    width="100%"
                    frameBorder="0"
                    scrolling="no"
                    title="Agendar sesión"
                    onLoad={() => setCalendlyLoaded(true)}
                    style={{
                      display: "block",
                      border: "none",
                      width: "100%",
                      height: "580px",
                      minHeight: "480px",
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}