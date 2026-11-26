import React from "react";
import { STAGES, OTHER_GENRE } from "@/lib/admissionForm";

const groups = (data) => [
  {
    step: 0,
    label: "Identidad y contacto",
    rows: [
      ["Nombre", `${data.first_name} ${data.last_name}`.trim()],
      ["Correo", data.email],
      ["Teléfono", data.phone],
      ["País / Ciudad", [data.country, data.city].filter(Boolean).join(" · ")],
      ["Instagram", data.instagram || "—"],
      ["Música o perfil", data.music_link || "—"],
    ],
  },
  {
    step: 1,
    label: "Momento del proyecto",
    rows: [["Etapa", data.project_stage]],
  },
  {
    step: 2,
    label: "Sonido e identidad",
    rows: [
      ["Géneros", (data.genres || []).join(", ")],
      ...(data.genres?.includes(OTHER_GENRE) && data.genre_other
        ? [["Otro", data.genre_other]]
        : []),
    ],
  },
  {
    step: 3,
    label: "Objetivos",
    rows: [["Objetivos", (data.goals || []).join(" · ")]],
  },
  {
    step: 4,
    label: "Principal bloqueo",
    rows: [["Qué te frena", data.main_blocker]],
  },
  {
    step: 5,
    label: "Plan de lanzamiento",
    rows: [
      ["Tipo de lanzamiento", data.release_type],
      ["Fecha objetivo", data.release_date],
    ],
  },
  {
    step: 6,
    label: "Disponibilidad",
    rows: [["Cuándo empezar", data.availability]],
  },
  {
    step: 7,
    label: "Inversión",
    rows: [["Presupuesto", data.budget]],
  },
];

export default function AdmissionReview({ data, onEdit }) {
  return (
    <div className="adm-review">
      {groups(data).map((group) => (
        <section key={group.label} className="adm-review__group">
          <div className="adm-review__head">
            <span className="adm-review__label">{group.label}</span>
            <button type="button" className="adm-review__edit" onClick={() => onEdit(group.step)}>
              Editar
            </button>
          </div>
          {group.rows.map(([label, value]) => (
            <p key={label} className="adm-review__value">
              {value || "—"}
            </p>
          ))}
        </section>
      ))}
      <p className="adm-hint">
        Puedes volver a cualquier etapa antes de enviar. {STAGES.length} etapas revisadas.
      </p>
    </div>
  );
}