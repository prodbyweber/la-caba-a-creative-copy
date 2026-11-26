import React from "react";
import ChoiceChips from "@/components/admision/ChoiceChips";
import {
  AVAILABILITY,
  BUDGETS,
  GENRES,
  GOALS,
  OTHER_GENRE,
  PROJECT_STAGES,
  RELEASE_DATES,
  RELEASE_TYPES,
} from "@/lib/admissionForm";

function Field({ label, error, hint, children }) {
  return (
    <div className="fa-field">
      <span className="fa-label">{label}</span>
      {children}
      {hint ? <p className="adm-hint">{hint}</p> : null}
      {error ? <p className="fa-error">{error}</p> : null}
    </div>
  );
}

function Text({ value, onChange, placeholder, type = "text", autoComplete }) {
  return (
    <input
      className="fa-input"
      type={type}
      value={value}
      placeholder={placeholder}
      autoComplete={autoComplete}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

export default function AdmissionStageBody({ step, data, set, errors }) {
  if (step === 0) {
    return (
      <div className="adm-fields adm-fields--two">
        <Field label="Nombre" error={errors.first_name}>
          <Text value={data.first_name} onChange={(v) => set("first_name", v)} autoComplete="given-name" />
        </Field>
        <Field label="Apellido" error={errors.last_name}>
          <Text value={data.last_name} onChange={(v) => set("last_name", v)} autoComplete="family-name" />
        </Field>
        <Field label="Correo electrónico" error={errors.email} hint="Será el correo con el que reservemos la conversación.">
          <Text value={data.email} onChange={(v) => set("email", v)} type="email" autoComplete="email" placeholder="tu@email.com" />
        </Field>
        <Field label="Teléfono" error={errors.phone}>
          <Text value={data.phone} onChange={(v) => set("phone", v)} type="tel" autoComplete="tel" placeholder="+34 600 000 000" />
        </Field>
        <Field label="País" error={errors.country}>
          <Text value={data.country} onChange={(v) => set("country", v)} autoComplete="country-name" placeholder="España" />
        </Field>
        <Field label="Ciudad" error={errors.city}>
          <Text value={data.city} onChange={(v) => set("city", v)} autoComplete="address-level2" placeholder="Madrid" />
        </Field>
        <Field label="Instagram @" error={errors.instagram} hint="Opcional">
          <Text value={data.instagram} onChange={(v) => set("instagram", v)} placeholder="@usuario" />
        </Field>
        <Field label="Enlace a tu música o perfil" error={errors.music_link} hint="Opcional · Spotify, YouTube o Drive">
          <Text value={data.music_link} onChange={(v) => set("music_link", v)} type="url" placeholder="https://" />
        </Field>
      </div>
    );
  }

  if (step === 1) {
    return (
      <ChoiceChips
        options={PROJECT_STAGES}
        value={data.project_stage}
        onChange={(v) => set("project_stage", v)}
        stack
        error={errors.project_stage}
      />
    );
  }

  if (step === 2) {
    return (
      <div>
        <ChoiceChips
          options={GENRES}
          value={data.genres}
          onChange={(v) => set("genres", v)}
          multi
          error={errors.genres}
        />
        {data.genres.includes(OTHER_GENRE) ? (
          <div className="adm-other">
            <Field label="¿Cuál?" error={errors.genre_other}>
              <Text value={data.genre_other} onChange={(v) => set("genre_other", v)} placeholder="Cuéntanos qué estilo" />
            </Field>
          </div>
        ) : null}
        <p className="adm-hint">Puedes seleccionar varios.</p>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div>
        <ChoiceChips
          options={GOALS}
          value={data.goals}
          onChange={(v) => set("goals", v)}
          multi
          stack
          error={errors.goals}
        />
        <p className="adm-hint">Puedes seleccionar varios.</p>
      </div>
    );
  }

  if (step === 4) {
    return (
      <Field label="Tu respuesta" error={errors.main_blocker} hint={`${data.main_blocker.trim().length} caracteres`}>
        <textarea
          className="fa-textarea adm-textarea"
          value={data.main_blocker}
          placeholder="Qué has intentado, qué te gustaría conseguir y qué sientes que te falta para avanzar."
          onChange={(event) => set("main_blocker", event.target.value)}
        />
      </Field>
    );
  }

  if (step === 5) {
    return (
      <div className="adm-fields">
        <div>
          <span className="fa-label">Tipo de lanzamiento</span>
          <ChoiceChips
            options={RELEASE_TYPES}
            value={data.release_type}
            onChange={(v) => set("release_type", v)}
            stack
            error={errors.release_type}
          />
        </div>
        <div style={{ marginTop: 8 }}>
          <span className="fa-label">Fecha objetivo de lanzamiento</span>
          <ChoiceChips
            options={RELEASE_DATES}
            value={data.release_date}
            onChange={(v) => set("release_date", v)}
            stack
            error={errors.release_date}
          />
        </div>
      </div>
    );
  }

  if (step === 6) {
    return (
      <ChoiceChips
        options={AVAILABILITY}
        value={data.availability}
        onChange={(v) => set("availability", v)}
        stack
        error={errors.availability}
      />
    );
  }

  return (
    <ChoiceChips
      options={BUDGETS}
      value={data.budget}
      onChange={(v) => set("budget", v)}
      stack
      error={errors.budget}
    />
  );
}