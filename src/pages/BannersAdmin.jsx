import React, { useState, useEffect, useRef } from "react";
import { Upload, Trash2, CheckCircle, AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";

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

function BannerCard({ bannerDef, configId, savedUrl, onUpdated }) {
  const [url, setUrl] = useState(savedUrl || "");
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null); // null | "saving" | "ok" | "error"
  const fileInputImg = useRef();
  const fileInputVid = useRef();

  // Sync ONLY when parent has a new value from server and local is still empty
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      setUrl(savedUrl || "");
    }
  }, []);

  const isVideo = isVideoUrl(url);

  const persist = async (newUrl) => {
    setStatus("saving");
    try {
      await base44.entities.LandingConfig.update(configId, { [bannerDef.key]: newUrl });
      setUrl(newUrl);
      setStatus("ok");
      onUpdated(bannerDef.key, newUrl);
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
      // Reset file inputs so same file can be re-selected
      if (fileInputImg.current) fileInputImg.current.value = "";
      if (fileInputVid.current) fileInputVid.current.value = "";
    }
  };

  const handleRemove = () => persist("");

  const handleUrlBlur = () => {
    if (url !== savedUrl) persist(url);
  };

  return (
    <div className="bg-[#111113] rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <div>
          <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{bannerDef.label}</span>
          <h3 className="text-base font-bold text-white mt-0.5">{bannerDef.subtitle}</h3>
        </div>
        <div className="flex items-center gap-2">
          {status === "saving" && (
            <span className="flex items-center gap-1.5 text-xs text-amber-400">
              <div className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              Guardando...
            </span>
          )}
          {status === "ok" && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5" /> Guardado
            </span>
          )}
          {status === "error" && (
            <span className="flex items-center gap-1.5 text-xs text-red-400">
              <AlertCircle className="w-3.5 h-3.5" /> Error
            </span>
          )}
          {url && (
            <button
              onClick={handleRemove}
              disabled={!!uploading || status === "saving"}
              className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-40"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="relative bg-black/40" style={{ height: 180 }}>
        {url ? (
          isVideo ? (
            <video
              key={url}
              src={url}
              autoPlay muted loop playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img src={url} alt={bannerDef.subtitle} className="w-full h-full object-cover" />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-white/20 text-sm">Sin media — sube una imagen o video</p>
          </div>
        )}
        {url && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-bold text-white/70 uppercase tracking-wider">
            {isVideo ? "Video" : "Imagen"}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-5 space-y-3">
        {/* URL manual */}
        <div>
          <label className="text-xs text-white/40 mb-1.5 block">URL directa (opcional)</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onBlur={handleUrlBlur}
            placeholder="https://..."
            className="w-full px-3 py-2 bg-white/5 rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Upload buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={uploading || status === "saving"}
            onClick={() => fileInputImg.current?.click()}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/20 bg-white/5 hover:bg-white/10 text-white text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            {uploading ? "Subiendo..." : "Imagen"}
          </button>
          <button
            type="button"
            disabled={uploading || status === "saving"}
            onClick={() => fileInputVid.current?.click()}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 text-purple-300 text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4 text-purple-400 flex-shrink-0" />
            {uploading ? "Subiendo..." : "Video (30MB)"}
          </button>
        </div>

        {/* Hidden inputs */}
        <input
          ref={fileInputImg}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files?.[0], false)}
        />
        <input
          ref={fileInputVid}
          type="file"
          accept="video/mp4,video/webm,video/mov,video/quicktime"
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files?.[0], true)}
        />
      </div>
    </div>
  );
}

export default function BannersAdmin() {
  const [configId, setConfigId] = useState(null);
  const [bannerUrls, setBannerUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      const configs = await base44.entities.LandingConfig.list();
      if (configs.length === 0) {
        setError("No existe configuración de landing. Ve al Landing Editor primero.");
        return;
      }
      const cfg = configs[0];
      setConfigId(cfg.id);
      setBannerUrls({
        hero_banner_1_image: cfg.hero_banner_1_image || "",
        hero_banner_2_image: cfg.hero_banner_2_image || "",
        hero_banner_3_image: cfg.hero_banner_3_image || "",
      });
    } catch (e) {
      setError("Error al cargar la configuración: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleUpdated = (key, newUrl) => {
    setBannerUrls((prev) => ({ ...prev, [key]: newUrl }));
  };

  return (
    <AdminLayout activePage="LandingEditor">
      <div className="min-h-screen bg-[#0a0a0b] p-4 sm:p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link
                  to="/LandingEditor"
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Banners de Portada</h1>
              </div>
              <p className="text-sm text-white/40 ml-11">
                Sube imagen o video para cada banner. Los cambios se guardan automáticamente en la base de datos.
              </p>
            </div>
            <button
              onClick={loadConfig}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm transition-colors disabled:opacity-40"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Recargar
            </button>
          </div>

          {/* States */}
          {loading && (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 mb-6">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && configId && (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {BANNERS.map((banner) => (
                  <BannerCard
                    key={banner.key}
                    bannerDef={banner}
                    configId={configId}
                    savedUrl={bannerUrls[banner.key]}
                    onUpdated={handleUpdated}
                  />
                ))}
              </div>

              <div className="mt-8 p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                <p className="text-xs text-white/30 text-center">
                  Los cambios se guardan automáticamente al subir un archivo o al confirmar la URL.
                  La landing page se actualiza al recargar.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}