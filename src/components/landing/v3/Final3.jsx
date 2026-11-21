import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { submitAccessRequest } from "@/lib/landingForms";
import { SESSION_CTA } from "./constants";
import Footer3 from "./Footer3";

export default function Final3({ settings }) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.email.trim()) {
      setError("Necesitamos tu nombre y tu email.");
      return;
    }
    setSending(true);
    try {
      await submitAccessRequest({ ...form, type: "message" });
      setDone(true);
    } catch (err) {
      setError("No se pudo enviar. Inténtalo de nuevo.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="ccl-snap ccl-final" id="final">
      <div className="ccl-final__screen">
        <div className="ccl-wrap ccl-final__inner">
          <span className="ccl-eyebrow">Empezar</span>
          <h2 className="ccl-display ccl-h1 ccl-final__title">Tu catálogo empieza en la cabaña.</h2>

          <div className="ccl-final__ctas">
            <Link to={SESSION_CTA} className="ccl-btn ccl-btn--primary">
              Agendar sesión de descubrimiento <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      <div className="ccl-final__tail">
        <div className="ccl-wrap">
          {done ? (
            <p className="ccl-form__ok">
              Gracias. Hemos recibido tu mensaje y te escribiremos pronto a {form.email}.
            </p>
          ) : (
            <form className="ccl-form" onSubmit={submit}>
              <div className="ccl-field">
                <label htmlFor="ccl-name">Nombre</label>
                <input id="ccl-name" className="ccl-input" value={form.name} onChange={set("name")} required />
              </div>
              <div className="ccl-field">
                <label htmlFor="ccl-email">Email</label>
                <input
                  id="ccl-email"
                  type="email"
                  className="ccl-input"
                  value={form.email}
                  onChange={set("email")}
                  required
                />
              </div>
              <div className="ccl-field">
                <label htmlFor="ccl-msg">Cuéntanos tu proyecto</label>
                <textarea
                  id="ccl-msg"
                  className="ccl-textarea"
                  value={form.message}
                  onChange={set("message")}
                  placeholder="Género, referencias, en qué punto estás…"
                />
              </div>
              {error && <p className="ccl-form__error">{error}</p>}
              <button type="submit" className="ccl-btn ccl-btn--ghost ccl-btn--block" disabled={sending}>
                {sending ? "Enviando…" : "Enviar mensaje"}
              </button>
            </form>
          )}
        </div>

        <Footer3 settings={settings} />
      </div>
    </section>
  );
}