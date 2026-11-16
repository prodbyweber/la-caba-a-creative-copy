import React from "react";
import ListEditor from "./ListEditor";

const CREATOR_FIELDS = [
  { key: "name", label: "Nombre", type: "text" },
  { key: "genre", label: "Género", type: "text", placeholder: "House, Reggaetón…" },
  { key: "photo_url", label: "Foto", type: "image" },
  { key: "cover_url", label: "Portada de la canción", type: "image" },
  { key: "track_title", label: "Título de la canción", type: "text" },
  { key: "audio_url", label: "Audio público (MP3)", type: "text", placeholder: "https://…mp3" },
  { key: "year", label: "Año", type: "text" },
  { key: "credits", label: "Créditos", type: "textarea" },
  { key: "is_public", label: "Público (solo marcados se muestran)", type: "toggle" },
];

export default function CreatorsPanel({ creators = [], onChange }) {
  return (
    <ListEditor
      items={creators}
      fields={CREATOR_FIELDS}
      onChange={onChange}
      addLabel="Añadir creador"
      itemTitle={(it, i) => it.name || it.track_title || `Creador ${i + 1}`}
    />
  );
}