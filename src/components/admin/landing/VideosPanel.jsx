import React from "react";
import ListEditor from "./ListEditor";

const VIDEO_FIELDS = [
  { key: "title", label: "Título", type: "text" },
  { key: "youtube_url", label: "Enlace de YouTube", type: "text", placeholder: "https://youtube.com/watch?v=…" },
  { key: "thumbnail_url", label: "Miniatura", type: "image", hint: "Si está vacía se usa la de YouTube." },
  { key: "tags", label: "Etiquetas / géneros", type: "tags", placeholder: "Trap, R&B" },
  { key: "is_featured", label: "Destacado (vídeo grande)", type: "toggle" },
  { key: "is_visible", label: "Visible", type: "toggle" },
];

export default function VideosPanel({ videos = [], onChange }) {
  return (
    <ListEditor
      items={videos}
      fields={VIDEO_FIELDS}
      onChange={onChange}
      addLabel="Añadir vídeo"
      itemTitle={(it, i) => it.title || `Vídeo ${i + 1}`}
    />
  );
}