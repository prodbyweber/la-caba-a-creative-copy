import React from "react";

export default function BlockerScreen({ data, set, errors }) {
  return (
    <div>
      <h1 className="adm-title">¿Qué te está frenando ahora mismo?</h1>

      <div className="adm-fields">
        <label className="adm-field">
          <span className="adm-field__label">Principal bloqueo</span>
          <textarea
            rows={3}
            value={data.main_blocker}
            onChange={(event) => set("main_blocker", event.target.value)}
            placeholder="Cuéntanoslo en una línea"
          />
          {errors.main_blocker ? (
            <span className="adm-field__error">{errors.main_blocker}</span>
          ) : null}
        </label>

        <label className="adm-field">
          <span className="adm-field__label">Instagram (opcional)</span>
          <input
            type="text"
            value={data.instagram}
            onChange={(event) => set("instagram", event.target.value)}
            placeholder="@tuusuario"
            autoCapitalize="none"
            autoComplete="off"
          />
        </label>

        <label className="adm-field">
          <span className="adm-field__label">Enlace a tu música (opcional)</span>
          <input
            type="text"
            value={data.music_link}
            onChange={(event) => set("music_link", event.target.value)}
            placeholder="Spotify, YouTube o Drive"
            inputMode="url"
            autoCapitalize="none"
            autoComplete="off"
          />
          {errors.music_link ? (
            <span className="adm-field__error">{errors.music_link}</span>
          ) : null}
        </label>
      </div>
    </div>
  );
}