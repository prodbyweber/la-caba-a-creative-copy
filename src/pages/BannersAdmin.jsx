import React, { useState, useEffect, useRef } from "react";
import { Upload, Trash2, CheckCircle, AlertCircle, ArrowLeft, RefreshCw, Smartphone } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";

const BANNERS = [
  { key: "hero_banner_1_image", mobileKey: "hero_banner_1_mobile_position", label: "Banner 1", subtitle: "Muse Club" },
  { key: "hero_banner_2_image", mobileKey: "hero_banner_2_mobile_position", label: "Banner 2", subtitle: "La Nueva Corriente" },
  { key: "hero_banner_3_image", mobileKey: "hero_banner_3_mobile_position", label: "Banner 3", subtitle: "Friends & Family" },
];

// Presets de posición para mobile
const POSITION_PRESETS = [
  { label: "Centro", value: "center center" },
  { label: "Arriba centro", value: "center top" },
  { label: "Abajo centro", value: "center bottom" },
  { label: "Izq. centro", value: "left center" },
  { label: "Der. centro", value: "right center" },
  { label: "Izq. arriba", value: "left top" },
  { label: "Der. arriba", value: "right top" },
  { label: "Izq. abajo", value: "left bottom" },
  { label: "Der. abajo", value: "right bottom" },
];

function isVideoUrl(url) {
  if (!url) return false;
  const cleanUrl = url.split("?")[0].toLowerCase();
  return cleanUrl.endsWith(".mp4") || cleanUrl.endsWith(".webm") || cleanUrl.endsWith(".mov");
}

