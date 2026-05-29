import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Play, X, ChevronLeft, ChevronRight, Minimize2, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function getYtEmbed(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}?autoplay=1&rel=0` : null;
}

function getYtThumb(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null;
}

const ROWS = [
  { key: "films", label: "Films", accent: "#ff5833" },
  { key: "musica", label: "Música", accent: "#ff5833" },
  { key: "shorts", label: "Shorts", accent: "#ff5833" },
  { key: "fotografia", label: "Fotografía Editorial", accent: "#ff5833", isPhoto: true },
];

function MediaCard({ item, contentType, onPlay, onGallery, isPhoto }) {
  const [hovered, setHovered] = useState(false);
  const thumb = item.thumbnail_url || getYtThumb(item.youtube_url || item.youtube_music_url);

  return (
    <div
      className="relative flex-shrink-0 rounded-xl overflow-hidden cursor-pointer select-none"
      style={{ width: "clamp(160px, 16vw, 220px)", aspectRatio: "16/9", background: "#111" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => isPhoto ? onGallery(item.photos || [], 0) : onPlay(item.youtube_url_override || item.youtube_url || item.youtube_music_url)}
    >
      {thumb ? (
        <img src={thumb} alt={item.title} className="w-full h-full object-cover transition-transform duration-300"
          style={{ transform: hovered ? "scale(1.04)" : "scale(1)", filter: hovered ? "brightness(0.8)" : "brightness(0.92)" }} />
      ) : (
        <div className="w-full h-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)" }} />
      )}

      {/* Overlay gradient */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)" }} />

      {/* Play button */}
      {!isPhoto && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
            style={{
              background: hovered ? "rgba(255,88,51,0.9)" : "rgba(255,255,255,0.15)",
              backdropFilter: "blur(8px)",
              transform: hovered ? "scale(1.1)" : "scale(1)",
              border: hovered ? "1.5px solid rgba(255,88,51,0.6)" : "1.5px solid rgba(255,255,255,0.25)",
            }}>
            <Play className="w-4 h-4 text-white" style={{ marginLeft: 2 }} />
          </div>
        </div>
      )}

      {/* Photo icon */}
      {isPhoto && hovered && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,88,51,0.85)", backdropFilter: "blur(8px)" }}>
            <Maximize2 className="w-4 h-4 text-white" />
          </div>
        </div>
      )}

      {/* Title + category */}
      <div className="absolute bottom-0 left-0 right-0 p-2.5">
        <p className="text-[10px] font-black uppercase tracking-wider mb-0.5"
          style={{ color: "#ff5833", fontFamily: "'Helvetica Neue', sans-serif" }}>
          {contentType}
        </p>
        <p className="text-xs font-bold text-white truncate"
          style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>
          {item.title}
        </p>
      </div>
    </div>
  );
}

function ContentRow({ label, items, contentType, onPlay, onGallery, isPhoto }) {
  if (!items.length) return null;
  return (
    <div className="mb-6">
      <p className="text-[10px] font-black uppercase tracking-widest mb-3 px-4 sm:px-8"
        style={{ color: "rgba(240,237,232,0.35)", fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "0.22em" }}>
        {label}
      </p>
      <div className="flex gap-2.5 overflow-x-auto pb-2 px-4 sm:px-8"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {items.map((item) => (
          <MediaCard key={item.id} item={item} contentType={contentType} onPlay={onPlay} onGallery={onGallery} isPhoto={isPhoto} />
        ))}
      </div>
    </div>
  );
}

// YouTube Player (modal + pip)
function YouTubePlayer({ url, onClose }) {
  const [pip, setPip] = useState(false);
  const embedUrl = getYtEmbed(url);
  if (!embedUrl) return null;

  if (pip) {
    return (
      <div className="fixed bottom-4 right-4 z-[9999] rounded-xl overflow-hidden shadow-2xl"
        style={{ width: 280, aspectRatio: "16/9", border: "1px solid rgba(255,255,255,0.15)" }}>
        <iframe src={embedUrl} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen title="video" />
        <div className="absolute top-1.5 right-1.5 flex gap-1">
          <button onClick={() => setPip(false)}
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.7)" }}>
            <Maximize2 className="w-3 h-3 text-white" />
          </button>
          <button onClick={onClose}
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.7)" }}>
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        className="relative w-full rounded-2xl overflow-hidden"
        style={{ maxWidth: 900, aspectRatio: "16/9", background: "#000" }}
        onClick={e => e.stopPropagation()}
      >
        <iframe src={embedUrl} className="w-full h-full" allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen title="video" />
        <div className="absolute top-3 right-3 flex gap-2">
          <button onClick={() => setPip(true)}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.15)" }}
            title="Minimizar">
            <Minimize2 className="w-3.5 h-3.5 text-white" />
          </button>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.15)" }}>
            <X className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Photo gallery lightbox
function PhotoLightbox({ photos, initialIdx, onClose }) {
  const [idx, setIdx] = useState(initialIdx || 0);
  if (!photos.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.96)" }}
      onClick={onClose}
    >
      <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center"
        style={{ background: "rgba(255,255,255,0.1)" }}>
        <X className="w-4 h-4 text-white" />
      </button>
      {idx > 0 && (
        <button onClick={e => { e.stopPropagation(); setIdx(i => i - 1); }}
          className="absolute left-4 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.1)" }}>
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>
      )}
      {idx < photos.length - 1 && (
        <button onClick={e => { e.stopPropagation(); setIdx(i => i + 1); }}
          className="absolute right-4 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.1)" }}>
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
      )}
      <img
        src={photos[idx]} alt="" onClick={e => e.stopPropagation()}
        className="max-w-full max-h-[85vh] rounded-xl object-contain"
        style={{ boxShadow: "0 0 80px rgba(0,0,0,0.8)" }}
      />
      <p className="absolute bottom-5 text-white/40 text-xs">{idx + 1} / {photos.length}</p>
    </motion.div>
  );
}

export default function StartExplorarBlock() {
  const [playUrl, setPlayUrl] = useState(null);
  const [gallery, setGallery] = useState(null); // { photos, idx }

  const { data: blocks = [] } = useQuery({
    queryKey: ["start-page-blocks"],
    queryFn: () => base44.entities.StartPageBlock.list("order"),
    staleTime: 60000,
  });

  const { data: explorarItems = [] } = useQuery({
    queryKey: ["explorar-items-start"],
    queryFn: () => base44.entities.ExplorarItem.filter({ is_active: true }),
    staleTime: 60000,
  });

  const { data: fotoItems = [] } = useQuery({
    queryKey: ["start-foto-items"],
    queryFn: () => base44.entities.StartPageFotoItem.list("order"),
    staleTime: 60000,
  });

  // Map blocks to ExplorarItems
  const getRowItems = (rowKey) => {
    const rowBlocks = blocks.filter(b => b.row_key === rowKey).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return rowBlocks.map(block => {
      const item = explorarItems.find(i => i.id === block.item_id);
      if (!item) return null;
      return { ...item, youtube_url_override: block.youtube_url_override || null };
    }).filter(Boolean);
  };

  const filmsItems = getRowItems("films");
  const musicaItems = getRowItems("musica");
  const shortsItems = getRowItems("shorts");

  const fotoItemsSorted = [...fotoItems].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map(f => ({
    ...f,
    thumbnail_url: f.thumbnail_url || (f.photos?.[0] || null),
  }));

  const hasContent = filmsItems.length || musicaItems.length || shortsItems.length || fotoItemsSorted.length;

  if (!hasContent) {
    return (
      <div className="py-10 text-center">
        <p className="text-sm" style={{ color: "rgba(240,237,232,0.2)" }}>
          Próximamente — añade contenido desde el panel de administración
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", marginLeft: "-clamp(24px, 6vw, 56px)", marginRight: "-clamp(24px, 6vw, 56px)" }}>
      <ContentRow label="Films" items={filmsItems} contentType="Film" onPlay={setPlayUrl} onGallery={() => {}} />
      <ContentRow label="Música" items={musicaItems} contentType="Música" onPlay={setPlayUrl} onGallery={() => {}} />
      <ContentRow label="Shorts" items={shortsItems} contentType="Short" onPlay={setPlayUrl} onGallery={() => {}} />
      <ContentRow label="Fotografía Editorial" items={fotoItemsSorted} contentType="Editorial"
        onPlay={() => {}} onGallery={(photos, idx) => setGallery({ photos, idx })} isPhoto />

      <AnimatePresence>
        {playUrl && <YouTubePlayer url={playUrl} onClose={() => setPlayUrl(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {gallery && <PhotoLightbox photos={gallery.photos} initialIdx={gallery.idx} onClose={() => setGallery(null)} />}
      </AnimatePresence>
    </div>
  );
}