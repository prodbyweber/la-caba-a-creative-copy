import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useGlobalAudio } from "@/context/GlobalAudioContext";
import { formatDuration } from "@/lib/musicConstants";
import { getTrackShareUrl, shareTrackLink } from "@/lib/trackShare";
import { resolveTrackBySlugOrId } from "@/lib/trackSlug";
import {
  Play, Pause, Volume2, VolumeX, Lock, Share2, FolderOpen,
  Home, Compass, LogIn, UserPlus, LayoutDashboard, User, Music2,
} from "lucide-react";

function useTrackMeta(track, hasAccess) {
  useEffect(() => {
    if (!track) return;
    const prevTitle = document.title;
    document.title = `${track.title} · Cabaña Creative`;

    const desc = `${track.title}${track.producers?.length ? " — Prod. " + track.producers.join(", ") : ""} · Escucha en Cabaña Creative.`;
    const url = getTrackShareUrl(track);
    const image = track.cover_url || "";

    const tags = [
      ["name", "description", desc],
      ["property", "og:title", track.title],
      ["property", "og:description", desc],
      ["property", "og:type", "music.song"],
      ["property", "og:url", url],
      ["property", "og:image", image],
      ["name", "twitter:card", "summary_large_image"],
      ["name", "twitter:title", track.title],
      ["name", "twitter:description", desc],
      ["name", "twitter:image", image],
    ];

    const created = [];
    tags.forEach(([attr, key, content]) => {
      if (!content) return;
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
        created.push(el);
      }
      el.setAttribute("content", content);
    });

    return () => {
      document.title = prevTitle;
      created.forEach((el) => el.remove());
    };
  }, [track, hasAccess]);
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
  } catch { return ""; }
}

