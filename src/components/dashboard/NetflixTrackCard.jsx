import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, Edit, ChevronDown, ChevronUp,
  Music2, ExternalLink, FolderOpen, Mic2, Sliders, Zap, Star
} from "lucide-react";

const statusConfig = {
  idea:       { label: "Idea",          color: "bg-white/10 text-white/50" },
  production: { label: "Producción",    color: "bg-blue-500/20 text-blue-400" },
  mixing:     { label: "Mezcla",        color: "bg-purple-500/20 text-purple-400" },
  mastering:  { label: "Masterización", color: "bg-orange-500/20 text-orange-400" },
  completed:  { label: "Completado",    color: "bg-emerald-500/20 text-emerald-400" },
};

const FOLDER_DEFS = [
  { key: "mp3",          label: "MP3",          icon: Music2,   color: "blue" },
  { key: "wav_24bit",    label: "WAV 24bit",     icon: Star,     color: "emerald" },
  { key: "stems",        label: "Stems",         icon: Sliders,  color: "purple" },
  { key: "mix",          label: "Mix",           icon: Sliders,  color: "pink" },
  { key: "master_24bit", label: "Master 24bit",  icon: Star,     color: "orange" },
  { key: "show",         label: "Show en vivo",  icon: Mic2,     color: "yellow" },
  { key: "acapella",     label: "Acapella",      icon: Mic2,     color: "rose" },
  { key: "beat_wav",     label: "Beat WAV",      icon: Zap,      color: "cyan" },
];

const colorMap = {
  blue:    "bg-blue-500/10 text-blue-400 border-blue-500/20",
  emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  purple:  "bg-purple-500/10 text-purple-400 border-purple-500/20",
  pink:    "bg-pink-500/10 text-pink-400 border-pink-500/20",
  orange:  "bg-orange-500/10 text-orange-400 border-orange-500/20",
  yellow:  "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  rose:    "bg-rose-500/10 text-rose-400 border-rose-500/20",
  cyan:    "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
};

