import React from "react";
import { MUSIC_HELP, MUSIC_OPTIONAL, MUSIC_TITLE } from "@/lib/admissionScreens";

/** Enlace de música: pantalla propia y opcional. */
export default function MusicScreen({ data, set, errors }) {
  return (
    <div>
      <h1 className="adm-title">
        {MUSIC_TITLE}
        <span className="adm-tag">{MUSIC_OPTIONAL}</span>
      </h1>
      <p className="adm-hint-inline">{MUSIC_HELP}</p>

      <div className="adm-fields">
        <label className="adm-field adm-field--boxed">
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