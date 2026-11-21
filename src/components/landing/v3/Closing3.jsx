import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { submitAccessRequest } from "@/lib/landingForms";
import { PROJECT_CTA } from "./constants";

export default function Closing3({ section, settings }) {
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

  const booking = settings?.booking_url || "/reservas";

  return (
    <section className="ccl-close" id="contacto">
      <div className="ccl-wrap">
        <div className="ccl-close__grid">
          <div data-reveal>
            <span className="ccl-eyebrow">Siguiente paso</span>
            <h2 className="ccl-close__title">{section?.title || "Tu próximo proyecto empieza aquí."}</h2>
            <p className="ccl-lead">
              {section?.subtitle ||
                "Cuéntanos qué estás desarrollando. Queremos conocer tu visión y explorar cómo podemos ayudarte."}
            </p>

            <div className="ccl-close__ctas">
              <Link to={PROJECT_CTA} className="ccl-btn ccl-btn--primary">
                Enviar mi proyecto <ArrowRight size={14} />
              </Link>
              <Link to={booking} className="ccl-btn ccl-btn--ghost">
                Agendar una sesión
              </Link>
            </div>
          </div>

          <div data-reveal>
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
        </div>
      </div>
    </section>
  );
}