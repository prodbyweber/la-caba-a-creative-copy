import React from "react";
import ChoiceList from "@/components/admision/ChoiceList";
import { GENRE_OPTIONS, MUSIC_HELP } from "@/lib/admissionScreens";

export default function SoundScreen({ data, set, errors }) {
  return (
    <div>
      <h1 className="adm-title">¿Qué géneros o estilos representan tu sonido?</h1>
      <p className="adm-hint-inline">Puedes elegir varios.</p>

      <ChoiceList
        options={GENRE_OPTIONS}
        value={data.genres}
        onChange={(value) => set("genres", value)}
        multi
        grid
      />
      {errors.genres ? <p className="adm-error">{errors.genres}</p> : null}

      <h2 className="adm-question">Comparte un enlace para escuchar tu música.</h2>
      <p className="adm-hint-inline">{MUSIC_HELP}</p>

      <div className="adm-fields">
        <label className="adm-field">
          <input
            type="url"
            value={data.music_link}
            onChange={(event) => set("music_link", event.target.value)}
            placeholder="https://open.spotify.com/..."
            aria-label="Enlace para escuchar tu música"
            inputMode="url"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
          {errors.music_link ? <span className="adm-field__error">{errors.music_link}</span> : null}
        </label>
      </div>
    </div>
  );
}