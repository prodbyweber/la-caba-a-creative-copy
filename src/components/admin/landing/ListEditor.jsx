import React, { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { Label, TextField, SelectField, TagsField, ImageField, ToggleField } from "./Field";

function renderField(field, item, patch) {
  const value = item[field.key];
  switch (field.type) {
    case "textarea":
      return (
        <TextField
          label={field.label}
          value={value}
          onChange={(v) => patch({ [field.key]: v })}
          textarea
          placeholder={field.placeholder}
        />
      );
    case "image":
      return (
        <ImageField
          label={field.label}
          value={value}
          onChange={(v) => patch({ [field.key]: v })}
          hint={field.hint}
        />
      );
    case "toggle":
      return <ToggleField label={field.label} checked={value !== false && !!value} onChange={(v) => patch({ [field.key]: v })} />;
    case "select":
      return (
        <SelectField
          label={field.label}
          value={value}
          onChange={(v) => patch({ [field.key]: v })}
          options={field.options}
        />
      );
    case "tags":
      return <TagsField label={field.label} value={value} onChange={(v) => patch({ [field.key]: v })} />;
    default:
      return (
        <TextField
          label={field.label}
          value={value}
          onChange={(v) => patch({ [field.key]: v })}
          placeholder={field.placeholder}
        />
      );
  }
}

export default function ListEditor({ items = [], fields, onChange, addLabel = "Añadir", itemTitle }) {
  const [open, setOpen] = useState(null);

  const update = (idx, patch) => {
    const next = items.map((it, i) => (i === idx ? { ...it, ...patch } : it));
    onChange(next);
  };

  const remove = (idx) => onChange(items.filter((_, i) => i !== idx));

  const move = (idx, dir) => {
    const target = idx + dir;
    if (target < 0 || target >= items.length) return;
    const next = items.slice();
    const [it] = next.splice(idx, 1);
    next.splice(target, 0, it);
    onChange(next.map((it, i) => ({ ...it, order: i + 1 })));
    setOpen(target);
  };

  const add = () => {
    const blank = fields.reduce((acc, f) => {
      acc[f.key] = f.type === "toggle" ? true : f.type === "tags" ? [] : f.type === "select" ? f.options?.[0]?.value : "";
      return acc;
    }, {});
    onChange([...items, { ...blank, order: items.length + 1 }]);
    setOpen(items.length);
  };

  return (
    <div className="space-y-2">
      {items.map((item, idx) => {
        const title = itemTitle ? itemTitle(item, idx) : item.title || item.name || `Elemento ${idx + 1}`;
        const isOpen = open === idx;
        return (
          <div key={idx} className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2.5">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : idx)}
                className="flex items-center gap-2 flex-1 min-w-0 text-left"
              >
                {isOpen ? <ChevronUp size={14} className="text-white/40" /> : <ChevronDown size={14} className="text-white/40" />}
                <span className="text-xs font-semibold text-white/85 truncate">{title || "(sin título)"}</span>
                {item.is_visible === false && (
                  <span className="text-[9px] uppercase tracking-wider text-white/30 border border-white/10 rounded px-1.5 py-0.5">
                    oculto
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => move(idx, -1)}
                className="p-1.5 text-white/30 hover:text-white"
                aria-label="Subir"
              >
                <ArrowUp size={13} />
              </button>
              <button
                type="button"
                onClick={() => move(idx, 1)}
                className="p-1.5 text-white/30 hover:text-white"
                aria-label="Bajar"
              >
                <ArrowDown size={13} />
              </button>
              <button
                type="button"
                onClick={() => remove(idx)}
                className="p-1.5 text-white/30 hover:text-red-400"
                aria-label="Eliminar"
              >
                <Trash2 size={13} />
              </button>
            </div>

            {isOpen && (
              <div className="px-3 pb-3 pt-1 grid gap-3 border-t border-white/5">
                {fields.map((f) => (
                  <div key={f.key}>{renderField(f, item, (patch) => update(idx, patch))}</div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={add}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-white/15 text-[11px] font-semibold text-white/50 hover:text-white hover:border-white/30"
      >
        <Plus size={13} /> {addLabel}
      </button>
    </div>
  );
}