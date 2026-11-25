import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, Paperclip } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { FA_GENRES } from "@/lib/fullAccessDefaults";

const STAGE_OPTIONS = ["Solo ideas", "Tengo demos", "Preparando un lanzamiento", "Ya he publicado"];
const YES_NO = ["Sí", "No", "Algunas"];

const EMPTY = {
  artist_name: "",
  contact_name: "",
  email: "",
  instagram: "",
  spotify: "",
  youtube: "",
  genres: "",
  references: "",
  identity: "",
  stage: "",
  released: "",
  has_demos: "",
  preparing_release: "",
  missing: "",
  wants: "",
  goals_90: "",
  catalog_vision: "",
  recognition: "",
  expectations: "",
  links: "",
  context: "",
};

export default function AdmissionForm({ lead, settings, onSubmitted }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    ...EMPTY,
    contact_name: lead?.name || "",
    email: lead?.email || "",
  });
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const set = (key, value) => setData((prev) => ({ ...prev, [key]: value }));

  const toggleGenre = (genre) => {
    const list = data.genres ? data.genres.split(", ") : [];
    const next = list.includes(genre) ? list.filter((g) => g !== genre) : [...list, genre];
    set("genres", next.join(", "));
  };
  const genres = data.genres ? data.genres.split(", ") : [];

  const uploadFiles = async (event) => {
    const picked = Array.from(event.target.files || []);
    if (!picked.length) return;
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of picked) {
        const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
        uploaded.push({ uri: file_uri, name: file.name });
      }
      setFiles((prev) => [...prev, ...uploaded]);
    } finally {
      setUploading(false);
    }
  };

  const next = () => {
    if (step === 0) {
      if (!data.artist_name.trim()) return setError("Escribe tu nombre artístico.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()))
        return setError("Revisa tu correo electrónico.");
    }
    setError("");
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await base44.functions.invoke("submitFullAccessApplication", {
        ...data,
        contact_name: data.contact_name || lead?.name || "",
        email: data.email || lead?.email,
        file_uris: files.map((f) => f.uri),
        file_names: files.map((f) => f.name),
        vsl_progress: 1,
        source: typeof document !== "undefined" ? document.referrer || "direct" : "direct",
      });
      if (res.data?.error) throw new Error(res.data.error);
      onSubmitted(res.data.application);
    } catch (err) {
      setError(err?.message || "No hemos podido enviar tu solicitud. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    {
      label: "Your identity",
      title: "¿Quién está detrás del proyecto?",
      hint: "Solo lo necesario para saber cómo llamarte.",
      body: (
        <div className="fa-form__grid fa-form__grid--two">
          <label className="fa-field">
            <span className="fa-label">Nombre artístico</span>
            <input
              className="fa-input"
              value={data.artist_name}
              onChange={(e) => set("artist_name", e.target.value)}
              placeholder="Cómo firmas tu música"
            />
          </label>
          <label className="fa-field">
            <span className="fa-label">Nombre de contacto</span>
            <input
              className="fa-input"
              value={data.contact_name}
              onChange={(e) => set("contact_name", e.target.value)}
              placeholder="Tu nombre"
            />
          </label>
          <label className="fa-field">
            <span className="fa-label">Correo</span>
            <input
              className="fa-input"
              type="email"
              value={data.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="tu@email.com"
            />
          </label>
          <label className="fa-field">
            <span className="fa-label">Instagram</span>
            <input
              className="fa-input"
              value={data.instagram}
              onChange={(e) => set("instagram", e.target.value)}
              placeholder="@usuario"
            />
          </label>
          <label className="fa-field">
            <span className="fa-label">Spotify</span>
            <input
              className="fa-input"
              value={data.spotify}
              onChange={(e) => set("spotify", e.target.value)}
              placeholder="Enlace de artista"
            />
          </label>
          <label className="fa-field">
            <span className="fa-label">YouTube o SoundCloud</span>
            <input
              className="fa-input"
              value={data.youtube}
              onChange={(e) => set("youtube", e.target.value)}
              placeholder="Enlace"
            />
          </label>
        </div>
      ),
    },
    {
      label: "Your sound",
      title: "¿Cómo suena tu proyecto?",
      hint: "Géneros, referencias y lo que te hace distinto.",
      body: (
        <div className="fa-form__grid">
          <div>
            <span className="fa-label">Géneros</span>
            <div className="fa-chips">
              {FA_GENRES.map((genre) => (
                <button
                  type="button"
                  key={genre}
                  className={`fa-chip${genres.includes(genre) ? " is-on" : ""}`}
                  onClick={() => toggleGenre(genre)}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
          <label className="fa-field">
            <span className="fa-label">Referencias y artistas que te inspiran</span>
            <textarea
              className="fa-textarea"
              value={data.references}
              onChange={(e) => set("references", e.target.value)}
              placeholder="Tres o cuatro nombres, sellos, discos..."
            />
          </label>
          <label className="fa-field">
            <span className="fa-label">Tu identidad musical</span>
            <textarea
              className="fa-textarea"
              value={data.identity}
              onChange={(e) => set("identity", e.target.value)}
              placeholder="Qué sientes que diferencia tu proyecto"
            />
          </label>
        </div>
      ),
    },
    {
      label: "Your project",
      title: "¿En qué punto estás?",
      hint: "Nos ayuda a saber desde dónde partimos.",
      body: (
        <div className="fa-form__grid">
          <div>
            <span className="fa-label">Punto actual</span>
            <div className="fa-chips">
              {STAGE_OPTIONS.map((option) => (
                <button
                  type="button"
                  key={option}
                  className={`fa-chip${data.stage === option ? " is-on" : ""}`}
                  onClick={() => set("stage", option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="fa-label">¿Tienes demos?</span>
            <div className="fa-chips">
              {YES_NO.map((option) => (
                <button
                  type="button"
                  key={option}
                  className={`fa-chip${data.has_demos === option ? " is-on" : ""}`}
                  onClick={() => set("has_demos", option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <label className="fa-field">
            <span className="fa-label">Canciones publicadas</span>
            <input
              className="fa-input"
              value={data.released}
              onChange={(e) => set("released", e.target.value)}
              placeholder="Títulos o enlaces, si los hay"
            />
          </label>
          <label className="fa-field">
            <span className="fa-label">¿Preparando un lanzamiento?</span>
            <input
              className="fa-input"
              value={data.preparing_release}
              onChange={(e) => set("preparing_release", e.target.value)}
              placeholder="Fecha o estado"
            />
          </label>
          <label className="fa-field">
            <span className="fa-label">Qué sientes que le falta al proyecto</span>
            <textarea
              className="fa-textarea"
              value={data.missing}
              onChange={(e) => set("missing", e.target.value)}
            />
          </label>
          <label className="fa-field">
            <span className="fa-label">Qué quieres desarrollar</span>
            <textarea
              className="fa-textarea"
              value={data.wants}
              onChange={(e) => set("wants", e.target.value)}
            />
          </label>
        </div>
      ),
    },
    {
      label: "Your vision",
      title: "¿Hacia dónde quieres ir?",
      hint: "Los próximos noventa días, el catálogo y lo que quieres que se reconozca.",
      body: (
        <div className="fa-form__grid">
          <label className="fa-field">
            <span className="fa-label">Objetivos a 90 días</span>
            <textarea
              className="fa-textarea"
              value={data.goals_90}
              onChange={(e) => set("goals_90", e.target.value)}
            />
          </label>
          <label className="fa-field">
            <span className="fa-label">Qué tipo de catálogo quieres construir</span>
            <textarea
              className="fa-textarea"
              value={data.catalog_vision}
              onChange={(e) => set("catalog_vision", e.target.value)}
            />
          </label>
          <label className="fa-field">
            <span className="fa-label">Qué quieres que la gente reconozca de tu música</span>
            <textarea
              className="fa-textarea"
              value={data.recognition}
              onChange={(e) => set("recognition", e.target.value)}
            />
          </label>
          <label className="fa-field">
            <span className="fa-label">Qué esperas de una colaboración de desarrollo artístico</span>
            <textarea
              className="fa-textarea"
              value={data.expectations}
              onChange={(e) => set("expectations", e.target.value)}
            />
          </label>
        </div>
      ),
    },
    {
      label: "Your music",
      title: "Deja que lo escuchemos.",
      hint: "Enlaces primero. Los archivos son opcionales.",
      body: (
        <div className="fa-form__grid">
          <label className="fa-field">
            <span className="fa-label">Enlaces a canciones y demos</span>
            <textarea
              className="fa-textarea"
              value={data.links}
              onChange={(e) => set("links", e.target.value)}
              placeholder="Drive, Dropbox, SoundCloud, YouTube..."
            />
          </label>
          <label className="fa-field">
            <span className="fa-label">Contexto adicional</span>
            <textarea
              className="fa-textarea"
              value={data.context}
              onChange={(e) => set("context", e.target.value)}
            />
          </label>
          <div>
            <span className="fa-label">Archivos (opcional)</span>
            <label className="fa-upload">
              <Paperclip size={15} />
              {uploading ? "Subiendo..." : "Adjuntar demos o referencias"}
              <input type="file" multiple hidden onChange={uploadFiles} />
            </label>
            {files.map((file) => (
              <div className="fa-file" key={file.uri}>
                <span>{file.name}</span>
                <button
                  type="button"
                  className="fa-nav__link"
                  onClick={() => setFiles((prev) => prev.filter((f) => f.uri !== file.uri))}
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  const current = steps[step];

  return (
    <div className="fa-form">
      <div className="fa-form__top">
        <span className="fa-micro">{settings.form_intro}</span>
        <span className="fa-form__steps">
          {current.label} · {step + 1}/5
        </span>
      </div>
      <div className="fa-form__track">
        <div className="fa-form__fill" style={{ width: `${((step + 1) / 5) * 100}%` }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -18 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          <h3 className="fa-form__title">{current.title}</h3>
          <p className="fa-form__hint">{current.hint}</p>
          <div style={{ marginTop: 26 }}>{current.body}</div>
        </motion.div>
      </AnimatePresence>

      {error && <p className="fa-error">{error}</p>}

      <div className="fa-form__nav">
        <button
          type="button"
          className="fa-btn fa-btn--ghost"
          onClick={() => setStep((prev) => Math.max(prev - 1, 0))}
          disabled={step === 0 || submitting}
        >
          <ArrowLeft size={15} /> Atrás
        </button>
        {step < 4 ? (
          <button type="button" className="fa-btn" onClick={next}>
            Continuar <ArrowRight size={15} />
          </button>
        ) : (
          <button type="button" className="fa-btn" onClick={submit} disabled={submitting || uploading}>
            {submitting ? <Loader2 size={15} className="animate-spin" /> : null}
            Enviar solicitud
          </button>
        )}
      </div>
    </div>
  );
}