import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Edit, Music2, ExternalLink, ChevronDown, X, Globe, Lock, Trash2, FolderOpen } from "lucide-react";
import { useGlobalAudio } from "@/context/GlobalAudioContext";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";

const statusConfig = {
  idea:       { label: "Idea",          color: "#6b7280" },
  production: { label: "Producción",    color: "#60a5fa" },
  mixing:     { label: "Mezcla",        color: "#a78bfa" },
  mastering:  { label: "Masterización", color: "#fb923c" },
  completed:  { label: "Completado",    color: "#34d399" },
};

const FOLDER_DEFS = [
  { key: "mp3",          label: "MP3" },
  { key: "wav_24bit",    label: "WAV 24bit" },
  { key: "stems",        label: "Stems" },
  { key: "mix",          label: "Mix" },
  { key: "master_24bit", label: "Master 24bit" },
  { key: "show",         label: "Show" },
  { key: "acapella",     label: "Acapella" },
  { key: "beat_wav",     label: "Beat WAV" },
];

function getYoutubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/|music\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function AudioWave() {
  const bars = [3, 6, 9, 5, 8, 4, 7, 3, 6, 8, 5];
  return (
    <div className="flex items-end gap-[2px] h-4">
      {bars.map((h, i) => (
        <div key={i} className="w-[2px] rounded-full"
          style={{
            height: `${h}px`,
            background: "rgba(255,255,255,0.5)",
            animation: `waveBar 0.${6 + (i % 5)}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.07}s`,
          }}
        />
      ))}
      <style>{`@keyframes waveBar { from { transform: scaleY(0.3); opacity:0.3; } to { transform: scaleY(1); opacity:0.9; } }`}</style>
    </div>
  );
}

