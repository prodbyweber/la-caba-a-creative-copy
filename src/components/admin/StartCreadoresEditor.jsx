import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Upload, GripVertical, Loader2, Save, ArrowUp, ArrowDown } from "lucide-react";

const iClass = "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500/60 placeholder-white/20 transition-colors";
const labelClass = "block text-[10px] font-bold text-white/35 uppercase tracking-wider mb-1";

function isVideo(url) {
  return url && /\.(mp4|webm|mov)(\?|$)/i.test(url);
}

export default function StartCreadoresEditor() {
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  const { data: cfg, isLoading } = useQuery({
    queryKey: ["landingConfig"],
    queryFn: async () => { const c = await base44.entities.LandingConfig.list(); return c[0] || null; },
    staleTime: 30000,
  });

  const defaultSlides = cfg ? [
    { url: cfg.hero_banner_1_image || "" },
    { url: cfg.hero_banner_2_image || "" },
    { url: cfg.hero_banner_3_image || "" },
  ].filter(s => s.url) : [];

  const [slides, setSlides] = useState(null);
  const [services, setServices] = useState(null);

  React.useEffect(() => {
    if (cfg && slides === null) {
      setSlides(cfg.creadores_slides?.length ? [...cfg.creadores_slides] : defaultSlides);
    }
    if (cfg && services === null) {
      setServices(cfg.creadores_services || [
        "Producción musical",
        "Producción audiovisual",
        "Estrategia de marca",
        "Fotografía editorial",
      ]);
    }
  }, [cfg]);

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.LandingConfig.update(cfg.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["landingConfig"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const handleSave = () => {
    mutation.mutate({ creadores_slides: slides, creadores_services: services });
  };

  const uploadFile = async (file) => {
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return file_url;
    } finally {
      setUploading(false);
    }
  };

  const moveSlide = (idx, dir) => {
    const next = [...slides];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setSlides(next);
  };

  const updateSlideUrl = (idx, url) => {
    const next = [...slides];
    next[idx] = { ...next[idx], url };
    setSlides(next);
  };

  const removeSlide = (idx) => setSlides(slides.filter((_, i) => i !== idx));

  const addSlide = () => setSlides([...slides, { url: "" }]);

  const updateService = (idx, val) => {
    const next = [...services];
    next[idx] = val;
    setServices(next);
  };

  const removeService = (idx) => setServices(services.filter((_, i) => i !== idx));

  if (isLoading || slides === null || services === null) {
    return <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 text-white/30 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-orange-500/[0.06] border border-orange-500/20">
        <div>
          <p className="text-sm font-semibold text-white">Sección Creadores</p>
          <p className="text-xs text-white/40">Carrusel de imágenes/videos + servicios</p>
        </div>
        <button
          onClick={handleSave}
          disabled={mutation.isPending}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-colors disabled:opacity-50"
        >
          {mutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          {saved ? "¡Guardado!" : "Guardar"}
        </button>
      </div>

      {/* SLIDES */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-white/50 uppercase tracking-wider">Diapositivas del carrusel</p>
          <button
            onClick={addSlide}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs transition-colors border border-white/10"
          >
            <Plus className="w-3.5 h-3.5" /> Añadir
          </button>
        </div>

        <div className="space-y-3">
          {slides.map((slide, idx) => {
            const url = typeof slide === "string" ? slide : slide?.url || "";
            return (
              <div key={idx} className="flex gap-2 items-start bg-white/[0.03] rounded-xl border border-white/[0.06] p-3">
                {/* Preview */}
                <div className="flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden bg-white/5 border border-white/10">
                  {url && isVideo(url) ? (
                    <video src={url} className="w-full h-full object-cover" muted playsInline />
                  ) : url ? (
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20 text-[9px]">Sin media</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <label className={labelClass}>URL de imagen o video</label>
                  <input
                    value={url}
                    onChange={e => updateSlideUrl(idx, e.target.value)}
                    className={iClass}
                    placeholder="https://..."
                  />
                  {/* Upload */}
                  <label className="mt-2 flex items-center gap-1.5 w-fit cursor-pointer text-xs text-orange-400 hover:text-orange-300 transition-colors">
                    <input
                      type="file"
                      accept="image/*,video/mp4,video/webm,video/mov,video/quicktime"
                      className="hidden"
                      onChange={async e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const fileUrl = await uploadFile(file);
                        updateSlideUrl(idx, fileUrl);
                      }}
                    />
                    <Upload className="w-3 h-3" />
                    {uploading ? "Subiendo..." : "Subir archivo"}
                  </label>
                </div>

                {/* Controls */}
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button onClick={() => moveSlide(idx, -1)} disabled={idx === 0}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white disabled:opacity-20 transition-colors">
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => moveSlide(idx, 1)} disabled={idx === slides.length - 1}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white disabled:opacity-20 transition-colors">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => removeSlide(idx)}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-[10px] text-white/20 mt-2">El carrusel rota automáticamente cada ~4.5 s. Soporta imágenes (JPG, PNG, WebP) y videos (MP4, WebM, MOV).</p>
      </div>

      {/* SERVICES */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-white/50 uppercase tracking-wider">Servicios listados</p>
          <button
            onClick={() => setServices([...services, ""])}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs transition-colors border border-white/10"
          >
            <Plus className="w-3.5 h-3.5" /> Añadir
          </button>
        </div>
        <div className="space-y-2">
          {services.map((svc, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                value={svc}
                onChange={e => updateService(idx, e.target.value)}
                className={iClass}
                placeholder="Nombre del servicio..."
              />
              <button onClick={() => removeService(idx)}
                className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors flex-shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Rotating words info */}
      <div className="p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">Palabras rotativas (fijas)</p>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {["artistas", "modelos", "actores", "creadoras", "creadores"].map(w => (
            <span key={w} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/50">{w}</span>
          ))}
        </div>
        <p className="text-[10px] text-white/20 mt-2">Las palabras se muestran de forma animada cuando el usuario está en esta sección. El menú siempre muestra "Creadores".</p>
      </div>

      {/* Save bottom */}
      <div className="flex justify-end pt-1">
        <button
          onClick={handleSave}
          disabled={mutation.isPending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition-colors disabled:opacity-50"
        >
          {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saved ? "¡Guardado!" : "Guardar sección Creadores"}
        </button>
      </div>
    </div>
  );
}