import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar } from "lucide-react";

const CALENDLY_URL = "https://calendly.com/hola-cabanacreative/creadores?primary_color=ff5833&hide_gdpr_banner=0&background_color=080808&text_color=f0ede8&hide_event_type_details=1";
const MAILERLITE_FORM_ID = "Ezjvmn";
// Tiempo de espera estimado para recibir el correo de confirmación (ms)
const VERIFICATION_WAIT_MS = 12000;

export default function DiscoverySessionModal({ open, onClose }) {
  const [step, setStep] = useState("email"); // "email" | "loading" | "calendar"
  const [calendlyLoaded, setCalendlyLoaded] = useState(false);
  const [mlReady, setMlReady] = useState(false);
  const waitTimer = useRef(null);
  const mlContainerRef = useRef(null);
  const observerRef = useRef(null);
  const submittedRef = useRef(false);

  // Reset al cerrar
  useEffect(() => {
    if (!open) {
      setStep("email");
      setCalendlyLoaded(false);
      setMlReady(false);
      submittedRef.current = false;
      if (waitTimer.current) { clearTimeout(waitTimer.current); waitTimer.current = null; }
      if (observerRef.current) { observerRef.current.disconnect(); observerRef.current = null; }
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

  // Inicializar formulario embebido de MailerLite y detectar envío exitoso
  useEffect(() => {
    if (!open || step !== "email") return;

    // Esperar a que el SDK universal de MailerLite esté disponible
    const initForm = () => {
      const container = mlContainerRef.current;
      if (!container) return;

      // El div ml-embedded ya está renderizado; MailerLite universal JS
      // lo detecta automáticamente. Si no aparece el formulario tras un
      // breve instante, forzamos el re-escaneo.
      if (window.ml && typeof window.ml === "function") {
        try {
          // Re-inicializa los formularios embebidos detectados dinámicamente
          if (typeof window.ml("reinit") !== "undefined") window.ml("reinit");
        } catch (e) { /* no-op */ }
      }

      setMlReady(true);

      // MutationObserver: detecta cuando MailerLite reemplaza el formulario
      // por el mensaje de éxito tras la suscripción, o cuando aparece un
      // elemento de confirmación dentro del contenedor.
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new MutationObserver(() => {
        detectSuccess();
      });
      observerRef.current.observe(container, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      });

      // También capturamos el envío del formulario por si MailerLite
      // no muestra un mensaje de éxito inmediato.
      const tryAttachSubmit = () => {
        const form = container.querySelector("form");
        if (form && !form.__cabanaAttached) {
          form.__cabanaAttached = true;
          form.addEventListener("submit", () => {
            // Damos un pequeño margen para que MailerLite procese la suscripción
            setTimeout(() => transitionToLoading(), 400);
          });
        }
      };
      tryAttachSubmit();

      // Re-intentar adjuntar el listener si el formulario se inyecta más tarde
      const submitInterval = setInterval(() => {
        if (submittedRef.current) {
          clearInterval(submitInterval);
          return;
        }
        tryAttachSubmit();
      }, 500);
      // Limpieza del intervalo tras 30s
      setTimeout(() => clearInterval(submitInterval), 30000);
    };

    const detectSuccess = () => {
      const container = mlContainerRef.current;
      if (!container || submittedRef.current) return;

      // MailerLite reemplaza el form con un mensaje de éxito.
      // Detectamos: el form desapareció y hay contenido de texto,
      // o aparece un elemento con clase que indica éxito.
      const form = container.querySelector("form");
      const hasSuccessText =
        container.textContent && (
          /gracias|thank you|suscrib|success|confirmado|confirmada/i.test(container.textContent)
        );

      // Si ya no hay formulario y hay texto de éxito, transicionamos
      if (!form && hasSuccessText && container.children.length > 0) {
        transitionToLoading();
      }
    };

    const transitionToLoading = () => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      setStep("loading");
      if (observerRef.current) { observerRef.current.disconnect(); observerRef.current = null; }
      waitTimer.current = setTimeout(() => {
        setStep("calendar");
      }, VERIFICATION_WAIT_MS);
    };

    // Pequeño retraso para asegurar que el div está en el DOM
    const t = setTimeout(initForm, 200);
    return () => {
      clearTimeout(t);
      if (observerRef.current) { observerRef.current.disconnect(); observerRef.current = null; }
    };
  }, [open, step]);

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
            {/* ── STEP: EMAIL (MailerLite embedded form) ── */}
            {step === "email" && (
              <motion.div
                key="step-email"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{ padding: "clamp(28px, 4vw, 40px) clamp(24px, 4vw, 36px)" }}
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
                  fontSize: "clamp(1.3rem, 3vw, 1.6rem)",
                  letterSpacing: "-0.03em",
                  color: "#f0ede8",
                  margin: "0 0 12px 0",
                  lineHeight: 1.15,
                }}>
                  Suscríbete para agendar
                </h3>

                <p style={{
                  fontFamily: "'Helvetica Neue', sans-serif",
                  fontWeight: 300,
                  fontSize: "clamp(0.82rem, 1.4vw, 0.92rem)",
                  color: "rgba(240,237,232,0.45)",
                  lineHeight: 1.6,
                  margin: "0 0 20px 0",
                }}>
                  Introduce tu correo para recibir la confirmación. Revisa también tu bandeja de spam para asegurarte de recibirla.
                </p>

                {/* ── MailerLite embedded form ── */}
                <div
                  ref={mlContainerRef}
                  className="ml-embedded-container"
                  style={{
                    minHeight: mlReady ? "auto" : "160px",
                    position: "relative",
                  }}
                >
                  {/* Formulario embebido de MailerLite (form ID Ezjvmn) */}
                  <div className="ml-embedded" data-form={MAILERLITE_FORM_ID}></div>

                  {/* Placeholder mientras MailerLite inyecta el formulario */}
                  {!mlReady && (
                    <div style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <div style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        border: "2px solid rgba(255,88,51,0.2)",
                        borderTopColor: "#ff5833",
                        animation: "spin 0.7s linear infinite",
                      }} />
                    </div>
                  )}
                </div>

                {/* Nota sobre spam */}
                <p style={{
                  fontFamily: "'Helvetica Neue', sans-serif",
                  fontWeight: 300,
                  fontSize: "0.72rem",
                  color: "rgba(240,237,232,0.3)",
                  lineHeight: 1.55,
                  margin: "16px 0 0 0",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                }}>
                  <span style={{ color: "#ff5833", flexShrink: 0 }}>●</span>
                  <span>Tras suscribirte, esperaremos la confirmación de tu correo antes de habilitar el calendario. Verifica tu bandeja de entrada y la carpeta de spam.</span>
                </p>
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