import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, Edit, Music2, ExternalLink,
  ChevronDown, X
} from "lucide-react";

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

// Full Netflix-style detail modal
function TrackDetailModal({ track, onClose, onEdit }) {
  const status = statusConfig[track.status] || statusConfig.idea;
  const folders = FOLDER_DEFS.filter(f => track.versions?.[f.key]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="relative w-full max-w-lg rounded-xl overflow-hidden shadow-2xl"
        style={{ background: "#181818" }}
      >
        {/* Hero cover */}
        <div className="relative" style={{ height: 220 }}>
          {track.cover_url ? (
            <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0b] flex items-center justify-center">
              <Music2 className="w-16 h-16 text-white/10" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/40 to-transparent" />

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          {/* Title over image */}
          <div className="absolute bottom-4 left-5">
            <h2 className="text-white font-black text-2xl leading-tight">{track.title}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 pb-5 pt-3 space-y-4">
          {/* Action row */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(track)}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-white text-black text-sm font-bold hover:bg-white/90 transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              Editar
            </button>
            <div className="flex items-center gap-1.5 ml-1">
              <span
                className="px-2 py-1 rounded text-[10px] font-bold"
                style={{ background: status.color + "22", color: status.color }}
              >
                {status.label}
              </span>
              {track.dolby_atmos && (
                <span className="px-2 py-1 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400">
                  ATMOS
                </span>
              )}
            </div>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {track.composers?.length > 0 && (
              <MetaRow label="Compositores" value={track.composers.join(", ")} />
            )}
            {track.producers?.length > 0 && (
              <MetaRow label="Productores" value={track.producers.join(", ")} />
            )}
            {track.mix_engineer && (
              <MetaRow label="Mezcla" value={track.mix_engineer} />
            )}
            {track.master_engineer && (
              <MetaRow label="Masterización" value={track.master_engineer} />
            )}
            {track.genre && (
              <MetaRow label="Género" value={track.genre} />
            )}
            {track.bpm && (
              <MetaRow label="BPM" value={track.bpm} />
            )}
            {track.key && (
              <MetaRow label="Tonalidad" value={track.key} />
            )}
          </div>

          {/* Drive folders */}
          {folders.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-2">Versiones</p>
              <div className="flex flex-wrap gap-1.5">
                {folders.map(f => (
                  <a
                    key={f.key}
                    href={track.versions[f.key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/[0.06] hover:bg-white/10 text-white/50 hover:text-white border border-white/[0.08] text-xs transition-colors"
                  >
                    <ExternalLink className="w-2.5 h-2.5" />
                    {f.label}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {track.notes && (
            <p className="text-xs text-white/35 leading-relaxed">{track.notes}</p>
          )}
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

  const status = statusConfig[track.status] || statusConfig.idea;

  // Toggle play — persists without hover
  const togglePlay = (e) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  return (
    <>
      <div
        className="relative flex-shrink-0"
        style={{ width: 200 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Card */}
        <motion.div
          animate={{ scale: hovered ? 1.06 : 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative rounded-lg overflow-hidden cursor-pointer"
          style={{ width: 200, height: 118, background: "#1a1a1c" }}
        >
          {track.audio_file_url && (
            <audio
              ref={audioRef}
              src={track.audio_file_url}
              preload="none"
              onEnded={() => setPlaying(false)}
              onPause={() => setPlaying(false)}
            />
          )}

          {/* Cover */}
          {track.cover_url ? (
            <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1e1e2e] to-[#0a0a0b] flex items-center justify-center">
              <Music2 className="w-8 h-8 text-white/10" />
            </div>
          )}

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
          {hovered && <div className="absolute inset-0 bg-black/20" />}

          {/* Status badge top-left */}
          <div
            className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold"
            style={{ background: status.color + "30", color: status.color }}
          >
            {status.label}
          </div>

          {/* Atmos badge top-right */}
          {track.dolby_atmos && (
            <div className="absolute top-2 right-2 px-1 py-0.5 rounded text-[8px] font-bold bg-orange-500/20 text-orange-400">
              ATMOS
            </div>
          )}

          {/* Bottom row: title + play btn */}
          <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2 flex items-end justify-between">
            <div className="flex-1 min-w-0 pr-2">
              <p className="text-white font-bold text-[11px] leading-tight line-clamp-1">{track.title}</p>
              {track.genre && (
                <p className="text-white/30 text-[9px] truncate mt-0.5">{track.genre}</p>
              )}
            </div>

            {/* Play button — always visible, small */}
            {track.audio_file_url && (
              <button
                onClick={togglePlay}
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: playing ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  backdropFilter: "blur(4px)",
                }}
              >
                {playing ? (
                  <Pause className="w-2.5 h-2.5 text-black" fill="black" />
                ) : (
                  <Play className="w-2.5 h-2.5 text-white ml-0.5" fill="white" />
                )}
              </button>
            )}
          </div>

          {/* Info chevron — bottom-right on hover */}
          <AnimatePresence>
            {hovered && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                onClick={(e) => { e.stopPropagation(); setShowDetail(true); }}
                className="absolute bottom-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(30,30,30,0.85)",
                  border: "1.5px solid rgba(255,255,255,0.2)",
                  backdropFilter: "blur(6px)",
                  // only show if no audio (so it doesn't overlap play btn)
                  ...(track.audio_file_url ? { bottom: 2, right: 32 } : { bottom: 2, right: 8 }),
                }}
              >
                <ChevronDown className="w-3 h-3 text-white/70" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Playing equalizer overlay */}
          {playing && (
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 flex items-end gap-0.5 h-3 pointer-events-none">
              {[1,2,3].map(i => (
                <div
                  key={i}
                  className="w-0.5 rounded-full bg-white/70"
                  style={{
                    height: `${5 + i * 3}px`,
                    animation: `pulse 0.${4+i}s ease-in-out infinite alternate`,
                  }}
                />
              ))}
            </div>
          )}
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