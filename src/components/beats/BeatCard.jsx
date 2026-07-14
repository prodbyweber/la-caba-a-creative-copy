import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Play, Pause, Heart, Activity, Zap, Share2, Download, ShoppingBag, ChevronDown } from "lucide-react";
import { useGlobalAudio } from "@/context/GlobalAudioContext";
import { getCoverForBeat, timeAgo } from "@/lib/beatsUtils";
import { beatSlug } from "@/lib/beatSlug";
import { formatDuration } from "@/lib/musicConstants";

export default function BeatCard({ beat, index, onPlay, onLike, onDownload, onBuy, onShare, liked, shareState, user }) {
  const { playingTrack, isPlaying, isLoading } = useGlobalAudio();
  const active = playingTrack?.beat_id === beat.id;
  const [imgError, setImgError] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const cover = imgError ? null : getCoverForBeat(beat);
  const genre = (beat.genres && beat.genres[0]) || "";
  const slug = beatSlug(beat);

  const handlePlayClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onPlay(beat);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index || 0) * 0.04, duration: 0.5 }}
      className="group"
      style={{ gridColumn: expanded ? "span 2" : undefined }}
    >
      <div
        className="relative rounded-2xl overflow-hidden transition-all"
        style={{ background: "#141416", border: expanded ? "1px solid rgba(139,92,246,0.35)" : "1px solid rgba(255,255,255,0.04)" }}
      >
        {/* Cover */}
        <div className="relative aspect-square overflow-hidden" style={{ background: "#161616" }} onClick={handlePlayClick}>
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

          {/* Soundwave + play count */}
          <div
            className="absolute bottom-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}
          >
            <Activity className="w-2.5 h-2.5 text-[#8b5cf6]" />
            {beat.plays_count || 0}
          </div>

          {/* Time ago */}
          <div
            className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white/80 tracking-wider"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
          >
            <Zap className="w-2 h-2 text-white/60" />
            {timeAgo(beat.created_date)}
          </div>

          {/* Like button (top-left) */}
          {onLike && (
            <button
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); onLike(beat); }}
              className="absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
              style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
            >
              <Heart className={`w-3.5 h-3.5 ${liked ? "fill-[#8b5cf6] text-[#8b5cf6]" : "text-white"}`} />
            </button>
          )}

          {/* Center play button (always visible) */}
          <button
            onClick={handlePlayClick}
            className="absolute inset-0 flex items-center justify-center transition-opacity"
          >
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110"
              style={{ background: "#8b5cf6" }}
            >
              {isLoading && active ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              ) : active && isPlaying ? (
                <Pause className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="white" />
              ) : (
                <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white ml-0.5" fill="white" />
              )}
            </div>
          </button>

          {/* Active state ring */}
          {active && (
            <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ border: "2px solid #8b5cf6" }} />
          )}

          {/* Active soundwave animation */}
          {active && isPlaying && (
            <div className="absolute top-2 left-2 flex items-end gap-0.5 h-3" style={{ left: "auto", right: "2.5rem", top: "0.5rem" }}>
              {[0, 1, 2, 3].map((i) => (
                <motion.span
                  key={i}
                  className="w-0.5 bg-[#8b5cf6] rounded-full"
                  animate={{ height: ["30%", "100%", "30%"] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                  style={{ height: "100%" }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info row (clickable to expand) */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full text-left p-3 flex items-start justify-between gap-2"
        >
          <div className="min-w-0 flex-1">
            <Link to={`/beats/${slug}`} onClick={(e) => e.stopPropagation()} className="block">
              <h3 className="text-sm font-bold text-white truncate leading-tight hover:text-[#a78bfa] transition-colors">{beat.title}</h3>
            </Link>
            <p className="text-xs text-[#a0a0a0] mt-0.5 truncate">{beat.producer || "Cabaña"}</p>
          </div>
          <ChevronDown className={`w-4 h-4 text-white/30 flex-shrink-0 mt-1 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>

        {/* Expandable details */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="px-3 pb-3 space-y-3">
                {/* Metadata grid */}
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  {genre && <Meta label="Género" value={genre} />}
                  {beat.bpm != null && <Meta label="BPM" value={`${beat.bpm}`} />}
                  {(beat.scale || beat.key) && <Meta label="Key" value={beat.scale || beat.key} />}
                  {beat.moods && beat.moods[0] && <Meta label="Mood" value={beat.moods[0]} />}
                  {beat.duration > 0 && <Meta label="Duración" value={formatDuration(beat.duration)} />}
                  <Meta label="Licencias" value={`${(beat.licenses || []).length || 0} disponibles`} />
                </div>

                {/* Genre + mood chips */}
                {((beat.genres && beat.genres.length) || (beat.moods && beat.moods.length)) > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {(beat.genres || []).slice(0, 3).map(g => (
                      <span key={g} className="px-2 py-0.5 rounded-full text-[9px] font-semibold text-white/70 bg-white/5 border border-white/10">{g}</span>
                    ))}
                    {(beat.moods || []).slice(0, 2).map(m => (
                      <span key={m} className="px-2 py-0.5 rounded-full text-[9px] font-semibold text-white/60 bg-white/5 border border-white/10">{m}</span>
                    ))}
                  </div>
                )}

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handlePlayClick}
                    className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold text-white"
                    style={{ background: "#8b5cf6" }}
                  >
                    {active && isPlaying ? <Pause className="w-3.5 h-3.5" fill="white" /> : <Play className="w-3.5 h-3.5" fill="white" />}
                    {active && isPlaying ? "Pausar" : "Reproducir"}
                  </button>

                  {beat.free_mp3_url && onDownload && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDownload(beat); }}
                      className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-semibold text-white/80 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Preview
                    </button>
                  )}

                  {onBuy && (beat.buy_link || beat.checkout_type !== "internal") && (
                    <a
                      href={beat.buy_link || "#"}
                      target={beat.buy_link ? "_blank" : undefined}
                      rel="noreferrer"
                      onClick={(e) => { if (!beat.buy_link) e.preventDefault(); onBuy(beat); }}
                      className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold text-white"
                      style={{ background: "linear-gradient(135deg, #7c4dff, #a78bfa)" }}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Comprar
                    </a>
                  )}

                  <button
                    onClick={(e) => { e.stopPropagation(); onShare(beat); }}
                    className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-semibold text-white/80 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    {shareState?.id === beat.id && shareState?.copied ? "Copiado" : "Compartir"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function Meta({ label, value }) {
  return (
    <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-white/[0.03] border border-white/5">
      <span className="text-white/40 uppercase tracking-wider">{label}</span>
      <span className="text-white font-semibold truncate ml-2">{value}</span>
    </div>
  );
}