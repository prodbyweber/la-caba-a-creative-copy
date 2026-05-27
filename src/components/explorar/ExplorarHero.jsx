import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Info, X, Youtube, ChevronLeft, ChevronRight, ExternalLink, Volume2, VolumeX } from "lucide-react";
import { useExplorar } from "@/context/ExplorarContext.jsx";

function getYoutubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function HeroSlide({ item, artist, onExplore, active, shouldPlayAudio, onVideoReady, onOpenItem }) {
  const ytUrl = item?.youtube_url || item?.youtube_music_url;
  const ytId = getYoutubeId(ytUrl);
  const bg = item?.image || artist?.avatar_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1600&q=80";
  const isVideo = item?.hero_media_type === "video" && item?.hero_media_url;
  const audioEnabled = isVideo && !!(item?.raw?.hero_audio_enabled ?? item?.hero_audio_enabled);
  const videoRef = useRef(null);
  // Audio always starts muted by default
  const [muted, setMuted] = useState(true);

  // Control play/pause — always muted until user explicitly toggles
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    if (active) {
      vid.play().catch(() => {});
      // If tab hidden or card modal open, force mute
      if (!shouldPlayAudio) {
        vid.muted = true;
        setMuted(true);
      }
      // Don't auto-unmute — user controls mute via button
    } else {
      vid.pause();
      vid.muted = true;
      setMuted(true);
    }
  }, [active, shouldPlayAudio]);

  const handleToggleMute = () => {
    const vid = videoRef.current;
    if (!vid) return;
    const next = !muted;
    vid.muted = next;
    vid.volume = 1;
    setMuted(next);
  };

  const handleActionBtn = () => {
    const link = item?.hero_link;
    if (!link) {
      onExplore?.();
      return;
    }
    if (link.startsWith("#open:")) {
      const itemId = link.replace("#open:", "");
      onOpenItem?.(itemId);
      return;
    }
    if (link.startsWith("http://") || link.startsWith("https://")) {
      window.open(link, "_blank", "noopener");
    } else {
      window.location.href = link;
    }
  };

  const hasPlayBtn = !!ytId;
  const hasActionBtn = !!(item?.hero_link || artist);
  const actionLabel = item?.hero_link_label || (artist ? "Ver artista" : "Más info");

  return (
    <div className="absolute inset-0">
      {/* Background media */}
      <div className="absolute inset-0 overflow-hidden">
        {isVideo ? (
          <>
            <video
              ref={videoRef}
              src={item.hero_media_url}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: "brightness(1.08) saturate(1.15)" }}
              muted
              loop
              playsInline
              preload="auto"
              onCanPlay={() => onVideoReady?.()}
              data-hero-video
            />
            {/* Audio toggle — shown on all video slides */}
            {isVideo && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                onClick={handleToggleMute}
                className="absolute bottom-12 right-4 z-20 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/70 hover:border-white/40 transition-all"
                title={muted ? "Activar sonido" : "Silenciar"}
              >
                {muted
                  ? <VolumeX className="w-4 h-4 text-white/70" />
                  : <Volume2 className="w-4 h-4 text-white" />
                }
              </motion.button>
            )}
          </>
        ) : (
          <img
            src={item?.hero_media_url || bg}
            alt={item?.title}
            className="w-full h-full object-cover"
            style={{ filter: "brightness(1.08) saturate(1.15)" }}
          />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(8,8,8,0.25) 20%, transparent 60%)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(8,8,8,0.3) 0%, transparent 35%)" }} />
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
            className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight"
            style={{ fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "-0.02em" }}
          >
            {item?.title}
          </h1>

          {artist && (
            <p className="text-white/60 text-sm mb-6 font-medium">
              por{" "}
              <span className="text-white cursor-pointer hover:text-[#ff5833] transition-colors" onClick={onExplore}>
                {artist.stageName}
              </span>
            </p>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            {hasPlayBtn && (
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
            {hasActionBtn && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={item?.hero_link ? handleActionBtn : onExplore}
                className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-bold rounded-lg hover:bg-white/20 transition-colors text-sm border border-white/10"
              >
                {item?.hero_link ? <ExternalLink className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                {actionLabel}
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function ExplorarHero({ items = [], artists = [], onExplore, onOpenItem }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [heroReady, setHeroReady] = useState(false);
  const explorar = useExplorar();
  const cardModalOpen = explorar?.cardModalOpen ?? false;
  const [showModal, setShowModal] = useState(false);
  const [embedFailed, setEmbedFailed] = useState(false);
  const intervalRef = useRef(null);
  // isHeroVisible: true when hero is scrolled into view (>50% visible)
  const [isHeroVisible, setIsHeroVisible] = useState(false);
  const heroRef = useRef(null);

  const heroItems = items.length > 0 ? items : [];
  const current = heroItems[activeIdx];
  const ytUrl = current?.youtube_url || current?.youtube_music_url;
  const ytId = getYoutubeId(ytUrl);

  if (current) current._openModal = () => setShowModal(true);

  // Audio should only play when:
  // 1. Hero is scrolled into view
  // 2. No card modal open (YouTube embed in cards)
  // 3. No YouTube modal open in hero
  // 4. Tab is visible (not background)
  const [tabVisible, setTabVisible] = useState(!document.hidden);

  const shouldPlayAudio = isHeroVisible && !cardModalOpen && !showModal && tabVisible;

  const goTo = (idx) => {
    if (idx === activeIdx || transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setActiveIdx(idx);
      setTransitioning(false);
    }, 250);
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

  // Track tab visibility (single listener)
  useEffect(() => {
    const handleVisibility = () => {
      const visible = !document.hidden;
      setTabVisible(visible);
      // Pause all hero videos when tab hidden, resume when visible
      document.querySelectorAll('[data-hero-video]').forEach(vid => {
        if (document.hidden) {
          vid.pause();
        } else {
          // Only resume if it's the active slide video
          vid.play().catch(() => {});
        }
      });
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // IntersectionObserver — hero visible only when >50% in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeroVisible(entry.isIntersecting && entry.intersectionRatio >= 0.5);
      },
      { threshold: [0, 0.5] }
    );
    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  // Preload logic for image vs video first slide
  useEffect(() => {
    if (heroItems.length === 0) return;
    const first = heroItems[0];
    const isVideo = first?.hero_media_type === "video" && first?.hero_media_url;
    if (isVideo) return; // revealed via onCanPlay
    const src = first?.hero_media_url || first?.image;
    if (!src) { setHeroReady(true); return; }
    const img = new Image();
    img.onload = () => setHeroReady(true);
    img.onerror = () => setHeroReady(true);
    img.src = src;
  }, [heroItems.length > 0 ? heroItems[0]?.id : null]);

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
              initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.97, opacity: 0 }}
              transition={{ duration: 0.12 }}
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
                <div className="relative w-full rounded-xl overflow-hidden shadow-2xl bg-black" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    key={ytId}
                    src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
                    title={current?.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full border-0"
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Carousel */}
      <motion.div
        ref={heroRef}
        className="relative w-full overflow-hidden"
        initial={{ opacity: 0, scale: 1.04 }}
        animate={heroReady ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.04 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        style={{ height: "85vh", minHeight: 520 }}
      >
        {heroItems.map((item, idx) => (
          <div
            key={item.id || idx}
            className="absolute inset-0"
            style={{
              opacity: idx === activeIdx ? 1 : 0,
              transitionDuration: "0ms",
              pointerEvents: idx === activeIdx ? "auto" : "none",
            }}
          >
            <HeroSlide
              item={item}
              artist={artists.find(a => a.id === item.artist_id)}
              onExplore={() => onExplore && onExplore(item)}
              active={idx === activeIdx && !transitioning}
              shouldPlayAudio={shouldPlayAudio}
              onVideoReady={idx === 0 ? () => setHeroReady(true) : undefined}
              onOpenItem={onOpenItem}
            />
          </div>
        ))}

        {/* Cinematic curtain */}
        <motion.div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{ background: "#080808" }}
          animate={{ opacity: transitioning ? 1 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        />

        {/* Nav arrows */}
        {heroItems.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 flex items-center justify-center transition-all backdrop-blur-sm">
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 flex items-center justify-center transition-all backdrop-blur-sm">
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
      </motion.div>
    </>
  );
}