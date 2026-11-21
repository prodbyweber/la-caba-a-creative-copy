import React, { useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PillCard from "./PillCard";
import CountryPicker from "./CountryPicker";
import DemoCard from "./DemoCard";
import WhatsAppInput from "./WhatsAppInput";

export default function BuilderSection({ section, cards = [] }) {
  const [picks, setPicks] = useState({});
  const [country, setCountry] = useState("");
  const [link, setLink] = useState("");
  const [file, setFile] = useState(null);
  const [directions, setDirections] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", whatsapp: "" });
  const [demo, setDemo] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const stopDemo = () => setDemo(false);
  const list = cards.filter((c) => c.is_visible !== false);

  const toggle = (card, option) => {
    stopDemo();
    setPicks((prev) => {
      const current = prev[card.key] || [];
      const exists = current.includes(option);
      const next = card.multi
        ? exists
          ? current.filter((o) => o !== option)
          : [...current, option]
        : exists
          ? []
          : [option];
      return { ...prev, [card.key]: next };
    });
  };

  const toggleDirection = (option) => {
    setDirections((prev) => (prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.email.trim()) {
      setError("Necesitamos tu nombre y tu email.");
      return;
    }
    if (form.whatsapp.replace(/\D/g, "").length < 8) {
      setError("Necesitamos tu WhatsApp para poder escribirte.");
      return;
    }
    setSending(true);
    try {
      const res = await base44.functions.invoke("submitProjectRequest", {
        name: form.name,
        email: form.email,
        whatsapp: form.whatsapp,
        genres: picks.genero || [],
        needs: picks.necesitas || [],
        mood: (picks.mood || [])[0] || "",
        stage: (picks.etapa || [])[0] || "",
        country,
        demo_link: link,
        demo_file_uri: file?.uri || "",
        demo_file_name: file?.name || "",
        creative_directions: directions,
      });
      if (res.data?.error) throw new Error(res.data.error);
      setSent(true);
    } catch (err) {
      setError("No se pudo enviar. Inténtalo de nuevo.");
    } finally {
      setSending(false);
    }
  };

  const summary = [
    ...(picks.etapa || []),
    ...(picks.genero || []),
    ...(picks.mood || []),
    ...(picks.necesitas || []),
    country,
  ].filter(Boolean);

  return (
    <section className="ccl-builder" id="comenzar">
      <div className="ccl-wrap">
        {section?.eyebrow && <span className="ccl-eyebrow">{section.eyebrow}</span>}
        <h2 className="ccl-display ccl-h2 ccl-builder__title">{section?.title}</h2>
        {section?.subtitle && <p className="ccl-lead">{section.subtitle}</p>}

        {sent ? (
          <div className="ccl-builder__done">
            <span className="ccl-builder__done-icon">
              <Check size={22} />
            </span>
            <h3 className="ccl-display">Recibido.</h3>
            <p>
              Gracias, {form.name.split(" ")[0] || "artista"}. Te escribimos a {form.email} para darle
              color a tu proyecto.
            </p>
            {summary.length > 0 && (
              <div className="ccl-builder__summary">
                {summary.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            )}
            <button
              type="button"
              className="ccl-btn ccl-btn--ghost"
              onClick={() => {
                setSent(false);
                setPicks({});
                setCountry("");
                setLink("");
                setFile(null);
                setDirections([]);
                setForm({ name: "", email: "", whatsapp: "" });
                setDemo(true);
              }}
            >
              Enviar otra solicitud
            </button>
          </div>
        ) : (
          <>
            <div className="ccl-builder__cards">
              {list.map((card, i) => {
                if (card.key === "ubicacion") {
                  return (
                    <CountryPicker
                      key={card.id || card.key}
                      card={card}
                      index={i}
                      value={country}
                      onChange={setCountry}
                      onInteract={stopDemo}
                    />
                  );
                }
                if (card.key === "demo") {
                  return (
                    <DemoCard
                      key={card.id || card.key}
                      card={card}
                      index={i}
                      link={link}
                      onLink={setLink}
                      file={file}
                      onFile={setFile}
                      directions={directions}
                      onToggleDirection={toggleDirection}
                      onInteract={stopDemo}
                    />
                  );
                }
                return (
                  <PillCard
                    key={card.id || card.key}
                    card={card}
                    index={i}
                    selected={picks[card.key] || []}
                    onToggle={(option) => toggle(card, option)}
                    demo={demo}
                  />
                );
              })}
            </div>

            <form className="ccl-form ccl-builder__form" onSubmit={submit}>
              <div className="ccl-field">
                <label htmlFor="ccl-b-name">Nombre</label>
                <input
                  id="ccl-b-name"
                  className="ccl-input"
                  value={form.name}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, name: e.target.value }));
                    stopDemo();
                  }}
                  required
                />
              </div>
              <div className="ccl-field">
                <label htmlFor="ccl-b-email">Email</label>
                <input
                  id="ccl-b-email"
                  type="email"
                  className="ccl-input"
                  value={form.email}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, email: e.target.value }));
                    stopDemo();
                  }}
                  required
                />
              </div>
              <div className="ccl-field">
                <label>WhatsApp</label>
                <WhatsAppInput
                  value={form.whatsapp}
                  onChange={(next) => {
                    setForm((f) => ({ ...f, whatsapp: next }));
                    stopDemo();
                  }}
                />
              </div>

              {error && <p className="ccl-form__error">{error}</p>}

              <button type="submit" className="ccl-btn ccl-btn--primary ccl-btn--block" disabled={sending}>
                {sending ? <Loader2 size={14} className="ccl-spin" /> : null}
                {sending ? "Enviando…" : "Enviar mi proyecto"}
                {!sending && <ArrowRight size={14} />}
              </button>
            </form>
          </>
        )}
      </div>
    </section>
  );
}