function BannerCard({ bannerDef, configId, savedUrl, savedMobilePosition, onUpdated }) {
  const [url, setUrl] = useState(savedUrl || "");
  const [mobilePosition, setMobilePosition] = useState(savedMobilePosition || "center center");
  const [customX, setCustomX] = useState("50");
  const [customY, setCustomY] = useState("50");
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null);
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  const fileInputImg = useRef();
  const fileInputVid = useRef();
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      setUrl(savedUrl || "");
      setMobilePosition(savedMobilePosition || "center center");
    }
  }, []);

  const isVideo = isVideoUrl(url);

  const persist = async (fields) => {
    if (!configId) return;
    setStatus("saving");
    try {
      await base44.entities.LandingConfig.update(configId, fields);
      setStatus("ok");
      onUpdated(fields);
      setTimeout(() => setStatus(null), 2500);
    } catch (e) {
      setStatus("error");
      console.error("Error guardando:", e);
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
      setUrl(file_url);
      await persist({ [bannerDef.key]: file_url });
    } catch (e) {
      setStatus("error");
      alert("Error al subir el archivo: " + e.message);
    } finally {
      setUploading(false);
      if (fileInputImg.current) fileInputImg.current.value = "";
      if (fileInputVid.current) fileInputVid.current.value = "";
    }
  };

  const handleRemove = () => {
    setUrl("");
    persist({ [bannerDef.key]: "" });
  };

  const handleUrlBlur = () => {
    if (url !== savedUrl) persist({ [bannerDef.key]: url });
  };

  const applyMobilePosition = (pos) => {
    setMobilePosition(pos);
    persist({ [bannerDef.mobileKey]: pos });
  };

  const applyCustomPosition = () => {
    const pos = `${customX}% ${customY}%`;
    applyMobilePosition(pos);
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

      {/* Preview desktop */}
      <div className="relative bg-black/40" style={{ height: 180 }}>
        {url ? (
          isVideo ? (
            <video key={url} src={url} autoPlay muted loop playsInline className="w-full h-full object-cover" />
          ) : (
            <img src={url} alt={bannerDef.subtitle} className="w-full h-full object-cover" style={{ objectPosition: "center center" }} />
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
        {/* URL */}
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
        <input ref={fileInputImg} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e.target.files?.[0], false)} />
        <input ref={fileInputVid} type="file" accept="video/mp4,video/webm,video/mov,video/quicktime" className="hidden" onChange={(e) => handleFileUpload(e.target.files?.[0], true)} />

        {/* Mobile position toggle */}
        {url && !isVideo && (
          <button
            onClick={() => setShowMobilePanel(!showMobilePanel)}
            className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border text-sm transition-all ${
              showMobilePanel
                ? "border-blue-500/40 bg-blue-500/10 text-blue-300"
                : "border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              <span>Ajuste Mobile</span>
            </div>
            <span className="text-xs text-white/30 font-mono">{mobilePosition}</span>
          </button>
        )}
      </div>

      {/* Mobile position panel */}
      {showMobilePanel && url && !isVideo && (
        <div className="border-t border-white/[0.06] p-5 space-y-4 bg-blue-500/[0.03]">
          <p className="text-xs text-white/40">
            Ajusta el punto focal de la imagen en <span className="text-blue-400">versión móvil</span> (pantalla vertical).
          </p>

          {/* Mobile preview — 9:16 aspect */}
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0">
              <p className="text-[10px] text-white/30 mb-1.5 uppercase tracking-widest">Vista mobile</p>
              <div
                className="relative overflow-hidden rounded-xl border border-white/10 bg-black"
                style={{ width: 90, height: 160 }}
              >
                <img
                  src={url}
                  alt="mobile preview"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: mobilePosition }}
                />
                {/* Phone notch */}
                <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-black/60 rounded-full" />
              </div>
              <p className="text-[9px] text-white/20 mt-1 text-center font-mono">{mobilePosition}</p>
            </div>

            <div className="flex-1 space-y-3">
              {/* Presets grid */}
              <div>
                <p className="text-[10px] text-white/30 mb-2 uppercase tracking-widest">Presets</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {POSITION_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => applyMobilePosition(preset.value)}
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-medium transition-all text-center leading-tight ${
                        mobilePosition === preset.value
                          ? "bg-blue-500/30 border border-blue-500/50 text-blue-300"
                          : "bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom XY sliders */}
              <div>
                <p className="text-[10px] text-white/30 mb-2 uppercase tracking-widest">Posición exacta (%)</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/30 w-4">X</span>
                    <input
                      type="range" min="0" max="100" value={customX}
                      onChange={(e) => setCustomX(e.target.value)}
                      className="flex-1 accent-blue-500 cursor-pointer"
                    />
                    <span className="text-[10px] text-white/50 font-mono w-7 text-right">{customX}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/30 w-4">Y</span>
                    <input
                      type="range" min="0" max="100" value={customY}
                      onChange={(e) => setCustomY(e.target.value)}
                      className="flex-1 accent-blue-500 cursor-pointer"
                    />
                    <span className="text-[10px] text-white/50 font-mono w-7 text-right">{customY}%</span>
                  </div>
                  <button
                    onClick={applyCustomPosition}
                    className="w-full py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-medium transition-colors border border-blue-500/20"
                  >
                    Aplicar posición exacta
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BannersAdmin() {
  const [configId, setConfigId] = useState(null);
  const [bannerData, setBannerData] = useState({});
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
      setBannerData({
        hero_banner_1_image: cfg.hero_banner_1_image || "",
        hero_banner_1_mobile_position: cfg.hero_banner_1_mobile_position || "center center",
        hero_banner_2_image: cfg.hero_banner_2_image || "",
        hero_banner_2_mobile_position: cfg.hero_banner_2_mobile_position || "center center",
        hero_banner_3_image: cfg.hero_banner_3_image || "",
        hero_banner_3_mobile_position: cfg.hero_banner_3_mobile_position || "center center",
      });
    } catch (e) {
      setError("Error al cargar la configuración: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadConfig(); }, []);

  const handleUpdated = (fields) => {
    setBannerData((prev) => ({ ...prev, ...fields }));
  };

  return (
    <AdminLayout activePage="LandingEditor">
      <div className="min-h-screen bg-[#0a0a0b] p-4 sm:p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link to="/LandingEditor" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Banners de Portada</h1>
              </div>
              <p className="text-sm text-white/40 ml-11">
                Sube imagen o video y ajusta la miniatura móvil de cada banner.
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
                    savedUrl={bannerData[banner.key]}
                    savedMobilePosition={bannerData[banner.mobileKey]}
                    onUpdated={handleUpdated}
                  />
                ))}
              </div>

              <div className="mt-8 p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                <p className="text-xs text-white/30 text-center">
                  Los cambios se guardan automáticamente. El ajuste mobile solo afecta la posición en pantallas pequeñas.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}