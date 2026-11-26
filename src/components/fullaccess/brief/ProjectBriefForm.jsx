import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import BookingSection from "@/components/fullaccess/BookingSection";
import BriefSummary from "./BriefSummary";
import { Field, ChipGroup } from "./BriefFields";
import {
  DRAFT_KEY,
  EMPTY_BRIEF,
  MODULES,
  MOMENT_OPTIONS,
  GOALS,
  BRIEF_GENRES,
  RELEASE_FORMATS,
  RELEASE_WINDOWS,
  START_WINDOWS,
  MODALITIES,
  PAYMENT_PREFS,
  PHONE_PREFIXES,
  newRequestKey,
  validateBrief,
  fullPhone,
} from "./briefConfig";

const readDraft = () => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.data) return null;
    return {
      data: { ...EMPTY_BRIEF, ...parsed.data },
      step: Math.min(Math.max(Number(parsed.step) || 0, 0), MODULES.length - 1),
      key: parsed.key || newRequestKey(),
    };
  } catch {
    return null;
  }
};

export default function ProjectBriefForm({ settings, onDone }) {
  const [initial] = useState(readDraft);
  const [data, setData] = useState(initial?.data || EMPTY_BRIEF);
  const [step, setStep] = useState(initial?.step || 0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [application, setApplication] = useState(null);
  const requestKeyRef = useRef(initial?.key || newRequestKey());

  useEffect(() => {
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ data, step, key: requestKeyRef.current })
      );
    } catch {
      /* almacenamiento no disponible */
    }
  }, [data, step]);

  const set = (key, value) => setData((prev) => ({ ...prev, [key]: value }));

  const toggleGoal = (goal) => {
    setData((prev) => {
      const list = prev.goals || [];
      if (list.includes(goal)) {
        return {
          ...prev,
          goals: list.filter((item) => item !== goal),
          priority_goal: prev.priority_goal === goal ? "" : prev.priority_goal,
        };
      }
      if (list.length >= 3) return prev;
      return { ...prev, goals: [...list, goal] };
    });
  };

  const goNext = () => {
    const problem = validateBrief({ ...data, step });
    if (problem && problem.step <= step) {
      setError(problem.message);
      return;
    }
    setError("");
    setStep((prev) => Math.min(prev + 1, MODULES.length - 1));
  };

  const submit = async () => {
    if (submitting) return;
    const problem = validateBrief(data);
    if (problem) {
      setError(problem.message);
      setStep(problem.step);
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await base44.functions.invoke("submitProjectBrief", {
        request_key: requestKeyRef.current,
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
        artist_name: data.artist_name.trim(),
        instagram: data.instagram.trim(),
        email: data.email.trim().toLowerCase(),
        phone: fullPhone(data),
        moment: data.moment,
        moment_detail: data.moment_detail,
        goals: data.goals,
        priority_goal: data.priority_goal,
        genres: data.genres.join(", "),
        music_link: data.music_link,
        references: data.references,
        release_format: data.release_format,
        release_window: data.release_window,
        start_window: data.start_window,
        modality: data.modality,
        payment_preference: data.payment_preference,
        vsl_progress: 1,
        source: "start-brief",
      });
      if (res.data?.error) throw new Error(res.data.error);
      const saved = res.data?.application;
      if (!saved?.id) throw new Error("No hemos podido confirmar el guardado. Inténtalo de nuevo.");
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
      setApplication(saved);
    } catch (err) {
      setError(err?.message || "No hemos podido enviar tu proyecto. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  if (application) {
    return (
      <div className="fa-brief__done">
        <span className="fa-eyebrow">Proyecto recibido</span>
        <h3 className="fa-display fa-brief__done-title">
          Gracias, {application.first_name || application.artist_name || "artista"}.
        </h3>
        <p className="fa-lead">
          Hemos guardado tu briefing. Elige ahora el día y la hora de tu sesión de valoración de{" "}
          {settings.booking_duration || 30} minutos.
        </p>
        <div className="fa-brief__booking">
          <BookingSection application={application} settings={settings} />
        </div>
        <button type="button" className="fa-btn fa-btn--ghost" onClick={onDone}>
          Cerrar
        </button>
      </div>
    );
  }

  const followUp = MOMENT_OPTIONS.find((option) => option.value === data.moment);

  const renderStep = () => {
    if (step === 0) {
      return (
        <div className="fa-form__grid fa-form__grid--two">
          <Field label="Nombre">
            <input
              className="fa-input"
              value={data.first_name}
              onChange={(event) => set("first_name", event.target.value)}
              autoComplete="given-name"
            />
          </Field>
          <Field label="Apellidos">
            <input
              className="fa-input"
              value={data.last_name}
              onChange={(event) => set("last_name", event.target.value)}
              autoComplete="family-name"
            />
          </Field>
          <Field label="Nombre artístico">
            <input
              className="fa-input"
              value={data.artist_name}
              onChange={(event) => set("artist_name", event.target.value)}
            />
          </Field>
          <Field label="Instagram">
            <input
              className="fa-input"
              value={data.instagram}
              onChange={(event) => set("instagram", event.target.value)}
              placeholder="@usuario"
            />
          </Field>
          <Field label="Correo electrónico">
            <input
              className="fa-input"
              type="email"
              value={data.email}
              onChange={(event) => set("email", event.target.value)}
              autoComplete="email"
            />
          </Field>
          <Field label="Teléfono">
            <div className="fa-phone">
              <select
                className="fa-input fa-phone__prefix"
                value={data.phone_prefix}
                onChange={(event) => set("phone_prefix", event.target.value)}
                aria-label="Prefijo internacional"
              >
                {PHONE_PREFIXES.map((prefix) => (
                  <option key={prefix.code} value={prefix.code}>
                    {prefix.label}
                  </option>
                ))}
              </select>
              <input
                className="fa-input"
                type="tel"
                value={data.phone}
                onChange={(event) => set("phone", event.target.value)}
                autoComplete="tel"
              />
            </div>
          </Field>
        </div>
      );
    }

    if (step === 1) {
      return (
        <div className="fa-form__grid">
          <div className="fa-field">
            <span className="fa-label">¿En qué punto se encuentra tu proyecto actualmente?</span>
            <ChipGroup
              options={MOMENT_OPTIONS}
              value={data.moment}
              onChange={(value) => set("moment", value)}
            />
          </div>
          {followUp ? (
            <Field label={followUp.followUp}>
              <textarea
                className="fa-textarea"
                rows={3}
                value={data.moment_detail}
                onChange={(event) => set("moment_detail", event.target.value)}
                placeholder={followUp.placeholder}
              />
            </Field>
          ) : null}
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="fa-form__grid">
          <div className="fa-field">
            <span className="fa-label">Hasta tres objetivos ({(data.goals || []).length}/3)</span>
            <div className="fa-chips">
              {GOALS.map((goal) => {
                const on = (data.goals || []).includes(goal);
                return (
                  <button
                    type="button"
                    key={goal}
                    className={`fa-chip${on ? " is-on" : ""}`}
                    onClick={() => toggleGoal(goal)}
                    aria-pressed={on}
                  >
                    {goal}
                  </button>
                );
              })}
            </div>
          </div>
          {data.goals?.length ? (
            <div className="fa-field">
              <span className="fa-label">¿Cuál es el prioritario?</span>
              <ChipGroup
                options={data.goals}
                value={data.priority_goal}
                onChange={(value) => set("priority_goal", value)}
              />
            </div>
          ) : null}
        </div>
      );
    }

    if (step === 3) {
      return (
        <div className="fa-form__grid">
          <div className="fa-field">
            <span className="fa-label">Géneros (puedes combinar)</span>
            <ChipGroup
              options={BRIEF_GENRES}
              value={data.genres}
              onChange={(value) => set("genres", value)}
              multiple
            />
          </div>
          <Field label="Enlace a música o demos" hint="Opcional">
            <input
              className="fa-input"
              value={data.music_link}
              onChange={(event) => set("music_link", event.target.value)}
              placeholder="Spotify, SoundCloud, Drive, YouTube..."
            />
          </Field>
          <Field label="Artistas de referencia" hint="Opcional">
            <textarea
              className="fa-textarea"
              rows={2}
              value={data.references}
              onChange={(event) => set("references", event.target.value)}
            />
          </Field>
        </div>
      );
    }

    if (step === 4) {
      return (
        <div className="fa-form__grid">
          <div className="fa-field">
            <span className="fa-label">Formato</span>
            <ChipGroup
              options={RELEASE_FORMATS}
              value={data.release_format}
              onChange={(value) => set("release_format", value)}
            />
          </div>
          <div className="fa-field">
            <span className="fa-label">Fecha estimada</span>
            <ChipGroup
              options={RELEASE_WINDOWS}
              value={data.release_window}
              onChange={(value) => set("release_window", value)}
            />
          </div>
        </div>
      );
    }

    if (step === 5) {
      return (
        <div className="fa-form__grid">
          <div className="fa-field">
            <span className="fa-label">¿Cuándo te gustaría empezar a trabajar en tu música?</span>
            <ChipGroup
              options={START_WINDOWS}
              value={data.start_window}
              onChange={(value) => set("start_window", value)}
            />
          </div>

          <div className="fa-note">
            Trabajamos con un máximo de 5 artistas por trimestre. Reservamos un número limitado de
            plazas para poder dedicar a cada proyecto el tiempo, la producción y la dirección
            artística que necesita.
          </div>

          <div className="fa-plans">
            <div className="fa-plan">
              <span className="fa-plan__name">Cabaña Full Access</span>
              <span className="fa-plan__price">Desde 2.000 €</span>
              <p className="fa-plan__text">
                Las propuestas suelen rondar los 2.600 €, según las necesidades y el alcance del
                proyecto.
              </p>
            </div>
            <div className="fa-plan">
              <span className="fa-plan__name">Single + acompañamiento</span>
              <span className="fa-plan__price">725 €</span>
              <p className="fa-plan__text">Por canción.</p>
            </div>
          </div>

          <div className="fa-field">
            <span className="fa-label">Modalidad</span>
            <ChipGroup
              options={MODALITIES}
              value={data.modality}
              onChange={(value) => set("modality", value)}
            />
          </div>

          <div className="fa-field">
            <span className="fa-label">Preferencia de pago</span>
            <ChipGroup
              options={PAYMENT_PREFS}
              value={data.payment_preference}
              onChange={(value) => set("payment_preference", value)}
            />
            <span className="fa-field__hint">
              El pago fraccionado depende de las condiciones acordadas.
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="fa-form__grid">
        <p className="fa-lead">
          Revisa tus respuestas. Puedes editar cualquier módulo sin perder la información.
        </p>
        <BriefSummary data={data} onEdit={(target) => setStep(target)} />
      </div>
    );
  };

  const isLast = step === MODULES.length - 1;

  return (
    <div className="fa-form fa-brief__form">
      <div className="fa-form__top">
        <span className="fa-micro">
          {String(step + 1).padStart(2, "0")} · {MODULES[step]}
        </span>
        <span className="fa-form__steps">
          {step + 1}/{MODULES.length}
        </span>
      </div>
      <div className="fa-form__track">
        <div
          className="fa-form__fill"
          style={{ width: `${((step + 1) / MODULES.length) * 100}%` }}
        />
      </div>

      <div className="fa-brief__body">{renderStep()}</div>

      {error ? <p className="fa-error">{error}</p> : null}

      <div className="fa-form__nav">
        <button
          type="button"
          className="fa-btn fa-btn--ghost"
          onClick={() => {
            setError("");
            setStep((prev) => Math.max(prev - 1, 0));
          }}
          disabled={step === 0 || submitting}
        >
          <ArrowLeft size={15} /> Atrás
        </button>

        {isLast ? (
          <button
            type="button"
            className="fa-btn"
            onClick={submit}
            disabled={submitting}
            aria-busy={submitting}
          >
            {submitting ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
            ENVIAR MI PROYECTO
          </button>
        ) : (
          <button type="button" className="fa-btn" onClick={goNext}>
            Continuar <ArrowRight size={15} />
          </button>
        )}
      </div>
    </div>
  );
}