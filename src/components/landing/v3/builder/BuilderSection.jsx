import React, { useState } from "react";
import { ArrowRight, ArrowLeft, Check, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PillCard from "./PillCard";
import CountryPicker from "./CountryPicker";
import DemoCard from "./DemoCard";
import WhatsAppInput from "./WhatsAppInput";

// Qué tarjetas del admin caen en cada paso.
const STEP_CARDS = [["etapa", "necesitas"], ["genero", "ubicacion"], ["mood", "demo"]];

const STEP_COPY = [
  {
    num: "01",
    title: "Elige cómo quieres comenzar",
    bullets: [
      "Puedes empezar con una canción o con un catálogo desde 3 canciones.",
      "Marca lo que necesites: lo ajustamos contigo.",
    ],
  },
  {
    num: "02",
    title: "Cuéntanos tu sonido",
    bullets: [
      "Tu género y tu país nos dicen de dónde viene tu música.",
      "Con eso preparamos la primera sesión.",
    ],
  },
  {
    num: "03",
    title: "Define el mood",
    bullets: [
      "El mood guía la producción antes de la primera nota.",
      "Un enlace o un audio de demo ayuda, pero no es obligatorio.",
    ],
  },
  {
    num: "04",
    title: "Tus datos",
    bullets: [
      "Te escribimos por WhatsApp, sin llamadas ni formularios eternos.",
      "Revisamos tu brief y te decimos cómo seguir.",
    ],
  },
];

export default function BuilderSection({ section, cards = [] }) {
  const [step, setStep] = useState(0);
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
  const copy = STEP_COPY[step];

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

  const summary = [
    ...(picks.etapa || []),
    ...(picks.genero || []),
    ...(picks.mood || []),
    country,
  ].filter(Boolean);

  const reset = () => {
    setSent(false);
    setStep(0);
    setPicks({});
    setCountry("");
    setLink("");
    setFile(null);
    setDirections([]);
    setForm({ name: "", email: "", whatsapp: "" });
    setDemo(true);
    setError("");
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
        mood: (picks.mood || []).join(" · "),
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

  const renderCard = (card) => {
    if (card.key === "ubicacion") {
      return (
        <CountryPicker
          key={card.id || card.key}
          card={card}
          index={list.indexOf(card)}
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
          index={list.indexOf(card)}
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
        index={list.indexOf(card)}
        selected={picks[card.key] || []}
        onToggle={(option) => toggle(card, option)}
        demo={demo}
      />
    );
  };

  const stepCards =
    step === 3 ? [] : STEP_CARDS[step].map((key) => list.find((c) => c.key === key)).filter(Boolean);

  return (
    <section className="ccl-brief" id="comenzar">
      <div className="ccl-wrap">
        {section?.eyebrow && <span className="ccl-eyebrow">{section.eyebrow}</span>}
        <h2 className="ccl-display ccl-h2 ccl-brief__title">{section?.title || "Tu brief"}</h2>
        {section?.subtitle && <p className="ccl-lead">{section.subtitle}</p>}

        {sent ? (
          <div className="ccl-brief__done">
            <span className="ccl-brief__done-icon">
              <Check size={22} />
            </span>
            <h3 className="ccl-display">Recibido.</h3>
            <p>Te escribiremos por WhatsApp para definir los siguientes pasos.</p>
            {summary.length > 0 && (
              <div className="ccl-brief__chips">
                {summary.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            )}
            <button type="button" className="ccl-btn ccl-btn--ghost" onClick={reset}>
              Enviar otro brief
            </button>
          </div>
        ) : (
          <>
            <div className="ccl-brief__bar">
              <span className="ccl-brief__count">Paso {step + 1} de 4</span>
              <div className="ccl-brief__dots" aria-hidden="true">
                {STEP_COPY.map((_, i) => (
                  <i key={i} className={i <= step ? "is-on" : ""} />
                ))}
              </div>
            </div>

            <div className="ccl-brief__grid">
              <div className="ccl-brief__panel">
                {step === 3 ? (
                  <form id="brief-form" className="ccl-form ccl-brief__form" onSubmit={submit}>
                    <div className="ccl-field">
                      <label htmlFor="ccl-b-name">Nombre</label>
                      <input
                        id="ccl-b-name"
                        className="ccl-input"
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
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
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="ccl-field">
                      <label>WhatsApp</label>
                      <WhatsAppInput
                        value={form.whatsapp}
                        onChange={(next) => setForm((f) => ({ ...f, whatsapp: next }))}
                      />
                    </div>
                  </form>
                ) : (
                  stepCards.map(renderCard)
                )}
              </div>

              <aside className="ccl-brief__copy">
                <span className="ccl-brief__num">{copy.num}</span>
                <h3 className="ccl-display ccl-brief__step-title">{copy.title}</h3>
                <ul className="ccl-brief__bullets">
                  {copy.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </aside>
            </div>

            {summary.length > 0 && (
              <p className="ccl-brief__sum">
                <b>Tu brief:</b> {summary.join(" · ")}
              </p>
            )}

            {error && <p className="ccl-form__error">{error}</p>}

            <div className="ccl-brief__nav">
              {step > 0 && (
                <button
                  type="button"
                  className="ccl-btn ccl-btn--ghost"
                  onClick={() => {
                    setError("");
                    setStep((s) => s - 1);
                  }}
                >
                  <ArrowLeft size={14} /> Atrás
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  className="ccl-btn ccl-btn--primary"
                  onClick={() => {
                    stopDemo();
                    setStep((s) => s + 1);
                  }}
                >
                  Siguiente <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="submit"
                  form="brief-form"
                  className="ccl-btn ccl-btn--primary"
                  disabled={sending}
                >
                  {sending ? <Loader2 size={14} className="ccl-spin" /> : null}
                  {sending ? "Enviando…" : "Enviar mi proyecto"}
                  {!sending && <ArrowRight size={14} />}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}