export default function NetflixTrackCard({ track, index, onEdit }) {
  const [hovered, setHovered] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const audioRef = useRef(null);
  const hoverTimer = useRef(null);

  const status = statusConfig[track.status] || statusConfig.idea;
  const folders = FOLDER_DEFS.filter(f => track.versions?.[f.key]);

  // Auto-play on hover after short delay
  useEffect(() => {
    if (hovered && track.audio_file_url && audioRef.current) {
      hoverTimer.current = setTimeout(async () => {
        try {
          audioRef.current.currentTime = 0;
          await audioRef.current.play();
          setPlaying(true);
        } catch {}
      }, 600);
    } else {
      clearTimeout(hoverTimer.current);
      if (audioRef.current && playing) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setPlaying(false);
      }
    }
    return () => clearTimeout(hoverTimer.current);
  }, [hovered]);

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
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      className="group"
    >
      {/* Card */}
      <div
        className={`relative rounded-xl overflow-hidden border transition-all duration-300 cursor-pointer ${
          hovered
            ? "border-white/20 shadow-2xl shadow-black/60 scale-[1.02] z-10"
            : "border-white/[0.06] hover:border-white/10"
        }`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setExpanded(!expanded)}
        style={{ background: hovered ? "#1c1c1e" : "#111113" }}
      >
        {/* Audio element */}
        {track.audio_file_url && (
          <audio
            ref={audioRef}
            src={track.audio_file_url}
            preload="none"
            onEnded={() => setPlaying(false)}
            onPause={() => setPlaying(false)}
          />
        )}

        {/* Main row */}
        <div className="flex items-center gap-3 p-3">
          {/* Track number */}
          <div className="w-5 text-center flex-shrink-0">
            <span className="text-xs text-white/20 font-mono">{String(index + 1).padStart(2, "0")}</span>
          </div>

          {/* Cover */}
          <div
            className="relative flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-purple-900/40 to-black"
            style={{ width: 52, height: 52 }}
          >
            {track.cover_url ? (
              <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music2 className="w-5 h-5 text-white/20" />
              </div>
            )}

            {/* Play button overlay */}
            {track.audio_file_url && (
              <AnimatePresence>
                {hovered && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.15 }}
                    onClick={togglePlay}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px]"
                  >
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg">
                      {playing ? (
                        <Pause className="w-3.5 h-3.5 text-black" fill="black" />
                      ) : (
                        <Play className="w-3.5 h-3.5 text-black ml-0.5" fill="black" />
                      )}
                    </div>
                  </motion.button>
                )}
              </AnimatePresence>
            )}

            {/* Playing indicator */}
            {playing && !hovered && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <div className="flex items-end gap-0.5 h-4">
                  {[1, 2, 3].map(i => (
                    <div
                      key={i}
                      className="w-0.5 bg-white rounded-full animate-pulse"
                      style={{ height: `${8 + i * 4}px`, animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h4 className="font-semibold text-white text-sm truncate">{track.title}</h4>
              {track.dolby_atmos && (
                <span className="flex-shrink-0 text-[9px] px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-400 font-bold tracking-wide border border-orange-500/20">
                  ATMOS
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${status.color}`}>
                {status.label}
              </span>
              {track.genre && (
                <span className="text-[10px] text-white/30">{track.genre}</span>
              )}
              {track.bpm && (
                <span className="text-[10px] text-white/20">{track.bpm} BPM</span>
              )}
              {track.key && (
                <span className="text-[10px] text-white/20">{track.key}</span>
              )}
            </div>
          </div>

          {/* Folder count */}
          {folders.length > 0 && (
            <div className="flex-shrink-0 flex items-center gap-1 text-white/25 text-[10px]">
              <FolderOpen className="w-3 h-3" />
              <span>{folders.length}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex-shrink-0 flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => onEdit(track)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/20 hover:text-white transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/20 hover:text-white transition-colors"
            >
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Hover preview bar */}
        {hovered && playing && (
          <div className="h-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-transparent animate-pulse" />
        )}
      </div>

      {/* Expanded panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border border-white/[0.06] border-t-0 rounded-b-xl bg-[#0f0f10] px-4 py-4 space-y-4">

              {/* Metadata grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {track.composers?.length > 0 && (
                  <MetaField label="Compositores" value={track.composers.join(", ")} />
                )}
                {track.producers?.length > 0 && (
                  <MetaField label="Productores" value={track.producers.join(", ")} />
                )}
                {track.mix_engineer && (
                  <MetaField label="Mezcla" value={track.mix_engineer} />
                )}
                {track.master_engineer && (
                  <MetaField label="Masterización" value={track.master_engineer} />
                )}
                {track.bpm && (
                  <MetaField label="BPM" value={track.bpm} />
                )}
                {track.key && (
                  <MetaField label="Tonalidad" value={track.key} />
                )}
                {track.genre && (
                  <MetaField label="Género" value={track.genre} />
                )}
                {track.duration && (
                  <MetaField label="Duración" value={`${Math.floor(track.duration/60)}:${String(track.duration%60).padStart(2,'0')}`} />
                )}
              </div>

              {/* Drive folders */}
              {folders.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-2">
                    Carpetas de Drive
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {folders.map(f => {
                      const Icon = f.icon;
                      const cls = colorMap[f.color] || colorMap.blue;
                      return (
                        <a
                          key={f.key}
                          href={track.versions[f.key]}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all hover:brightness-125 ${cls}`}
                        >
                          <Icon className="w-3 h-3" />
                          {f.label}
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Audio principal link */}
              {track.audio_file_url && (
                <div>
                  <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-2">
                    Archivo de audio
                  </p>
                  <a
                    href={track.audio_file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white/60 hover:text-white text-xs font-medium transition-colors"
                  >
                    <Music2 className="w-3 h-3" />
                    Abrir audio
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                </div>
              )}

              {/* Notes */}
              {track.notes && (
                <div>
                  <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-1">Notas</p>
                  <p className="text-xs text-white/40 leading-relaxed">{track.notes}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MetaField({ label, value }) {
  return (
    <div>
      <p className="text-[9px] font-semibold text-white/20 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-xs text-white/70 font-medium truncate">{value}</p>
    </div>
  );
}