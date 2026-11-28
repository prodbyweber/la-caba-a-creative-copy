import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { GripVertical, Pencil, Copy, Eye, EyeOff, Trash2 } from "lucide-react";

const LABELS = {
  hero: "Hero",
  paises: "Países",
  marcas: "Marcas",
  generos: "Géneros",
  comunidad: "Comunidad",
  proceso: "Cómo funciona",
  comenzar: "Cómo comenzar",
  antes_despues: "Antes / Después",
  casa: "Founder",
  cifras: "Cifras",
  tendencia: "Tendencia",
  final: "Cierre",
};

export default function SectionRow({ section, index, onEdit, onDuplicate, onToggle, onRemove }) {
  const hidden = section.is_visible === false;

  return (
    <Draggable draggableId={section.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
            snapshot.isDragging
              ? "border-[#ff5833]/60 bg-[#151517]"
              : "border-white/10 bg-white/[0.02]"
          } ${hidden ? "opacity-55" : ""}`}
        >
          <span
            {...provided.dragHandleProps}
            className="text-white/25 hover:text-white/70 cursor-grab active:cursor-grabbing"
            aria-label="Arrastrar para reordenar"
          >
            <GripVertical size={14} />
          </span>

          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold truncate">
              {section.title || LABELS[section.key] || section.key}
            </div>
            <div className="text-[10.5px] text-white/30 truncate">
              {LABELS[section.key] || section.key}
              {section.eyebrow ? ` · ${section.eyebrow}` : ""}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onToggle(section)}
            className="p-1.5 rounded-lg text-white/40 hover:text-white"
            aria-label={hidden ? "Mostrar" : "Ocultar"}
          >
            {hidden ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
          <button
            type="button"
            onClick={() => onDuplicate(section)}
            className="p-1.5 rounded-lg text-white/40 hover:text-white"
            aria-label="Duplicar"
          >
            <Copy size={13} />
          </button>
          <button
            type="button"
            onClick={() => onEdit(section)}
            className="p-1.5 rounded-lg text-white/40 hover:text-white"
            aria-label="Editar"
          >
            <Pencil size={13} />
          </button>
          <button
            type="button"
            onClick={() => onRemove(section)}
            className="p-1.5 rounded-lg text-white/40 hover:text-red-400"
            aria-label="Eliminar"
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}
    </Draggable>
  );
}