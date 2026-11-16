import React, { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Upload, Loader2, Trash2, ArrowUp, ArrowDown } from "lucide-react";

export default function BrandLogosEditor() {
  const queryClient = useQueryClient();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: cfg } = useQuery({
    queryKey: ["landingConfig"],
    queryFn: async () => {
      const list = await base44.entities.LandingConfig.list();
      return list[0] || null;
    },
  });

  const logos = cfg?.brand_logos || [];

  const save = async (next) => {
    if (!cfg) return;
    setSaving(true);
    try {
      await base44.entities.LandingConfig.update(cfg.id, { brand_logos: next });
      await queryClient.invalidateQueries({ queryKey: ["landingConfig"] });
    } finally {
      setSaving(false);
    }
  };

  const add = (url) => {
    if (!url) return;
    save([...logos, url]);
  };

  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await base44.integrations.Core.UploadPublicFile({ file });
      add(res?.file_url || res?.data?.file_url);
    } finally {
      setUploading(false);
    }
  };

  const move = (idx, dir) => {
    const target = idx + dir;
    if (target < 0 || target >= logos.length) return;
    const next = logos.slice();
    const [it] = next.splice(idx, 1);
    next.splice(target, 0, it);
    save(next);
  };

  if (!cfg) {
    return <p className="text-[11px] text-white/30">Cargando logos…</p>;
  }

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-white/30">
        Se comparten con /start: un cambio aquí se aplica a las dos páginas al instante.
      </p>

      {logos.map((logo, idx) => (
        <div key={`${logo}-${idx}`} className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-2 py-1.5">
          <img src={logo} alt="" className="w-14 h-8 object-contain opacity-70" />
          <span className="flex-1 text-[10px] text-white/30 truncate">{logo.split("/").pop()}</span>
          <button type="button" onClick={() => move(idx, -1)} className="p-1 text-white/30 hover:text-white" aria-label="Subir">
            <ArrowUp size={12} />
          </button>
          <button type="button" onClick={() => move(idx, 1)} className="p-1 text-white/30 hover:text-white" aria-label="Bajar">
            <ArrowDown size={12} />
          </button>
          <button
            type="button"
            onClick={() => save(logos.filter((_, i) => i !== idx))}
            className="p-1 text-white/30 hover:text-red-400"
            aria-label="Eliminar"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ))}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading || saving}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 bg-white/[0.04] text-[11px] font-semibold text-white/70 hover:bg-white/[0.09] disabled:opacity-40"
        >
          {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
          Añadir logo
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => upload(e.target.files?.[0])}
        />
      </div>
    </div>
  );
}