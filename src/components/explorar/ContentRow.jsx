import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ChevronDown, Music2, Play, Pause, Youtube, X } from "lucide-react";

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

function AudioWave() {
  const bars = [3, 6, 9, 5, 8, 4, 7, 3, 6, 8, 5];
  return (
    <div className="flex items-end gap-[2px] h-4">
      {bars.map((h, i) => (
        <div
          key={i}
          className="w-[2px] rounded-full"
          style={{
            height: `${h}px`,
            background: "rgba(255,255,255,0.4)",
            animation: `waveBar 0.${6 + (i % 5)}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.07}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes waveBar {
          from { transform: scaleY(0.3); opacity: 0.3; }
          to   { transform: scaleY(1);   opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

function ContentCard({ item, onClick, isFirst }) {
  const [hovered, setHovered] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [showPreviewAnim, setShowPreviewAnim] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [showYTModal, setShowYTModal] = useState(false);

  const previewRef = useRef(null);
  const playbackRef = useRef(null);
  const hoverDelayRef = useRef(null);
  const previewTimerRef = useRef(null);

  const ytId = getYoutubeId(item.youtube_url || item.youtube_music_url);
  const hasAudio = !!item.audio_file_url;
  const hasVideo = !!ytId;

  const stopPreview = () => {
    if (previewRef.current) {
      previewRef.current.pause();
      previewRef.current.currentTime = 0;
    }
    clearTimeout(hoverDelayRef.current);
    clearTimeout(previewTimerRef.current);
    hoverDelayRef.current = null;
    previewTimerRef.current = null;
    setPreviewing(false);
    setShowPreviewAnim(false);
  };

  const handleMouseEnter = () => {
    setHovered(true);
    if (hasAudio && previewRef.current && !playing) {
      hoverDelayRef.current = setTimeout(() => {
        setShowPreviewAnim(true);
        previewRef.current.currentTime = 0;
        previewRef.current.volume = 0.6;
        previewRef.current.play().then(() => {
          setPreviewing(true);
          previewTimerRef.current = setTimeout(() => stopPreview(), 40000);
        }).catch(() => {});
      }, 1500);
    }
  };

  const handleMouseLeave = () => {
    setHovered(false);
    stopPreview();
  };

  const togglePlay = (e) => {
    e.stopPropagation();
    if (!playbackRef.current) return;
    stopPreview();
    if (playing) {
      playbackRef.current.pause();
      setPlaying(false);
    } else {
      playbackRef.current.currentTime = 0;
      playbackRef.current.volume = 1;
      playbackRef.current.play().then(() => setPlaying(true)).catch(() => {});
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

      <div
        className="relative flex-shrink-0"
        style={{ width: 220, zIndex: hovered ? 50 : 1 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          animate={{ scale: hovered ? 1.18 : 1 }}
          transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="rounded-xl cursor-pointer shadow-2xl"
          style={{ width: 220, transformOrigin: isFirst ? "left center" : "center center", overflow: "visible" }}
          onClick={handleCardClick}
        >
          <div className="rounded-xl overflow-hidden" style={{ background: "#1a1a1c" }}>
            {/* Audio elements */}
            {hasAudio && (
              <>
                <audio ref={previewRef} src={item.audio_file_url} preload="metadata" />
                <audio ref={playbackRef} src={item.audio_file_url} preload="metadata" onEnded={() => setPlaying(false)} />
              </>
            )}

            {/* Cover con pan cinematográfico */}
            <div style={{ height: 138, overflow: "hidden", position: "relative" }}>
              <motion.div
                style={{ width: "100%", height: "100%" }}
                animate={
                  playing
                    ? { scale: 1.1, x: [0, 3, -3, 1, 0] }
                    : showPreviewAnim
                    ? { scale: 1.1, x: 2 }
                    : hovered
                    ? { scale: 1.08 }
                    : { scale: 1, x: 0 }
                }
                transition={
                  playing
                    ? { scale: { duration: 0.7 }, x: { duration: 8, repeat: Infinity, ease: "easeInOut" } }
                    : showPreviewAnim
                    ? { duration: 1.5, ease: "easeOut" }
                    : { duration: 0.7, ease: "easeOut" }
                }
              >
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#1e1e2e] to-[#0a0a0b] flex items-center justify-center">
                    <Music2 className="w-8 h-8 text-white/10" />
                  </div>
                )}
              </motion.div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />

              {/* Info chevron on hover */}
              <AnimatePresence>
                {hovered && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    onClick={(e) => { e.stopPropagation(); handleCardClick(); }}
                    className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{
                      background: "rgba(20,20,20,0.80)",
                      border: "1px solid rgba(255,255,255,0.18)",
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    <ChevronDown className="w-2.5 h-2.5 text-white/70" />
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Bottom: title + play/yt btn */}
              <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2 flex items-end justify-between">
                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-white font-bold text-[11px] leading-tight line-clamp-1">{item.title}</p>
                  {item.subtitle && (
                    <p className="text-white/30 text-[9px] truncate mt-0.5">{item.subtitle}</p>
                  )}
                </div>
                {/* Play button — audio primero, si no video */}
                {hasAudio && (
                  <button
                    onClick={togglePlay}
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{
                      background: "rgba(255,255,255,0.12)",
                      border: "1px solid rgba(255,255,255,0.18)",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    {playing ? (
                      <Pause className="w-2.5 h-2.5 text-white" fill="white" />
                    ) : (
                      <Play className="w-2.5 h-2.5 text-white ml-0.5" fill="white" />
                    )}
                  </button>
                )}
                {!hasAudio && hasVideo && (
                  <button
                    onClick={openYTModal}
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{
                      background: "rgba(255,255,255,0.12)",
                      border: "1px solid rgba(255,255,255,0.18)",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    <Play className="w-2.5 h-2.5 text-white ml-0.5" fill="white" />
                  </button>
                )}
              </div>
            </div>

            {/* Metadata panel — desliza hacia abajo en hover */}
            <AnimatePresence>
              {hovered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="overflow-hidden"
                  style={{ background: "#1a1a1c" }}
                >
                  <div className="px-2.5 pt-2 pb-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {hasVideo && (
                          <button
                            onClick={openYTModal}
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold bg-white/8 text-white/50 hover:text-white transition-colors border border-white/10"
                          >
                            <Play className="w-2 h-2" fill="currentColor" /> Ver video
                          </button>
                        )}
                        {hasAudio && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-500/15 text-emerald-400">
                            Audio
                          </span>
                        )}
                      </div>
                      {(playing || previewing) && <AudioWave />}
                    </div>
                    {item.subtitle && (
                      <p className="text-[9px] text-white/35 truncate">{item.subtitle}</p>
                    )}
                    {/* Iconos de tipo de media disponible */}
                    <div className="flex items-center gap-1.5">
                      {hasVideo && <Youtube className="w-2.5 h-2.5 text-red-400/50" />}
                      {hasAudio && <Music2 className="w-2.5 h-2.5 text-emerald-400/50" />}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
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
          <ContentCard key={`${item.id}-${i}`} item={item} onClick={onItemClick} isFirst={i === 0} />
        ))}
      </div>
    </div>
  );
}