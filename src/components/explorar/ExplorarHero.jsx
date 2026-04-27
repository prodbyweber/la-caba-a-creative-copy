import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Info, X, Youtube, ChevronLeft, ChevronRight } from "lucide-react";

function getYoutubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function HeroSlide({ item, artist, onExplore, active }) {
  const ytUrl = item?.youtube_url || item?.youtube_music_url;
  const ytId = getYoutubeId(ytUrl);
  const bg = item?.image || artist?.avatar_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1600&q=80";
  const isVideo = item?.hero_media_type === "video" && item?.hero_media_url;
  const videoRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current) return;
    if (active) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [active]);

  return (
    <div className="absolute inset-0">
      {/* Background media */}
      <div className="absolute inset-0 overflow-hidden">
        {isVideo ? (
          <video
            ref={videoRef}
            src={item.hero_media_url}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <motion.img
            src={item?.hero_media_url || bg}
            alt={item?.title}
            className="w-full h-full object-cover"
            initial={{ scale: 1.06 }}
            animate={active ? { scale: 1 } : { scale: 1.06 }}
            transition={{ duration: 7, ease: "easeOut" }}
          />
        )}
        {/* Gradients — más suaves para dar visibilidad */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(8,8,8,0.80) 30%, rgba(8,8,8,0.10) 100%)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(8,8,8,0.95) 0%, transparent 45%)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(8,8,8,0.30) 0%, transparent 25%)" }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end h-full px-6 sm:px-12 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          className="max-w-xl"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#ff5833]">Destacado</span>
            {item?.subtitle && (
              <>
                <span className="text-white/20 text-xs">·</span>
                <span className="text-[10px] text-white/50 uppercase tracking-wider">{item.subtitle}</span>
              </>
            )}
          </div>

          <h1
            className="text-5xl sm:text-7xl font-black text-white mb-4 leading-none"
            style={{ fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "-0.03em" }}
          >
            {item?.title || "Cabaña Creative"}
          </h1>

          {artist && (
            <p className="text-white/60 text-sm mb-6 font-medium">
              por{" "}
              <span className="text-white cursor-pointer hover:text-[#ff5833] transition-colors" onClick={onExplore}>
                {artist.stageName}
              </span>
            </p>
          )}

          <div className="flex items-center gap-3">
            {ytId && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => item?._openModal?.()}
                className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-white/90 transition-colors text-sm"
              >
                <Play className="w-4 h-4" fill="black" />
                Reproducir
              </motion.button>
            )}
            {artist && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onExplore}
                className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-bold rounded-lg hover:bg-white/20 transition-colors text-sm border border-white/10"
              >
                <Info className="w-4 h-4" />
                Ver artista
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function ExplorarHero({ items = [], artists = [], onExplore }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [embedFailed, setEmbedFailed] = useState(false);
  const intervalRef = useRef(null);

  // Support legacy single-item prop
  const heroItems = items.length > 0 ? items : [];
  const current = heroItems[activeIdx];
  const currentArtist = current?.artist_id ? artists.find(a => a.id === current.artist_id) : null;
  const ytUrl = current?.youtube_url || current?.youtube_music_url;
  const ytId = getYoutubeId(ytUrl);

  // Inject modal opener
  if (current) current._openModal = () => setShowModal(true);

  const goTo = (idx) => {
    setActiveIdx(idx);
    resetInterval();
  };

  const prev = () => goTo((activeIdx - 1 + heroItems.length) % heroItems.length);
  const next = () => goTo((activeIdx + 1) % heroItems.length);

  const resetInterval = () => {
    clearInterval(intervalRef.current);
    if (heroItems.length > 1) {
      intervalRef.current = setInterval(() => {
        setActiveIdx(i => (i + 1) % heroItems.length);
      }, 7000);
    }
  };

  useEffect(() => {
    resetInterval();
    return () => clearInterval(intervalRef.current);
  }, [heroItems.length]);

  if (heroItems.length === 0) return null;

  return (
    <>
      {/* YouTube Modal */}
      <AnimatePresence>
        {showModal && ytId && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => { setShowModal(false); setEmbedFailed(false); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-4xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <p className="text-white font-bold text-sm truncate pr-4">{current?.title}</p>
                <button
                  onClick={() => { setShowModal(false); setEmbedFailed(false); }}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
              {embedFailed ? (
                <div className="w-full rounded-xl bg-[#111] border border-white/10 flex flex-col items-center justify-center py-16 gap-4">
                  <Youtube className="w-12 h-12 text-red-400" />
                  <p className="text-white/70 text-sm text-center">Este video no permite reproducción embebida.</p>
                  {ytUrl && (
                    <a href={ytUrl} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors">
                      Ver en YouTube →
                    </a>
                  )}
                </div>
              ) : (
                <div className="relative w-full rounded-xl overflow-hidden shadow-2xl" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
                    title={current?.title}
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

      {/* Hero Carousel */}
      <div className="relative w-full overflow-hidden" style={{ height: "85vh", minHeight: 520 }}>
        <AnimatePresence mode="sync">
          {heroItems.map((item, idx) =>
            idx === activeIdx ? (
              <motion.div
                key={item.id || idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0"
              >
                <HeroSlide
                  item={item}
                  artist={artists.find(a => a.id === item.artist_id)}
                  onExplore={() => onExplore && onExplore(item)}
                  active={idx === activeIdx}
                />
              </motion.div>
            ) : null
          )}
        </AnimatePresence>

        {/* Navigation arrows — solo si hay más de 1 */}
        {heroItems.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 flex items-center justify-center transition-all backdrop-blur-sm"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 flex items-center justify-center transition-all backdrop-blur-sm"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </>
        )}

        {/* Dots */}
        {heroItems.length > 1 && (
          <div className="absolute bottom-8 right-8 z-20 flex items-center gap-1.5">
            {heroItems.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                className={`h-0.5 rounded-full transition-all duration-400 ${idx === activeIdx ? "w-6 bg-white" : "w-2 bg-white/25 hover:bg-white/50"}`}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}