import React from "react";
import { motion } from "framer-motion";
import { Play, Pause, Heart, Download, Share2, Activity } from "lucide-react";
import { useGlobalAudio } from "@/context/GlobalAudioContext";
import { getCoverForBeat } from "@/lib/beatsUtils";

// Listado vertical estilo ranking (replica de la referencia adjunta).
// rank en círculo · artwork · título + productor · géneros · BPM · controles.
// Clic en la fila abre la vista cinematográfica del beat.
export default function BeatsRankingList({ beats, isPlaying, onPlay, onLike, onDownload, onShare, likedIds, user, onOpen, listBeats }) {
  const { playingTrack } = useGlobalAudio();
  if (!beats || beats.length === 0) return null;

  const share = async (beat) => {
    if (onShare) { onShare(beat); return; }
    const url = `${window.location.origin}/beats/${beat.slug || beat.id}`;
    if (navigator.share) { try { await navigator.share({ title: beat.title, url }); } catch {} }
    else { try { await navigator.clipboard.writeText(url); } catch {} }
  };

  return (
    <div className="rounded-2xl p-2 sm:p-3" style={{ background: "#1a1a1a" }}>
      {beats.map((beat, i) => {
        const active = playingTrack?.beat_id === beat.id;
        const liked = likedIds?.has(beat.id);
        const cover = getCoverForBeat(beat);
        const hasStems = beat.licenses && beat.licenses.length > 0;
        const genres = (beat.genres || []).slice(0, 2).join(", ");
        const meta = [genres, beat.bpm ? `${beat.bpm} BPM` : null].filter(Boolean).join(" · ");

        return (
          <motion.div
            key={beat.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="group flex items-center gap-2.5 sm:gap-3 p-2.5 rounded-xl cursor-pointer hover:bg-white/[0.04] transition-colors"
            style={{ borderBottom: i < beats.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
            onClick={() => (onOpen ? onOpen(beat) : onPlay(beat, beats))}
          >
            {/* Rank circle */}
            <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: "#1e1e1e", color: active ? "#ff5833" : "#6b6b6b" }}>
              {i + 1}
            </span>

            {/* Artwork */}
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-lg overflow-hidden flex-shrink-0" style={{ background: "#161616" }}
              onClick={(e) => { e.stopPropagation(); onOpen ? onOpen(beat) : onPlay(beat, beats); }}>
              {cover ? (
                <img src={cover} alt="" loading="lazy" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><Activity className="w-4 h-4 text-white/15" /></div>
              )}
              {active && <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.35)" }} />}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white truncate">{beat.title}</h3>
                {hasStems && (
                  <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider" style={{ background: "rgba(255,200,0,0.15)", color: "#ffd24a" }}>STEMS</span>
                )}
              </div>
              <p className="text-xs text-[#a0a0a0] truncate">{beat.producer || "Cabaña"}{meta ? ` · ${meta}` : ""}</p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
              {onLike && (
                <button onClick={() => onLike(beat)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                  <Heart className={`w-4 h-4 ${liked ? "fill-[#ff3b3b] text-[#ff3b3b]" : "text-white/50"}`} />
                </button>
              )}
              {onDownload && beat.free_mp3_url && (
                <button onClick={() => onDownload(beat)} className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              )}
              <button onClick={() => share(beat)} className="w-8 h-8 rounded-full hidden sm:flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onPlay(beat, listBeats || beats)}
                title={active && isPlaying ? "Pausar" : "Reproducir"}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                style={{ background: active ? "#ff5833" : "#1e1e1e", border: active ? "none" : "1px solid rgba(255,255,255,0.08)" }}
              >
                {active && isPlaying ? <Pause className="w-4 h-4 text-white" fill="white" /> : <Play className="w-4 h-4 text-white ml-0.5" fill="white" />}
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}