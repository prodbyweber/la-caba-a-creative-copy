import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { getTrackShareUrl, shareTrackLink } from "@/lib/trackShare";
import { resolveTrackBySlugOrId } from "@/lib/trackSlug";
import {
  activePlatforms, detectRefererSource, parseUTM, getOrCreateVisitorId,
  createReleaseSession, trackReleaseClick,
} from "@/lib/releaseUtils";
import { Play, Pause, Lock, Share2, ExternalLink, Music2, BarChart3 } from "lucide-react";
import WaveformBars from "@/components/audio/WaveformBars";

const PREVIEW_SECONDS = 15;
const CABANA_LOGO = "https://media.base44.com/images/public/6966ddf48947f217e81ea27c/6b7c4002a_Titulo.png";

function useTrackMeta(track) {
  useEffect(() => {
    if (!track) return;
    const prevTitle = document.title;
    document.title = `${track.title} · Cabaña Creative`;

    const artistLabel = track.display_artist || "";
    const desc = `${track.title}${artistLabel ? " — " + artistLabel : ""} · Escucha en Cabaña Creative.`;
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
  }, [track]);
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
  } catch { return ""; }
}

function PlatformIcon({ platform, className = "w-5 h-5" }) {
  const common = { viewBox: "0 0 24 24", fill: "currentColor", className };
  if (platform === "spotify") {
    return (
      <svg {...common}>
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.52 17.34c-.23.37-.7.49-1.07.27-2.93-1.79-6.62-2.2-10.97-1.21-.42.1-.84-.16-.94-.58-.1-.42.16-.84.58-.94 4.75-1.08 8.83-.62 12.1 1.39.37.22.49.69.3 1.07zm1.47-3.27c-.29.47-.9.62-1.37.33-3.36-2.07-8.49-2.67-12.46-1.46-.53.16-1.1-.14-1.26-.67-.16-.53.14-1.1.67-1.26 4.54-1.38 10.18-.71 14.09 1.69.47.29.62.9.33 1.37zm.13-3.4C15.1 8.2 8.9 7.94 5.04 9.09c-.64.2-1.32-.16-1.52-.8-.2-.64.16-1.32.8-1.52 4.43-1.34 11.32-1.03 15.79 1.71.59.35.78 1.11.43 1.7-.35.59-1.11.78-1.7.43z"/>
      </svg>
    );
  }
  if (platform === "apple_music") {
    return (
      <svg {...common}>
        <path d="M17.05 12.04c-.03-2.4 1.96-3.55 2.05-3.61-1.12-1.64-2.86-1.86-3.47-1.89-1.48-.15-2.89.87-3.64.87-.75 0-1.9-.85-3.13-.83-1.61.02-3.1.94-3.93 2.38-1.68 2.91-.43 7.21 1.21 9.57.8 1.16 1.76 2.46 3.02 2.41 1.21-.05 1.67-.78 3.13-.78s1.87.78 3.14.76c1.3-.02 2.12-1.18 2.91-2.35.92-1.35 1.3-2.66 1.32-2.73-.03-.01-2.53-.97-2.56-3.84zM14.8 5.18c.66-.8 1.11-1.92.99-3.03-.96.04-2.12.64-2.81 1.44-.62.72-1.16 1.86-1.01 2.95 1.07.08 2.17-.54 2.83-1.36z"/>
      </svg>
    );
  }
  if (platform === "youtube_music") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <circle cx="12" cy="12" r="9.2" fill="currentColor" opacity="0.18" />
        <circle cx="12" cy="12" r="9.2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10.4 8.4l6 3.6-6 3.6z" fill="currentColor" />
      </svg>
    );
  }
  return null;
}

