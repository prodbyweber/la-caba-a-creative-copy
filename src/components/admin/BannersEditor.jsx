import React, { useState, useRef, useEffect, useCallback } from "react";
import { Upload, Trash2, CheckCircle, AlertCircle, Move } from "lucide-react";
import { base44 } from "@/api/base44Client";

const BANNERS = [
  { key: "hero_banner_1_image", label: "Banner 1", subtitle: "Muse Club", ctaTextKey: "hero_banner_1_cta_text", ctaLinkKey: "hero_banner_1_cta_link", mobilePositionKey: "hero_banner_1_mobile_position", desktopPositionKey: "hero_banner_1_desktop_position", defaultCta: "Explore" },
  { key: "hero_banner_2_image", label: "Banner 2", subtitle: "La Nueva Corriente", ctaTextKey: "hero_banner_2_cta_text", ctaLinkKey: "hero_banner_2_cta_link", mobilePositionKey: "hero_banner_2_mobile_position", desktopPositionKey: "hero_banner_2_desktop_position", defaultCta: "Descubrir" },
  { key: "hero_banner_3_image", label: "Banner 3", subtitle: "Friends & Family", ctaTextKey: "hero_banner_3_cta_text", ctaLinkKey: "hero_banner_3_cta_link", mobilePositionKey: "hero_banner_3_mobile_position", desktopPositionKey: "hero_banner_3_desktop_position", defaultCta: "Ver todo" },
];

function isVideoUrl(url) {
  if (!url) return false;
  const cleanUrl = url.split("?")[0].toLowerCase();
  return cleanUrl.endsWith(".mp4") || cleanUrl.endsWith(".webm") || cleanUrl.endsWith(".mov");
}

