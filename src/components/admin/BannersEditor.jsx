import React, { useState, useEffect } from "react";
import { Upload, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const BANNERS = [
  { key: "hero_banner_1_image", label: "Banner 1 — Muse Club" },
  { key: "hero_banner_2_image", label: "Banner 2 — La Nueva Corriente" },
  { key: "hero_banner_3_image", label: "Banner 3 — Friends & Family" },
];

function isVideoUrl(url) {
  if (!url) return false;
  // Check extension before query string, or common video content-type patterns
  return /\.(mp4|webm|mov|quicktime)(\?|#|$)/i.test(url) ||
    url.includes("video/") ||
    /video/i.test(url.split("?")[0].split("/").pop());
}

function BannerItem({ bannerKey, label, initialUrl, onSave }) {
  const [url, setUrl] = useState(initialUrl || "");
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Only sync from parent on mount or when initialUrl changes from empty to a real value
  useEffect(() => {
    if (initialUrl && !url) {
      setUrl(initialUrl);
    }
  }, [initialUrl]);

  const isVideo = isVideoUrl(url);

  const handleSave = async (newUrl) => {
    setUrl(newUrl);
    await onSave(bannerKey, newUrl);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleUpload = async (file, isVideoFile) => {
    if (!file) return;
    if (isVideoFile && file.size > 30 * 1024 * 1024) {
      alert("El video no puede superar los 30 MB.");
      return;
    }
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await handleSave(file_url);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    await handleSave("");
  };

  return (
    <div className="mb-6 p-3 bg-white/[0.03] rounded-xl border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm text-gray-400 font-medium">{label}</label>
        {saved && <span className="text-xs text-emerald-400 font-medium">✓ Guardado</span>}
      </div>

      {/* Preview */}
      {url && (
        <div className="mb-3 relative rounded-xl overflow-hidden border border-white/10" style={{ height: 120 }}>
          {isVideo ? (
            <video
              key={url}
              src={url}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <img src={url} alt={label} className="w-full h-full object-cover" />
          )}
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-black/70 text-white/80">
            {isVideo ? "VIDEO" : "IMAGEN"}
          </div>
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* URL input — no actualiza en cada keystroke, solo al perder foco */}
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onBlur={() => { if (url !== initialUrl) handleSave(url); }}
        placeholder="URL de imagen o video..."
        className="w-full px-3 py-2 bg-white/5 rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500 mb-2"
      />

      {/* Upload buttons */}
      <div className="flex gap-2">
        <label className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-white/20 cursor-pointer transition-all text-sm ${uploading ? "opacity-50 pointer-events-none" : "bg-white/5 hover:bg-white/10 text-white"}`}>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleUpload(e.target.files?.[0], false)}
          />
          <Upload className="w-4 h-4 text-emerald-400" />
          {uploading ? "Subiendo..." : "Subir imagen"}
        </label>
        <label className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-purple-500/30 cursor-pointer transition-all text-sm ${uploading ? "opacity-50 pointer-events-none" : "bg-purple-500/5 hover:bg-purple-500/10 text-purple-300"}`}>
          <input
            type="file"
            accept="video/mp4,video/webm,video/mov,video/quicktime"
            className="hidden"
            onChange={(e) => handleUpload(e.target.files?.[0], true)}
          />
          <Upload className="w-4 h-4 text-purple-400" />
          {uploading ? "Subiendo..." : "Subir video (30MB)"}
        </label>
      </div>
    </div>
  );
}

export default function BannersEditor({ config, onSave }) {
  return (
    <div>
      <p className="text-xs text-white/40 mb-4">
        Sube imagen o video corto (máx. 30 MB) para cada banner. Los videos se reproducen en loop automáticamente.
      </p>
      {BANNERS.map((banner) => (
        <BannerItem
          key={banner.key}
          bannerKey={banner.key}
          label={banner.label}
          initialUrl={config?.[banner.key] || ""}
          onSave={onSave}
        />
      ))}
    </div>
  );
}