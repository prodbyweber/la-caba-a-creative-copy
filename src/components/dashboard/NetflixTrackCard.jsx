import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Edit, Music2, ExternalLink, ChevronDown, X } from "lucide-react";

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
function AudioWave({ large = false }) {
  const bars = large
    ? [4, 8, 14, 10, 18, 8, 12, 6, 16, 10, 14, 7, 11, 5, 9]
    : [3, 6, 9, 5, 8, 4, 7, 3, 6, 8, 5];
  return (
    <div className={`flex items-end gap-[2px] ${large ? "h-8" : "h-4"}`}>
      {bars.map((h, i) => (
        <div
          key={i}
          className="rounded-full"
          style={{
            width: large ? "3px" : "2px",
            height: `${h}px`,
            background: large ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.4)",
            animation: `waveBar 0.${6 + (i % 5)}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.07}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes waveBar {
          from { transform: scaleY(0.3); opacity: 0.3; }
          to   { transform: scaleY(1);   opacity: 0.9; }
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

function TrackDetailModal({ track, onClose, onEdit }) {
  const status = statusConfig[track.status] || statusConfig.idea;
  const folders = FOLDER_DEFS.filter(f => track.versions?.[f.key]);

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
        <div className="relative" style={{ height: 220 }}>
          {track.cover_url ? (
            <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0b] flex items-center justify-center">
              <Music2 className="w-16 h-16 text-white/10" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/40 to-transparent" />
          <button onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
          <div className="absolute bottom-4 left-5">
            <h2 className="text-white font-black text-2xl leading-tight">{track.title}</h2>
          </div>
        </div>
        <div className="px-5 pb-5 pt-3 space-y-4">
          <div className="flex items-center gap-2">
            <button onClick={() => onEdit(track)}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-white text-black text-sm font-bold hover:bg-white/90 transition-colors">
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
          {track.notes && <p className="text-xs text-white/35 leading-relaxed">{track.notes}</p>}
        </div>
      </motion.div>
    </div>
  );
}

function TrackCard({ track, onEdit }) {
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);   // click to expand inline
  const [playing, setPlaying] = useState(false);      // full playback
  const [previewing, setPreviewing] = useState(false); // hover preview
  const [showDetail, setShowDetail] = useState(false);

  const previewRef = useRef(null);
  const playbackRef = useRef(null);
  const previewTimerRef = useRef(null);

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
    setPreviewing(false);
  };

  const handleMouseEnter = () => {
    setHovered(true);
    if (track.audio_file_url && previewRef.current && !playing) {
      previewRef.current.currentTime = 0;
      previewRef.current.volume = 0.6;
      previewRef.current.play().then(() => {
        setPreviewing(true);
        previewTimerRef.current = setTimeout(() => stopPreview(), 40000);
      }).catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setHovered(false);
    stopPreview();
  };

  const togglePlay = (e) => {
    e.stopPropagation();
    if (!playbackRef.current) return;
    if (playing) {
      playbackRef.current.pause();
      setPlaying(false);
    } else {
      stopPreview();
      playbackRef.current.volume = 1;
      playbackRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  const handlePlaybackEnded = () => setPlaying(false);

  const handleCardClick = () => {
    setExpanded(prev => !prev);
  };

  return (
    <>
      {/* Outer container */}
      <div
        className="relative flex-shrink-0"
        style={{ width: 200, zIndex: hovered || expanded ? 50 : 1 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          animate={{ scale: hovered && !expanded ? 1.18 : 1 }}
          transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="rounded-xl cursor-pointer shadow-2xl"
          style={{ width: 200, transformOrigin: "center center", overflow: "visible" }}
        >
          {/* Inner card */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ background: "#1a1a1c" }}
            onClick={handleCardClick}
          >
            {track.audio_file_url && (
              <>
                <audio ref={previewRef} src={track.audio_file_url} preload="metadata" />
                <audio ref={playbackRef} src={track.audio_file_url} preload="metadata" onEnded={handlePlaybackEnded} />
              </>
            )}

            {/* Cover image */}
            <div style={{ height: 118, overflow: "hidden", position: "relative" }}>
              <motion.div
                style={{ width: "100%", height: "100%" }}
                animate={
                  hovered || playing
                    ? { scale: 1.1, x: playing ? [0, 3, -3, 1, 0] : 2 }
                    : { scale: 1, x: 0 }
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

              {/* Info chevron — opens modal (stopPropagation so card click doesn't fire) */}
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

              {/* Bottom: title + small play btn */}
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

            {/* Hover metadata panel */}
            <AnimatePresence>
              {hovered && !expanded && (
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

            {/* ── EXPANDED panel (click on card) ── */}
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className="overflow-hidden"
                  style={{ background: "#111" }}
                  onClick={e => e.stopPropagation()}
                >
                  {/* Cinematic image with constant pan animation */}
                  <div style={{ height: 100, overflow: "hidden", position: "relative" }}>
                    <motion.div
                      style={{ width: "100%", height: "100%" }}
                      animate={{ scale: 1.12, x: [0, 4, -4, 2, 0] }}
                      transition={{ x: { duration: 10, repeat: Infinity, ease: "easeInOut" }, scale: { duration: 1 } }}
                    >
                      {track.cover_url ? (
                        <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#1e1e2e] to-[#0a0a0b]" />
                      )}
                    </motion.div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />

                    {/* Title over image */}
                    <div className="absolute bottom-2 left-3 right-3">
                      <p className="text-white font-black text-xs leading-tight truncate">{track.title}</p>
                    </div>
                  </div>

                  {/* Cinematic play button + waveform */}
                  <div className="px-3 py-3 flex flex-col items-center gap-2">
                    {track.audio_file_url && (
                      <button
                        onClick={togglePlay}
                        className="relative w-10 h-10 rounded-full flex items-center justify-center transition-all"
                        style={{
                          background: playing
                            ? "rgba(255,255,255,0.08)"
                            : "rgba(255,255,255,0.10)",
                          border: "1px solid rgba(255,255,255,0.20)",
                          backdropFilter: "blur(8px)",
                          boxShadow: playing ? "0 0 20px rgba(255,255,255,0.12)" : "none",
                        }}
                      >
                        {playing ? (
                          <Pause className="w-4 h-4 text-white" fill="white" />
                        ) : (
                          <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                        )}
                      </button>
                    )}

                    {/* Waveform — always visible in expanded, animated when audio active */}
                    <div style={{ opacity: (playing || previewing) ? 1 : 0.2, transition: "opacity 0.4s" }}>
                      <AudioWave large />
                    </div>
                  </div>

                  {/* Minimal meta */}
                  <div className="px-3 pb-3 space-y-1">
                    {metaParts.length > 0 && (
                      <div className="flex flex-wrap gap-x-1.5 gap-y-0.5">
                        {metaParts.map((part, i) => (
                          <React.Fragment key={i}>
                            <span className="text-[9px] text-white/40">{part}</span>
                            {i < metaParts.length - 1 && <span className="text-[9px] text-white/15">·</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                    {(track.producers?.length > 0 || track.mix_engineer) && (
                      <p className="text-[8px] text-white/20 truncate">
                        {track.producers?.length > 0 && `Prod. ${track.producers[0]}`}
                        {track.producers?.length > 0 && track.mix_engineer && " · "}
                        {track.mix_engineer && `Mix: ${track.mix_engineer}`}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-1">
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold"
                        style={{ background: status.color + "25", color: status.color }}>
                        {status.label}
                      </span>
                      {track.dolby_atmos && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-orange-500/20 text-orange-400">ATMOS</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showDetail && (
          <TrackDetailModal
            track={track}
            onClose={() => setShowDetail(false)}
            onEdit={(t) => { setShowDetail(false); onEdit(t); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default function NetflixTrackCard({ track, index, onEdit }) {
  return <TrackCard track={track} index={index} onEdit={onEdit} />;
}