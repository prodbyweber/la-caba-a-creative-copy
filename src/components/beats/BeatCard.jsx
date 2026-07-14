import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Play, Pause, Heart, Activity, Zap, ChevronDown } from "lucide-react";
import { useBeatPlayer } from "@/hooks/useBeatPlayer";
import { getCoverForBeat, timeAgo } from "@/lib/beatsUtils";
import BeatExpandedPanel from "./BeatExpandedPanel";

export default function BeatCard({
  beat,
  index,
  user,
  liked,
  saved,
  onLike,
  onSave,
  onDownload,
  onBuy,
  listBeats,
}) {
  const { toggle, playingTrack, isPlaying } = useBeatPlayer();
  const [imgError, setImgError] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const cover = imgError ? null : getCoverForBeat(beat);
  const genre = (beat.genres && beat.genres[0]) || "";
  const active = playingTrack?.beat_id === beat.id;
  const list = listBeats && listBeats.length ? listBeats : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index || 0) * 0.04, duration: 0.5 }}
      className="group"
    >
      {/* Cover — clickable to detail */}
      <Link to={`/beats/${beat.slug || beat.id}`} className="block">
        <div className="relative aspect-square rounded-2xl overflow-hidden mb-2.5" style={{ background: "#161616" }}>
          {cover ? (
            <img
              src={cover}
              alt={beat.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Activity className="w-8 h-8 text-white/10" />
            </div>
          )}

          {/* Cinematic gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/5 pointer-events-none" />

          {/* Soundwave + play count (bottom-left) */}
          <div
            className="absolute bottom-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}
          >
            <Activity className="w-2.5 h-2.5 text-[#8b5cf6]" />
            {beat.plays_count || 0}
          </div>

          {/* Time ago (top-right) */}
          <div
            className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white/80 tracking-wider"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
          >
            <Zap className="w-2 h-2 text-white/60" />
            {timeAgo(beat.created_date)}
          </div>

          {/* Like button (top-left, on hover) */}
          {onLike && (
            <button
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); onLike(beat); }}
              className="absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
              style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
            >
              <Heart className={`w-3.5 h-3.5 ${liked ? "fill-[#8b5cf6] text-[#8b5cf6]" : "text-white"}`} />
            </button>
          )}

          {/* Hover play button (center) */}
          <div
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(beat, list); }}
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110" style={{ background: "#8b5cf6" }}>
              {active && isPlaying ? (
                <Pause className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="white" />
              ) : (
                <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white ml-0.5" fill="white" />
              )}
            </div>
          </div>

          {/* Active state ring */}
          {active && (
            <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ border: "2px solid #8b5cf6" }} />
          )}
        </div>
      </Link>

      {/* Info row: title (link) + expand toggle */}
      <div className="flex items-start gap-1">
        <Link to={`/beats/${beat.slug || beat.id}`} className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white truncate leading-tight hover:text-[#a78bfa] transition-colors">{beat.title}</h3>
          <p className="text-xs text-[#a0a0a0] mt-0.5 truncate">{beat.producer || "Cabaña"}</p>
        </Link>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all flex-shrink-0"
          title={expanded ? "Cerrar" : "Ver detalles"}
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Genre label (uppercase) + BPM/Key */}
      <div className="flex items-center gap-2 mt-1.5">
        {genre && <span className="text-[9px] text-[#a0a0a0] font-bold tracking-wider uppercase">{genre}</span>}
        {beat.bpm && <span className="text-[10px] text-[#707070] font-medium">{beat.bpm} BPM</span>}
        {(beat.scale || beat.key) && (
          <span className="text-[10px] text-[#707070] font-medium">{beat.scale || beat.key}</span>
        )}
      </div>

      {/* Expansion panel */}
      <BeatExpandedPanel
        beat={beat}
        expanded={expanded}
        user={user}
        liked={liked}
        saved={saved}
        onLike={onLike}
        onSave={onSave}
        onDownload={onDownload}
        onBuy={onBuy}
      />
    </motion.div>
  );
}