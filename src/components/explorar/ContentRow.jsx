import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Music2, Play, Pause, Youtube, X } from "lucide-react";

function getYoutubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

// Modal de reproductor YouTube inline
function YoutubeModal({ ytId, title, onClose }) {
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
            <div className="relative w-full rounded-xl overflow-hidden shadow-2xl" style={{ paddingBottom: "56.25%" }}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ContentCard({ item, onClick }) {
  const [hovered, setHovered] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [showYTModal, setShowYTModal] = useState(false);
  const audioRef = useRef(null);

  const ytId = getYoutubeId(item.youtube_url || item.youtube_music_url);
  const hasAudio = !!item.audio_file_url;
  const hasVideo = !!ytId;

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
      {/* YouTube Modal */}
      {showYTModal && (
        <YoutubeModal
          ytId={ytId}
          title={item.title}
          onClose={() => setShowYTModal(false)}
        />
      )}

      <motion.div
        className="relative flex-shrink-0 cursor-pointer group"
        style={{ width: 220 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={handleCardClick}
      >
        <motion.div
          animate={{ scale: hovered ? 1.06 : 1 }}
          transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative rounded-xl overflow-hidden bg-[#1a1a1c]"
          style={{ aspectRatio: "16/9" }}
        >
          {/* Audio element */}
          {hasAudio && (
            <audio
              ref={audioRef}
              src={item.audio_file_url}
              preload="metadata"
              onEnded={() => setPlaying(false)}
            />
          )}

          {/* Cover image */}
          {item.image ? (
            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music2 className="w-8 h-8 text-white/10" />
            </div>
          )}

          {/* Gradient */}
          <div
            className="absolute inset-0 transition-opacity duration-300"
            style={{
              background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)",
              opacity: hovered ? 1 : 0.5,
            }}
          />

          {/* Playing bar animation */}
          {playing && (
            <div className="absolute top-2 left-2 flex items-end gap-[2px] h-4">
              {[3, 6, 9, 5, 8, 4, 7].map((h, i) => (
                <div
                  key={i}
                  className="w-[2px] rounded-full bg-white/60"
                  style={{
                    height: `${h}px`,
                    animation: `waveBar 0.${6 + (i % 5)}s ease-in-out infinite alternate`,
                    animationDelay: `${i * 0.07}s`,
                  }}
                />
              ))}
              <style>{`
                @keyframes waveBar {
                  from { transform: scaleY(0.3); opacity: 0.3; }
                  to   { transform: scaleY(1); opacity: 0.8; }
                }
              `}</style>
            </div>
          )}

          {/* Hover controls */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center gap-3"
              >
                {/* Audio play */}
                {hasAudio && (
                  <button
                    onClick={toggleAudio}
                    className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors"
                    title={playing ? "Pausar" : "Reproducir audio"}
                  >
                    {playing ? (
                      <Pause className="w-4 h-4 text-white" fill="white" />
                    ) : (
                      <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                    )}
                  </button>
                )}

                {/* YouTube modal button */}
                {hasVideo && (
                  <button
                    onClick={openYTModal}
                    className="w-10 h-10 rounded-full bg-red-600/80 backdrop-blur-sm flex items-center justify-center border border-red-400/30 hover:bg-red-600 transition-colors"
                    title="Reproducir video"
                  >
                    <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom info */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="text-white font-bold text-xs leading-tight line-clamp-1">{item.title}</p>
            {item.subtitle && (
              <p className="text-white/40 text-[10px] mt-0.5 truncate">{item.subtitle}</p>
            )}
            <div className="flex items-center gap-1.5 mt-1">
              {hasVideo && <Youtube className="w-2.5 h-2.5 text-red-400/70" />}
              {hasAudio && <Music2 className="w-2.5 h-2.5 text-emerald-400/70" />}
            </div>
          </div>
        </motion.div>
      </motion.div>
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