export default function TrackShare() {
  const { slug, id } = useParams();
  const routeKey = slug || id;
  const [user, setUser] = useState(null);
  const [profileUsername, setProfileUsername] = useState(null);
  const [shareFeedback, setShareFeedback] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const sessionPromiseRef = useRef(null);

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

  const { data: artist } = useQuery({
    queryKey: ["track-share-artist", track?.artist_id],
    queryFn: () => base44.entities.Artist.get(track.artist_id),
    enabled: !!track?.artist_id,
    retry: false,
  });

  const { data: ownerProfile } = useQuery({
    queryKey: ["track-share-owner", track?.created_by_id],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: track.created_by_id }).then(p => p[0] || null),
    enabled: !track?.artist_id && !!track?.created_by_id,
    retry: false,
  });

  const resolvedArtistName = artist?.stageName || ownerProfile?.artist_name || ownerProfile?.display_name || ownerProfile?.full_name || "";
  const artistName = track?.display_artist || resolvedArtistName;
  const artistAvatar = artist?.avatar_url || ownerProfile?.avatar_url || ownerProfile?.profile_photo_url || "";

  const isOwnerOrAdmin = !!user && (user.role === "admin" || track?.created_by_id === user.id);
  const hasAccess = track?.is_public === true || isOwnerOrAdmin;

  const platforms = useMemo(
    () => activePlatforms(track?.streaming_links, track?.platform_order),
    [track?.streaming_links, track?.platform_order]
  );

  useTrackMeta(track);

  // Creación de la sesión de Analytics — una sola vez al cargar la página.
  // Toda la info del visitante (fuente, geo, dispositivo...) se fija aquí y no se recalcula.
  useEffect(() => {
    if (!track?.id || sessionPromiseRef.current) return;
    const utm = parseUTM();
    sessionPromiseRef.current = createReleaseSession({
      track_id: track.id,
      visitor_id: getOrCreateVisitorId(),
      referer: document.referrer || null,
      referer_source: detectRefererSource(document.referrer, navigator.userAgent),
      ...utm,
    });
  }, [track?.id]);

  const cappedDuration = duration > 0 ? Math.min(duration, PREVIEW_SECONDS) : PREVIEW_SECONDS;

  const handleTogglePlay = useCallback(() => {
    const el = audioRef.current;
    if (!el || !track?.audio_file_url || !hasAccess) return;
    if (isPlaying) {
      el.pause();
    } else {
      if (el.currentTime >= PREVIEW_SECONDS) el.currentTime = 0;
      el.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isPlaying, track?.audio_file_url, hasAccess]);

  const updateSeekFromClientX = useCallback((clientX) => {
    const el = audioRef.current;
    if (!el || !cappedDuration || !progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const t = (x / rect.width) * cappedDuration;
    el.currentTime = t;
    setCurrentTime(t);
  }, [cappedDuration]);

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

  // El clic NO recalcula la fuente ni crea sesión: se vincula a la sesión existente.
  const handlePlatformClick = useCallback(async (p) => {
    try {
      const sid = await sessionPromiseRef.current;
      if (sid) await trackReleaseClick({ session_id: sid, track_id: track.id, platform: p.key });
    } catch { /* silent */ }
    window.open(p.url, "_blank", "noopener,noreferrer");
  }, [track?.id]);

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

  const formatTime = (s) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0b" }}>
        <div className="w-8 h-8 rounded-full border-2 border-yellow-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isError || !track) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-6" style={{ background: "#0a0a0b" }}>
        <Music2 className="w-12 h-12 text-white/15" />
        <p className="text-white/60">Este track no existe o ya no está disponible.</p>
        <Link to="/" className="text-yellow-400 text-sm font-semibold">Volver al inicio</Link>
      </div>
    );
  }

  const coverFallback = !track.cover_url && track.youtube_music_url
    ? `https://img.youtube.com/vi/${(track.youtube_music_url.match(/v=([^&]+)/) || [])[1] || ""}/hqdefault.jpg`
    : null;
  const coverSrc = track.cover_url || coverFallback;

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "#0a0a0b", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Ambient backdrop from the cover */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        {coverSrc && (
          <img src={coverSrc} alt="" className="w-full h-full object-cover" style={{ filter: "blur(60px) saturate(1.6)", opacity: 0.45, transform: "scale(1.15)" }} />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(10,10,11,0.5) 0%, rgba(10,10,11,0.82) 45%, #0a0a0b 100%)" }} />
      </div>

      {/* Minimal top bar */}
      <div className="relative z-20 flex items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={CABANA_LOGO} alt="Cabaña Creative" className="h-5 w-auto opacity-80" />
        </Link>
        {user ? (
          <Link to={profileUsername ? `/${profileUsername}` : "/Explorar"} className="text-[11px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">
            {profileUsername ? "Mi perfil" : "Catálogo"}
          </Link>
        ) : (
          <Link to="/login" className="text-[11px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">
            Entrar
          </Link>
        )}
      </div>

      <div className="relative z-10 px-5 max-w-md mx-auto pb-16 flex flex-col items-center">
        {/* Cover — hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-44 h-44 sm:w-48 sm:h-48 rounded-2xl overflow-hidden relative"
          style={{ background: "#161616", boxShadow: "0 35px 80px rgba(0,0,0,0.6)" }}
        >
          {coverSrc ? (
            <img src={coverSrc} alt={track.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(250,204,21,0.10) 0%, #1a1a0e 50%, #0a0a0b 100%)" }}>
              <Music2 className="w-14 h-14 text-white/10" />
            </div>
          )}
          {!hasAccess && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)" }}>
              <Lock className="w-8 h-8 text-white/70" />
            </div>
          )}
        </motion.div>

        {/* Artist minimalist logo + name */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-5 flex items-center gap-2"
        >
          {artistAvatar ? (
            <img src={artistAvatar} alt={artistName} className="w-6 h-6 rounded-full object-cover" style={{ border: "1px solid rgba(255,255,255,0.18)" }} />
          ) : artistName ? (
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-[#0a0a0b]" style={{ background: "#facc15" }}>
              {artistName.charAt(0).toUpperCase()}
            </span>
          ) : null}
          {artistName && (
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: "#facc15" }}>
              {artistName}
            </span>
          )}
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.28 }}
          className="mt-2 text-2xl sm:text-3xl font-black text-white text-center"
          style={{ letterSpacing: "-0.03em", lineHeight: 1.05 }}
        >
          {track.title}
        </motion.h1>

        {/* Private state */}
        {!hasAccess && (
          <motion.div
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-5 w-full rounded-2xl px-5 py-5 flex flex-col items-center text-center gap-3"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(20px)" }}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(250,204,21,0.15)" }}>
              <Lock className="w-4 h-4 text-[#facc15]" />
            </div>
            <p className="text-xs text-white/60 max-w-xs">Este track es privado. Inicia sesión si tienes permisos.</p>
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-4 py-2 rounded-full text-xs font-bold transition-colors" style={{ background: "linear-gradient(135deg, #facc15, #eab308)", color: "#0a0a0b" }}>
                Iniciar sesión
              </Link>
              <Link to="/register" className="px-4 py-2 rounded-full text-xs font-semibold text-white/70 hover:text-white bg-white/5 border border-white/10 transition-colors">
                Crear cuenta
              </Link>
            </div>
          </motion.div>
        )}

        {/* Vertical link buttons — main focus */}
        {platforms.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.48 }}
            className="mt-7 w-full space-y-3"
          >
            <p className="text-center text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">Stream la señal</p>
            {platforms.map((p, i) => (
              <motion.button
                key={p.key}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.5 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => handlePlatformClick(p)}
                className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: p.meta.color, boxShadow: `0 12px 30px ${p.meta.color}40` }}
              >
                <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full" style={{ background: "rgba(255,255,255,0.16)" }}>
                  <PlatformIcon platform={p.key} className="w-5 h-5" />
                </span>
                <span className="flex-1 text-left">{p.meta.verb} {p.meta.label}</span>
                <ExternalLink className="w-4 h-4 text-white/70 flex-shrink-0" />
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Slim preview player — sutil */}
        {hasAccess && track.audio_file_url && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.45 }}
            className="mt-4 w-full flex items-center gap-2.5 px-3 py-2 rounded-full"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <audio
              ref={audioRef}
              src={track.audio_file_url}
              preload="metadata"
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
              onTimeUpdate={(e) => {
                const t = e.currentTarget.currentTime;
                if (t >= PREVIEW_SECONDS) {
                  e.currentTarget.pause();
                  e.currentTarget.currentTime = 0;
                  setCurrentTime(0);
                  setIsPlaying(false);
                } else {
                  setCurrentTime(t);
                }
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => { setIsPlaying(false); setCurrentTime(0); }}
            />
            <button
              onClick={handleTogglePlay}
              className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
              style={{ background: "rgba(250,204,21,0.16)" }}
            >
              {isPlaying ? <Pause className="w-3 h-3 text-[#facc15]" fill="#facc15" /> : <Play className="w-3 h-3 text-[#facc15] ml-0.5" fill="#facc15" />}
            </button>
            <div
              ref={progressRef}
              className="flex-1 h-6 flex items-center cursor-pointer"
              onMouseDown={(e) => { setDragging(true); updateSeekFromClientX(e.clientX); }}
              onTouchStart={(e) => { setDragging(true); updateSeekFromClientX(e.touches[0].clientX); }}
            >
              <WaveformBars progress={cappedDuration ? currentTime / cappedDuration : 0} isPlaying={isPlaying} bars={28} color="#facc15" />
            </div>
            <span className="flex-shrink-0 text-[9px] font-medium text-white/35 tabular-nums">
              {formatTime(currentTime)}
            </span>
          </motion.div>
        )}

        {/* Share */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-6 relative"
        >
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-5 h-11 rounded-full text-xs font-bold text-white transition-colors"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <Share2 className="w-3.5 h-3.5" /> Compartir
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
        </motion.div>

        {isOwnerOrAdmin && (
          <Link
            to={(track.slug ? `/t/${track.slug}` : `/track/${track.id}`) + "/analytics"}
            className="mt-4 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-[#facc15] transition-colors"
          >
            <BarChart3 className="w-3 h-3" /> Analítica en vivo
          </Link>
        )}

        {/* Footer — Cabaña Creative branding */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 flex flex-col items-center gap-1.5"
        >
          <Link to="/" className="flex items-center gap-2">
            <img src={CABANA_LOGO} alt="Cabaña Creative" className="h-4 w-auto opacity-50" />
          </Link>
          <span className="text-[9px] font-bold uppercase tracking-[0.35em] text-white/20">Cabaña Creative</span>
        </motion.div>
      </div>
    </div>
  );
}