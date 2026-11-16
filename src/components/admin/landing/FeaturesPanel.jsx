import React from "react";
import ListEditor from "./ListEditor";

const FEATURE_FIELDS = [
  { key: "title", label: "Titular de beneficio", type: "text" },
  { key: "support_line", label: "Línea de apoyo", type: "textarea" },
  {
    key: "badge",
    label: "Etiqueta",
    type: "select",
    options: [
      { value: "available", label: "Disponible" },
      { value: "soon", label: "Próximamente" },
    ],
  },
  {
    key: "visual",
    label: "Interfaz de la tarjeta",
    type: "select",
    options: [
      { value: "catalog", label: "Catálogo" },
      { value: "player", label: "Reproductor" },
      { value: "artwork", label: "Portada y metadata" },
      { value: "beats", label: "Beats" },
      { value: "roadmap", label: "Hoja de ruta" },
      { value: "workshop", label: "Workshop" },
    ],
  },
  {
    key: "size",
    label: "Tamaño en la cuadrícula",
    type: "select",
    options: [
      { value: "lg", label: "Grande" },
      { value: "md", label: "Mediano" },
      { value: "sm", label: "Pequeño" },
    ],
  },
  { key: "image_url", label: "Imagen opcional", type: "image", hint: "Sustituye a la mini interfaz." },
  { key: "is_visible", label: "Visible", type: "toggle" },
];

export default function FeaturesPanel({ features = [], onChange }) {
  return (
    <ListEditor
      items={features}
      fields={FEATURE_FIELDS}
      onChange={onChange}
      addLabel="Añadir tarjeta"
      itemTitle={(it, i) => it.title || `Tarjeta ${i + 1}`}
    />
  );
}