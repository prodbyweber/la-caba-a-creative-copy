import React, { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const DEFAULT = {
  cta_btn1_link: "https://calendly.com",
};

export default function StartCTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const [showCalendly, setShowCalendly] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const { data: cfg } = useQuery({
    queryKey: ["landingConfig"],
    queryFn: async () => { const c = await base44.entities.LandingConfig.list(); return c[0] || null; },
    staleTime: 30000,
  });
  const c = { ...DEFAULT, ...(cfg?.start_page_config || {}) };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { setError("Completa todos los campos."); return; }
    setSending(true);
    setError("");
    await base44.entities.ContactLead.create({
      name: form.name,
      email: form.email,
      message: form.message,
      status: "Nuevo",
    });
    setSending(false);
    setSent(true);
  };

  const inputStyle = {
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    fontSize: "clamp(0.85rem, 1.8vw, 1rem)",
    fontWeight: 400,
    background: "transparent",
    border: "none",
    borderBottom: "1px solid rgba(12,12,12,0.2)",
    outline: "none",
    color: "#0c0c0c",
    padding: "12px 0",
    width: "100%",
    letterSpacing: "-0.01em",
  };

  return (
    <section
      id="cta"
      ref={ref}
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        background: "#f0ede8",
        overflow: "hidden",
        padding: "clamp(80px, 15vw, 160px) clamp(24px, 8vw, 100px)",
      }}
    >
      <div style={{ maxWidth: "780px", position: "relative", zIndex: 1 }}>

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
            color: "rgba(12,12,12,0.35)",
            marginBottom: "clamp(20px, 4vw, 36px)",
          }}
        >
          Siguiente paso
        </motion.p>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 36 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontWeight: 900,
            fontSize: "clamp(2.8rem, 8vw, 7rem)",
            letterSpacing: "-0.045em",
            lineHeight: 0.88,
            color: "#0c0c0c",
            margin: "0 0 clamp(12px, 3vw, 24px)",
          }}
        >
          Let's make
          <br />
          <span style={{ color: "#ff5833" }}>something</span>
          <br />
          real.
        </motion.h2>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{
            height: "1px",
            background: "rgba(12,12,12,0.15)",
            transformOrigin: "left",
            marginBottom: "clamp(28px, 5vw, 52px)",
            marginTop: "clamp(20px, 4vw, 40px)",
          }}
        />

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.45 }}
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontWeight: 300,
            fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
            color: "rgba(12,12,12,0.5)",
            lineHeight: 1.6,
            marginBottom: "clamp(36px, 7vw, 72px)",
            maxWidth: "420px",
          }}
        >
          Una videollamada. Sin compromiso.<br />Cuéntanos tu proyecto.
        </motion.p>

        {/* CTA actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.6 }}
          style={{ display: "flex", flexDirection: "column", gap: "0" }}
        >
          {/* Agendar reunión — toggle Calendly */}
          <button
            onClick={() => { setShowCalendly(v => !v); setShowForm(false); }}
            style={{
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontWeight: 900,
              fontSize: "clamp(1.5rem, 4.5vw, 3.2rem)",
              letterSpacing: "-0.035em",
              color: showCalendly ? "#ff5833" : "#0c0c0c",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
              gap: "16px",
              textAlign: "left",
              paddingBottom: "clamp(10px, 2vw, 18px)",
              borderBottom: "1px solid rgba(12,12,12,0.12)",
              marginBottom: "clamp(10px, 2vw, 18px)",
              transition: "gap 0.25s ease, color 0.2s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.gap = "28px"; e.currentTarget.style.color = "#ff5833"; }}
            onMouseLeave={e => { e.currentTarget.style.gap = "16px"; e.currentTarget.style.color = showCalendly ? "#ff5833" : "#0c0c0c"; }}
          >
            Agendar reunión
            <motion.span
              animate={{ rotate: showCalendly ? 90 : 0 }}
              transition={{ duration: 0.3 }}
              style={{ fontSize: "0.7em", opacity: 0.6, display: "inline-block" }}
            >
              →
            </motion.span>
          </button>

          {/* Calendly inline widget */}
          <AnimatePresence>
            {showCalendly && (
              <motion.div
                key="calendly-widget"
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 700, marginTop: "clamp(20px, 3vw, 32px)" }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                style={{ overflow: "hidden", marginBottom: "clamp(10px, 2vw, 18px)", borderRadius: "8px" }}
              >
                <iframe
                  src="https://calendly.com/hola-cabanacreative/creadores?primary_color=ff5200&embed_domain=cabanacreative.com&embed_type=Inline"
                  width="100%"
                  height="700"
                  frameBorder="0"
                  title="Agendar reunión"
                  style={{ border: "none", borderRadius: "8px", display: "block" }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Contactar — toggle form */}
          <button
            onClick={() => { setShowForm(v => !v); setShowCalendly(false); setSent(false); setError(""); }}
            style={{
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontWeight: 900,
              fontSize: "clamp(1.5rem, 4.5vw, 3.2rem)",
              letterSpacing: "-0.035em",
              color: showForm ? "#0c0c0c" : "rgba(12,12,12,0.3)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
              gap: "16px",
              textAlign: "left",
              transition: "gap 0.25s ease, color 0.2s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.gap = "28px"; e.currentTarget.style.color = "#0c0c0c"; }}
            onMouseLeave={e => { e.currentTarget.style.gap = "16px"; e.currentTarget.style.color = showForm ? "#0c0c0c" : "rgba(12,12,12,0.3)"; }}
          >
            Contactar
            <motion.span
              animate={{ rotate: showForm ? 90 : 0 }}
              transition={{ duration: 0.3 }}
              style={{ fontSize: "0.7em", opacity: 0.5, display: "inline-block" }}
            >
              →
            </motion.span>
          </button>

          {/* Contact form — expanded */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                key="contact-form"
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: "clamp(28px, 5vw, 48px)" }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                style={{ overflow: "hidden" }}
              >
                {sent ? (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                      fontWeight: 700,
                      fontSize: "clamp(1rem, 2.5vw, 1.4rem)",
                      color: "#0c0c0c",
                      letterSpacing: "-0.02em",
                      paddingBottom: "32px",
                    }}
                  >
                    Recibido. Te contactamos pronto.
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "clamp(16px, 3vw, 28px)", paddingBottom: "32px" }}>
                    <div style={{ display: "flex", gap: "clamp(16px, 4vw, 40px)", flexWrap: "wrap" }}>
                      <div style={{ flex: "1 1 200px" }}>
                        <label style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: "9px", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(12,12,12,0.35)", display: "block", marginBottom: "8px" }}>
                          Nombre
                        </label>
                        <input
                          style={inputStyle}
                          placeholder="Tu nombre"
                          value={form.name}
                          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        />
                      </div>
                      <div style={{ flex: "1 1 200px" }}>
                        <label style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: "9px", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(12,12,12,0.35)", display: "block", marginBottom: "8px" }}>
                          Email
                        </label>
                        <input
                          type="email"
                          style={inputStyle}
                          placeholder="tu@email.com"
                          value={form.email}
                          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: "9px", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(12,12,12,0.35)", display: "block", marginBottom: "8px" }}>
                        Cuéntanos tu proyecto
                      </label>
                      <textarea
                        rows={4}
                        style={{ ...inputStyle, resize: "none", borderBottom: "1px solid rgba(12,12,12,0.2)" }}
                        placeholder="¿Quién eres? ¿Qué quieres crear? ¿Cuándo te gustaría empezar?"
                        value={form.message}
                        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      />
                    </div>

                    {error && (
                      <p style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: "12px", color: "#ff5833", margin: 0 }}>{error}</p>
                    )}

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
                          background: "#0c0c0c",
                          color: "#f0ede8",
                          border: "none",
                          padding: "clamp(12px, 2vw, 16px) clamp(24px, 4vw, 40px)",
                          cursor: sending ? "wait" : "pointer",
                          opacity: sending ? 0.5 : 1,
                          transition: "background 0.2s ease, transform 0.15s ease",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#ff5833"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "#0c0c0c"; }}
                      >
                        {sending ? "Enviando..." : "Enviar →"}
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}