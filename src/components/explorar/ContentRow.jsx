import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Music2, Play, Pause, Youtube, X, ChevronDown, Heart, Bookmark } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useExplorar } from "@/context/ExplorarContext.jsx";
import RecommendedRow from "@/components/explorar/RecommendedRow";

function getYoutubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

// Modal YouTube fullscreen
function YoutubeModal({ ytId, title, originalUrl, onClose }) {
  const [embedFailed, setEmbedFailed] = useState(false);
  return createPortal(
    <AnimatePresence>
      {ytId && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[500] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-4xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <p className="text-white font-bold text-sm truncate pr-4">{title}</p>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            {embedFailed ? (
              <div className="w-full rounded-xl bg-[#111] border border-white/10 flex flex-col items-center justify-center py-16 gap-4">
                <Youtube className="w-12 h-12 text-red-400" />
                <p className="text-white/70 text-sm text-center">Este video no permite reproducción embebida.</p>
                {originalUrl && (
                  <a href={originalUrl} target="_blank" rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors">
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
    </AnimatePresence>,
    document.body
  );
}

// Credits modal — completamente fuera del árbol de la tarjeta via portal
function CreditsModal({ item: initialItem, hasVideo: initialHasVideo, hasAudio: initialHasAudio, playing, onClose, onPlay, onToggleAudio, currentUser, isLiked, isSaved, onToggleLike, onToggleSave, allItems }) {
  // currentItem puede cambiar al navegar por recomendados — siempre el mismo modal, X cierra todo
  const [currentItem, setCurrentItem] = React.useState(initialItem);
  const item = currentItem;
  const ytId = getYoutubeId(item.youtube_url || item.youtube_music_url);
  const hasVideo = !!ytId;
  const hasAudio = !!item.audio_file_url;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[500] bg-black/85 backdrop-blur-xl flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 24 }}
        transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: "#141414" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Hero media */}
        <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
          {item.hero_media_type === "video" && item.hero_media_url ? (
            <video src={item.hero_media_url} className="w-full h-full object-cover" autoPlay muted loop playsInline />
          ) : item.image ? (
            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1a1a1c] to-[#080808] flex items-center justify-center">
              <Music2 className="w-12 h-12 text-white/10" />
            </div>
          )}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, #141414 100%)" }} />
          <button onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center hover:bg-black/80 transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-4 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-black text-white leading-tight" style={{ fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "-0.02em" }}>
                {item.title}
              </h2>
              {item.subtitle && <p className="text-white/50 text-xs mt-0.5">{item.subtitle}</p>}
            </div>
            {currentUser && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onToggleLike()}
                  className={`w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center border transition-all ${
                    isLiked
                      ? "bg-red-500/60 border-red-400/60"
                      : "bg-black/40 border-white/20 hover:bg-black/60"
                  }`}
                  title={isLiked ? "Quitar like" : "Me gusta"}
                >
                  <Heart className="w-3.5 h-3.5 text-white" fill={isLiked ? "white" : "none"} />
                </button>
                <button
                  onClick={() => onToggleSave()}
                  className={`w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center border transition-all ${
                    isSaved
                      ? "bg-blue-500/60 border-blue-400/60"
                      : "bg-black/40 border-white/20 hover:bg-black/60"
                  }`}
                  title={isSaved ? "Quitar de guardados" : "Guardar"}
                >
                  <Bookmark className="w-3.5 h-3.5 text-white" fill={isSaved ? "white" : "none"} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="px-6 pt-3 pb-6">
          <div className="flex items-center gap-2 mb-5">
            {hasVideo && (
              <button onClick={onPlay}
                className="flex items-center gap-2 px-5 py-2 bg-white text-black font-bold text-sm rounded-lg hover:bg-white/90 transition-colors">
                <Play className="w-4 h-4" fill="black" />
                Reproducir
              </button>
            )}
            {hasAudio && (
              <button onClick={onToggleAudio}
                className="flex items-center gap-2 px-5 py-2 bg-white/15 text-white font-bold text-sm rounded-lg hover:bg-white/25 transition-colors border border-white/10">
                {playing ? <Pause className="w-4 h-4" fill="white" /> : <Play className="w-4 h-4" fill="white" />}
                {playing ? "Pausar" : "Escuchar"}
              </button>
            )}
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-4">
            {item.subtitle && (
              <div>
                <span className="text-white/30 text-xs">Género: </span>
                <span className="text-white/60 text-xs">{item.subtitle}</span>
              </div>
            )}
            {item.raw?.year && (
              <div>
                <span className="text-white/30 text-xs">Año: </span>
                <span className="text-white/60 text-xs">{item.raw.year}</span>
              </div>
            )}
            {item.raw?.duration && (
              <div>
                <span className="text-white/30 text-xs">Duración: </span>
                <span className="text-white/60 text-xs">{item.raw.duration}</span>
              </div>
            )}
            {item.raw?.content_type && (
              <div>
                <span className="text-white/30 text-xs">Tipo: </span>
                <span className="text-white/60 text-xs capitalize">{item.raw.content_type}</span>
              </div>
            )}
            {item.youtube_url && (
              <div className="col-span-2">
                <a href={item.youtube_url} target="_blank" rel="noopener noreferrer"
                  className="text-white/40 text-xs hover:text-white transition-colors underline underline-offset-2"
                  onClick={e => e.stopPropagation()}>
                  Ver en YouTube →
                </a>
              </div>
            )}
          </div>

          {/* Créditos */}
          {item.raw?.credits && item.raw.credits.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-white/20 uppercase tracking-widest mb-2">Créditos</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                {item.raw.credits.map((credit, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-white/25 text-xs flex-shrink-0">{credit.role}:</span>
                    <span className="text-white/60 text-xs truncate">{credit.name || "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recomendados */}
        <RecommendedRow
          currentItem={item}
          allItems={allItems}
          onSelect={(recommended) => setCurrentItem(recommended)}
        />
      </motion.div>
    </motion.div>,
    document.body
  );
}

function ContentCard({ item, onClick, currentUser, allItems, onSelectRecommended }) {
  const [hovered, setHovered] = useState(false);
  const [previewActive, setPreviewActive] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [showYTModal, setShowYTModal] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const audioRef = useRef(null);
  const hoverTimer = useRef(null);
  const qc = useQueryClient();
  const explorar = useExplorar();

  // Fetch user's likes and saves for this item
  const { data: likes = [] } = useQuery({
    queryKey: ["likes", item.id, currentUser?.id],
    queryFn: () => currentUser?.id ? base44.entities.Like.filter({ item_id: item.id, user_id: currentUser.id }) : Promise.resolve([]),
    enabled: !!currentUser?.id,
  });

  const { data: saves = [] } = useQuery({
    queryKey: ["saves", item.id, currentUser?.id],
    queryFn: () => currentUser?.id ? base44.entities.Save.filter({ item_id: item.id, user_id: currentUser.id }) : Promise.resolve([]),
    enabled: !!currentUser?.id,
  });

  const isLiked = likes.length > 0;
  const isSaved = saves.length > 0;

  const toggleLikeMutation = useMutation({
    mutationFn: async () => {
      if (isLiked && likes[0]?.id) {
        await base44.entities.Like.delete(likes[0].id);
      } else {
        await base44.entities.Like.create({ user_id: currentUser.id, item_id: item.id });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["likes", item.id, currentUser?.id] });
    },
  });

  const toggleSaveMutation = useMutation({
    mutationFn: async () => {
      if (isSaved && saves[0]?.id) {
        await base44.entities.Save.delete(saves[0].id);
      } else {
        await base44.entities.Save.create({ user_id: currentUser.id, item_id: item.id });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["saves", item.id, currentUser?.id] });
    },
  });

  const ytId = getYoutubeId(item.youtube_url || item.youtube_music_url);
  const hasAudio = !!item.audio_file_url;
  const hasVideo = !!ytId;

  const handleMouseEnter = () => {
    setHovered(true);
    hoverTimer.current = setTimeout(() => {
      setPreviewActive(true);
      if (audioRef.current && !playing) {
        audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
      }
    }, 1500);
  };

  const handleMouseLeave = () => {
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

  const handleCardClick = () => {
    if (item.artist_id) onClick(item);
  };

  return (
    <>
      {/* Modals via portal — completamente fuera de la tarjeta */}
      {showYTModal && (
        <YoutubeModal
          ytId={ytId}
          title={item.title}
          originalUrl={item.youtube_url || item.youtube_music_url}
          onClose={() => { setShowYTModal(false); explorar?.setCardModalOpen(false); }}
        />
      )}
      <AnimatePresence>
        {showCredits && (
          <CreditsModal
            item={item}
            hasVideo={hasVideo}
            hasAudio={hasAudio}
            playing={playing}
            onClose={() => { setShowCredits(false); explorar?.setCardModalOpen(false); }}
            onPlay={() => { setShowCredits(false); setShowYTModal(true); explorar?.setCardModalOpen(true); }}
            onToggleAudio={(e) => toggleAudio(e)}
            currentUser={currentUser}
            isLiked={isLiked}
            isSaved={isSaved}
            onToggleLike={() => toggleLikeMutation.mutate()}
            onToggleSave={() => toggleSaveMutation.mutate()}
            allItems={allItems}
          />
        )}
      </AnimatePresence>

      <motion.div
        className="relative flex-shrink-0 cursor-pointer"
        style={{ width: 220 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleCardClick}
        animate={previewActive ? { scale: 1.08, zIndex: 10 } : { scale: 1, zIndex: 1 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Audio element */}
        {hasAudio && (
          <audio ref={audioRef} src={item.audio_file_url} preload="metadata" onEnded={() => setPlaying(false)} />
        )}

        <div className="relative rounded-xl overflow-hidden bg-[#1a1a1c]" style={{ aspectRatio: "16/9" }}>
          {/* Cover image */}
          {item.image ? (
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover transition-all duration-500"
              style={{
                filter: hovered ? "brightness(1.15) saturate(1.3) contrast(1.05)" : "brightness(1.05) saturate(1.15)",
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music2 className="w-8 h-8 text-white/10" />
            </div>
          )}

          {/* Preview en loop (video o iframe YouTube si no hay preview propio) */}
          <AnimatePresence>
            {previewActive && (item.raw?.preview_media_url || hasVideo) && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0"
              >
                {item.raw?.preview_media_url ? (
                  item.raw.preview_media_type === "video" ? (
                    <video
                      src={item.raw.preview_media_url}
                      className="w-full h-full object-cover"
                      autoPlay muted loop playsInline
                      preload="none"
                      style={{ pointerEvents: "none" }}
                    />
                  ) : (
                    <img src={item.raw.preview_media_url} alt="" className="w-full h-full object-cover" style={{ pointerEvents: "none" }} />
                  )
                ) : hasVideo ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&mute=1&controls=0&rel=0&modestbranding=1&loop=1&playlist=${ytId}`}
                    className="w-full h-full"
                    allow="autoplay"
                    style={{ pointerEvents: "none" }}
                  />
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hover overlay — muy sutil, solo para legibilidad de controles */}
          <div
            className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
            style={{
              background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%)",
              opacity: hovered ? 1 : 0,
            }}
          />

          {/* Playing bar */}
          {playing && !previewActive && (
            <div className="absolute top-2 left-2 flex items-end gap-[2px] h-4">
              {[3, 6, 9, 5, 8, 4, 7].map((h, i) => (
                <div key={i} className="w-[2px] rounded-full bg-white/60"
                  style={{ height: `${h}px`, animation: `waveBar 0.${6 + (i % 5)}s ease-in-out infinite alternate`, animationDelay: `${i * 0.07}s` }} />
              ))}
              <style>{`@keyframes waveBar { from { transform: scaleY(0.3); opacity: 0.3; } to { transform: scaleY(1); opacity: 0.8; } }`}</style>
            </div>
          )}

          {/* Hover controls */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center gap-2.5"
              >
                {hasAudio && (
                  <button onClick={toggleAudio}
                    className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/20 hover:bg-black/60 transition-colors"
                    title={playing ? "Pausar" : "Reproducir audio"}>
                    {playing ? <Pause className="w-3.5 h-3.5 text-white" fill="white" /> : <Play className="w-3.5 h-3.5 text-white ml-0.5" fill="white" />}
                  </button>
                )}
                {hasVideo && (
                  <button onClick={e => { e.stopPropagation(); setShowYTModal(true); explorar?.setCardModalOpen(true); }}
                    className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/20 hover:bg-black/60 transition-colors"
                    title="Reproducir video">
                    <Play className="w-3.5 h-3.5 text-white ml-0.5" fill="white" />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>



          {/* Credits button — esquina inferior derecha, solo visible en hover */}
          <AnimatePresence>
            {hovered && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={e => { e.stopPropagation(); setShowCredits(true); explorar?.setCardModalOpen(true); }}
                className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/70 hover:border-white/40 transition-all"
                title="Más información"
              >
                <ChevronDown className="w-3.5 h-3.5 text-white/80" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}

export default function ContentRow({ title, items, onItemClick, currentUser, allItems, onSelectRecommended }) {
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
          <ContentCard key={`${item.id}-${i}`} item={item} onClick={onItemClick} currentUser={currentUser} allItems={allItems} onSelectRecommended={onSelectRecommended} />
        ))}
      </div>
    </div>
  );
}