function TopNav({ user, profileUsername }) {
  return (
    <div className="flex items-center justify-between px-5 sm:px-10 py-4">
      <Link to="/" className="flex items-center gap-2">
        <img src="https://media.base44.com/images/public/6966ddf48947f217e81ea27c/6b7c4002a_Titulo.png" alt="Cabaña Creative" className="h-6 w-auto opacity-90" />
      </Link>
      <div className="flex items-center gap-2 sm:gap-3">
        <Link to="/" className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white transition-colors px-3 py-2">
          <Home className="w-3.5 h-3.5" /> Inicio
        </Link>
        <Link to="/Explorar" className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white transition-colors px-3 py-2">
          <Compass className="w-3.5 h-3.5" /> Catálogo
        </Link>
        {user ? (
          <>
            <Link to="/ArtistDashboard" className="flex items-center gap-1.5 text-xs font-semibold text-white/70 hover:text-white px-3 py-2 rounded-full bg-white/5 border border-white/10 transition-colors">
              <LayoutDashboard className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <Link to={profileUsername ? `/${profileUsername}` : "/ArtistDashboard"} className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white transition-colors">
              <User className="w-4 h-4" />
            </Link>
          </>
        ) : (
          <>
            <Link to="/login" className="flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white transition-colors px-3 py-2">
              <LogIn className="w-3.5 h-3.5" /> Login
            </Link>
            <Link to="/register" className="flex items-center gap-1.5 text-xs font-bold text-[#0e0e0e] px-4 py-2 rounded-full transition-transform hover:scale-105" style={{ background: "#d4f7c7" }}>
              <UserPlus className="w-3.5 h-3.5" /> Registrarse
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function TrackShare() {
  const { slug, id } = useParams();
  const routeKey = slug || id;
  const { playingTrack, isPlaying, currentTime, duration, volume, playTrack, pauseTrack, resumeTrack, seekTrack, setVolume } = useGlobalAudio();
  const [user, setUser] = useState(null);
  const [profileUsername, setProfileUsername] = useState(null);
  const [shareFeedback, setShareFeedback] = useState("");
  const progressRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (!authed) return;
      const u = await base44.auth.me();
      setUser(u);
      const profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
      if (profiles[0]?.username) setProfileUsername(profiles[0].username);
    }).catch(() => {});
  }, []);

  const { data: track, isLoading, isError } = useQuery({
    queryKey: ["track-share", routeKey],
    queryFn: async () => resolveTrackBySlugOrId(routeKey),
    enabled: !!routeKey,
    retry: false,
  });

  const isOwnerOrAdmin = !!user && (user.role === "admin" || track?.created_by_id === user.id);
  const hasAccess = track?.is_public === true || isOwnerOrAdmin;
  const active = playingTrack?.id === track?.id;

  useTrackMeta(track, hasAccess);

  const handleTogglePlay = useCallback(() => {
    if (!track?.audio_file_url || !hasAccess) return;
    if (active) {
      isPlaying ? pauseTrack() : resumeTrack();
    } else {
      playTrack({ ...track, producer: track.producers?.join(", ") || track.composers?.join(", ") });
    }
  }, [track, hasAccess, active, isPlaying, pauseTrack, resumeTrack, playTrack]);

  const handleShare = async () => {
    const result = await shareTrackLink(track);
    if (result.copied) {
      setShareFeedback("Enlace copiado");
      setTimeout(() => setShareFeedback(""), 2200);
    } else if (result.copied === false) {
      setShareFeedback("No se pudo copiar");
      setTimeout(() => setShareFeedback(""), 2200);
    }
  };

  const updateSeekFromClientX = useCallback((clientX) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    seekTrack((x / rect.width) * duration);
  }, [duration, seekTrack]);

  useEffect(() => {
    if (!dragging) return;
    const move = (e) => updateSeekFromClientX(e.touches ? e.touches[0].clientX : e.clientX);
    const up = () => setDragging(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move);
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
  }, [dragging, updateSeekFromClientX]);

  const progressPct = active && duration ? (currentTime / duration) * 100 : 0;

  const formatTime = (s) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0b" }}>
        <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isError || !track) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-6" style={{ background: "#0a0a0b" }}>
        <Music2 className="w-12 h-12 text-white/15" />
        <p className="text-white/60">Este track no existe o ya no está disponible.</p>
        <Link to="/" className="text-purple-400 text-sm font-semibold">Volver al inicio</Link>
      </div>
    );
  }

  const producerLabel = track.producers?.join(", ") || track.composers?.join(", ") || "";

  return (
    <div className="min-h-screen pb-24" style={{ background: "#0a0a0b", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Cinematic ambient backdrop from the cover */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        {track.cover_url && (
          <img src={track.cover_url} alt="" className="w-full h-full object-cover opacity-25" style={{ filter: "blur(60px) saturate(1.4)" }} />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(10,10,11,0.4) 0%, rgba(10,10,11,0.92) 55%, #0a0a0b 100%)" }} />
      </div>

      <div className="relative z-10">
        <TopNav user={user} profileUsername={profileUsername} />

        <div className="px-5 sm:px-10 max-w-3xl mx-auto pt-6 sm:pt-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center sm:items-start"
          >
            {/* Cover */}
            <div
              className="w-52 h-52 sm:w-64 sm:h-64 rounded-2xl overflow-hidden flex-shrink-0 relative"
              style={{ background: "#161616", boxShadow: "0 30px 70px rgba(0,0,0,0.55)" }}
            >
              {track.cover_url ? (
                <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1e0a3c 0%, #0a1628 50%, #0a0a0b 100%)" }}>
                  <Music2 className="w-16 h-16 text-white/10" />
                </div>
              )}
              {!hasAccess && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)" }}>
                  <Lock className="w-9 h-9 text-white/70" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left min-w-0 w-full">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2" style={{ color: "#a78bfa" }}>
                Cabaña Creative
              </p>
              <h1 className="text-3xl sm:text-5xl font-black text-white mb-2" style={{ letterSpacing: "-0.03em", lineHeight: 1.02 }}>
                {track.title}
              </h1>
              {producerLabel && <p className="text-sm sm:text-base text-white/50 font-medium mb-4">{producerLabel}</p>}

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-6">
                <span
                  className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    background: track.is_public ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.06)",
                    color: track.is_public ? "#34d399" : "rgba(255,255,255,0.5)",
                    border: `1px solid ${track.is_public ? "rgba(52,211,153,0.25)" : "rgba(255,255,255,0.1)"}`,
                  }}
                >
                  {track.is_public ? "Público" : "Privado"}
                </span>
                {track.genre && <span className="text-xs text-white/45 font-medium">{track.genre}</span>}
                {track.bpm && <span className="text-xs text-white/45 font-medium">{track.bpm} BPM</span>}
                {track.key && <span className="text-xs text-white/45 font-medium">{track.key}</span>}
                {track.duration > 0 && <span className="text-xs text-white/45 font-medium">{formatDuration(track.duration)}</span>}
                {track.created_date && <span className="text-xs text-white/30 font-medium">{formatDate(track.created_date)}</span>}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap">
                <button
                  onClick={handleTogglePlay}
                  disabled={!hasAccess || !track.audio_file_url}
                  className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ background: "#8b5cf6" }}
                >
                  {active && isPlaying ? <Pause className="w-6 h-6 text-white" fill="white" /> : <Play className="w-6 h-6 text-white ml-0.5" fill="white" />}
                </button>

                <div className="relative">
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-5 h-14 rounded-full text-sm font-bold transition-colors"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                  >
                    <Share2 className="w-4 h-4" /> Compartir
                  </button>
                  <AnimatePresence>
                    {shareFeedback && (
                      <motion.span
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md text-[10px] font-bold text-white whitespace-nowrap"
                        style={{ background: "rgba(0,0,0,0.85)", border: "1px solid rgba(255,255,255,0.15)" }}
                      >
                        {shareFeedback}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                {isOwnerOrAdmin && track.versions?.drive_folder && (
                  <a
                    href={track.versions.drive_folder}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-5 h-14 rounded-full text-sm font-bold transition-colors"
                    style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)", color: "#c4b5fd" }}
                  >
                    <FolderOpen className="w-4 h-4" /> Drive
                  </a>
                )}
              </div>
            </div>
          </motion.div>

          {/* Player */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-10 rounded-2xl p-5 sm:p-7 relative"
            style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(20px)" }}
          >
            {hasAccess ? (
              <div className="space-y-4">
                <div
                  ref={progressRef}
                  className="relative h-2 rounded-full cursor-pointer group"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                  onMouseDown={(e) => { setDragging(true); updateSeekFromClientX(e.clientX); }}
                  onTouchStart={(e) => { setDragging(true); updateSeekFromClientX(e.touches[0].clientX); }}
                >
                  <div className="absolute h-full rounded-full pointer-events-none" style={{ width: `${progressPct}%`, background: "#8b5cf6" }} />
                  <div
                    className="absolute top-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    style={{ left: `${progressPct}%`, transform: "translate(-50%, -50%)" }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs font-medium text-white/40">
                  <span>{formatTime(active ? currentTime : 0)}</span>
                  <span>{formatTime(active ? duration : track.duration)}</span>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button onClick={() => setVolume(volume === 0 ? 1 : 0)} className="text-white/40 hover:text-white transition-colors">
                    {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range" min="0" max="1" step="0.01" value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="flex-1 h-1 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
                    style={{ background: "rgba(255,255,255,0.1)" }}
                  />
                  <span className="text-xs text-white/30 w-8 text-right">{Math.round(volume * 100)}%</span>
                </div>

                {!track.audio_file_url && (
                  <p className="text-center text-xs text-white/30 pt-1">Este track no tiene audio disponible.</p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center text-center gap-3 py-4">
                <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: "rgba(139,92,246,0.15)" }}>
                  <Lock className="w-5 h-5 text-[#a78bfa]" />
                </div>
                <p className="text-sm text-white/60 max-w-sm">
                  Este track es privado. Inicia sesión o crea una cuenta para acceder si tienes permisos.
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <Link to="/login" className="px-5 py-2.5 rounded-full text-sm font-bold text-white transition-colors" style={{ background: "#8b5cf6" }}>
                    Iniciar sesión
                  </Link>
                  <Link to="/register" className="px-5 py-2.5 rounded-full text-sm font-semibold text-white/70 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    Crear cuenta
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}