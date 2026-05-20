import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Music2, Play, Pause, ChevronDown, X } from "lucide-react";
import { useExplorar } from "@/context/ExplorarContext.jsx";

function getYoutubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

// ── Content Card ───────────────────────────────────────────────────────────
function ContentCard({ item, onClick, currentUser, allItems }) {
  const [hovered, setHovered] = useState(false);
  const [previewActive, setPreviewActive] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [ytPlaying, setYtPlaying] = useState(false);
  const audioRef = useRef(null);
  const hoverTimer = useRef(null);
  const explorar = useExplorar();

  const ytId = getYoutubeId(item.youtube_url || item.youtube_music_url);
  const hasAudio = !!item.audio_file_url;
  const hasVideo = !!ytId;

  const handleMouseEnter = () => {
    if (ytPlaying) return;
    setHovered(true);
    hoverTimer.current = setTimeout(() => {
      setPreviewActive(true);
      if (audioRef.current && !playing) {
        audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
      }
    }, 1500);
  };

  const handleMouseLeave = () => {
    if (ytPlaying) return;
    setHovered(false);
    setPreviewActive(false);
    clearTimeout(hoverTimer.current);
    if (audioRef.current && playing) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlaying(false);
    }
  };

  const toggleAudio = (e) => {
    if (e) e.stopPropagation();
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  const toggleYtPlay = (e) => {
    if (e) e.stopPropagation();
    setYtPlaying(v => !v);
    if (!ytPlaying) {
      setPreviewActive(false);
      clearTimeout(hoverTimer.current);
    }
  };

  const openCredits = (e) => {
    e.stopPropagation();
    explorar?.openCreditsModal(item, currentUser, allItems);
  };

  return (
    <motion.div
      className="relative flex-shrink-0 cursor-pointer"
        style={{ width: 220 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => { if (item.artist_id) onClick(item); }}
        animate={previewActive ? { scale: 1.08, zIndex: 10 } : { scale: 1, zIndex: 1 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {hasAudio && (
          <audio ref={audioRef} src={item.audio_file_url} preload="metadata" onEnded={() => setPlaying(false)} />
        )}

        <div className="relative rounded-xl overflow-hidden bg-[#1a1a1c]" style={{ aspectRatio: "16/9" }}>
          {/* YouTube inline embed: full play (with sound) or muted hover preview */}
          {hasVideo && (ytPlaying || (previewActive && !item.raw?.preview_media_url)) && (
            <div className="absolute inset-0 z-10">
              <iframe
                key={ytPlaying ? "play" : "preview"}
                src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&mute=${ytPlaying ? 0 : 1}&controls=${ytPlaying ? 1 : 0}&rel=0&modestbranding=1${!ytPlaying ? `&loop=1&playlist=${ytId}` : ""}`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ pointerEvents: ytPlaying ? "auto" : "none" }}
              />
            </div>
          )}

          {/* Cover image */}
          {!ytPlaying && (item.image ? (
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover transition-all duration-500"
              style={{ filter: hovered ? "brightness(1.15) saturate(1.3) contrast(1.05)" : "brightness(1.05) saturate(1.15)" }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music2 className="w-8 h-8 text-white/10" />
            </div>
          ))}

          {/* Custom video/image preview */}
          <AnimatePresence>
            {!ytPlaying && previewActive && item.raw?.preview_media_url && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0"
              >
                {item.raw.preview_media_type === "video" ? (
                  <video src={item.raw.preview_media_url} className="w-full h-full object-cover"
                    autoPlay muted loop playsInline preload="none" style={{ pointerEvents: "none" }} />
                ) : (
                  <img src={item.raw.preview_media_url} alt="" className="w-full h-full object-cover" style={{ pointerEvents: "none" }} />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {!ytPlaying && (
            <div
              className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%)", opacity: hovered ? 1 : 0, zIndex: 2 }}
            />
          )}

          {playing && !previewActive && !ytPlaying && (
            <div className="absolute top-2 left-2 flex items-end gap-[2px] h-4" style={{ zIndex: 3 }}>
              {[3, 6, 9, 5, 8, 4, 7].map((h, i) => (
                <div key={i} className="w-[2px] rounded-full bg-white/60"
                  style={{ height: `${h}px`, animation: `waveBar 0.${6 + (i % 5)}s ease-in-out infinite alternate`, animationDelay: `${i * 0.07}s` }} />
              ))}
              <style>{`@keyframes waveBar { from { transform: scaleY(0.3); opacity: 0.3; } to { transform: scaleY(1); opacity: 0.8; } }`}</style>
            </div>
          )}

          <AnimatePresence>
            {(hovered || ytPlaying) && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center gap-2.5" style={{ zIndex: 11, pointerEvents: ytPlaying ? "none" : "auto" }}>
                {!ytPlaying && hasAudio && (
                  <button onClick={toggleAudio}
                    className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/20 hover:bg-black/60 transition-colors pointer-events-auto"
                    title={playing ? "Pausar" : "Reproducir audio"}>
                    {playing ? <Pause className="w-3.5 h-3.5 text-white" fill="white" /> : <Play className="w-3.5 h-3.5 text-white ml-0.5" fill="white" />}
                  </button>
                )}
                {hasVideo && !ytPlaying && (
                  <button onClick={toggleYtPlay}
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-colors pointer-events-auto"
                    style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.25)" }}
                    title="Reproducir con sonido">
                    <svg className="w-4 h-4 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stop YT / info buttons */}
          <AnimatePresence>
            {ytPlaying && (
              <motion.button
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={(e) => { e.stopPropagation(); setYtPlaying(false); }}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 border border-white/20 flex items-center justify-center hover:bg-black/90 transition-all"
                style={{ zIndex: 20, pointerEvents: "auto" }}
              >
                <X className="w-3 h-3 text-white/80" />
              </motion.button>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {hovered && !ytPlaying && (
              <motion.button
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={openCredits}
                className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/70 hover:border-white/40 transition-all"
                style={{ zIndex: 3 }}
              >
                <ChevronDown className="w-3.5 h-3.5 text-white/80" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
  );
}

// ── Content Row ────────────────────────────────────────────────────────────
export default function ContentRow({ title, items, onItemClick, currentUser, allItems }) {
  const rowRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scroll = (dir) => {
    const el = rowRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -600 : 600, behavior: "smooth" });
    setTimeout(() => {
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    }, 400);
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="relative group/row py-4 px-4 sm:px-8">
      <h2 className="text-sm font-bold text-white mb-3 tracking-wide" style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>
        {title}
      </h2>

      {canScrollLeft && (
        <button onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-32 bg-gradient-to-r from-[#080808] to-transparent flex items-center justify-start pl-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center">
            <ChevronLeft className="w-4 h-4 text-white" />
          </div>
        </button>
      )}

      {canScrollRight && items.length > 4 && (
        <button onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-32 bg-gradient-to-l from-[#080808] to-transparent flex items-center justify-end pr-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center">
            <ChevronRight className="w-4 h-4 text-white" />
          </div>
        </button>
      )}

      <div
        ref={rowRef}
        className="flex gap-3 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onScroll={(e) => {
          const el = e.currentTarget;
          setCanScrollLeft(el.scrollLeft > 0);
          setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
        }}
      >
        {items.map((item, i) => (
          <ContentCard key={`${item.id}-${i}`} item={item} onClick={onItemClick} currentUser={currentUser} allItems={allItems} />
        ))}
      </div>
    </div>
  );
}