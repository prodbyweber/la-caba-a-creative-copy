import React from "react";
import ChoiceList from "@/components/admision/ChoiceList";
import { GENRE_OPTIONS } from "@/lib/admissionScreens";

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
    </div>
  );
}