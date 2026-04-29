import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, Music2, Heart, Bookmark } from "lucide-react";
import { useExplorar } from "@/context/ExplorarContext.jsx";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import RecommendedRow from "@/components/explorar/RecommendedRow";
import ProjectGalleryStrip from "@/components/explorar/ProjectGalleryStrip";
import ForYouFeed from "@/components/explorar/ForYouFeed";

function getYoutubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

// ── Singleton YouTube Modal ─────────────────────────────────────────────────
function YoutubeModal() {
  const { ytModal, closeYtModal } = useExplorar();
  if (!ytModal) return null;
  const { ytId, title, originalUrl } = ytModal;

  return createPortal(
    <motion.div
      key="yt-modal"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
      style={{ zIndex: 1000 }}
      onClick={closeYtModal}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="relative w-full max-w-4xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-white font-bold text-sm truncate pr-4">{title}</p>
          <button onClick={closeYtModal} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
        {/* iframe is stable — never unmounts while modal is open */}
        <div className="relative w-full rounded-xl overflow-hidden shadow-2xl bg-black" style={{ paddingBottom: "56.25%" }}>
          <iframe
            key={ytId}
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
        {originalUrl && (
          <p className="text-center mt-3">
            <a href={originalUrl} target="_blank" rel="noopener noreferrer"
              className="text-white/30 hover:text-white/60 text-xs underline underline-offset-2 transition-colors">
              Abrir en YouTube →
            </a>
          </p>
        )}
      </motion.div>
    </motion.div>,
    document.body
  );
}

// ── Singleton Credits Modal ─────────────────────────────────────────────────
function CreditsModalInner() {
  const { creditsModal, closeCreditsModal, openYtModal } = useExplorar();
  const [currentItem, setCurrentItem] = useState(null);
  const [showFeed, setShowFeed] = useState(false);
  const qc = useQueryClient();

  // Sync currentItem when modal opens with a new item
  useEffect(() => {
    if (creditsModal?.item) {
      setCurrentItem(creditsModal.item);
      setShowFeed(false);
    }
  }, [creditsModal?.item?.id]);

  const item = currentItem;
  const currentUser = creditsModal?.currentUser;
  const allItems = creditsModal?.allItems;
  const ytId = item ? getYoutubeId(item.youtube_url || item.youtube_music_url) : null;
  const hasVideo = !!ytId;

  // All hooks must be called unconditionally
  const { data: likes = [] } = useQuery({
    queryKey: ["likes", item?.id, currentUser?.id],
    queryFn: () => base44.entities.Like.filter({ item_id: item.id, user_id: currentUser.id }),
    enabled: !!item?.id && !!currentUser?.id,
  });
  const { data: saves = [] } = useQuery({
    queryKey: ["saves", item?.id, currentUser?.id],
    queryFn: () => base44.entities.Save.filter({ item_id: item.id, user_id: currentUser.id }),
    enabled: !!item?.id && !!currentUser?.id,
  });
  const isLiked = likes.length > 0;
  const isSaved = saves.length > 0;

  const toggleLike = useMutation({
    mutationFn: async () => {
      if (isLiked && likes[0]?.id) await base44.entities.Like.delete(likes[0].id);
      else await base44.entities.Like.create({ user_id: currentUser?.id, item_id: item?.id });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["likes", item?.id, currentUser?.id] }),
  });
  const toggleSave = useMutation({
    mutationFn: async () => {
      if (isSaved && saves[0]?.id) await base44.entities.Save.delete(saves[0].id);
      else await base44.entities.Save.create({ user_id: currentUser?.id, item_id: item?.id });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["saves", item?.id, currentUser?.id] }),
  });

  // Resolve linked artist for the current user (for gallery access check)
  const { data: linkedArtist } = useQuery({
    queryKey: ["linked-artist", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      const results = await base44.entities.Artist.filter({ user_id: currentUser.id });
      return results[0] || null;
    },
    enabled: !!currentUser?.id,
    staleTime: 60000,
  });

  if (!creditsModal || !item) return null;

  return createPortal(
    <motion.div
      key="credits-modal"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/85 backdrop-blur-xl flex items-end sm:items-center justify-center px-3 pb-0 sm:pb-4 sm:pt-4"
      style={{ zIndex: 900 }}
      onClick={closeCreditsModal}
    >
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative w-full max-w-lg rounded-t-2xl sm:rounded-2xl overflow-y-auto"
        style={{ background: "#141414", maxHeight: "92dvh", scrollbarWidth: "none", msOverflowStyle: "none" }}
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
          <button onClick={closeCreditsModal}
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
                <button onClick={() => toggleLike.mutate()}
                  className={`w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center border transition-all ${isLiked ? "bg-red-500/60 border-red-400/60" : "bg-black/40 border-white/20 hover:bg-black/60"}`}>
                  <Heart className="w-3.5 h-3.5 text-white" fill={isLiked ? "white" : "none"} />
                </button>
                <button onClick={() => toggleSave.mutate()}
                  className={`w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center border transition-all ${isSaved ? "bg-blue-500/60 border-blue-400/60" : "bg-black/40 border-white/20 hover:bg-black/60"}`}>
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
              <button
                onClick={() => openYtModal(ytId, item.title, item.youtube_url || item.youtube_music_url)}
                className="flex items-center gap-2 px-5 py-2 bg-white text-black font-bold text-sm rounded-lg hover:bg-white/90 transition-colors">
                <Play className="w-4 h-4" fill="black" />
                Reproducir
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-4">
            {item.subtitle && (
              <div><span className="text-white/30 text-xs">Género: </span><span className="text-white/60 text-xs">{item.subtitle}</span></div>
            )}
            {item.raw?.year && (
              <div><span className="text-white/30 text-xs">Año: </span><span className="text-white/60 text-xs">{item.raw.year}</span></div>
            )}
            {item.raw?.duration && (
              <div><span className="text-white/30 text-xs">Duración: </span><span className="text-white/60 text-xs">{item.raw.duration}</span></div>
            )}
            {item.raw?.content_type && (
              <div><span className="text-white/30 text-xs">Tipo: </span><span className="text-white/60 text-xs capitalize">{item.raw.content_type}</span></div>
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

        {/* Gallery strip — upload button is inline inside the strip for authorized users */}
        <div className="px-6 pb-4">
          <ProjectGalleryStrip
            gallery={item.raw?.gallery || []}
            projectRaw={item.raw}
            currentUser={currentUser}
            linkedArtistId={linkedArtist?.id}
            onOpenFeed={() => setShowFeed(true)}
            onUploaded={() => qc.invalidateQueries({ queryKey: ["explorar-items"] })}
          />
        </div>

        <RecommendedRow
          currentItem={item}
          allItems={allItems}
          onSelect={(recommended) => setCurrentItem(recommended)}
        />

        {/* For You Feed */}
        <AnimatePresence>
          {showFeed && (
            <ForYouFeed
              initialItem={{ ...item, gallery: item.raw?.gallery || [] }}
              allItems={allItems}
              currentUser={currentUser}
              linkedArtistId={linkedArtist?.id}
              onClose={() => setShowFeed(false)}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>,
    document.body
  );
}

// ── GlobalModals — rendered once at root level ──────────────────────────────
export default function GlobalModals() {
  const { ytModal, creditsModal } = useExplorar();
  return (
    <>
      <AnimatePresence>{creditsModal && <CreditsModalInner key="credits" />}</AnimatePresence>
      <AnimatePresence>{ytModal && <YoutubeModal key="yt" />}</AnimatePresence>
    </>
  );
}