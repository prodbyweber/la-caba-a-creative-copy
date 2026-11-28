import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Upload,
  Check,
  X,
} from "lucide-react";
import { Label, TextField, ToggleField, ImageField } from "./Field";

const inputCls =
  "w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#ff5833]/60";

function NumberField({ label, value, onChange }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <input
        type="number"
        className={inputCls}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
      />
    </label>
  );
}

function ColorField({ label, value, onChange }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <div className="flex gap-2 items-center">
        <input
          type="color"
          value={value || "#ff5833"}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 rounded-lg border border-white/10 bg-transparent"
        />
        <input className={inputCls} value={value || ""} onChange={(e) => onChange(e.target.value)} />
      </div>
    </label>
  );
}

function ListField({ label, value = [], onChange, hint }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <textarea
        className={inputCls}
        rows={4}
        value={(value || []).join("\n")}
        onChange={(e) =>
          onChange(
            e.target.value
              .split("\n")
              .map((t) => t.trim())
              .filter(Boolean)
          )
        }
      />
      <span className="block text-[10px] text-white/25 mt-1">{hint || "Una opción por línea."}</span>
    </label>
  );
}

function AudioField({ label, value = "", onChange }) {
  const ref = useRef(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await base44.integrations.Core.UploadPublicFile({ file });
      const url = res?.file_url || res?.data?.file_url;
      if (url) onChange(url);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-2">
        <input
          className={inputCls}
          value={value || ""}
          placeholder="https://…mp3"
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={uploading}
          className="px-3 rounded-lg border border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.09] flex items-center gap-1.5 text-[11px] font-semibold flex-shrink-0 disabled:opacity-40"
        >
          {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
          Subir
        </button>
        <input
          ref={ref}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => upload(e.target.files?.[0])}
        />
      </div>
    </div>
  );
}

function FieldSwitch({ field, value, onChange }) {
  switch (field.type) {
    case "textarea":
      return <TextField label={field.label} value={value} onChange={onChange} textarea rows={3} hint={field.hint} />;
    case "number":
      return <NumberField label={field.label} value={value} onChange={onChange} />;
    case "toggle":
      return <ToggleField label={field.label} checked={value !== false} onChange={onChange} />;
    case "media":
      return <ImageField label={field.label} value={value} onChange={onChange} hint={field.hint} />;
    case "audio":
      return <AudioField label={field.label} value={value} onChange={onChange} />;
    case "color":
      return <ColorField label={field.label} value={value} onChange={onChange} />;
    case "list":
      return <ListField label={field.label} value={value} onChange={onChange} hint={field.hint} />;
    default:
      return <TextField label={field.label} value={value} onChange={onChange} placeholder={field.placeholder} hint={field.hint} />;
  }
}

export default function CrudPanel({ entityName, fields, defaults = {}, hint, itemTitle }) {
  const [items, setItems] = useState(null);
  const [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const load = async () => {
    const list = await base44.entities[entityName].list("-created_date", 200);
    setItems(list);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityName]);

  const sorted = [...(items || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const startNew = () => {
    setNotice("");
    setDraft({ ...defaults, is_visible: true });
  };

  const save = async () => {
    if (!draft) return;
    setBusy(true);
    setNotice("");
    try {
      if (draft.id) {
        const { id, created_date, updated_date, created_by_id, ...rest } = draft;
        await base44.entities[entityName].update(id, rest);
      } else {
        await base44.entities[entityName].create({ ...draft, order: sorted.length + 1 });
      }
      setDraft(null);
      await load();
      setNotice("Guardado");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (item) => {
    if (!window.confirm("¿Eliminar este elemento?")) return;
    await base44.entities[entityName].delete(item.id);
    await load();
  };

  const move = async (index, dir) => {
    const next = [...sorted];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    await base44.entities[entityName].bulkUpdate(next.map((it, i) => ({ id: it.id, order: i + 1 })));
    await load();
  };

  if (!items) {
    return (
      <div className="grid place-items-center py-16">
        <Loader2 className="w-5 h-5 animate-spin text-white/30" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          onClick={startNew}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#ff5833] text-[11px] font-bold text-white hover:bg-[#e04a28]"
        >
          <Plus size={12} /> Añadir
        </button>
        {notice && (
          <span className="flex items-center gap-1 text-[11px] text-emerald-300">
            <Check size={12} /> {notice}
          </span>
        )}
      </div>

      {hint && <p className="text-[11px] text-white/30 mb-4">{hint}</p>}

      {draft && (
        <div className="mb-5 rounded-xl border border-[#ff5833]/40 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">
              {draft.id ? "Editar" : "Nuevo"}
            </span>
            <button type="button" onClick={() => setDraft(null)} className="text-white/40 hover:text-white">
              <X size={14} />
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {fields.map((field) => (
              <div key={field.key} className={field.wide ? "sm:col-span-2" : ""}>
                <FieldSwitch
                  field={field}
                  value={draft[field.key]}
                  onChange={(value) => setDraft((d) => ({ ...d, [field.key]: value }))}
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={save}
            disabled={busy}
            className="mt-4 flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#ff5833] text-[11px] font-bold text-white disabled:opacity-50"
          >
            {busy ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Guardar
          </button>
        </div>
      )}

      <div className="grid gap-2">
        {sorted.map((item, index) => (
          <div
            key={item.id}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5"
          >
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={() => move(index, -1)}
                className="text-white/30 hover:text-white"
                aria-label="Subir"
              >
                <ChevronUp size={13} />
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                className="text-white/30 hover:text-white"
                aria-label="Bajar"
              >
                <ChevronDown size={13} />
              </button>
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold truncate">
                {itemTitle ? itemTitle(item) : item.title || item.name || item.key || item.artist}
              </div>
              <div className="text-[10.5px] text-white/30 truncate">
                {item.is_visible === false ? "oculto · " : ""}
                orden {item.order ?? "-"}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setNotice("");
                setDraft({ ...item });
              }}
              className="p-1.5 rounded-lg text-white/40 hover:text-white"
              aria-label="Editar"
            >
              <Pencil size={13} />
            </button>
            <button
              type="button"
              onClick={() => remove(item)}
              className="p-1.5 rounded-lg text-white/40 hover:text-red-400"
              aria-label="Eliminar"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}

        {sorted.length === 0 && (
          <p className="text-[12px] text-white/30 py-6 text-center">
            Todavía no hay elementos guardados. La home usa el contenido por defecto.
          </p>
        )}
      </div>
    </div>
  );
}