import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Music2, X, Edit, ExternalLink } from "lucide-react";

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

// Simple bottom sheet detail view for mobile
function MobileTrackDetail({ track, onClose, onEdit }) {
  const status = statusConfig[track.status] || statusConfig.idea;
  const folders = FOLDER_DEFS.filter(f => track.versions?.[f.key]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/75"
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative rounded-t-2xl overflow-hidden"
        style={{ background: "#181818", maxHeight: "85vh", overflowY: "auto" }}
      >
        {/* Cover banner */}
        <div className="relative h-52 overflow-hidden flex-shrink-0">
          {track.cover_url ? (
            <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0b] flex items-center justify-center">
              <Music2 className="w-16 h-16 text-white/10" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/50 to-transparent" />
          <button onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center">
            <X className="w-4 h-4 text-white" />
          </button>
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-white font-black text-2xl leading-tight">{track.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold"
                style={{ background: status.color + "30", color: status.color }}>
                {status.label}
              </span>
              {track.dolby_atmos && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400">ATMOS</span>
              )}
            </div>
          </div>
        </div>

        <div className="px-4 pb-8 pt-3 space-y-4">
          {/* Edit button */}
          <button onClick={() => { onClose(); onEdit(track); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white text-sm font-bold w-full justify-center hover:bg-white/15 transition-colors">
            <Edit className="w-4 h-4" /> Editar track
          </button>

          {/* Meta */}
          {(track.genre || track.bpm || track.key) && (
            <div className="flex gap-4 flex-wrap">
              {track.genre && <div><p className="text-[10px] text-white/25 uppercase tracking-wider">Género</p><p className="text-xs text-white/70">{track.genre}</p></div>}
              {track.bpm && <div><p className="text-[10px] text-white/25 uppercase tracking-wider">BPM</p><p className="text-xs text-white/70">{track.bpm}</p></div>}
              {track.key && <div><p className="text-[10px] text-white/25 uppercase tracking-wider">Tonalidad</p><p className="text-xs text-white/70">{track.key}</p></div>}
            </div>
          )}

          {track.composers?.length > 0 && (
            <div><p className="text-[10px] text-white/25 uppercase tracking-wider mb-1">Compositores</p>
            <p className="text-xs text-white/60">{track.composers.join(", ")}</p></div>
          )}
          {track.producers?.length > 0 && (
            <div><p className="text-[10px] text-white/25 uppercase tracking-wider mb-1">Productores</p>
            <p className="text-xs text-white/60">{track.producers.join(", ")}</p></div>
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

export default function MobileTrackPoster({ track, onEdit }) {
  const [showDetail, setShowDetail] = useState(false);
  const status = statusConfig[track.status] || statusConfig.idea;

  return (
    <>
      <div
        className="flex-shrink-0 w-[110px] cursor-pointer"
        onClick={() => setShowDetail(true)}
      >
        {/* Poster — 2:3 ratio like Netflix movie poster */}
        <div className="relative rounded-lg overflow-hidden mb-1.5" style={{ aspectRatio: "2/3" }}>
          {track.cover_url ? (
            <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1e1e2e] to-[#0a0a0b] flex items-center justify-center">
              <Music2 className="w-8 h-8 text-white/15" />
            </div>
          )}
          {/* Bottom gradient + title overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-2">
            <p className="text-white font-bold text-[11px] leading-tight line-clamp-2">{track.title}</p>
          </div>
          {/* Status dot */}
          <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full" style={{ background: status.color }} />
        </div>
        <p className="text-[10px] text-white/35 truncate">{status.label}</p>
      </div>

      <AnimatePresence>
        {showDetail && (
          <MobileTrackDetail
            track={track}
            onClose={() => setShowDetail(false)}
            onEdit={onEdit}
          />
        )}
      </AnimatePresence>
    </>
  );
}