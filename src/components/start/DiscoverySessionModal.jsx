import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Check, AlertCircle, Calendar } from "lucide-react";

const CALENDLY_URL = "https://calendly.com/hola-cabanacreative/creadores?primary_color=ff5833&hide_gdpr_banner=0&background_color=080808&text_color=f0ede8&hide_event_type_details=1";
// Tiempo de espera simulando verificación de correo (ms)
const VERIFICATION_WAIT_MS = 9000;

export default function DiscoverySessionModal({ open, onClose }) {
  const [step, setStep] = useState("email"); // "email" | "loading" | "calendar"
  const [email, setEmail] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [calendlyLoaded, setCalendlyLoaded] = useState(false);
  const waitTimer = useRef(null);

  // Reset al cerrar
  useEffect(() => {
    if (!open) {
      setStep("email");
      setEmail("");
      setAccepted(false);
      setSubmitting(false);
      setError("");
      setCalendlyLoaded(false);
      if (waitTimer.current) clearTimeout(waitTimer.current);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Introduce un correo válido");
      return;
    }
    if (!accepted) {
      setError("Debes confirmar que revisarás tu bandeja de spam");
      return;
    }

    setSubmitting(true);

    // Suscripción a MailerLite (best-effort usando el SDK universal cargado globalmente)
    try {
      if (window.ml && typeof window.ml === "function") {
        // El SDK universal de MailerLite gestiona la suscripción a través de formularios embebidos;
        // aquí enviamos el evento de suscripción para tracking.
        window.ml("subscribe", { email });
      }
    } catch (err) {
      // No bloqueamos el flujo si falla el tracking
    }

    // Transición a estado de carga
    setTimeout(() => {
      setSubmitting(false);
      setStep("loading");
      // Tras el tiempo de espera, mostrar el calendario
      waitTimer.current = setTimeout(() => {
        setStep("calendar");
      }, VERIFICATION_WAIT_MS);
    }, 600);
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
            maxWidth: "480px",
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
            {/* ── STEP: EMAIL ── */}
            {step === "email" && (
              <motion.div
                key="step-email"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{ padding: "clamp(28px, 4vw, 40px) clamp(24px, 4vw, 36px)" }}
              >
                {/* Icon */}
                <div style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "rgba(255,88,51,0.1)",
                  border: "1px solid rgba(255,88,51,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                }}>
                  <Mail size={20} color="#ff5833" />
                </div>

                <p style={{
                  fontFamily: "'Helvetica Neue', sans-serif",
                  fontSize: "9px",
                  fontWeight: 700,
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "rgba(240,237,232,0.3)",
                  margin: "0 0 8px 0",
                }}>
                  Sesión de descubrimiento
                </p>

                <h3 style={{
                  fontFamily: "'Helvetica Neue', sans-serif",
                  fontWeight: 900,
                  fontSize: "clamp(1.3rem, 3vw, 1.6rem)",
                  letterSpacing: "-0.03em",
                  color: "#f0ede8",
                  margin: "0 0 12px 0",
                  lineHeight: 1.15,
                }}>
                  Confirma tu correo para agendar
                </h3>

                <p style={{
                  fontFamily: "'Helvetica Neue', sans-serif",
                  fontWeight: 300,
                  fontSize: "clamp(0.82rem, 1.4vw, 0.92rem)",
                  color: "rgba(240,237,232,0.45)",
                  lineHeight: 1.6,
                  margin: "0 0 24px 0",
                }}>
                  Te enviaremos la confirmación de la sesión. Revisa también tu bandeja de correo no deseado (spam) para asegurarte de recibirla.
                </p>

                <form onSubmit={handleSubmit}>
                  {/* Email input */}
                  <div style={{ position: "relative", marginBottom: "16px" }}>
                    <Mail size={15} color="rgba(240,237,232,0.3)" style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                    }} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }}
                      placeholder="tu@correo.com"
                      required
                      style={{
                        width: "100%",
                        fontFamily: "'Helvetica Neue', sans-serif",
                        fontSize: "0.9rem",
                        color: "#f0ede8",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "10px",
                        padding: "14px 14px 14px 42px",
                        outline: "none",
                        transition: "border-color 0.2s",
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = "rgba(255,88,51,0.4)"}
                      onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
                    />
                  </div>

                  {/* Aceptación / confirmación spam */}
                  <button
                    type="button"
                    onClick={() => { setAccepted(!accepted); setError(""); }}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      padding: "0",
                      marginBottom: "20px",
                    }}
                  >
                    <div style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "5px",
                      border: accepted ? "1px solid #ff5833" : "1px solid rgba(255,255,255,0.2)",
                      background: accepted ? "#ff5833" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: "2px",
                      transition: "all 0.2s",
                    }}>
                      {accepted && <Check size={12} color="#fff" strokeWidth={3} />}
                    </div>
                    <span style={{
                      fontFamily: "'Helvetica Neue', sans-serif",
                      fontSize: "0.78rem",
                      color: "rgba(240,237,232,0.5)",
                      lineHeight: 1.55,
                    }}>
                      Confirmo que revisaré mi bandeja de entrada y la carpeta de spam para validar la confirmación de la sesión.
                    </span>
                  </button>

                  {/* Error */}
                  {error && (
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "16px",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      background: "rgba(239,68,68,0.08)",
                      border: "1px solid rgba(239,68,68,0.2)",
                    }}>
                      <AlertCircle size={14} color="#ef4444" />
                      <span style={{
                        fontFamily: "'Helvetica Neue', sans-serif",
                        fontSize: "0.78rem",
                        color: "#fca5a5",
                      }}>
                        {error}
                      </span>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      width: "100%",
                      fontFamily: "'Helvetica Neue', sans-serif",
                      fontWeight: 900,
                      fontSize: "0.9rem",
                      letterSpacing: "0.01em",
                      background: "#ff5833",
                      color: "#fff",
                      border: "none",
                      borderRadius: "10px",
                      padding: "15px",
                      cursor: submitting ? "wait" : "pointer",
                      transition: "background 0.2s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      opacity: submitting ? 0.7 : 1,
                    }}
                    onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.background = "#e04a28"; }}
                    onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.background = "#ff5833"; }}
                  >
                    {submitting ? (
                      <>
                        <div style={{
                          width: "16px",
                          height: "16px",
                          borderRadius: "50%",
                          border: "2px solid rgba(255,255,255,0.4)",
                          borderTopColor: "transparent",
                          animation: "spin 0.7s linear infinite",
                        }} />
                        Enviando...
                      </>
                    ) : (
                      <>Confirmar y agendar →</>
                    )}
                  </button>
                </form>
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
                  Estamos a la espera de que confirmes tu correo para agendar la sesión de descubrimiento correctamente.
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