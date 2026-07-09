import React from "react";
import { motion } from "framer-motion";
import { Play, Pause, Heart, Download, MoreVertical, Activity } from "lucide-react";
import { useGlobalAudio } from "@/context/GlobalAudioContext";
import { getCoverForBeat } from "@/lib/beatsUtils";

export default function BeatsTrendingList({ beats, isPlaying, onPlay, onLike, onDownload, likedIds, user }) {
  const { playingTrack } = useGlobalAudio();
  if (!beats || beats.length === 0) return null;

  return (
    <div className="space-y-2.5">
      {beats.map((beat, i) => {
        const active = playingTrack?.beat_id === beat.id;
        const liked = likedIds.has(beat.id);
        const cover = getCoverForBeat(beat);

        return (
          <motion.div
            key={beat.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="flex items-center gap-3 p-2 rounded-2xl transition-colors cursor-pointer hover:bg-white/5"
            style={{ background: active ? "rgba(139,92,246,0.07)" : "transparent", border: active ? "1px solid rgba(139,92,246,0.2)" : "1px solid transparent" }}
            onClick={() => onPlay(beat, beats)}
          >
            {/* Thumbnail */}
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden flex-shrink-0" style={{ background: "#161616" }}>
              <img src={cover} alt="" className="w-full h-full object-cover" />
              {active && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
                  <Activity className="w-5 h-5 text-[#8b5cf6]" />
                </div>
              )}
            </div>

            {/* Title + producer */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white truncate">{beat.title}</h3>
              <p className="text-xs text-[#a0a0a0] truncate">{beat.producer || "Cabaña"}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {beat.bpm && <span className="text-[10px] text-[#707070] font-medium">{beat.bpm} BPM</span>}
                {(beat.key || beat.scale) && <span className="text-[10px] text-[#707070] font-medium">{beat.scale || beat.key}</span>}
              </div>
            </div>

            {/* Right controls */}
            {active ? (
              <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <button className="hidden sm:flex w-8 h-8 rounded-full items-center justify-center text-white/40 hover:text-white hover:bg-white/10">
                  <MoreVertical className="w-4 h-4" />
                </button>
                {onLike && (
                  <button onClick={() => onLike(beat)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10">
                    <Heart className={`w-4 h-4 ${liked ? "fill-[#8b5cf6] text-[#8b5cf6]" : "text-white/60"}`} />
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
                  style={{ background: "#8b5cf6" }}
                >
                  {active && isPlaying ? <Pause className="w-4 h-4 text-white" fill="white" /> : <Play className="w-4 h-4 text-white ml-0.5" fill="white" />}
                </button>
                {beat.licenses && beat.licenses.length > 0 && (
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-md text-[9px] font-bold text-white/60" style={{ background: "#262626" }}>STEMS</span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="flex items-center gap-1 text-[10px] text-[#a0a0a0] font-medium">
                  <Activity className="w-3 h-3" />
                  {beat.plays_count || 0}
                </div>
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-[#a0a0a0]" style={{ background: "#262626" }}>
                  {i + 1}
                </span>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}