function BannerCard({ bannerDef, configId, savedUrl, savedCtaText, savedCtaLink, savedMobilePosition, savedDesktopPosition }) {
  const [url, setUrl] = useState(savedUrl || "");
  const [ctaText, setCtaText] = useState(savedCtaText || "");
  const [ctaLink, setCtaLink] = useState(savedCtaLink || "");
  const [mobilePosition, setMobilePosition] = useState(savedMobilePosition || "center center");
  const [desktopPosition, setDesktopPosition] = useState(savedDesktopPosition || "center center");
  const [isDragging, setIsDragging] = useState(false);
  const previewRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null); // null | "saving" | "ok" | "error"
  const fileInputImg = useRef();
  const fileInputVid = useRef();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current && savedUrl !== undefined) {
      initializedRef.current = true;
      setUrl(savedUrl || "");
      setCtaText(savedCtaText || "");
      setCtaLink(savedCtaLink || "");
      setMobilePosition(savedMobilePosition || "center center");
      setDesktopPosition(savedDesktopPosition || "center center");
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

  const persistCta = async (key, value) => {
    if (!configId) return;
    setStatus("saving");
    try {
      await base44.entities.LandingConfig.update(configId, { [key]: value });
      setStatus("ok");
      setTimeout(() => setStatus(null), 2500);
    } catch (e) {
      setStatus("error");
    }
  };

  const persistPosition = async (key, value) => {
    if (!configId) return;
    try {
      await base44.entities.LandingConfig.update(configId, { [key]: value });
    } catch (e) {
      console.error("Error al guardar posición:", e);
    }
  };

  const handleRemove = () => persist("");
  const handleUrlBlur = () => { if (url !== savedUrl) persist(url); };
  const handleCtaTextBlur = () => { if (ctaText !== savedCtaText) persistCta(bannerDef.ctaTextKey, ctaText); };
  const handleCtaLinkBlur = () => { if (ctaLink !== savedCtaLink) persistCta(bannerDef.ctaLinkKey, ctaLink); };
  const handleMobilePositionChange = (e) => { setMobilePosition(e.target.value); persistPosition(bannerDef.mobilePositionKey, e.target.value); };
  const handleDesktopPositionChange = (e) => { setDesktopPosition(e.target.value); persistPosition(bannerDef.desktopPositionKey, e.target.value); };

  const getPosFromEvent = useCallback((e) => {
    const rect = previewRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = Math.round(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)));
    const y = Math.round(Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100)));
    return `${x}% ${y}%`;
  }, []);

  const handlePreviewPointerDown = (e) => {
    if (!url || isVideo) return;
    e.preventDefault();
    setIsDragging(true);
    const pos = getPosFromEvent(e);
    if (pos) setDesktopPosition(pos);
  };

  const handlePreviewPointerMove = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault();
    const pos = getPosFromEvent(e);
    if (pos) setDesktopPosition(pos);
  }, [isDragging, getPosFromEvent]);

  const handlePreviewPointerUp = useCallback((e) => {
    if (!isDragging) return;
    setIsDragging(false);
    const pos = getPosFromEvent(e);
    if (pos) {
      setDesktopPosition(pos);
      persistPosition(bannerDef.desktopPositionKey, pos);
    }
  }, [isDragging, getPosFromEvent, bannerDef.desktopPositionKey]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handlePreviewPointerMove);
      window.addEventListener("mouseup", handlePreviewPointerUp);
      window.addEventListener("touchmove", handlePreviewPointerMove, { passive: false });
      window.addEventListener("touchend", handlePreviewPointerUp);
    }
    return () => {
      window.removeEventListener("mousemove", handlePreviewPointerMove);
      window.removeEventListener("mouseup", handlePreviewPointerUp);
      window.removeEventListener("touchmove", handlePreviewPointerMove);
      window.removeEventListener("touchend", handlePreviewPointerUp);
    };
  }, [isDragging, handlePreviewPointerMove, handlePreviewPointerUp]);

  // Parse position to x/y % for the crosshair dot
  const parsedPos = (() => {
    const parts = desktopPosition.split(" ");
    if (parts.length === 2) {
      const parseVal = (v) => {
        if (v.endsWith("%")) return parseFloat(v);
        if (v === "left") return 0; if (v === "right") return 100;
        if (v === "top") return 0; if (v === "bottom") return 100;
        return 50;
      };
      return { x: parseVal(parts[0]), y: parseVal(parts[1]) };
    }
    return { x: 50, y: 50 };
  })();

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

      {/* Preview interactivo — arrastra para ajustar posición desktop */}
      <div
        ref={previewRef}
        className={`relative bg-black/40 overflow-hidden ${url && !isVideo ? "cursor-crosshair" : ""}`}
        style={{ height: 200 }}
        onMouseDown={handlePreviewPointerDown}
        onTouchStart={handlePreviewPointerDown}
      >
        {url ? (
          isVideo ? (
            <video key={url} src={url} autoPlay muted loop playsInline className="w-full h-full object-cover" />
          ) : (
            <img
              src={url}
              alt={bannerDef.subtitle}
              className="w-full h-full object-cover select-none"
              draggable={false}
              style={{ objectPosition: desktopPosition }}
            />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-white/20 text-xs">Sin media</p>
          </div>
        )}
        {url && !isVideo && (
          <>
            {/* Crosshair dot */}
            <div
              className="absolute w-5 h-5 rounded-full border-2 border-white shadow-lg pointer-events-none"
              style={{
                left: `calc(${parsedPos.x}% - 10px)`,
                top: `calc(${parsedPos.y}% - 10px)`,
                background: "rgba(255,255,255,0.25)",
                boxShadow: "0 0 0 1px rgba(0,0,0,0.4)",
              }}
            />
            <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 px-2 py-0.5 rounded bg-black/70 text-[9px] font-bold text-white/70">
              <Move className="w-3 h-3" /> Arrastra para ajustar
            </div>
          </>
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

        {/* CTA fields */}
        <div className="pt-2 pb-1 border-t border-white/[0.06]">
          <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-2">Botón CTA</p>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              onBlur={handleCtaTextBlur}
              placeholder={`Texto (ej: ${bannerDef.defaultCta})`}
              className="px-3 py-2 bg-white/5 rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
            />
            <input
              type="text"
              value={ctaLink}
              onChange={(e) => setCtaLink(e.target.value)}
              onBlur={handleCtaLinkBlur}
              placeholder="Link (ej: /Explorar)"
              className="px-3 py-2 bg-white/5 rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
          <p className="text-[10px] text-white/20 mt-1.5">Por defecto redirigen a /Explorar</p>
        </div>

        {/* Posición de imagen */}
        <div className="pt-2 pb-1 border-t border-white/[0.06]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest">Posición Desktop</p>
            <span className="text-[9px] text-white/30 font-mono">{desktopPosition}</span>
          </div>
          <p className="text-[9px] text-white/30 mb-3">Arrastra la imagen de arriba para ajustar el encuadre desktop.</p>
          <div>
            <label className="text-[9px] text-white/40 block mb-1">Posición Mobile</label>
            <select
              value={mobilePosition}
              onChange={handleMobilePositionChange}
              className="w-full px-3 py-2 bg-white/5 rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="top left">Arriba Izquierda</option>
              <option value="top center">Arriba Centro</option>
              <option value="top right">Arriba Derecha</option>
              <option value="center left">Centro Izquierda</option>
              <option value="center center">Centro Centro</option>
              <option value="center right">Centro Derecha</option>
              <option value="bottom left">Abajo Izquierda</option>
              <option value="bottom center">Abajo Centro</option>
              <option value="bottom right">Abajo Derecha</option>
            </select>
          </div>
        </div>

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
          savedCtaText={config?.[banner.ctaTextKey] || ""}
          savedCtaLink={config?.[banner.ctaLinkKey] || ""}
          savedMobilePosition={config?.[banner.mobilePositionKey] || "center center"}
          savedDesktopPosition={config?.[banner.desktopPositionKey] || "center center"}
        />
      ))}
    </div>
  );
}