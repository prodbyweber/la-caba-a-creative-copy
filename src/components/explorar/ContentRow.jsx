import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Music2, Play, Pause, Youtube, X } from "lucide-react";

function getYoutubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

// Modal de reproductor YouTube inline
function YoutubeModal({ ytId, title, originalUrl, onClose }) {
  const [embedFailed, setEmbedFailed] = useState(false);

  return (
    <AnimatePresence>
      {ytId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-4xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <p className="text-white font-bold text-sm truncate pr-4">{title}</p>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            {embedFailed ? (
              <div className="w-full rounded-xl bg-[#111] border border-white/10 flex flex-col items-center justify-center py-16 gap-4">
                <Youtube className="w-12 h-12 text-red-400" />
                <p className="text-white/70 text-sm text-center">Este video no permite reproducción embebida.</p>
                {originalUrl && (
                  <a
                    href={originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors"
                  >
                    Ver en YouTube →
                  </a>
                )}
              </div>
            ) : (
              <div className="relative w-full rounded-xl overflow-hidden shadow-2xl" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
                  title={title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                  onError={() => setEmbedFailed(true)}
                />
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ContentCard({ item, onClick }) {
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [previewActive, setPreviewActive] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [showYTModal, setShowYTModal] = useState(false);
  const audioRef = useRef(null);
  const hoverTimer = useRef(null);
  const previewTimer = useRef(null);
  const cardRef = useRef(null);

  const ytId = getYoutubeId(item.youtube_url || item.youtube_music_url);
  const hasAudio = !!item.audio_file_url;
  const hasVideo = !!ytId;

  const handleMouseEnter = () => {
    setHovered(true);
    // Expand immediately on hover
    hoverTimer.current = setTimeout(() => {
      setExpanded(true);
    }, 200);
    // Start preview after 1.5s
    previewTimer.current = setTimeout(() => {
      setPreviewActive(true);
      if (audioRef.current && !playing) {
        audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
      }
    }, 1500);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    setExpanded(false);
    setPreviewActive(false);
    clearTimeout(hoverTimer.current);
    clearTimeout(previewTimer.current);
    if (audioRef.current && playing) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlaying(false);
    }
  };

  const toggleAudio = (e) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  const openYTModal = (e) => {
    e.stopPropagation();
    setShowYTModal(true);
  };

  const handleCardClick = () => {
    if (item.artist_id) onClick(item);
  };

  return (
    <>
      {showYTModal && (
        <YoutubeModal
          ytId={ytId}
          title={item.title}
          originalUrl={item.youtube_url || item.youtube_music_url}
          onClose={() => setShowYTModal(false)}
        />
      )}

      {/* Wrapper that reserves space so the row doesn't shift */}
      <div
        ref={cardRef}
        className="relative flex-shrink-0"
        style={{ width: 220, height: 124 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Expanded Netflix card — absolutely positioned above */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 0 }}
              animate={{ opacity: 1, scale: 1, y: -20 }}
              exit={{ opacity: 0, scale: 0.88, y: 0 }}
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="absolute left-1/2 -translate-x-1/2 z-50 rounded-xl overflow-hidden shadow-2xl"
              style={{ width: 300, background: "#181818", top: 0 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Video/Image section */}
              <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
                {/* Audio element */}
                {hasAudio && (
                  <audio ref={audioRef} src={item.audio_file_url} preload="metadata" onEnded={() => setPlaying(false)} />
                )}

                {/* Cover */}
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#111] flex items-center justify-center">
                    <Music2 className="w-10 h-10 text-white/10" />
                  </div>
                )}

                {/* YouTube preview iframe */}
                <AnimatePresence>
                  {previewActive && hasVideo && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0"
                    >
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&mute=1&controls=0&rel=0&modestbranding=1&loop=1&playlist=${ytId}`}
                        className="w-full h-full"
                        allow="autoplay"
                        style={{ pointerEvents: "none" }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Bottom gradient */}
                <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to top, #181818 0%, transparent 50%)" }} />
              </div>

              {/* Info panel */}
              <div className="px-4 pb-4 pt-2">
                {/* Title */}
                <p className="text-white font-bold text-sm leading-tight mb-2.5">{item.title}</p>

                {/* Action buttons */}
                <div className="flex items-center gap-2 mb-3">
                  {/* Play button */}
                  {(hasVideo || hasAudio) && (
                    <button
                      onClick={hasVideo ? openYTModal : toggleAudio}
                      className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:bg-white/90 transition-colors flex-shrink-0"
                      title="Reproducir"
                    >
                      {playing && !hasVideo ? (
                        <Pause className="w-4 h-4 text-black" fill="black" />
                      ) : (
                        <Play className="w-4 h-4 text-black ml-0.5" fill="black" />
                      )}
                    </button>
                  )}

                  {/* Expand/detail button */}
                  {item.artist_id && (
                    <button
                      onClick={handleCardClick}
                      className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors flex-shrink-0"
                      title="Ver artista"
                    >
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}

                  {/* Open YT link */}
                  {hasVideo && (
                    <button
                      onClick={(e) => { e.stopPropagation(); window.open(item.youtube_url || item.youtube_music_url, "_blank"); }}
                      className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors flex-shrink-0 ml-auto"
                      title="Ver en YouTube"
                    >
                      <Youtube className="w-3.5 h-3.5 text-white/70" />
                    </button>
                  )}
                </div>

                {/* Metadata tags */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  {item.subtitle && (
                    <span className="text-[11px] text-white/50 font-medium">{item.subtitle}</span>
                  )}
                  {item.subtitle && (hasVideo || hasAudio) && (
                    <span className="text-white/20 text-[10px]">·</span>
                  )}
                  {hasVideo && (
                    <span className="text-[11px] text-white/50">Video</span>
                  )}
                  {hasVideo && hasAudio && (
                    <span className="text-white/20 text-[10px]">·</span>
                  )}
                  {hasAudio && (
                    <span className="text-[11px] text-white/50">Audio</span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Base card — always visible */}
        <div
          className="w-full h-full rounded-xl overflow-hidden bg-[#1a1a1c] cursor-pointer"
          onClick={handleCardClick}
        >
          {item.image ? (
            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music2 className="w-8 h-8 text-white/10" />
            </div>
          )}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)" }} />
          <div className="absolute bottom-0 left-0 right-0 p-2.5 pointer-events-none">
            <p className="text-white font-bold text-[11px] leading-tight line-clamp-1">{item.title}</p>
            {item.subtitle && <p className="text-white/40 text-[9px] mt-0.5 truncate">{item.subtitle}</p>}
          </div>
        </div>
      </div>
    </>
  );
}

export default function ContentRow({ title, items, onItemClick }) {
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
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-32 bg-gradient-to-r from-[#080808] to-transparent flex items-center justify-start pl-1 opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center">
            <ChevronLeft className="w-4 h-4 text-white" />
          </div>
        </button>
      )}

      {canScrollRight && items.length > 4 && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-32 bg-gradient-to-l from-[#080808] to-transparent flex items-center justify-end pr-1 opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
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
          <ContentCard key={`${item.id}-${i}`} item={item} onClick={onItemClick} />
        ))}
      </div>
    </div>
  );
}