import React, { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import PhoneInput from "@/components/start/PhoneInput";

const font = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const inputStyle = {
  fontFamily: font,
  fontSize: "clamp(0.85rem, 1.8vw, 1rem)",
  fontWeight: 400,
  background: "transparent",
  border: "none",
  borderBottom: "1px solid rgba(240,237,232,0.12)",
  outline: "none",
  color: "#f0ede8",
  padding: "12px 0",
  width: "100%",
  letterSpacing: "-0.01em",
  transition: "border-color 0.2s ease",
};

const labelStyle = {
  fontFamily: font,
  fontSize: "9px",
  fontWeight: 700,
  letterSpacing: "0.3em",
  textTransform: "uppercase",
  color: "rgba(240,237,232,0.25)",
  display: "block",
  marginBottom: "8px",
};

export default function LandingContact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [phoneValue, setPhoneValue] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError("Completa los campos requeridos.");
      return;
    }
    setSending(true);
    setError("");
    try {
      await base44.functions.invoke("sendContactEmail", {
        name: form.name,
        email: form.email,
        phone: phoneValue,
        message: form.message,
      });
      await base44.entities.ContactLead.create({
        name: form.name,
        email: form.email,
        message: form.message + (phoneValue ? `\n\nTeléfono: ${phoneValue}` : ""),
        status: "Nuevo",
      });
      setSent(true);
      setForm({ name: "", email: "", phone: "", message: "" });
      setPhoneValue("");
    } catch {
      setError("Error al enviar. Intenta de nuevo.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section
      id="contacto"
      style={{
        background: "#080808",
        borderTop: "1px solid rgba(240,237,232,0.05)",
        padding: "clamp(80px, 14vw, 160px) clamp(24px, 6vw, 56px)",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: "clamp(48px, 8vw, 80px)" }}
        >
          <p style={{
            fontFamily: font, fontWeight: 700, fontSize: "10px",
            letterSpacing: "0.35em", textTransform: "uppercase",
            color: "rgba(240,237,232,0.3)", marginBottom: "clamp(12px, 2vw, 20px)",
          }}>
            Contacto
          </p>
          <h2 style={{
            fontFamily: font, fontWeight: 900,
            fontSize: "clamp(3rem, 9vw, 7rem)",
            letterSpacing: "-0.04em", color: "#f0ede8",
            lineHeight: 0.9, margin: 0,
          }}>
            Hablemos.
          </h2>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "clamp(48px, 8vw, 80px)" }}>
          {/* Two-column layout on wider screens */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "clamp(40px, 8vw, 100px)", alignItems: "start" }}
            className="contact-grid">

            {/* Left — info */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <p style={{
                fontFamily: font, fontWeight: 300,
                fontSize: "clamp(0.85rem, 1.8vw, 1.05rem)",
                color: "rgba(240,237,232,0.4)", lineHeight: 1.7,
                marginBottom: "clamp(32px, 5vw, 48px)",
              }}>
                Cuéntanos sobre tu proyecto. Encontraremos la mejor forma de trabajar juntos.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <a href="mailto:hola@cabanacreative.es" style={{ display: "flex", alignItems: "center", gap: "14px", textDecoration: "none", group: true }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(240,237,232,0.04)", border: "1px solid rgba(240,237,232,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(240,237,232,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                  </div>
                  <span style={{ fontFamily: font, fontSize: "clamp(0.8rem, 1.5vw, 0.9rem)", color: "rgba(240,237,232,0.4)" }}>
                    hola@cabanacreative.es
                  </span>
                </a>

                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(240,237,232,0.04)", border: "1px solid rgba(240,237,232,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(240,237,232,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <span style={{ fontFamily: font, fontSize: "clamp(0.8rem, 1.5vw, 0.9rem)", color: "rgba(240,237,232,0.4)" }}>
                    Madrid, España
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Right — form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              {sent ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ paddingTop: "20px" }}
                >
                  <p style={{
                    fontFamily: font, fontWeight: 900,
                    fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
                    color: "#f0ede8", letterSpacing: "-0.03em", lineHeight: 1.1,
                  }}>
                    Recibido.
                    <br />
                    <span style={{ color: "rgba(240,237,232,0.4)", fontWeight: 300 }}>Te contactamos pronto.</span>
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "clamp(20px, 3vw, 28px)" }}>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(16px, 4vw, 40px)" }}>
                    <div>
                      <label style={labelStyle}>Nombre *</label>
                      <input
                        style={inputStyle}
                        placeholder="Tu nombre"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        onFocus={e => e.target.style.borderBottomColor = "rgba(255,88,51,0.5)"}
                        onBlur={e => e.target.style.borderBottomColor = "rgba(240,237,232,0.12)"}
                        required
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Email *</label>
                      <input
                        type="email"
                        style={inputStyle}
                        placeholder="tu@email.com"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        onFocus={e => e.target.style.borderBottomColor = "rgba(255,88,51,0.5)"}
                        onBlur={e => e.target.style.borderBottomColor = "rgba(240,237,232,0.12)"}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Teléfono</label>
                    <PhoneInput
                      value={phoneValue}
                      onChange={setPhoneValue}
                      inputStyle={{ ...inputStyle }}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Proyecto *</label>
                    <textarea
                      rows={4}
                      style={{ ...inputStyle, resize: "none" }}
                      placeholder="¿Quién eres? ¿Qué quieres crear? ¿Cuándo te gustaría empezar?"
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      onFocus={e => e.target.style.borderBottomColor = "rgba(255,88,51,0.5)"}
                      onBlur={e => e.target.style.borderBottomColor = "rgba(240,237,232,0.12)"}
                      required
                    />
                  </div>

                  {error && (
                    <p style={{ fontFamily: font, fontSize: "12px", color: "#ff5833", margin: 0 }}>{error}</p>
                  )}

                  <div>
                    <button
                      type="submit"
                      disabled={sending}
                      style={{
                        fontFamily: font,
                        fontWeight: 900,
                        fontSize: "clamp(0.8rem, 1.5vw, 0.9rem)",
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        background: "#f0ede8",
                        color: "#0c0c0c",
                        border: "none",
                        padding: "clamp(13px, 2vw, 16px) clamp(28px, 4vw, 44px)",
                        cursor: sending ? "wait" : "pointer",
                        opacity: sending ? 0.5 : 1,
                        transition: "background 0.25s ease, color 0.25s ease",
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
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}