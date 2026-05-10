import React, { useRef, useEffect, useState, lazy } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import PhoneInput from "./PhoneInput";

function useAutoPlay(src) {
  const ref = useRef(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || !src) return;
    const play = () => { v.muted = true; v.play().catch(() => {}); };
    play();
    v.addEventListener("canplay", play);
    v.addEventListener("pause", play);
    return () => { v.removeEventListener("canplay", play); v.removeEventListener("pause", play); };
  }, [src]);
  return ref;
}

function isVideo(url) {
  return url && /\.(mp4|webm|mov)(\?|$)/i.test(url);
}

const inputStyle = {
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  fontSize: "clamp(0.85rem, 1.8vw, 1rem)",
  fontWeight: 400,
  background: "transparent",
  border: "none",
  borderBottom: "1px solid rgba(240,237,232,0.15)",
  outline: "none",
  color: "#f0ede8",
  padding: "12px 0",
  width: "100%",
  letterSpacing: "-0.01em",
};

function CalendlyEmbed() {
  const [loaded, setLoaded] = React.useState(false);
  // Calendly needs ~660px on desktop, ~700px on mobile (no side panel)
  // Clip the Calendly logo banner at the top (~60px) while keeping profile pics + meeting info
  const CLIP_TOP = 60;
  const isMobile = typeof window !== "undefined" && window.innerWidth < 600;
  const iframeHeight = isMobile ? 700 : 680;
  const containerHeight = iframeHeight - CLIP_TOP;

  return (
    <div
      style={{
        marginTop: "12px",
        marginBottom: "12px",
        width: "100%",
        position: "relative",
        height: `${containerHeight}px`,
        overflow: "hidden",
        borderRadius: "8px",
      }}
    >
      {!loaded && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(12,12,12,0.8)", zIndex: 1, borderRadius: "8px",
        }}>
          <div style={{
            width: "24px", height: "24px", borderRadius: "50%",
            border: "2px solid #ff5200", borderTopColor: "transparent",
            animation: "spin 0.7s linear infinite",
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
      {/* iframe shifted up by CLIP_TOP to hide the logo banner */}
      <iframe
        src="https://calendly.com/hola-cabanacreative/creadores?primary_color=ff5200&hide_gdpr_banner=1&background_color=0c0c0c&text_color=f0ede8"
        width="100%"
        frameBorder="0"
        scrolling="no"
        loading="eager"
        title="Agendar reunión"
        onLoad={() => setLoaded(true)}
        style={{
          display: "block",
          border: "none",
          width: "100%",
          height: `${iframeHeight}px`,
          marginTop: `-${CLIP_TOP}px`,
        }}
      />
    </div>
  );
}

function CalendlyPanel() {
  const [form, setForm] = useState({ name: "", lastName: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { setError("Completa todos los campos."); return; }
    setSending(true);
    setError("");
    await base44.entities.ContactLead.create({
      name: `${form.name} ${form.lastName}`.trim(),
      email: form.email,
      message: form.message + (form.phone ? `\n\nTeléfono: ${form.phone}` : ""),
      status: "Nuevo",
    });
    setSending(false);
    setSent(true);
  };

  return (
    <motion.div
      key="calendly"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <CalendlyEmbed />

      {/* Divider */}
      <div style={{ height: "1px", background: "rgba(240,237,232,0.08)", margin: "clamp(20px, 3vw, 32px) 0" }} />

      {/* Email */}
      <p style={{
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        fontWeight: 300,
        fontSize: "clamp(0.8rem, 1.5vw, 0.95rem)",
        color: "rgba(240,237,232,0.45)",
        lineHeight: 1.5,
        marginBottom: "clamp(6px, 1.5vw, 10px)",
      }}>
        ¿Prefieres escribirnos? Envíanos tu proyecto o brief a{" "}
        <a
          href="mailto:hola@cabanacreative.es"
          style={{ color: "#ff5833", textDecoration: "none", fontWeight: 600, transition: "opacity 0.2s ease" }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.75"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          hola@cabanacreative.es
        </a>
      </p>

      {/* Divider */}
      <div style={{ height: "1px", background: "rgba(240,237,232,0.08)", margin: "clamp(20px, 3vw, 32px) 0" }} />

      {/* Form */}
      {sent ? (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontWeight: 700,
            fontSize: "clamp(1rem, 2.5vw, 1.3rem)",
            color: "#f0ede8",
            letterSpacing: "-0.02em",
            paddingBottom: "32px",
          }}
        >
          Recibido. Te contactamos pronto.
        </motion.p>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "clamp(16px, 3vw, 24px)", paddingBottom: "32px" }}>
          <div style={{ display: "flex", gap: "clamp(16px, 4vw, 40px)", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 180px" }}>
              <label style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: "9px", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(240,237,232,0.3)", display: "block", marginBottom: "8px" }}>Nombre</label>
              <input style={inputStyle} placeholder="Tu nombre" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div style={{ flex: "1 1 180px" }}>
              <label style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: "9px", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(240,237,232,0.3)", display: "block", marginBottom: "8px" }}>Apellidos</label>
              <input style={inputStyle} placeholder="Tus apellidos" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "clamp(16px, 4vw, 40px)", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 180px" }}>
              <label style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: "9px", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(240,237,232,0.3)", display: "block", marginBottom: "8px" }}>Email</label>
              <input type="email" style={inputStyle} placeholder="tu@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div style={{ flex: "1 1 180px" }}>
              <label style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: "9px", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(240,237,232,0.3)", display: "block", marginBottom: "8px" }}>Teléfono</label>
              <PhoneInput value={form.phone} onChange={val => setForm(f => ({ ...f, phone: val }))} inputStyle={{ ...inputStyle }} />
            </div>
          </div>
          <div>
            <label style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: "9px", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(240,237,232,0.3)", display: "block", marginBottom: "8px" }}>Cuéntanos tu proyecto</label>
            <textarea rows={4} style={{ ...inputStyle, resize: "none", borderBottom: "1px solid rgba(240,237,232,0.15)" }} placeholder="¿Quién eres? ¿Qué quieres crear? ¿Cuándo te gustaría empezar?" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
          </div>
          {error && <p style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: "12px", color: "#ff5833", margin: 0 }}>{error}</p>}
          <div>
            <button
              type="submit"
              disabled={sending}
              style={{
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontWeight: 900,
                fontSize: "clamp(0.8rem, 1.8vw, 1rem)",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                background: "#f0ede8",
                color: "#0c0c0c",
                border: "none",
                padding: "clamp(12px, 2vw, 16px) clamp(24px, 4vw, 40px)",
                cursor: sending ? "wait" : "pointer",
                opacity: sending ? 0.5 : 1,
                transition: "background 0.2s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#ff5833"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#f0ede8"; e.currentTarget.style.color = "#0c0c0c"; }}
            >
              {sending ? "Enviando..." : "Enviar →"}
            </button>
          </div>
        </form>
      )}
    </motion.div>
  );
}

function ContactPanel() {
  const [form, setForm] = useState({ name: "", lastName: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { setError("Completa todos los campos."); return; }
    setSending(true);
    setError("");
    await base44.entities.ContactLead.create({
      name: `${form.name} ${form.lastName}`.trim(),
      email: form.email,
      message: form.message + (form.phone ? `\n\nTeléfono: ${form.phone}` : ""),
      status: "Nuevo",
    });
    setSending(false);
    setSent(true);
  };

  return (
    <motion.div
      key="contact"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ marginTop: "clamp(16px, 3vw, 28px)", marginBottom: "clamp(16px, 3vw, 28px)" }}
    >
      {/* Calendly para Marca */}
      <CalendlyEmbed />

      {/* Divider */}
      <div style={{ height: "1px", background: "rgba(240,237,232,0.08)", margin: "clamp(20px, 3vw, 32px) 0" }} />

      {/* Email breve */}
      <p style={{
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        fontWeight: 300,
        fontSize: "clamp(0.8rem, 1.5vw, 0.95rem)",
        color: "rgba(240,237,232,0.45)",
        lineHeight: 1.5,
        marginBottom: "clamp(6px, 1.5vw, 10px)",
      }}>
        ¿Prefieres escribirnos? Envíanos tu proyecto o brief a{" "}
        <a
          href="mailto:hola@cabanacreative.es"
          style={{
            color: "#ff5833",
            textDecoration: "none",
            fontWeight: 600,
            transition: "opacity 0.2s ease",
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.75"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          hola@cabanacreative.es
        </a>
      </p>

      {/* Divider */}
      <div style={{ height: "1px", background: "rgba(240,237,232,0.08)", margin: "clamp(20px, 3vw, 32px) 0" }} />

      {/* Form */}
      {sent ? (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontWeight: 700,
            fontSize: "clamp(1rem, 2.5vw, 1.3rem)",
            color: "#f0ede8",
            letterSpacing: "-0.02em",
            paddingBottom: "32px",
          }}
        >
          Recibido. Te contactamos pronto.
        </motion.p>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "clamp(16px, 3vw, 24px)", paddingBottom: "32px" }}>
          <div style={{ display: "flex", gap: "clamp(16px, 4vw, 40px)", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 180px" }}>
              <label style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: "9px", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(240,237,232,0.3)", display: "block", marginBottom: "8px" }}>Nombre</label>
              <input style={inputStyle} placeholder="Tu nombre" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div style={{ flex: "1 1 180px" }}>
              <label style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: "9px", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(240,237,232,0.3)", display: "block", marginBottom: "8px" }}>Apellidos</label>
              <input style={inputStyle} placeholder="Tus apellidos" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "clamp(16px, 4vw, 40px)", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 180px" }}>
              <label style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: "9px", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(240,237,232,0.3)", display: "block", marginBottom: "8px" }}>Email</label>
              <input type="email" style={inputStyle} placeholder="tu@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div style={{ flex: "1 1 180px" }}>
              <label style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: "9px", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(240,237,232,0.3)", display: "block", marginBottom: "8px" }}>Teléfono</label>
              <PhoneInput value={form.phone} onChange={val => setForm(f => ({ ...f, phone: val }))} inputStyle={{ ...inputStyle }} />
            </div>
          </div>
          <div>
            <label style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: "9px", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(240,237,232,0.3)", display: "block", marginBottom: "8px" }}>Cuéntanos tu proyecto</label>
            <textarea rows={4} style={{ ...inputStyle, resize: "none", borderBottom: "1px solid rgba(240,237,232,0.15)" }} placeholder="¿Quién eres? ¿Qué quieres crear? ¿Cuándo te gustaría empezar?" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
          </div>
          {error && <p style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: "12px", color: "#ff5833", margin: 0 }}>{error}</p>}
          <div>
            <button
              type="submit"
              disabled={sending}
              style={{
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontWeight: 900,
                fontSize: "clamp(0.8rem, 1.8vw, 1rem)",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                background: "#f0ede8",
                color: "#0c0c0c",
                border: "none",
                padding: "clamp(12px, 2vw, 16px) clamp(24px, 4vw, 40px)",
                cursor: sending ? "wait" : "pointer",
                opacity: sending ? 0.5 : 1,
                transition: "background 0.2s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#ff5833"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#f0ede8"; e.currentTarget.style.color = "#0c0c0c"; }}
            >
              {sending ? "Enviando..." : "Enviar →"}
            </button>
          </div>
        </form>
      )}
    </motion.div>
  );
}

