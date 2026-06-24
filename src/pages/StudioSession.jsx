import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { ArrowLeft, X, Clock } from "lucide-react";

// ─── Default iframes fallback ────────────────────────────────────────────────
const DEFAULTS = {
  iframe_2h: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ2rL6stve6STKzdmkSIT7nXxVji_5QiqxLZQDcQNhGmjnMFmzEmEtcJnrraLy6WDyhgtdEm1GiN?gv=true",
  iframe_4h: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ2rL6stve6STKzdmkSIT7nXxVji_5QiqxLZQDcQNhGmjnMFmzEmEtcJnrraLy6WDyhgtdEm1GiN?gv=true",
  iframe_6h: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ1b89Rorg3Wv_UXJypZRtc51ha3VeFePtDeBaWAJ5DHkavX8ORnZtosOI6D4UvjBjyMIfFvNhAj?gv=true",
  overlay_opacity: 0.72,
};

// ─── Session options config ───────────────────────────────────────────────────
const SESSION_OPTIONS = [
  {
    key: "2h",
    hours: "2",
    label: "Sesión de 2 Horas",
    desc: "Consultoría, estrategia o feedback de proyecto.",
    tag: "Bloque corto",
  },
  {
    key: "4h",
    hours: "4",
    label: "Sesión de 4 Horas",
    desc: "Producción activa, grabación de voz o refinamiento de mezcla.",
    tag: "Bloque medio",
    featured: true,
  },
  {
    key: "6h",
    hours: "6",
    label: "Sesión de 6 Horas",
    desc: "Jornada intensiva: grabación de catálogo, mezcla o film scoring.",
    tag: "Jornada completa",
  },
];

