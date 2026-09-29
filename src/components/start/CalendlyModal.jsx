import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CALENDLY_URL =
  "https://calendly.com/hola-cabanacreative/creadores?primary_color=ff5833&hide_gdpr_banner=0&background_color=080808&text_color=f0ede8&hide_event_type_details=0";

export default function CalendlyModal() {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const handler = () => {
      setOpen(true);
      setLoaded(false);
    };
    window.addEventListener("open-calendly-modal", handler);
    return () => window.removeEventListener("open-calendly-modal", handler);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.88)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "640px",
              maxHeight: "90vh",
              background: "#0f0f0f",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow:
                "0 20px 80px rgba(0,0,0,0.8), 0 0 120px rgba(255,88,51,0.08)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setOpen(false)}
              aria-label="Cerrar"
              style={{
                position: "absolute",
                top: "14px",
                right: "14px",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "rgba(0,0,0,0.7)",
                border: "1px solid rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 10,
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(0,0,0,0.95)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(0,0,0,0.7)")
              }
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Loading state */}
            {!loaded && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#0f0f0f",
                  zIndex: 1,
                }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    border: "2px solid #ff5833",
                    borderTopColor: "transparent",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {/* Calendly iframe */}
            <iframe
              src={CALENDLY_URL}
              width="100%"
              frameBorder="0"
              scrolling="auto"
              loading="eager"
              title="Agendar sesión de descubrimiento"
              onLoad={() => setLoaded(true)}
              style={{
                display: "block",
                border: "none",
                width: "100%",
                height: "640px",
                minHeight: "640px",
                background: "#0f0f0f",
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}