export default function StartChoosePath() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [openPanel, setOpenPanel] = useState(null); // "artist" | "brand" | null

  const { data: cfg } = useQuery({
    queryKey: ["landingConfig"],
    queryFn: async () => { const c = await base44.entities.LandingConfig.list(); return c[0] || null; },
    staleTime: 30000,
  });

  const bgSrc = cfg?.hero_banner_1_image || "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1800&q=85";
  const vidRef = useAutoPlay(isVideo(bgSrc) ? bgSrc : null);

  const PATHS = [
    { key: "artist", label: "Artista / Creador" },
    { key: "brand", label: "Marca" },
  ];

  const toggle = (key) => setOpenPanel(v => v === key ? null : key);

  const btnColor = (key) => openPanel === key ? "#ff5833" : "rgba(240,237,232,0.6)";

  return (
    <section
      id="choose"
      ref={ref}
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100dvh",
        overflow: "visible",
        background: "#080808",
        display: "flex",
        alignItems: "flex-end",
      }}
    >
      {/* Background */}
      {isVideo(bgSrc) ? (
        <video
          ref={vidRef}
          src={bgSrc}
          autoPlay muted loop playsInline preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ pointerEvents: "none", filter: "brightness(0.4) saturate(0.6)" }}
        />
      ) : (
        <img
          src={bgSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(0.4) saturate(0.6)" }}
        />
      )}

      {/* Overlay */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)"
      }} />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          padding: "clamp(120px, 20vw, 200px) clamp(24px, 6vw, 56px) clamp(40px, 8vw, 72px)",
          width: "100%",
        }}
      >
        {/* Label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontWeight: 700,
            fontSize: "10px",
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "rgba(240,237,232,0.3)",
            marginBottom: "clamp(12px, 2vw, 20px)",
          }}
        >
          Siguiente paso
        </motion.p>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontWeight: 900,
            fontSize: "clamp(2.4rem, 8vw, 6rem)",
            letterSpacing: "-0.04em",
            color: "#f0ede8",
            lineHeight: 0.9,
            marginBottom: "clamp(8px, 2vw, 16px)",
          }}
        >
          Comenzar
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontWeight: 300,
            fontSize: "clamp(0.8rem, 1.8vw, 1rem)",
            color: "rgba(240,237,232,0.45)",
            marginBottom: "clamp(24px, 5vw, 48px)",
            maxWidth: "400px",
            lineHeight: 1.5,
          }}
        >
          Selecciona tu camino y construyamos algo extraordinario.
        </motion.p>

        {/* Paths */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {PATHS.map((path, i) => (
            <div key={path.key}>
              <motion.button
                initial={{ opacity: 0, x: -16 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.65, delay: 0.4 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => toggle(path.key)}
                style={{
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                  fontWeight: 900,
                  fontSize: "clamp(1.8rem, 6vw, 4rem)",
                  letterSpacing: "-0.03em",
                  color: btnColor(path.key),
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  textAlign: "left",
                  width: "100%",
                  paddingBottom: "clamp(10px, 2vw, 16px)",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  marginBottom: openPanel === path.key ? "0" : "clamp(10px, 2vw, 16px)",
                  transition: "color 0.25s ease, gap 0.25s ease",
                }}
                onMouseEnter={e => { e.currentTarget.style.color = "#f0ede8"; e.currentTarget.style.gap = "28px"; }}
                onMouseLeave={e => { e.currentTarget.style.color = btnColor(path.key); e.currentTarget.style.gap = "16px"; }}
              >
                {path.label}
                <motion.span
                  animate={{ rotate: openPanel === path.key ? 90 : 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ fontSize: "clamp(1.2rem, 3vw, 2rem)", opacity: 0.5, display: "inline-block" }}
                >
                  →
                </motion.span>
              </motion.button>

              <AnimatePresence>
                {openPanel === path.key && (
                  <motion.div
                    key={path.key + "-panel"}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    style={{ overflow: "clip", marginBottom: "clamp(10px, 2vw, 16px)" }}
                  >
                    {path.key === "artist" ? <CalendlyPanel /> : <ContactPanel />}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}