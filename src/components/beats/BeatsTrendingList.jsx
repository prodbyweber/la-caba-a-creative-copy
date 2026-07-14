import React from "react";
import { motion } from "framer-motion";
import { Play, Pause, Heart, Download, Activity } from "lucide-react";
import { useGlobalAudio } from "@/context/GlobalAudioContext";
import { getCoverForBeat } from "@/lib/beatsUtils";

// Listado vertical de Trending — filas limpias y minimalistas:
// rank · artwork · título + productor · botón circular de play/pause.
export default function BeatsTrendingList({ beats, isPlaying, onPlay, onLike, onDownload, likedIds, user }) {
  const { playingTrack } = useGlobalAudio();
  if (!beats || beats.length === 0) return null;

  return (
    <div className="rounded-2xl p-2 sm:p-3" style={{ background: "#1a1a1a" }}>
      {beats.map((beat, i) => {
        const active = playingTrack?.beat_id === beat.id;
        const liked = likedIds.has(beat.id);
        const cover = getCoverForBeat(beat);
        const hasStems = beat.licenses && beat.licenses.length > 0;

        return (
          <motion.div
            key={beat.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="group flex items-center gap-3 p-2.5 rounded-xl transition-colors cursor-pointer hover:bg-white/[0.04]"
            style={{ borderBottom: i < beats.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
            onClick={() => onPlay(beat, beats)}
          >
            {/* Rank */}
            <span className="w-5 text-center text-sm font-black text-white/25 flex-shrink-0">{i + 1}</span>

            {/* Artwork */}
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden flex-shrink-0" style={{ background: "#161616" }}>
              {cover ? (
                <img src={cover} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white/15" />
                </div>
              )}
              {active && <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.35)" }} />}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white truncate">{beat.title}</h3>
                {hasStems && (
                  <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[8px] font-bold text-white/60 tracking-wider" style={{ background: "rgba(255,255,255,0.08)" }}>STEMS</span>
                )}
              </div>
              <p className="text-xs text-[#a0a0a0] truncate">{beat.producer || "Cabaña"}</p>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
              {onLike && (
                <button onClick={() => onLike(beat)} className="w-8 h-8 rounded-full hidden sm:flex items-center justify-center hover:bg-white/10 transition-colors">
                  <Heart className={`w-4 h-4 ${liked ? "fill-[#ff3b3b] text-[#ff3b3b]" : "text-white/50"}`} />
                </button>
              )}
              {onDownload && beat.free_mp3_url && (
                <button onClick={() => onDownload(beat)} className="w-8 h-8 rounded-full hidden sm:flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => onPlay(beat, beats)}
                className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
                style={{
                  background: active ? "#ff5833" : "rgba(255,255,255,0.06)",
                  border: active ? "none" : "1px solid rgba(255,255,255,0.1)",
                }}
                title={active && isPlaying ? "Pausar" : "Reproducir"}
              >
                {active && isPlaying ? (
                  <Pause className="w-4 h-4 text-white" fill="white" />
                ) : (
                  <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                )}
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}