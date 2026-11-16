import React, { useState } from "react";
import { ChevronDown, ChevronUp, ArrowUp, ArrowDown, Eye, EyeOff } from "lucide-react";
import { TextField } from "./Field";
import { SECTION_LABELS } from "@/lib/landingDefaults";

export default function SectionsPanel({ sections = [], onChange }) {
  const [open, setOpen] = useState(null);

  const update = (idx, patch) =>
    onChange(sections.map((s, i) => (i === idx ? { ...s, ...patch } : s)));

  const move = (idx, dir) => {
    const target = idx + dir;
    if (target < 0 || target >= sections.length) return;
    const next = sections.slice();
    const [it] = next.splice(idx, 1);
    next.splice(target, 0, it);
    onChange(next.map((s, i) => ({ ...s, order: i + 1 })));
    setOpen(target);
  };

  return (
    <div className="space-y-2">
      {sections.map((section, idx) => {
        const isOpen = open === idx;
        const label = SECTION_LABELS[section.key] || section.key;
        return (
          <div key={section.key} className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2.5">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : idx)}
                className="flex items-center gap-2 flex-1 min-w-0 text-left"
              >
                {isOpen ? <ChevronUp size={14} className="text-white/40" /> : <ChevronDown size={14} className="text-white/40" />}
                <span className="text-xs font-semibold text-white/85">{label}</span>
                <span className="text-[10px] text-white/25 truncate">{section.title}</span>
              </button>

              <button
                type="button"
                onClick={() => update(idx, { is_visible: section.is_visible === false })}
                className="p-1.5 text-white/30 hover:text-white"
                aria-label={section.is_visible === false ? "Mostrar sección" : "Ocultar sección"}
              >
                {section.is_visible === false ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
              <button type="button" onClick={() => move(idx, -1)} className="p-1.5 text-white/30 hover:text-white" aria-label="Subir">
                <ArrowUp size={13} />
              </button>
              <button type="button" onClick={() => move(idx, 1)} className="p-1.5 text-white/30 hover:text-white" aria-label="Bajar">
                <ArrowDown size={13} />
              </button>
            </div>

            {isOpen && (
              <div className="px-3 pb-3 pt-1 grid gap-3 border-t border-white/5">
                <TextField label="Antetítulo" value={section.eyebrow} onChange={(v) => update(idx, { eyebrow: v })} />
                <TextField label="Titular" value={section.title} onChange={(v) => update(idx, { title: v })} />
                <TextField
                  label="Texto de apoyo"
                  value={section.subtitle}
                  onChange={(v) => update(idx, { subtitle: v })}
                  textarea
                  rows={2}
                />
                <TextField
                  label="Texto secundario / enlace"
                  value={section.body}
                  onChange={(v) => update(idx, { body: v })}
                  textarea
                  rows={2}
                  hint="En el cierre se usa como texto del enlace de sesión de descubrimiento."
                />
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="Botón 1 · texto" value={section.cta_label} onChange={(v) => update(idx, { cta_label: v })} />
                  <TextField
                    label="Botón 1 · enlace"
                    value={section.cta_link}
                    onChange={(v) => update(idx, { cta_link: v })}
                    hint="/login · /reservas · modal:access"
                  />
                  <TextField label="Botón 2 · texto" value={section.cta2_label} onChange={(v) => update(idx, { cta2_label: v })} />
                  <TextField
                    label="Botón 2 · enlace"
                    value={section.cta2_link}
                    onChange={(v) => update(idx, { cta2_link: v })}
                    hint="modal:access abre el formulario"
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}