import React, { useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, Loader2, X } from "lucide-react";

const inputCls =
  "w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#ff5833]/60";

export function Label({ children }) {
  return (
    <span className="block text-[9.5px] font-bold uppercase tracking-[0.16em] text-white/40 mb-1.5">
      {children}
    </span>
  );
}

export function TextField({ label, value = "", onChange, placeholder, textarea, rows = 3, hint }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      {textarea ? (
        <textarea
          className={inputCls}
          rows={rows}
          value={value || ""}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className={inputCls}
          value={value || ""}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {hint && <span className="block text-[10px] text-white/25 mt-1">{hint}</span>}
    </label>
  );
}

export function SelectField({ label, value, onChange, options = [] }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <select className={inputCls} value={value || ""} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#111]">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ToggleField({ label, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2.5 text-left"
      aria-pressed={!!checked}
    >
      <span
        className={`relative w-9 h-5 rounded-full transition-colors ${
          checked ? "bg-[#ff5833]" : "bg-white/15"
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-[18px]" : "translate-x-0.5"
          }`}
        />
      </span>
      <span className="text-xs text-white/70">{label}</span>
    </button>
  );
}

export function TagsField({ label, value = [], onChange, placeholder = "Afrobeats, Afrohouse" }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <input
        className={inputCls}
        value={(value || []).join(", ")}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(
            e.target.value
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          )
        }
      />
      <span className="block text-[10px] text-white/25 mt-1">Separa las etiquetas con comas.</span>
    </label>
  );
}

export function ImageField({ label, value = "", onChange, hint }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const res = await base44.integrations.Core.UploadPublicFile({ file });
      const url = res?.file_url || res?.data?.file_url;
      if (url) onChange(url);
    } catch (e) {
      setError("No se pudo subir el archivo.");
    } finally {
      setUploading(false);
    }
  };

  const isVideo = /\.(mp4|webm|mov|m4v)(\?|$)/i.test(value || "");

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-3 items-start">
        <div className="w-20 h-20 rounded-lg border border-white/10 bg-black/40 overflow-hidden flex-shrink-0 grid place-items-center">
          {value ? (
            isVideo ? (
              <video src={value} className="w-full h-full object-cover" muted />
            ) : (
              <img src={value} alt="" className="w-full h-full object-cover" />
            )
          ) : (
            <span className="text-[9px] text-white/25">vacío</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex gap-2">
            <input
              className={inputCls}
              value={value || ""}
              placeholder="https://…"
              onChange={(e) => onChange(e.target.value)}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="px-3 rounded-lg border border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.09] flex items-center gap-1.5 text-[11px] font-semibold flex-shrink-0 disabled:opacity-40"
            >
              {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
              Subir
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="px-2 rounded-lg border border-white/10 text-white/40 hover:text-white flex-shrink-0"
                aria-label="Quitar"
              >
                <X size={12} />
              </button>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => upload(e.target.files?.[0])}
          />
          {(hint || error) && (
            <span className="block text-[10px] mt-1 text-white/25">{error || hint}</span>
          )}
        </div>
      </div>
    </div>
  );
}