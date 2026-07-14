import React from "react";
import { motion } from "framer-motion";
import { Play, Pause, Heart, Download, Activity } from "lucide-react";
import { useGlobalAudio } from "@/context/GlobalAudioContext";
import { getCoverForBeat } from "@/lib/beatsUtils";

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
            className="flex items-center gap-3 p-2 rounded-xl transition-colors cursor-pointer hover:bg-white/5"
            style={{ borderBottom: i < beats.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
            onClick={() => onPlay(beat, beats)}
          >
            {/* Left: thumbnail (active) or rank circle */}
            {active ? (
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden flex-shrink-0" style={{ background: "#161616" }}>
                <img src={cover} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)" }}>
                  <Activity className="w-5 h-5" style={{ color: "#ff5833" }} />
                </div>
              </div>
            ) : (
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#2a2a2a" }}>
                <span className="text-base sm:text-lg font-black text-[#a0a0a0]">{i + 1}</span>
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white truncate">{beat.title}</h3>
                {hasStems && (
                  <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[8px] font-bold text-white/70 tracking-wider" style={{ background: "rgba(0,0,0,0.4)" }}>STEMS</span>
                )}
              </div>
              <p className="text-xs text-[#a0a0a0] truncate">{beat.producer || "Cabaña"}</p>
            </div>

            {/* Right controls */}
            {active ? (
              <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                {onLike && (
                  <button onClick={() => onLike(beat)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10">
                    <Heart className={`w-4 h-4 ${liked ? "fill-[#ff3b3b] text-[#ff3b3b]" : "text-white/60"}`} />
                  </button>
                )}
                {onDownload && beat.free_mp3_url && (
                  <button onClick={() => onDownload(beat)} className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10">
                    <Download className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => onPlay(beat, beats)}
                  className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                  style={{ background: "#ff5833" }}
                >
                  {active && isPlaying ? <Pause className="w-4 h-4 text-white" fill="white" /> : <Play className="w-4 h-4 text-white ml-0.5" fill="white" />}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="hidden sm:flex items-center gap-1 text-[10px] text-[#a0a0a0] font-medium">
                  <Activity className="w-3 h-3" />
                  {beat.plays_count || 0}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onPlay(beat, beats); }}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Play className="w-4 h-4" fill="currentColor" />
                </button>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}