// ── Detail Modal ──────────────────────────────────────────────────────────────
function TrackDetailModal({ track, onClose, onEdit, onDelete, onTogglePublic }) {
  const status = statusConfig[track.status] || statusConfig.idea;
  const folders = FOLDER_DEFS.filter(f => track.versions?.[f.key]);
  const isPublic = track.is_public === true;
  const hasAudio = !!track.audio_file_url;
  const hasYoutube = !!track.youtube_music_url;
  const ytId = getYoutubeId(track.youtube_music_url);
  const [playing, setPlaying] = useState(false);
  const [showYtPlayer, setShowYtPlayer] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      if (audioRef.current) { audioRef.current.pause(); }
    };
  }, []);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 1;
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 flex items-end sm:items-center justify-center" style={{ zIndex: 99999 }}>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
      />

      {/* Modal panel */}
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 60, scale: 0.96 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full sm:max-w-xl rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: "#0f0f0f", maxHeight: "92vh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}
      >
        {hasAudio && (
          <audio ref={audioRef} src={track.audio_file_url} preload="metadata" onEnded={() => setPlaying(false)} />
        )}

        {/* Hero: cover or gradient */}
        <div className="relative" style={{ height: 260, overflow: "hidden" }}>
          <motion.div
            className="absolute inset-0"
            animate={playing ? { scale: 1.08, x: [0, 4, -4, 2, 0] } : { scale: 1.04, x: 0 }}
            transition={playing
              ? { scale: { duration: 0.8 }, x: { duration: 10, repeat: Infinity, ease: "easeInOut" } }
              : { duration: 0.8, ease: "easeOut" }}
          >
            {track.cover_url ? (
              <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #1e0a3c 0%, #0a1628 40%, #0a0a0b 100%)" }}>
                <Music2 className="w-20 h-20 text-white/10" />
              </div>
            )}
          </motion.div>

          {/* Gradient overlay */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #0f0f0f 0%, rgba(15,15,15,0.5) 50%, transparent 100%)" }} />

          {/* Playing wave overlay */}
          {playing && (
            <div className="absolute bottom-16 left-5">
              <AudioWave />
            </div>
          )}

          {/* Title + status at bottom of hero */}
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold"
                style={{ background: status.color + "25", color: status.color }}>
                {status.label}
              </span>
              {track.dolby_atmos && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400">ATMOS</span>
              )}
              {isPublic && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400">Público</span>
              )}
            </div>
            <h2 className="text-white font-black text-2xl leading-tight">{track.title}</h2>
            {track.genre && <p className="text-white/40 text-sm mt-0.5">{track.genre}</p>}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-colors"
            style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 pb-8 pt-4 space-y-5">

          {/* Action row */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* MP3 play */}
            {hasAudio && (
              <button
                onClick={toggleAudio}
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  background: playing ? "rgba(255,255,255,0.12)" : "white",
                  border: playing ? "1px solid rgba(255,255,255,0.2)" : "none",
                }}
              >
                {playing
                  ? <Pause className="w-4 h-4 text-white" fill="white" />
                  : <Play className="w-4 h-4 text-black ml-0.5" fill="black" />
                }
              </button>
            )}

            {/* YouTube embed toggle */}
            {hasYoutube && (
              <button
                onClick={() => setShowYtPlayer(v => !v)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all flex-shrink-0"
                style={{
                  background: showYtPlayer ? "rgba(255,80,80,0.2)" : "rgba(255,80,80,0.1)",
                  border: "1px solid rgba(255,80,80,0.3)",
                  color: "#f87171",
                }}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                </svg>
                {showYtPlayer ? "Cerrar video" : "YouTube Music"}
              </button>
            )}

            {/* Edit */}
            <button
              onClick={() => onEdit(track)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-white/8 text-white/60 hover:bg-white/15 hover:text-white transition-all"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <Edit className="w-3.5 h-3.5" /> Editar
            </button>

            {/* Toggle public */}
            <button
              onClick={onTogglePublic}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                isPublic ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25" : "text-white/30 hover:bg-white/10 hover:text-white/60"
              }`}
              style={!isPublic ? { background: "rgba(255,255,255,0.05)" } : {}}
            >
              {isPublic ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              {isPublic ? "Público" : "Privado"}
            </button>

            {/* Delete */}
            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" /> Eliminar
            </button>
          </div>

          {/* YouTube embed player */}
          <AnimatePresence>
            {showYtPlayer && ytId && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden rounded-xl"
              >
                <div className="relative w-full rounded-xl overflow-hidden" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Technical metadata */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            {track.bpm && (
              <div>
                <p className="text-[10px] font-semibold text-white/20 uppercase tracking-wider">BPM</p>
                <p className="text-sm text-white/70 font-medium">{track.bpm}</p>
              </div>
            )}
            {track.key && (
              <div>
                <p className="text-[10px] font-semibold text-white/20 uppercase tracking-wider">Tonalidad</p>
                <p className="text-sm text-white/70 font-medium">{track.key}</p>
              </div>
            )}
          </div>

          {/* Credits */}
          {(track.composers?.length > 0 || track.producers?.length > 0 || track.mix_engineer || track.master_engineer) && (
            <div className="space-y-3">
              <p className="text-[10px] font-semibold text-white/20 uppercase tracking-widest">Créditos</p>
              <div className="grid grid-cols-1 gap-2">
                {track.composers?.length > 0 && (
                  <div className="flex items-start gap-3 py-2 border-b border-white/[0.05]">
                    <span className="text-[10px] text-white/25 uppercase tracking-wider w-24 flex-shrink-0 pt-0.5">Compositores</span>
                    <span className="text-sm text-white/65 font-medium">{track.composers.join(", ")}</span>
                  </div>
                )}
                {track.producers?.length > 0 && (
                  <div className="flex items-start gap-3 py-2 border-b border-white/[0.05]">
                    <span className="text-[10px] text-white/25 uppercase tracking-wider w-24 flex-shrink-0 pt-0.5">Productores</span>
                    <span className="text-sm text-white/65 font-medium">{track.producers.join(", ")}</span>
                  </div>
                )}
                {track.mix_engineer && (
                  <div className="flex items-start gap-3 py-2 border-b border-white/[0.05]">
                    <span className="text-[10px] text-white/25 uppercase tracking-wider w-24 flex-shrink-0 pt-0.5">Mezcla</span>
                    <span className="text-sm text-white/65 font-medium">{track.mix_engineer}</span>
                  </div>
                )}
                {track.master_engineer && (
                  <div className="flex items-start gap-3 py-2 border-b border-white/[0.05]">
                    <span className="text-[10px] text-white/25 uppercase tracking-wider w-24 flex-shrink-0 pt-0.5">Masterización</span>
                    <span className="text-sm text-white/65 font-medium">{track.master_engineer}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Versions / Drive folder */}
          {(folders.length > 0 || track.versions?.drive_folder) && (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-white/20 uppercase tracking-widest">Archivos</p>
              {track.versions?.drive_folder && (
                <a href={track.versions.drive_folder} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/[0.07] hover:border-white/15 transition-all group"
                  style={{ background: "rgba(255,255,255,0.03)" }}>
                  <FolderOpen className="w-4 h-4 text-white/30 group-hover:text-white/60" />
                  <span className="text-sm text-white/50 group-hover:text-white/80">Carpeta de Drive</span>
                  <ExternalLink className="w-3 h-3 text-white/20 group-hover:text-white/50 ml-auto" />
                </a>
              )}
              {folders.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {folders.map(f => (
                    <a key={f.key} href={track.versions[f.key]} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/[0.07] hover:border-white/15 text-white/40 hover:text-white/80 text-xs transition-all"
                      style={{ background: "rgba(255,255,255,0.03)" }}>
                      <ExternalLink className="w-2.5 h-2.5" /> {f.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {track.notes && (
            <div>
              <p className="text-[10px] font-semibold text-white/20 uppercase tracking-widest mb-1.5">Notas</p>
              <p className="text-sm text-white/35 leading-relaxed">{track.notes}</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
}

// ── Track Card ────────────────────────────────────────────────────────────────
function TrackCard({ track, onEdit, isFirst }) {
  const [hovered, setHovered] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showPreviewAnimation, setShowPreviewAnimation] = useState(false);
  const [localTrack, setLocalTrack] = useState(track);

  useEffect(() => { setLocalTrack(track); }, [track]);

  const previewRef = useRef(null);
  const playbackRef = useRef(null);
  const previewTimerRef = useRef(null);
  const hoverDelayRef = useRef(null);

  const globalAudio = useGlobalAudio();
  const queryClient = useQueryClient();

  const status = statusConfig[track.status] || statusConfig.idea;
  const hasAudio = !!track.audio_file_url;
  const hasYoutube = !!track.youtube_music_url;

  const metaParts = [track.genre, track.bpm ? `${track.bpm} BPM` : null, track.key].filter(Boolean);

  const stopPreview = () => {
    if (previewRef.current) { previewRef.current.pause(); previewRef.current.currentTime = 0; }
    clearTimeout(previewTimerRef.current);
    clearTimeout(hoverDelayRef.current);
    previewTimerRef.current = null;
    hoverDelayRef.current = null;
    setPreviewing(false);
    setShowPreviewAnimation(false);
  };

  const handleMouseEnter = () => {
    setHovered(true);
    if (hasAudio && previewRef.current && !playing && !globalAudio?.isPlaying) {
      hoverDelayRef.current = setTimeout(() => {
        setShowPreviewAnimation(true);
        previewRef.current.currentTime = 0;
        previewRef.current.volume = 0.6;
        previewRef.current.play().then(() => {
          setPreviewing(true);
          previewTimerRef.current = setTimeout(() => stopPreview(), 40000);
        }).catch(() => {});
      }, 1500);
    }
  };

  const handleMouseLeave = () => { setHovered(false); stopPreview(); };

  const togglePlay = (e) => {
    if (e) e.stopPropagation();
    if (!playbackRef.current) return;
    clearTimeout(hoverDelayRef.current);
    stopPreview();
    if (playing) {
      playbackRef.current.pause();
      setPlaying(false);
    } else {
      playbackRef.current.currentTime = 0;
      playbackRef.current.volume = 1;
      playbackRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  const handleTogglePublic = async () => {
    const updated = { ...localTrack, is_public: !localTrack.is_public };
    await base44.entities.Track.update(localTrack.id, { is_public: updated.is_public });
    setLocalTrack(updated);
    queryClient.invalidateQueries({ queryKey: ['all-tracks'] });
  };

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar "${localTrack.title}"?`)) return;
    await base44.entities.Track.delete(localTrack.id);
    setShowDetail(false);
    queryClient.invalidateQueries({ queryKey: ['all-tracks'] });
  };

  return (
    <>
      {/* Outer wrapper — z-index elevates on hover */}
      <div
        style={{ width: 240, flexShrink: 0, position: "relative", zIndex: hovered ? 200 : 1 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Scale wrapper */}
        <motion.div
          animate={{ scale: hovered ? 1.16 : 1 }}
          transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            width: 240,
            transformOrigin: isFirst ? "left center" : "center center",
            cursor: "pointer",
            position: "relative",
          }}
          onClick={() => setShowDetail(true)}
        >
          {/* ChevronDown button — positioned within scale wrapper, above overflow-hidden */}
          <div
            style={{ position: "absolute", top: 8, right: 8, zIndex: 10 }}
            onClick={(e) => { e.stopPropagation(); setShowDetail(true); }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              style={{
                background: "rgba(10,10,10,0.8)",
                border: "1px solid rgba(255,255,255,0.3)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
            >
              <ChevronDown className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          <div className="rounded-xl shadow-2xl" style={{ background: "#1a1a1c", overflow: "visible" }}>
            {hasAudio && (
              <>
                <audio ref={previewRef} src={track.audio_file_url} preload="metadata" />
                <audio ref={playbackRef} src={track.audio_file_url} preload="metadata" onEnded={() => setPlaying(false)} />
              </>
            )}

            {/* Cover */}
            <div style={{ height: 150, overflow: "hidden", position: "relative", borderRadius: "0.75rem 0.75rem 0 0" }}>
              <motion.div
                style={{ width: "100%", height: "100%" }}
                animate={
                  playing ? { scale: 1.1, x: [0, 3, -3, 1, 0] }
                  : showPreviewAnimation ? { scale: 1.1, x: 2 }
                  : hovered ? { scale: 1.08 }
                  : { scale: 1, x: 0 }
                }
                transition={
                  playing
                    ? { scale: { duration: 0.7 }, x: { duration: 8, repeat: Infinity, ease: "easeInOut" } }
                    : showPreviewAnimation ? { duration: 1.5, ease: "easeOut" }
                    : { duration: 0.7, ease: "easeOut" }
                }
              >
                {track.cover_url ? (
                  <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1.5"
                    style={{ background: "linear-gradient(135deg, #1e1a3e 0%, #1a1a2e 50%, #0a0a0b 100%)" }}>
                    <Music2 className="w-10 h-10 text-white/15" />
                    <p className="text-[9px] text-white/15 font-medium text-center px-2 line-clamp-2 leading-tight">{track.title}</p>
                  </div>
                )}
              </motion.div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />

              {/* Status badge */}
              <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold"
                style={{ background: status.color + "30", color: status.color }}>
                {status.label}
              </div>

              {/* YT badge */}
              {!hasAudio && hasYoutube && (
                <div className="absolute top-2 left-14 flex items-center gap-1 px-1.5 py-0.5 rounded"
                  style={{ background: "rgba(255,0,0,0.18)", border: "1px solid rgba(255,80,80,0.25)" }}>
                  <svg className="w-2.5 h-2.5 text-red-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                  </svg>
                  <span className="text-[8px] text-red-400 font-bold">YT</span>
                </div>
              )}

              {/* Bottom: title + MP3 play button */}
              <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2 flex items-end justify-between">
                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-white font-bold text-[11px] leading-tight line-clamp-1">{track.title}</p>
                  {track.genre && <p className="text-white/30 text-[9px] truncate mt-0.5">{track.genre}</p>}
                </div>
                {hasAudio && (
                  <button
                    onClick={(e) => { e.stopPropagation(); togglePlay(e); }}
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{
                      background: playing ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.88)",
                      border: playing ? "1px solid rgba(255,255,255,0.18)" : "none",
                    }}
                  >
                    {playing
                      ? <Pause className="w-2.5 h-2.5 text-white" fill="white" />
                      : <Play className="w-2.5 h-2.5 text-black ml-0.5" fill="black" />
                    }
                  </button>
                )}
              </div>
            </div>

            {/* Hover metadata panel */}
            <AnimatePresence>
              {hovered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22 }}
                  style={{ background: "#1a1a1c", overflow: "hidden", borderRadius: "0 0 0.75rem 0.75rem" }}
                >
                  <div className="px-2.5 pt-2 pb-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold"
                          style={{ background: status.color + "25", color: status.color }}>
                          {status.label}
                        </span>
                        {track.dolby_atmos && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-orange-500/20 text-orange-400">ATMOS</span>
                        )}
                        {hasYoutube && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-red-500/15 text-red-400">YT Music</span>
                        )}
                      </div>
                      {(playing || previewing) && <AudioWave />}
                    </div>
                    {metaParts.length > 0 && (
                      <div className="flex flex-wrap gap-x-1.5 gap-y-0.5">
                        {metaParts.map((part, i) => (
                          <React.Fragment key={i}>
                            <span className="text-[9px] text-white/45">{part}</span>
                            {i < metaParts.length - 1 && <span className="text-[9px] text-white/20">·</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                    {(track.producers?.length > 0 || track.mix_engineer) && (
                      <p className="text-[8px] text-white/25 truncate">
                        {track.producers?.length > 0 && `Prod. ${track.producers[0]}`}
                        {track.producers?.length > 0 && track.mix_engineer && " · "}
                        {track.mix_engineer && `Mix: ${track.mix_engineer}`}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Detail modal rendered via portal */}
      <AnimatePresence>
        {showDetail && (
          <TrackDetailModal
            track={localTrack}
            onClose={() => setShowDetail(false)}
            onEdit={(t) => { setShowDetail(false); onEdit(t); }}
            onDelete={handleDelete}
            onTogglePublic={handleTogglePublic}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default function NetflixTrackCard({ track, index, onEdit }) {
  return <TrackCard track={track} index={index} onEdit={onEdit} isFirst={index === 0} />;
}