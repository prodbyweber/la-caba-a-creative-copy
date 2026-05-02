import React, { useState, useRef } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Edit, Music2, ExternalLink, ChevronDown, X } from "lucide-react";
import { useGlobalAudio } from "@/context/GlobalAudioContext";

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

// Minimal animated waveform
function AudioWave() {
  const bars = [3, 6, 9, 5, 8, 4, 7, 3, 6, 8, 5];
  return (
    <div className="flex items-end gap-[2px] h-4">
      {bars.map((h, i) => (
        <div
          key={i}
          className="w-[2px] rounded-full"
          style={{
            height: `${h}px`,
            background: "rgba(255,255,255,0.4)",
            animation: `waveBar 0.${6 + (i % 5)}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.07}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes waveBar {
          from { transform: scaleY(0.3); opacity: 0.3; }
          to   { transform: scaleY(1);   opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

function MetaRow({ label, value }) {
  return (
    <div>
      <span className="text-[10px] font-semibold text-white/25 uppercase tracking-wider block">{label}</span>
      <span className="text-xs text-white/65 font-medium">{value}</span>
    </div>
  );
}

// Modal recibe el estado de playback externo para sincronizarlo
function TrackDetailModal({ track, onClose, onEdit, playing, onTogglePlay }) {
  const status = statusConfig[track.status] || statusConfig.idea;
  const folders = FOLDER_DEFS.filter(f => track.versions?.[f.key]);

  // Lock body scroll while open
  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="relative w-full max-w-lg rounded-xl overflow-hidden shadow-2xl"
        style={{ background: "#181818" }}
      >
        {/* Cover with cinematic animation — same as card */}
        <div className="relative" style={{ height: 220, overflow: "hidden" }}>
          <motion.div
            style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
            animate={
              playing
                ? { scale: 1.08, x: [0, 4, -4, 2, 0] }
                : { scale: 1.04, x: 0 }
            }
            transition={
              playing
                ? { scale: { duration: 0.7 }, x: { duration: 8, repeat: Infinity, ease: "easeInOut" } }
                : { duration: 0.7, ease: "easeOut" }
            }
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

          <button onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>

          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
            <h2 className="text-white font-black text-2xl leading-tight">{track.title}</h2>
            {/* Waveform when playing */}
            {playing && (
              <div className="mb-1">
                <AudioWave />
              </div>
            )}
          </div>
        </div>

        <div className="px-5 pb-5 pt-3 space-y-4">
          {/* Actions row: play + edit + badges */}
          <div className="flex items-center gap-2">
            {/* Play button in modal, synced with card */}
            {track.audio_file_url && (
              <button
                onClick={(e) => { e.stopPropagation(); onTogglePlay(e); }}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  backdropFilter: "blur(8px)",
                }}
              >
                {playing ? (
                  <Pause className="w-4 h-4 text-white" fill="white" />
                ) : (
                  <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                )}
              </button>
            )}
            <button onClick={() => onEdit(track)}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-white/10 text-white/70 text-sm font-bold hover:bg-white/20 transition-colors">
              <Edit className="w-3.5 h-3.5" /> Editar
            </button>
            <div className="flex items-center gap-1.5 ml-1">
              <span className="px-2 py-1 rounded text-[10px] font-bold"
                style={{ background: status.color + "22", color: status.color }}>
                {status.label}
              </span>
              {track.dolby_atmos && (
                <span className="px-2 py-1 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400">ATMOS</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {track.composers?.length > 0 && <MetaRow label="Compositores" value={track.composers.join(", ")} />}
            {track.producers?.length > 0 && <MetaRow label="Productores" value={track.producers.join(", ")} />}
            {track.mix_engineer && <MetaRow label="Mezcla" value={track.mix_engineer} />}
            {track.master_engineer && <MetaRow label="Masterización" value={track.master_engineer} />}
            {track.genre && <MetaRow label="Género" value={track.genre} />}
            {track.bpm && <MetaRow label="BPM" value={track.bpm} />}
            {track.key && <MetaRow label="Tonalidad" value={track.key} />}
          </div>

          {folders.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-2">Versiones</p>
              <div className="flex flex-wrap gap-1.5">
                {folders.map(f => (
                  <a key={f.key} href={track.versions[f.key]} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/[0.06] hover:bg-white/10 text-white/50 hover:text-white border border-white/[0.08] text-xs transition-colors">
                    <ExternalLink className="w-2.5 h-2.5" /> {f.label}
                  </a>
                ))}
              </div>
            </div>
          )}
          {track.youtube_music_url && (
            <a
              href={track.youtube_music_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 transition-colors"
            >
              <svg className="w-3.5 h-3.5 text-red-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
              <span className="text-xs text-red-400 font-medium truncate">Ver en YouTube Music</span>
              <ExternalLink className="w-3 h-3 text-red-400/50 ml-auto flex-shrink-0" />
            </a>
          )}
          {track.notes && <p className="text-xs text-white/35 leading-relaxed">{track.notes}</p>}
        </div>
      </motion.div>
    </div>
  );
}

function TrackCard({ track, onEdit, isFirst }) {
  const [hovered, setHovered] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showPreviewAnimation, setShowPreviewAnimation] = useState(false);

  const previewRef = useRef(null);
  const playbackRef = useRef(null);
  const previewTimerRef = useRef(null);
  const hoverDelayRef = useRef(null);

  const globalAudio = useGlobalAudio();

  const status = statusConfig[track.status] || statusConfig.idea;

  const metaParts = [
    track.genre,
    track.bpm ? `${track.bpm} BPM` : null,
    track.key,
  ].filter(Boolean);

  const stopPreview = () => {
    if (previewRef.current) {
      previewRef.current.pause();
      previewRef.current.currentTime = 0;
    }
    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current);
      previewTimerRef.current = null;
    }
    if (hoverDelayRef.current) {
      clearTimeout(hoverDelayRef.current);
      hoverDelayRef.current = null;
    }
    setPreviewing(false);
    setShowPreviewAnimation(false);
  };

  const handleMouseEnter = () => {
    setHovered(true);
    // No reproducir preview si hay algo sonando globalmente
    if (track.audio_file_url && previewRef.current && !playing && !globalAudio?.playingTrack && !globalAudio?.isPlaying) {
      // Delay de 1.5 segundos antes de iniciar preview
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

  const handleMouseLeave = () => {
    setHovered(false);
    stopPreview();
  };

  const togglePlay = (e) => {
    e.stopPropagation();
    if (!playbackRef.current) return;
    
    // Cancelar delay de hover si existe
    if (hoverDelayRef.current) {
      clearTimeout(hoverDelayRef.current);
      hoverDelayRef.current = null;
    }
    stopPreview();
    
    if (playing) {
      playbackRef.current.pause();
      setPlaying(false);
    } else {
      // Play inmediato sin delay
      playbackRef.current.currentTime = 0;
      playbackRef.current.volume = 1;
      playbackRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  const handleCardClick = () => {
    setShowDetail(true);
  };

  const handlePlaybackEnded = () => setPlaying(false);

  return (
    <>
      <div
        className="relative flex-shrink-0"
        style={{ width: 240, zIndex: hovered ? 50 : 1 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          animate={{ scale: hovered ? 1.18 : 1 }}
          transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="rounded-xl cursor-pointer shadow-2xl"
          style={{ width: 240, transformOrigin: isFirst ? "left center" : "center center", overflow: "visible" }}
          onClick={handleCardClick}
        >
          <div className="rounded-xl overflow-hidden" style={{ background: "#1a1a1c" }}>
            {track.audio_file_url && (
              <>
                <audio ref={previewRef} src={track.audio_file_url} preload="metadata" />
                <audio ref={playbackRef} src={track.audio_file_url} preload="metadata" onEnded={handlePlaybackEnded} />
              </>
            )}

            {/* Cover with cinematic pan */}
            <div style={{ height: 150, overflow: "hidden", position: "relative" }}>
              <motion.div
                style={{ width: "100%", height: "100%" }}
                animate={
                  playing
                    ? { scale: 1.1, x: [0, 3, -3, 1, 0] }
                    : showPreviewAnimation
                    ? { scale: 1.1, x: 2 }
                    : hovered
                    ? { scale: 1.08 }
                    : { scale: 1, x: 0 }
                }
                transition={
                  playing
                    ? { scale: { duration: 0.7 }, x: { duration: 8, repeat: Infinity, ease: "easeInOut" } }
                    : showPreviewAnimation
                    ? { duration: 1.5, ease: "easeOut" }
                    : { duration: 0.7, ease: "easeOut" }
                }
              >
                {track.cover_url ? (
                  <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#1e1e2e] to-[#0a0a0b] flex items-center justify-center">
                    <Music2 className="w-8 h-8 text-white/10" />
                  </div>
                )}
              </motion.div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />

              {/* Status badge */}
              <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold"
                style={{ background: status.color + "30", color: status.color }}>
                {status.label}
              </div>

              {/* Info chevron on hover */}
              <AnimatePresence>
                {hovered && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    onClick={(e) => { e.stopPropagation(); setShowDetail(true); }}
                    className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{
                      background: "rgba(20,20,20,0.80)",
                      border: "1px solid rgba(255,255,255,0.18)",
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    <ChevronDown className="w-2.5 h-2.5 text-white/70" />
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Bottom: title + play btn */}
              <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2 flex items-end justify-between">
                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-white font-bold text-[11px] leading-tight line-clamp-1">{track.title}</p>
                  {track.genre && (
                    <p className="text-white/30 text-[9px] truncate mt-0.5">{track.genre}</p>
                  )}
                </div>
                {track.audio_file_url && (
                  <button
                    onClick={togglePlay}
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{
                      background: "rgba(255,255,255,0.12)",
                      border: "1px solid rgba(255,255,255,0.18)",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    {playing ? (
                      <Pause className="w-2.5 h-2.5 text-white" fill="white" />
                    ) : (
                      <Play className="w-2.5 h-2.5 text-white ml-0.5" fill="white" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Metadata panel — slides in below on hover */}
            <AnimatePresence>
              {hovered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="overflow-hidden"
                  style={{ background: "#1a1a1c" }}
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

      {showDetail && ReactDOM.createPortal(
        <AnimatePresence>
          <TrackDetailModal
            track={track}
            onClose={() => setShowDetail(false)}
            onEdit={(t) => { setShowDetail(false); onEdit(t); }}
            playing={playing}
            onTogglePlay={togglePlay}
          />
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

export default function NetflixTrackCard({ track, index, onEdit }) {
  return <TrackCard track={track} index={index} onEdit={onEdit} isFirst={index === 0} />;
}