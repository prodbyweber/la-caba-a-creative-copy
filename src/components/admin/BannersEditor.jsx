import React, { useState, useRef, useEffect } from "react";
import { Upload, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

const BANNERS = [
  { key: "hero_banner_1_image", label: "Banner 1", subtitle: "Muse Club" },
  { key: "hero_banner_2_image", label: "Banner 2", subtitle: "La Nueva Corriente" },
  { key: "hero_banner_3_image", label: "Banner 3", subtitle: "Friends & Family" },
];

function isVideoUrl(url) {
  if (!url) return false;
  const cleanUrl = url.split("?")[0].toLowerCase();
  return cleanUrl.endsWith(".mp4") || cleanUrl.endsWith(".webm") || cleanUrl.endsWith(".mov");
}

function BannerCard({ bannerDef, configId, savedUrl }) {
  const [url, setUrl] = useState(savedUrl || "");
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null); // null | "saving" | "ok" | "error"
  const fileInputImg = useRef();
  const fileInputVid = useRef();
  // Track the last savedUrl we initialized from, to avoid resetting user edits
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current && savedUrl !== undefined) {
      initializedRef.current = true;
      setUrl(savedUrl || "");
    }
  }, [savedUrl]);

  const isVideo = isVideoUrl(url);

  const persist = async (newUrl) => {
    if (!configId) return;
    setStatus("saving");
    try {
      await base44.entities.LandingConfig.update(configId, { [bannerDef.key]: newUrl });
      setUrl(newUrl);
      setStatus("ok");
      setTimeout(() => setStatus(null), 2500);
    } catch (e) {
      setStatus("error");
      console.error("Error guardando banner:", e);
    }
  };

  const handleFileUpload = async (file, isVid) => {
    if (!file) return;
    if (isVid && file.size > 30 * 1024 * 1024) {
      alert("El video no puede superar los 30 MB.");
      return;
    }
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await persist(file_url);
    } catch (e) {
      setStatus("error");
      alert("Error al subir el archivo: " + e.message);
    } finally {
      setUploading(false);
      if (fileInputImg.current) fileInputImg.current.value = "";
      if (fileInputVid.current) fileInputVid.current.value = "";
    }
  };

  const handleRemove = () => persist("");
  const handleUrlBlur = () => { if (url !== savedUrl) persist(url); };

  return (
    <div className="mb-5 bg-white/[0.03] rounded-xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div>
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{bannerDef.label}</span>
          <p className="text-sm font-semibold text-white mt-0.5">{bannerDef.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {status === "saving" && (
            <span className="flex items-center gap-1 text-xs text-amber-400">
              <div className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              Guardando...
            </span>
          )}
          {status === "ok" && (
            <span className="flex items-center gap-1 text-xs text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5" /> Guardado
            </span>
          )}
          {status === "error" && (
            <span className="flex items-center gap-1 text-xs text-red-400">
              <AlertCircle className="w-3.5 h-3.5" /> Error
            </span>
          )}
          {url && (
            <button
              onClick={handleRemove}
              disabled={!!uploading || status === "saving"}
              className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="relative bg-black/40" style={{ height: 120 }}>
        {url ? (
          isVideo ? (
            <video key={url} src={url} autoPlay muted loop playsInline className="w-full h-full object-cover" />
          ) : (
            <img src={url} alt={bannerDef.subtitle} className="w-full h-full object-cover" />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-white/20 text-xs">Sin media</p>
          </div>
        )}
        {url && (
          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-bold text-white/70 uppercase tracking-wider">
            {isVideo ? "Video" : "Imagen"}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 space-y-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={handleUrlBlur}
          placeholder="URL directa (opcional)..."
          className="w-full px-3 py-2 bg-white/5 rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
        />
        <div className="grid grid-cols-2 gap-2">
          <label className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-dashed border-white/20 text-sm cursor-pointer transition-all ${uploading || status === "saving" ? "opacity-40 pointer-events-none" : "bg-white/5 hover:bg-white/10 text-white"}`}>
            <input ref={fileInputImg} type="file" accept="image/*" className="hidden"
              onChange={(e) => handleFileUpload(e.target.files?.[0], false)} />
            <Upload className="w-4 h-4 text-emerald-400" />
            {uploading ? "Subiendo..." : "Imagen"}
          </label>
          <label className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-dashed border-purple-500/30 text-sm cursor-pointer transition-all ${uploading || status === "saving" ? "opacity-40 pointer-events-none" : "bg-purple-500/5 hover:bg-purple-500/10 text-purple-300"}`}>
            <input ref={fileInputVid} type="file" accept="video/mp4,video/webm,video/mov,video/quicktime" className="hidden"
              onChange={(e) => handleFileUpload(e.target.files?.[0], true)} />
            <Upload className="w-4 h-4 text-purple-400" />
            {uploading ? "Subiendo..." : "Video (30MB)"}
          </label>
        </div>
      </div>
    </div>
  );
}

export default function BannersEditor({ configId, config }) {
  return (
    <div>
      <p className="text-xs text-white/40 mb-4">
        Sube imagen o video (máx. 30 MB) para cada banner. Se guardan directamente en la base de datos.
      </p>
      {BANNERS.map((banner) => (
        <BannerCard
          key={banner.key}
          bannerDef={banner}
          configId={configId}
          savedUrl={config?.[banner.key] || ""}
        />
      ))}
    </div>
  );
}