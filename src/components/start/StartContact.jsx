import React, { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";

const inputStyle = {
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  fontSize: "clamp(0.9rem, 2vw, 1rem)",
  fontWeight: 400,
  background: "#f9f8f7",
  border: "1px solid rgba(12,12,12,0.08)",
  outline: "none",
  color: "#0c0c0c",
  padding: "12px 16px",
  width: "100%",
  borderRadius: "10px",
  letterSpacing: "-0.01em",
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

export default function StartContact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError("Completa todos los campos.");
      return;
    }
    setSending(true);
    setError("");
    try {
      await base44.entities.ContactLead.create({
        name: form.name,
        email: form.email,
        message: form.message,
        status: "Nuevo",
      });
      setSending(false);
      setSent(true);
    } catch {
      setSending(false);
      setError("Error al enviar. Intenta de nuevo.");
    }
  };

  return (
    <section
      id="contact"
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100dvh",
        background: "linear-gradient(135deg, #fafaf9 0%, #f5f3f0 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(40px, 8vw, 80px) clamp(24px, 6vw, 56px)",
        overflow: "hidden",
      }}
    >
      {/* Decorative elements */}
      <div
        style={{
          position: "absolute",
          top: "-40%",
          right: "-20%",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,88,51,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-30%",
          left: "-10%",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,88,51,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ maxWidth: "720px", width: "100%", position: "relative", zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <p
            style={{
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontWeight: 700,
              fontSize: "11px",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#ff5833",
              marginBottom: "clamp(16px, 3vw, 24px)",
            }}
          >
            Contacto
          </p>

          <h2
            style={{
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontWeight: 900,
              fontSize: "clamp(2rem, 7vw, 4.5rem)",
              letterSpacing: "-0.04em",
              color: "#0c0c0c",
              lineHeight: 1.1,
              marginBottom: "clamp(12px, 2vw, 20px)",
            }}
          >
            Hablemos
          </h2>

          <p
            style={{
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontWeight: 300,
              fontSize: "clamp(0.9rem, 1.8vw, 1.1rem)",
              color: "rgba(12,12,12,0.6)",
              marginBottom: "clamp(32px, 5vw, 48px)",
              maxWidth: "560px",
              lineHeight: 1.65,
            }}
          >
            Cuéntanos tu proyecto, idea o pregunta. Nos encantaría conectar contigo y explorar las posibilidades juntos.
          </p>

          {sent ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: "clamp(24px, 4vw, 32px)",
                background: "#ff5833",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(1rem, 2vw, 1.3rem)",
                  color: "white",
                  letterSpacing: "-0.02em",
                  margin: 0,
                }}
              >
                ¡Mensaje recibido! Te contactamos pronto.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "clamp(16px, 3vw, 24px)" }}>
              <div style={{ display: "flex", gap: "clamp(12px, 3vw, 20px)", flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 160px" }}>
                  <label
                    style={{
                      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                      fontSize: "10px",
                      fontWeight: 700,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: "rgba(12,12,12,0.5)",
                      display: "block",
                      marginBottom: "8px",
                    }}
                  >
                    Nombre
                  </label>
                  <input
                    style={inputStyle}
                    placeholder="Tu nombre"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#ff5833";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(255,88,51,0.12)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "rgba(12,12,12,0.08)";
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                    }}
                  />
                </div>
                <div style={{ flex: "1 1 160px" }}>
                  <label
                    style={{
                      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                      fontSize: "10px",
                      fontWeight: 700,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: "rgba(12,12,12,0.5)",
                      display: "block",
                      marginBottom: "8px",
                    }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    style={inputStyle}
                    placeholder="tu@email.com"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#ff5833";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(255,88,51,0.12)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "rgba(12,12,12,0.08)";
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "rgba(12,12,12,0.5)",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  Mensaje
                </label>
                <textarea
                  rows={5}
                  style={{
                    ...inputStyle,
                    resize: "none",
                    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                  }}
                  placeholder="Cuéntanos tu proyecto..."
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#ff5833";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(255,88,51,0.12)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(12,12,12,0.08)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                  }}
                />
              </div>

              {error && (
                <p
                  style={{
                    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                    fontSize: "12px",
                    color: "#ff5833",
                    margin: 0,
                  }}
                >
                  {error}
                </p>
              )}

              <div>
                <button
                  type="submit"
                  disabled={sending}
                  style={{
                    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                    fontWeight: 900,
                    fontSize: "clamp(0.85rem, 1.8vw, 1rem)",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    background: "#ff5833",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "clamp(12px, 2vw, 16px) clamp(24px, 4vw, 40px)",
                    cursor: sending ? "wait" : "pointer",
                    opacity: sending ? 0.6 : 1,
                    transition: "background 0.2s ease, transform 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!sending) {
                      e.currentTarget.style.background = "#e04a20";
                      e.currentTarget.style.transform = "scale(1.02)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#ff5833";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  {sending ? "Enviando..." : "Enviar →"}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}