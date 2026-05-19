import React, { useState, useRef, useEffect, createContext, useContext, useCallback } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Music2, X, Edit, ExternalLink, ChevronDown, Globe, Lock } from "lucide-react";
import { useGlobalAudio } from "@/context/GlobalAudioContext";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";

// ─── Fallback local audio context (deprecado, usar useGlobalAudio) ───────────
const AudioContext = createContext(null);

export function MobileAudioProvider({ children }) {
  // Fallback vacío para compatibilidad
  return (
    <AudioContext.Provider value={{ playingId: null }}>
      {children}
    </AudioContext.Provider>
  );
}

function useMobileAudio() {
  return useContext(AudioContext) || {};
}

// ─── Animated waveform ────────────────────────────────────────────────────────
function AudioWave({ small = false }) {
  const bars = [3, 6, 9, 5, 8, 4, 7, 5];
  const h = small ? 10 : 14;
  return (
    <div className="flex items-end gap-[1.5px]" style={{ height: h }}>
      {bars.map((b, i) => (
        <div
          key={i}
          className="w-[2px] rounded-full bg-white/70"
          style={{
            height: Math.round((b / 9) * h),
            animation: `mobileWave 0.${5 + (i % 5)}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.07}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes mobileWave {
          from { transform: scaleY(0.25); opacity: 0.3; }
          to   { transform: scaleY(1);    opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}

// ─── Status config ────────────────────────────────────────────────────────────
const statusConfig = {
  idea:       { label: "Idea",          color: "#6b7280" },
  production: { label: "Producción",    color: "#60a5fa" },
  mixing:     { label: "Mezcla",        color: "#a78bfa" },
  mastering:  { label: "Masterización", color: "#fb923c" },
  completed:  { label: "Completado",    color: "#34d399" },
};

const FOLDER_DEFS = [
  { key: "mp3",          label: "MP3" },
  { key: "wav_24bit",    label: "WAV" },
  { key: "stems",        label: "Stems" },
  { key: "mix",          label: "Mix" },
  { key: "master_24bit", label: "Master" },
  { key: "acapella",     label: "Acapella" },
];

function getYoutubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/|music\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

// ─── Bottom-sheet detail (with shared play state) ─────────────────────────────
function MobileTrackDetail({ track, onClose, onEdit, playing, onTogglePlay, onTogglePublic }) {
  const status = statusConfig[track.status] || statusConfig.idea;
  const folders = FOLDER_DEFS.filter(f => track.versions?.[f.key]);
  const isPublic = track.is_public === true;
  const hasYoutube = !!track.youtube_music_url;
  const [showYtPlayer, setShowYtPlayer] = useState(false);

  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col justify-end">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90"
        style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
      />
      {/* bottom padding to clear mobile nav (65px) */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 320 }}
        className="relative rounded-t-2xl overflow-hidden"
        style={{ background: "#181818", maxHeight: "calc(100vh - 80px)", overflowY: "auto", paddingBottom: "calc(65px + env(safe-area-inset-bottom, 0px))" }}
      >
        {/* Cover banner with cinematic pan when playing */}
        <div className="relative overflow-hidden flex-shrink-0" style={{ height: 220 }}>
          <motion.div
            className="absolute inset-0"
            animate={playing ? { scale: 1.08, x: [0, 4, -4, 2, 0] } : { scale: 1.02, x: 0 }}
            transition={playing
              ? { scale: { duration: 0.7 }, x: { duration: 8, repeat: Infinity, ease: "easeInOut" } }
              : { duration: 0.7 }}
          >
            {track.cover_url ? (
              <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0b] flex items-center justify-center">
                <Music2 className="w-16 h-16 text-white/10" />
              </div>
            )}
          </motion.div>

          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/40 to-transparent" />

          {/* Close */}
          <button onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center">
            <X className="w-4 h-4 text-white" />
          </button>

          {/* Title + wave */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <h2 className="text-white font-black text-2xl leading-tight flex-1 pr-3">{track.title}</h2>
            {playing && <AudioWave />}
          </div>
        </div>

        {/* YouTube player embed */}
        {showYtPlayer && hasYoutube && (
          <div className="px-4 pt-3 pb-2">
            <div className="relative w-full rounded-xl overflow-hidden" style={{ paddingBottom: "56.25%" }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube-nocookie.com/embed/${getYoutubeId(track.youtube_music_url)}?autoplay=1&rel=0&modestbranding=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        <div className="px-4 pb-8 pt-4 space-y-4">
          {/* Play + Edit + Toggle public row */}
          <div className="flex items-center gap-2 flex-wrap">
            {track.audio_file_url && (
              <button
                onClick={onTogglePlay}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0"
                style={{
                  background: playing ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.9)",
                  border: playing ? "1px solid rgba(255,255,255,0.2)" : "none",
                }}
              >
                {playing ? <Pause className="w-4 h-4 text-white" fill="white" /> : <Play className="w-4 h-4 text-black ml-0.5" fill="black" />}
              </button>
            )}
            {/* YouTube Music button */}
            {hasYoutube && (
              <button
                onClick={() => setShowYtPlayer(v => !v)}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors flex-shrink-0"
                style={{
                  background: showYtPlayer ? "rgba(255,88,88,0.2)" : "rgba(255,88,88,0.1)",
                  border: "1px solid rgba(255,88,88,0.3)",
                  color: "#f87171",
                }}
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                </svg>
                {showYtPlayer ? "Cerrar" : "YT Music"}
              </button>
            )}
            <button onClick={() => { onClose(); onEdit(track); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white text-sm font-bold flex-1 justify-center hover:bg-white/15 transition-colors">
              <Edit className="w-4 h-4" /> Editar
            </button>
            {/* Toggle público/privado */}
            <button
              onClick={onTogglePublic}
              title={isPublic ? "Público — toca para privado" : "Privado — toca para público"}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 ${isPublic ? "bg-emerald-500/20 border border-emerald-500/30" : "bg-white/[0.06] border border-white/10"}`}
            >
              {isPublic ? <Globe className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-white/30" />}
            </button>
          </div>

          {/* Status badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold"
              style={{ background: status.color + "28", color: status.color }}>
              {status.label}
            </span>
            {track.dolby_atmos && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400">ATMOS</span>
            )}
          </div>

          {/* Meta */}
          {(track.genre || track.bpm || track.key) && (
            <div className="flex gap-4 flex-wrap">
              {track.genre && <div><p className="text-[10px] text-white/25 uppercase tracking-wider">Género</p><p className="text-xs text-white/70">{track.genre}</p></div>}
              {track.bpm && <div><p className="text-[10px] text-white/25 uppercase tracking-wider">BPM</p><p className="text-xs text-white/70">{track.bpm}</p></div>}
              {track.key && <div><p className="text-[10px] text-white/25 uppercase tracking-wider">Tonalidad</p><p className="text-xs text-white/70">{track.key}</p></div>}
            </div>
          )}

          {track.composers?.length > 0 && (
            <div>
              <p className="text-[10px] text-white/25 uppercase tracking-wider mb-1">Compositores</p>
              <p className="text-xs text-white/60">{track.composers.join(", ")}</p>
            </div>
          )}
          {track.producers?.length > 0 && (
            <div>
              <p className="text-[10px] text-white/25 uppercase tracking-wider mb-1">Productores</p>
              <p className="text-xs text-white/60">{track.producers.join(", ")}</p>
            </div>
          )}

          {folders.length > 0 && (
            <div>
              <p className="text-[10px] text-white/25 uppercase tracking-wider mb-2">Versiones</p>
              <div className="flex flex-wrap gap-2">
                {folders.map(f => (
                  <a key={f.key} href={track.versions[f.key]} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.07] text-white/60 text-xs border border-white/10">
                    <ExternalLink className="w-3 h-3" /> {f.label}
                  </a>
                ))}
              </div>
            </div>
          )}

          {track.notes && <p className="text-xs text-white/30 leading-relaxed">{track.notes}</p>}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Poster card ──────────────────────────────────────────────────────────────
export default function MobileTrackPoster({ track, onEdit }) {
  const [showDetail, setShowDetail] = useState(false);
  const globalAudio = useGlobalAudio();
  const isPlaying = globalAudio?.playingTrack?.id === track.id;
  const queryClient = useQueryClient();

  const status = statusConfig[track.status] || statusConfig.idea;
  const hasAudio = !!track.audio_file_url;
  const hasYoutube = !!track.youtube_music_url;
  const hasPlayable = hasAudio || hasYoutube;

  // Toggle play/pause using global audio
  const handleTogglePlay = useCallback((e) => {
    if (e) e.stopPropagation();
    if (hasAudio) {
      if (isPlaying) {
        globalAudio.pauseTrack();
      } else {
        globalAudio.playTrack(track);
      }
    } else if (hasYoutube) {
      // For YouTube-only tracks, open the detail sheet
      setShowDetail(true);
    }
  }, [isPlaying, hasAudio, hasYoutube, globalAudio, track]);

  const handleTogglePublic = useCallback(async () => {
    await base44.entities.Track.update(track.id, { is_public: !track.is_public });
    queryClient.invalidateQueries({ queryKey: ['tracks'] });
  }, [track, queryClient]);

  return (
    <>

      <div className="flex-shrink-0 w-[110px]" style={{ position: "relative" }}>
        {/* Poster — overflow hidden only on inner visual div */}
        <div
          className="relative mb-1.5 cursor-pointer"
          style={{ aspectRatio: "2/3", position: "relative" }}
          onClick={() => setShowDetail(true)}
        >
          {/* Inner clipped visual layer */}
          <div className="absolute inset-0 rounded-lg overflow-hidden">
            {/* Cover with cinematic pan when playing */}
            <motion.div
              className="absolute inset-0"
              animate={isPlaying ? { scale: 1.08, x: [0, 3, -3, 1, 0] } : { scale: 1, x: 0 }}
              transition={isPlaying
                ? { scale: { duration: 0.7 }, x: { duration: 8, repeat: Infinity, ease: "easeInOut" } }
                : { duration: 0.5 }}
            >
              {(() => {
                const ytThumb = !track.cover_url && track.youtube_music_url ? `https://img.youtube.com/vi/${getYoutubeId(track.youtube_music_url)}/hqdefault.jpg` : null;
                const src = track.cover_url || ytThumb;
                return src ? (
                  <img src={src} alt={track.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#1e1a3e] via-[#1a1a2e] to-[#0a0a0b] flex flex-col items-center justify-center gap-1.5">
                    <Music2 className="w-7 h-7 text-white/15" />
                    <p className="text-[8px] text-white/15 font-medium text-center px-1.5 line-clamp-2 leading-tight">{track.title}</p>
                  </div>
                );
              })()}
            </motion.div>

            {/* Bottom gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-transparent" />

            {/* YT badge when only youtube (no mp3) */}
            {!hasAudio && hasYoutube && (
              <div className="absolute top-1.5 left-1.5 flex items-center gap-0.5 px-1 py-0.5 rounded"
                style={{ background: "rgba(255,0,0,0.2)", border: "1px solid rgba(255,80,80,0.3)" }}>
                <svg className="w-2.5 h-2.5 text-red-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                </svg>
              </div>
            )}

            {/* Bottom area: title + play button */}
            <div className="absolute bottom-0 left-0 right-0 px-2 pb-2 flex items-end justify-between gap-1">
              <p className="text-white font-bold text-[11px] leading-tight line-clamp-2 flex-1">{track.title}</p>

              {hasPlayable && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleTogglePlay(e); }}
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all active:scale-90"
                  style={{
                    background: isPlaying ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.88)",
                    border: isPlaying ? "1px solid rgba(255,255,255,0.3)" : "none",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  {isPlaying
                    ? <Pause className="w-2.5 h-2.5 text-white" fill="white" />
                    : <Play className="w-2.5 h-2.5 text-black ml-0.5" fill="black" />
                  }
                </button>
              )}
            </div>

            {/* Waveform when playing — center of card */}
            <AnimatePresence>
              {isPlaying && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                >
                  <AudioWave small />
                </motion.div>
              )}
            </AnimatePresence>
          </div>{/* end inner clipped layer */}

          {/* Info button — OUTSIDE overflow:hidden, rendered on top */}
          <button
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); setShowDetail(true); }}
            onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); setShowDetail(true); }}
            className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(4px)",
              zIndex: 20,
              touchAction: "manipulation",
            }}
          >
            <ChevronDown className="w-3.5 h-3.5 text-white/80" />
          </button>
        </div>

        {/* Status label below poster */}
        <p className="text-[10px] truncate" style={{ color: status.color + "99" }}>{status.label}</p>
      </div>

      <AnimatePresence>
        {showDetail && ReactDOM.createPortal(
          <MobileTrackDetail
            track={track}
            onClose={() => setShowDetail(false)}
            onEdit={onEdit}
            playing={isPlaying}
            onTogglePlay={handleTogglePlay}
            onTogglePublic={handleTogglePublic}
          />,
          document.body
        )}
      </AnimatePresence>
    </>
  );
}