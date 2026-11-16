import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { submitAccessRequest } from "@/lib/landingForms";

export default function AccessModal({ open, onClose }) {
  const [form, setForm] = useState({ name: "", email: "", artist_name: "", music_link: "", message: "" });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

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
      await submitAccessRequest({ ...form, type: "access" });
      setDone(true);
    } catch (err) {
      setError("No se pudo enviar. Inténtalo de nuevo.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="cc-modal" role="dialog" aria-modal="true" aria-label="Solicitar acceso" onClick={onClose}>
      <div className="cc-modal__panel" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="cc-modal__close" onClick={onClose} aria-label="Cerrar">
          <X size={16} />
        </button>

        {done ? (
          <div>
            <h2 className="cc-modal__title">Gracias.</h2>
            <p className="cc-form__ok">
              Revisaremos tu solicitud y te escribiremos pronto.
            </p>
            <button type="button" className="cc-btn cc-btn--ghost" onClick={onClose} style={{ marginTop: 18 }}>
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <h2 className="cc-modal__title">Solicitar acceso</h2>
            <p className="cc-modal__sub">
              Cuéntanos quién eres y qué estás produciendo. Revisamos cada solicitud a mano.
            </p>

            <form className="cc-form" onSubmit={submit}>
              <div className="cc-field">
                <label htmlFor="acc-name">Nombre</label>
                <input id="acc-name" className="cc-input" value={form.name} onChange={set("name")} autoFocus required />
              </div>
              <div className="cc-field">
                <label htmlFor="acc-email">Email</label>
                <input
                  id="acc-email"
                  type="email"
                  className="cc-input"
                  value={form.email}
                  onChange={set("email")}
                  required
                />
              </div>
              <div className="cc-field">
                <label htmlFor="acc-artist">Nombre artístico</label>
                <input id="acc-artist" className="cc-input" value={form.artist_name} onChange={set("artist_name")} />
              </div>
              <div className="cc-field">
                <label htmlFor="acc-link">Enlace a tu música (opcional)</label>
                <input
                  id="acc-link"
                  className="cc-input"
                  placeholder="Spotify, YouTube, Drive…"
                  value={form.music_link}
                  onChange={set("music_link")}
                />
              </div>
              <div className="cc-field">
                <label htmlFor="acc-msg">Cuéntanos tu proyecto</label>
                <textarea id="acc-msg" className="cc-textarea" value={form.message} onChange={set("message")} />
              </div>

              {error && <p className="cc-form__error">{error}</p>}

              <button type="submit" className="cc-btn cc-btn--primary cc-btn--block" disabled={sending}>
                {sending ? "Enviando…" : "Enviar solicitud"}
              </button>
              <p className="cc-form__note">
                El acceso es por invitación. Usamos tus datos solo para responderte.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}