import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Pause, ExternalLink, Volume2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
  effectivePlatformOrder,
  platformMeta,
  detectRefererSource,
  parseUTM,
  getOrCreateVisitorId,
  trackEvent,
} from "@/lib/releaseUtils";

export default function ReleaseLanding() {
  const { slug } = useParams();
  const [landing, setLanding] = useState(null);
  const [track, setTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewEnded, setPreviewEnded] = useState(false);
  const audioRef = useRef(null);
  const viewedRef = useRef(false);

  // Fetch landing + track
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const bySlug = await base44.entities.ReleaseLanding.filter({ slug });
        const l = bySlug && bySlug[0];
        if (!active) return;
        if (!l || l.is_active === false) { setNotFound(true); setLoading(false); return; }
        setLanding(l);
        const t = await base44.entities.Track.get(l.track_id);
        if (!active) return;
        setTrack(t);
        setLoading(false);

        // Registrar visita (una sola vez por carga)
        if (!viewedRef.current) {
          viewedRef.current = true;
          const visitor_id = getOrCreateVisitorId();
          const utm = parseUTM();
          trackEvent({
            landing_id: l.id,
            event_type: "view",
            visitor_id,
            referer_source: detectRefererSource(document.referrer),
            ...utm,
          });
        }
      } catch (e) {
        if (active) { setNotFound(true); setLoading(false); }
      }
    })();
    return () => { active = false; };
  }, [slug]);

  const platforms = useMemo(() => {
    if (!track) return [];
    const links = track.streaming_links || {};
    const order = effectivePlatformOrder(track.platform_order);
    return order.map((k) => ({ key: k, meta: platformMeta(k), url: links[k] })).filter((p) => p.url);
  }, [track]);

  const handlePlatformClick = (key, url) => {
    const visitor_id = getOrCreateVisitorId();
    trackEvent({
      landing_id: landing?.id,
      event_type: "click",
      platform: key,
      visitor_id,
      referer_source: detectRefererSource(document.referrer),
      ...parseUTM(),
    });
    // Redirección inmediata (el tracking es fire-and-forget, no bloquea)
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play(); setPlaying(true); setPreviewEnded(false); }
  };

  const onTimeUpdate = () => {
    const a = audioRef.current;
    if (!a || !a.duration) return;
    setProgress((a.currentTime / a.duration) * 100);
    const limit = landing?.preview_limit_seconds || 0;
    if (limit > 0 && a.currentTime >= limit) {
      a.pause();
      setPlaying(false);
      setPreviewEnded(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 text-center">
        <p className="text-2xl font-black mb-2">Landing no disponible</p>
        <p className="text-white/40 text-sm mb-6">Este lanzamiento no existe o no está publicado.</p>
        <Link to="/Explorar" className="px-5 py-2.5 rounded-xl bg-white text-black text-sm font-bold">
          Explorar
        </Link>
      </div>
    );
  }

  const title = landing.title_override || track?.title || "Release";
  const artist = landing.artist_override || track?.display_artist || "";
  const cover = track?.cover_url;
  const bgUrl = landing.background_url;
  const accent = landing.accent_color || "#ff5833";

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col">
      {/* Fondo cinematográfico */}
      <div className="absolute inset-0 z-0">
        {bgUrl && landing.background_type === "video" ? (
          <video src={bgUrl} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-40" />
        ) : bgUrl ? (
          <img src={bgUrl} alt="" className="w-full h-full object-cover opacity-40" />
        ) : cover ? (
          <img src={cover} alt="" className="w-full h-full object-cover opacity-30 scale-110 blur-2xl" />
        ) : (
          <div className="w-full h-full" style={{ background: `radial-gradient(circle at 50% 30%, ${accent}22, #000 70%)` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/90" />
      </div>

      {/* Contenido */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-10 max-w-xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center text-center"
        >
          {cover && (
            <div className="relative mb-6">
              <img
                src={cover}
                alt={title}
                className="w-56 h-56 sm:w-64 sm:h-64 rounded-2xl object-cover shadow-2xl"
                style={{ boxShadow: `0 24px 80px ${accent}40, 0 0 0 1px rgba(255,255,255,0.06)` }}
              />
              <button
                onClick={togglePlay}
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-transform active:scale-95"
                style={{ background: accent, boxShadow: `0 8px 32px ${accent}80` }}
              >
                {playing ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
              </button>
            </div>
          )}

          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] mb-2" style={{ color: accent }}>
            Nuevo lanzamiento
          </p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-none mb-1">{title}</h1>
          {artist && <p className="text-lg text-white/60 font-medium">{artist}</p>}
        </motion.div>

        {/* Barra de preview / reproductor */}
        {track?.audio_file_url && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="w-full mt-8"
          >
            <div className="relative h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${progress}%`, background: accent }} />
            </div>
            <div className="flex items-center justify-center gap-2 mt-2">
              {!cover && (
                <button onClick={togglePlay} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: accent }}>
                  {playing ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-0.5" />}
                </button>
              )}
              <p className="text-[11px] text-white/40">
                {previewEnded
                  ? "Vista previa finalizada"
                  : playing
                    ? "Reproduciendo vista previa…"
                    : "Toca play para escuchar una vista previa"}
              </p>
            </div>
            <audio
              ref={audioRef}
              src={track.audio_file_url}
              onTimeUpdate={onTimeUpdate}
              onEnded={() => { setPlaying(false); setProgress(0); }}
              preload="metadata"
            />
          </motion.div>
        )}

        {/* Botones de plataformas */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-full mt-8 space-y-2.5"
        >
          {platforms.length === 0 ? (
            <p className="text-center text-white/40 text-sm">Próximamente en todas las plataformas.</p>
          ) : (
            platforms.map(({ key, meta, url }) => (
              <button
                key={key}
                onClick={() => handlePlatformClick(key, url)}
                className="group w-full flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all active:scale-[0.98]"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <span className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: meta.color }} />
                  <span className="text-sm font-semibold">{meta.label}</span>
                </span>
                <span className="flex items-center gap-1 text-white/40 group-hover:text-white transition-colors text-xs font-medium">
                  Escuchar <ExternalLink className="w-3.5 h-3.5" />
                </span>
              </button>
            ))
          )}
        </motion.div>
      </main>

      {/* Branding Cabaña */}
      <footer className="relative z-10 py-6 text-center">
        <Link to="/Explorar" className="inline-flex items-baseline gap-1 opacity-70 hover:opacity-100 transition-opacity">
          <span style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 900, letterSpacing: "-0.04em" }}>
            <span style={{ color: accent }}>Cabaña</span>
            <span className="text-white"> Creative</span>
          </span>
        </Link>
      </footer>
    </div>
  );
}