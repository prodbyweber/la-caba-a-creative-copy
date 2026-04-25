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

function TrackDetailModal({ track, onClose, onEdit }) {
  const status = statusConfig[track.status] || statusConfig.idea;
  const folders = FOLDER_DEFS.filter(f => track.versions?.[f.key]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
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
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          <div className="absolute bottom-4 left-5">
            <h2 className="text-white font-black text-2xl leading-tight">{track.title}</h2>
          </div>
        </div>
        <div className="px-5 pb-5 pt-3 space-y-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(track)}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-white text-black text-sm font-bold hover:bg-white/90 transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              Editar
            </button>
            <div className="flex items-center gap-1.5 ml-1">
              <span className="px-2 py-1 rounded text-[10px] font-bold" style={{ background: status.color + "22", color: status.color }}>
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
                    <ExternalLink className="w-2.5 h-2.5" />
                    {f.label}
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

function MetaRow({ label, value }) {
  return (
    <div>
      <span className="text-[10px] font-semibold text-white/25 uppercase tracking-wider block">{label}</span>
      <span className="text-xs text-white/65 font-medium">{value}</span>
    </div>
  );
}

function TrackCard({ track, index, onEdit }) {
  const [hovered, setHovered] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const audioRef = useRef(null);
  const userPlayingRef = useRef(false);

  const status = statusConfig[track.status] || statusConfig.idea;

  // Build a short metadata string for the hover panel
  const metaParts = [
    track.genre,
    track.bpm ? `${track.bpm} BPM` : null,
    track.key,
    track.composers?.length > 0 ? track.composers[0] : null,
  ].filter(Boolean);

  const handleMouseLeave = () => {
    setHovered(false);
    if (audioRef.current && !userPlayingRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlaying(false);
    }
  };

  const togglePlay = (e) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (userPlayingRef.current) {
      audioRef.current.pause();
      userPlayingRef.current = false;
      setPlaying(false);
    } else {
      userPlayingRef.current = true;
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  const handleEnded = () => {
    userPlayingRef.current = false;
    setPlaying(false);
  };

  const isActuallyPlaying = playing && userPlayingRef.current;

  return (
    <>
      <div
        className="relative flex-shrink-0"
        style={{ width: 200 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
      >
        {/* Card wrapper — expands downward on hover */}
        <motion.div
          animate={{ scale: hovered ? 1.08 : 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative rounded-lg overflow-hidden cursor-pointer origin-bottom"
          style={{ width: 200, background: "#1a1a1c" }}
        >
          {track.audio_file_url && (
            <audio
              ref={audioRef}
              src={track.audio_file_url}
              preload="metadata"
              onEnded={handleEnded}
              onPause={() => { if (!userPlayingRef.current) setPlaying(false); }}
            />
          )}

          {/* Cover image with cinematic motion */}
          <div style={{ height: 118, overflow: "hidden", position: "relative" }}>
            <motion.div
              className="w-full h-full"
              animate={
                hovered || playing
                  ? { scale: 1.08, x: playing ? [0, 2, -2, 1, 0] : 0 }
                  : { scale: 1, x: 0 }
              }
              transition={
                playing
                  ? { scale: { duration: 0.6, ease: "easeOut" }, x: { duration: 6, repeat: Infinity, ease: "easeInOut" } }
                  : { duration: 0.6, ease: "easeOut" }
              }
              style={{ width: "100%", height: "100%" }}
            >
              {track.cover_url ? (
                <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#1e1e2e] to-[#0a0a0b] flex items-center justify-center">
                  <Music2 className="w-8 h-8 text-white/10" />
                </div>
              )}
            </motion.div>

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
            {hovered && <div className="absolute inset-0 bg-black/15" />}

            {/* Status badge top-left */}
            <div
              className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold"
              style={{ background: status.color + "30", color: status.color }}
            >
              {status.label}
            </div>

            {/* Info chevron — top-right on hover */}
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

            {/* Bottom row inside image: title + play btn */}
            <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2 flex items-end justify-between">
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-white font-bold text-[11px] leading-tight line-clamp-1">{track.title}</p>
                {track.genre && (
                  <p className="text-white/30 text-[9px] truncate mt-0.5">{track.genre}</p>
                )}
              </div>

              {/* Play button — always transparent */}
              {track.audio_file_url && (
                <button
                  onClick={togglePlay}
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  {isActuallyPlaying ? (
                    <Pause className="w-2.5 h-2.5 text-white" fill="white" />
                  ) : (
                    <Play className="w-2.5 h-2.5 text-white ml-0.5" fill="white" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Netflix-style metadata panel — slides in below on hover */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="overflow-hidden"
                style={{ background: "#1a1a1c" }}
              >
                <div className="px-2.5 pt-2 pb-2.5 space-y-1.5">
                  {/* Status + dolby row */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className="px-1.5 py-0.5 rounded text-[8px] font-bold"
                      style={{ background: status.color + "25", color: status.color }}
                    >
                      {status.label}
                    </span>
                    {track.dolby_atmos && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-orange-500/20 text-orange-400">ATMOS</span>
                    )}
                    {isActuallyPlaying && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse inline-block" />
                        Reproduciendo
                      </span>
                    )}
                  </div>

                  {/* Meta tags */}
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

                  {/* Credits row */}
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
        </motion.div>
      </div>

      {/* Detail Modal */}
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