import React, { useState } from "react";
import { Mail, MapPin, ArrowUpRight } from "lucide-react";
import CtaButton from "./CtaButton";
import { submitAccessRequest } from "@/lib/landingForms";

export default function ClosingSection({ section, settings, onAccess }) {
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

  const bookingIsExternal = /^https?:\/\//.test(settings?.booking_url || "");

  return (
    <section className="cc-sec cc-closing" id="entrar">
      <div className="cc-closing__glow" />
      <div className="cc-wrap">
        <div className="cc-closing__grid">
          <div className="cc-closing__main" data-reveal>
            <h2 className="cc-h2" style={{ fontSize: "clamp(2rem, 5vw, 3.6rem)" }}>
              {section?.title}
            </h2>
            {section?.subtitle && <p className="cc-lead" style={{ margin: "14px auto 0" }}>{section.subtitle}</p>}

            <div className="cc-closing__ctas">
              <CtaButton
                label={section?.cta_label || settings?.login_label || "Acceder"}
                href={section?.cta_link || settings?.login_url || "/login"}
                variant="primary"
                onAccess={onAccess}
              />
              <CtaButton
                label={section?.cta2_label || settings?.request_label || "Solicitar acceso"}
                href={section?.cta2_link || "modal:access"}
                variant="ghost"
                onAccess={onAccess}
              />
            </div>

            {settings?.booking_url && (
              <a
                className="cc-closing__secondary"
                href={settings.booking_url}
                target={bookingIsExternal ? "_blank" : undefined}
                rel={bookingIsExternal ? "noopener noreferrer" : undefined}
              >
                {section?.body || settings.booking_label} <ArrowUpRight size={12} style={{ display: "inline" }} />
              </a>
            )}

            <div className="cc-contact">
              {settings?.contact_email && (
                <a href={`mailto:${settings.contact_email}`}>
                  <Mail size={12} style={{ display: "inline", marginRight: 6 }} />
                  {settings.contact_email}
                </a>
              )}
              {settings?.city && (
                <span>
                  <MapPin size={12} style={{ display: "inline", marginRight: 6 }} />
                  {settings.city}
                </span>
              )}
            </div>
          </div>

          <div data-reveal>
            {settings?.access_card_image_url && (
              <div className="cc-closing__card" style={{ marginBottom: 12 }}>
                <img src={settings.access_card_image_url} alt="Artistas de Cabaña Creative" loading="lazy" />
                <div className="cc-closing__card-body">
                  <p className="cc-card__sub" style={{ marginBottom: 12 }}>
                    Tu catálogo, tus demos y tu próximo lanzamiento, juntos.
                  </p>
                  <CtaButton
                    label={settings?.login_label || "Acceder"}
                    href={settings?.login_url || "/login"}
                    variant="primary"
                    className="cc-btn--block"
                  />
                </div>
              </div>
            )}

            <div className="cc-closing__card">
              <div className="cc-closing__card-body">
                {done ? (
                  <p className="cc-form__ok">Gracias. Te escribiremos pronto.</p>
                ) : (
                  <form className="cc-form" onSubmit={submit}>
                    <div className="cc-field">
                      <label htmlFor="close-name">Nombre</label>
                      <input id="close-name" className="cc-input" value={form.name} onChange={set("name")} required />
                    </div>
                    <div className="cc-field">
                      <label htmlFor="close-email">Email</label>
                      <input
                        id="close-email"
                        type="email"
                        className="cc-input"
                        value={form.email}
                        onChange={set("email")}
                        required
                      />
                    </div>
                    <div className="cc-field">
                      <label htmlFor="close-msg">Cuéntanos tu proyecto</label>
                      <textarea id="close-msg" className="cc-textarea" value={form.message} onChange={set("message")} />
                    </div>
                    {error && <p className="cc-form__error">{error}</p>}
                    <button type="submit" className="cc-btn cc-btn--ghost cc-btn--block" disabled={sending}>
                      {sending ? "Enviando…" : "Enviar mensaje"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}