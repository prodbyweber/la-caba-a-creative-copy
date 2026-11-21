import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Upload, Trash2, ChevronUp, ChevronDown, Save, Check } from "lucide-react";

/** Editor de los logos de marcas (LandingConfig.brand_logos). */
export default function BrandsPanel() {
  const [record, setRecord] = useState(null);
  const [logos, setLogos] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      const list = await base44.entities.LandingConfig.list("-created_date", 1);
      const cfg = list[0] || null;
      setRecord(cfg);
      setLogos(Array.isArray(cfg?.brand_logos) ? cfg.brand_logos : []);
      setLoaded(true);
    };
    load();
  }, []);

  const upload = async (file) => {
    if (!file) return;
    setBusy(true);
    try {
      const res = await base44.integrations.Core.UploadPublicFile({ file });
      const url = res?.file_url || res?.data?.file_url;
      if (url) setLogos((prev) => [...prev, url]);
    } finally {
      setBusy(false);
    }
  };

  const move = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= logos.length) return;
    const next = [...logos];
    [next[index], next[target]] = [next[target], next[index]];
    setLogos(next);
  };

  const remove = (index) => setLogos((prev) => prev.filter((_, i) => i !== index));

  const save = async () => {
    setBusy(true);
    setNotice("");
    try {
      if (record?.id) {
        await base44.entities.LandingConfig.update(record.id, { brand_logos: logos });
      } else {
        const created = await base44.entities.LandingConfig.create({ brand_logos: logos });
        setRecord(created);
      }
      setNotice("Guardado");
    } finally {
      setBusy(false);
    }
  };

  if (!loaded) {
    return (
      <div className="grid place-items-center py-16">
        <Loader2 className="w-5 h-5 animate-spin text-white/30" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <p className="text-[11px] text-white/30 mb-4">
        Logos de las marcas con las que habéis colaborado. Se muestran en blanco y negro y recuperan el
        color al pasar por encima.
      </p>

      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 text-[11px] font-semibold text-white/70 hover:bg-white/[0.06] disabled:opacity-40"
        >
          {busy ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />} Subir logo
        </button>
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#ff5833] text-[11px] font-bold text-white disabled:opacity-50"
        >
          <Save size={12} /> Guardar
        </button>
        {notice && (
          <span className="flex items-center gap-1 text-[11px] text-emerald-300">
            <Check size={12} /> {notice}
          </span>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => upload(e.target.files?.[0])}
        />
      </div>

      <div className="grid gap-2">
        {logos.map((url, index) => (
          <div
            key={`${url}-${index}`}
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
            <div className="h-10 w-16 rounded-lg bg-white grid place-items-center overflow-hidden">
              <img src={url} alt="" className="max-h-full max-w-full object-contain" />
            </div>
            <span className="flex-1 min-w-0 text-[10.5px] text-white/30 truncate">{url}</span>
            <button
              type="button"
              onClick={() => remove(index)}
              className="p-1.5 rounded-lg text-white/40 hover:text-red-400"
              aria-label="Eliminar"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}

        {logos.length === 0 && (
          <p className="text-[12px] text-white/30 py-6 text-center">Todavía no hay logos subidos.</p>
        )}
      </div>
    </div>
  );
}