// ─── Booking Modal ────────────────────────────────────────────────────────────
function BookingModal({ option, cfg, onClose }) {
  const [loaded, setLoaded] = useState(false);

  const iframeSrc =
    option.key === "2h" ? (cfg?.iframe_2h || DEFAULTS.iframe_2h) :
    option.key === "4h" ? (cfg?.iframe_4h || DEFAULTS.iframe_4h) :
                          (cfg?.iframe_6h || DEFAULTS.iframe_6h);

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        key="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.88)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "16px",
        }}
      >
        <motion.div
          key="modal-panel"
          initial={{ opacity: 0, y: 32, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.97 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "720px",
            maxHeight: "90dvh",
            borderRadius: "16px",
            overflow: "hidden",
            background: "#0d0d0d",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.8)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Modal header */}
          <div style={{
            padding: "20px 24px 18px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}>
            <div>
              <p style={{ fontFamily: "'Helvetica Neue', sans-serif", fontSize: "9px", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "#ff5833", margin: "0 0 4px" }}>
                Reservar sesión
              </p>
              <h3 style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 900, fontSize: "clamp(1rem, 2.5vw, 1.25rem)", letterSpacing: "-0.03em", color: "#f0ede8", margin: 0, lineHeight: 1.1 }}>
                {option.label}
              </h3>
            </div>
            <button
              onClick={onClose}
              style={{
                width: "36px", height: "36px", borderRadius: "50%",
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", flexShrink: 0, transition: "background 0.2s",
                color: "rgba(240,237,232,0.6)",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
            >
              <X size={16} />
            </button>
          </div>

          {/* Iframe area */}
          <div style={{ position: "relative", flex: 1, overflow: "hidden", minHeight: "520px" }}>
            {!loaded && (
              <div style={{
                position: "absolute", inset: 0, display: "flex",
                alignItems: "center", justifyContent: "center",
                background: "#0d0d0d", zIndex: 2,
              }}>
                <div style={{
                  width: "28px", height: "28px", borderRadius: "50%",
                  border: "2px solid #ff5833", borderTopColor: "transparent",
                  animation: "spin 0.7s linear infinite",
                }} />
              </div>
            )}
            <iframe
              src={iframeSrc}
              style={{ border: 0, display: "block", width: "100%", height: "100%", minHeight: "520px" }}
              frameBorder="0"
              title={option.label}
              onLoad={() => setLoaded(true)}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function StudioSession() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeOption, setActiveOption] = useState(null);

  useEffect(() => {
    base44.auth.me().then((u) => {
      if (u?.role === "admin") setIsAdmin(true);
    }).catch(() => {});
  }, []);

  const { data: cfg } = useQuery({
    queryKey: ["studioSessionConfig"],
    queryFn: async () => {
      const rows = await base44.entities.StudioSessionConfig.list();
      return rows[0] || null;
    },
    staleTime: 60000,
  });

  const opacity = cfg?.overlay_opacity ?? DEFAULTS.overlay_opacity;
  const bgImage = cfg?.bg_image_url || null;

  return (
    <div style={{
      position: "relative",
      minHeight: "100dvh",
      background: "#080808",
      overflow: "hidden",
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* ── Cinematic background ─────────────────────────────────────── */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        {bgImage ? (
          <img
            src={bgImage}
            alt="Studio"
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover", objectPosition: "center",
              filter: "saturate(0.6) brightness(0.5)",
            }}
          />
        ) : (
          /* Fallback gradient when no image is set */
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(135deg, #0e0e0e 0%, #1a1208 50%, #080808 100%)",
          }} />
        )}

        {/* Cinematic overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: `rgba(8,8,8,${opacity})`,
        }} />

        {/* Top vignette */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(8,8,8,0.85) 0%, transparent 30%, transparent 60%, rgba(8,8,8,0.9) 100%)",
        }} />

        {/* Radial vignette */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 100% 80% at 50% 50%, transparent 30%, rgba(8,8,8,0.6) 100%)",
        }} />

        {/* Grain texture for cinema feel */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.03,
          backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 256 256\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noise\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"4\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noise)\" opacity=\"1\"/%3E%3C/svg%3E')",
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }} />
      </div>

      {/* ── Back button (admin only) ─────────────────────────────────── */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ position: "absolute", top: "24px", left: "24px", zIndex: 30 }}
        >
          <Link
            to="/AdminDashboard"
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              color: "rgba(240,237,232,0.35)", textDecoration: "none",
              fontSize: "10px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "rgba(240,237,232,0.7)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "rgba(240,237,232,0.35)"}
          >
            <ArrowLeft size={12} />
            Dashboard
          </Link>
        </motion.div>
      )}

      {/* ── Logo ────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        style={{ position: "absolute", top: "20px", left: "50%", transform: "translateX(-50%)", zIndex: 30 }}
      >
        <img
          src="https://media.base44.com/images/public/6966ddf48947f217e81ea27c/6b7c4002a_Titulo.png"
          alt="Cabaña Creative"
          style={{ height: "30px", width: "auto", opacity: 0.65 }}
        />
      </motion.div>

      {/* ── Main content ────────────────────────────────────────────── */}
      <div style={{
        position: "relative", zIndex: 20,
        display: "flex", flexDirection: "column", alignItems: "center",
        minHeight: "100dvh",
        paddingTop: "clamp(90px, 12vw, 130px)",
        paddingBottom: "clamp(48px, 7vw, 80px)",
        paddingLeft: "clamp(16px, 5vw, 48px)",
        paddingRight: "clamp(16px, 5vw, 48px)",
      }}>

        {/* Eyebrow label */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{
            fontSize: "9px", fontWeight: 700, letterSpacing: "0.4em",
            textTransform: "uppercase", color: "#ff5833",
            marginBottom: "clamp(10px, 1.5vw, 16px)",
          }}
        >
          Cabaña Creative Studio
        </motion.p>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontSize: "clamp(2rem, 6vw, 3.6rem)",
            fontWeight: 900, letterSpacing: "-0.045em",
            color: "#f0ede8", lineHeight: 0.93,
            textAlign: "center",
            marginBottom: "clamp(12px, 2vw, 18px)",
          }}
        >
          La Cabaña
        </motion.h1>

        {/* Subline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          style={{
            fontSize: "clamp(0.8rem, 1.6vw, 0.95rem)",
            fontWeight: 300, color: "rgba(240,237,232,0.4)",
            textAlign: "center", maxWidth: "380px",
            lineHeight: 1.6, marginBottom: "clamp(40px, 6vw, 64px)",
          }}
        >
          Reserva tu tiempo en el estudio. Elige la duración que se adapte a tu proyecto.
        </motion.p>

        {/* ── Session option cards ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "clamp(10px, 1.8vw, 16px)",
            width: "100%",
            maxWidth: "800px",
          }}
        >
          {SESSION_OPTIONS.map((opt, i) => (
            <motion.button
              key={opt.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => setActiveOption(opt)}
              style={{
                position: "relative",
                background: opt.featured
                  ? "rgba(255,88,51,0.09)"
                  : "rgba(255,255,255,0.03)",
                border: opt.featured
                  ? "1px solid rgba(255,88,51,0.3)"
                  : "1px solid rgba(255,255,255,0.07)",
                borderRadius: "14px",
                padding: "clamp(20px, 2.5vw, 28px) clamp(18px, 2.5vw, 24px)",
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.25s, border-color 0.25s, transform 0.2s, box-shadow 0.25s",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = opt.featured ? "rgba(255,88,51,0.15)" : "rgba(255,255,255,0.07)";
                e.currentTarget.style.borderColor = opt.featured ? "rgba(255,88,51,0.5)" : "rgba(255,255,255,0.15)";
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = opt.featured ? "0 16px 48px rgba(255,88,51,0.18)" : "0 16px 48px rgba(0,0,0,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = opt.featured ? "rgba(255,88,51,0.09)" : "rgba(255,255,255,0.03)";
                e.currentTarget.style.borderColor = opt.featured ? "rgba(255,88,51,0.3)" : "rgba(255,255,255,0.07)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Featured badge */}
              {opt.featured && (
                <span style={{
                  position: "absolute", top: "14px", right: "14px",
                  fontSize: "7px", fontWeight: 700, letterSpacing: "0.2em",
                  textTransform: "uppercase", color: "#ff5833",
                  background: "rgba(255,88,51,0.12)", borderRadius: "4px",
                  padding: "3px 7px",
                }}>
                  Popular
                </span>
              )}

              {/* Hours badge */}
              <div style={{
                display: "flex", alignItems: "center", gap: "6px",
                marginBottom: "clamp(12px, 1.8vw, 16px)",
              }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  background: opt.featured ? "rgba(255,88,51,0.15)" : "rgba(255,255,255,0.06)",
                  border: `1px solid ${opt.featured ? "rgba(255,88,51,0.25)" : "rgba(255,255,255,0.08)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Clock size={15} color={opt.featured ? "#ff5833" : "rgba(240,237,232,0.4)"} />
                </div>
                <span style={{
                  fontFamily: "'Helvetica Neue', sans-serif",
                  fontSize: "8px", fontWeight: 700, letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: opt.featured ? "rgba(255,88,51,0.7)" : "rgba(240,237,232,0.3)",
                }}>
                  {opt.tag}
                </span>
              </div>

              {/* Title */}
              <h3 style={{
                fontFamily: "'Helvetica Neue', sans-serif",
                fontWeight: 900, fontSize: "clamp(1rem, 1.8vw, 1.15rem)",
                letterSpacing: "-0.03em", color: "#f0ede8",
                margin: "0 0 8px", lineHeight: 1.1,
              }}>
                {opt.label}
              </h3>

              {/* Description */}
              <p style={{
                fontFamily: "'Helvetica Neue', sans-serif",
                fontWeight: 300, fontSize: "clamp(0.75rem, 1.2vw, 0.82rem)",
                color: "rgba(240,237,232,0.4)", lineHeight: 1.55,
                margin: "0 0 clamp(16px, 2.5vw, 22px)",
              }}>
                {opt.desc}
              </p>

              {/* CTA row */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{
                  fontFamily: "'Helvetica Neue', sans-serif",
                  fontWeight: 700, fontSize: "clamp(0.7rem, 1.1vw, 0.78rem)",
                  letterSpacing: "-0.01em",
                  color: opt.featured ? "#ff5833" : "rgba(240,237,232,0.55)",
                }}>
                  Ver disponibilidad →
                </span>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Divider + tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.95 }}
          style={{ marginTop: "clamp(32px, 5vw, 56px)", textAlign: "center" }}
        >
          <div style={{ height: "1px", width: "36px", background: "rgba(255,255,255,0.1)", margin: "0 auto 14px" }} />
          <p style={{
            fontSize: "9px", fontWeight: 600, letterSpacing: "0.28em",
            textTransform: "uppercase", color: "rgba(240,237,232,0.15)",
          }}>
            Música · Films · Creadores
          </p>
        </motion.div>
      </div>

      {/* ── Booking Modal ────────────────────────────────────────────── */}
      {activeOption && (
        <BookingModal
          option={activeOption}
          cfg={cfg}
          onClose={() => setActiveOption(null)}
        />
      )}
    </div>
  );
}