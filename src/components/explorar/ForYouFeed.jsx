import React, { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Share2 } from "lucide-react";

function getYtShortId(url) {
  if (!url) return null;
  const m = url.match(/(?:shorts\/|youtu\.be\/|watch\?v=)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

// ── Single full-screen card ──────────────────────────────────────────────────
function FeedCard({ item, projectTitle }) {
  const [liked, setLiked] = useState(false);

  if (item.type === "youtube_short") {
    const ytId = getYtShortId(item.url);
    return (
      <div className="relative w-full h-full bg-black flex items-center justify-center">
        {ytId ? (
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=0&controls=1&rel=0&modestbranding=1&loop=1&playlist=${ytId}`}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ pointerEvents: "all" }}
          />
        ) : (
          <div className="text-white/20 text-sm">Video no disponible</div>
        )}
        <Overlay item={item} projectTitle={projectTitle} liked={liked} setLiked={setLiked} />
      </div>
    );
  }

  // image
  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
      <img
        src={item.url}
        alt={item.caption || ""}
        className="w-full h-full object-contain"
        style={{ maxHeight: "100%" }}
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.7) 100%)" }} />
      <Overlay item={item} projectTitle={projectTitle} liked={liked} setLiked={setLiked} />
    </div>
  );
}

function Overlay({ item, projectTitle, liked, setLiked }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 px-4 pb-8 flex items-end justify-between pointer-events-none">
      <div className="pointer-events-none">
        <p className="text-white font-bold text-sm leading-tight" style={{ fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "-0.01em" }}>
          {projectTitle}
        </p>
        {item.caption && (
          <p className="text-white/50 text-xs mt-0.5">{item.caption}</p>
        )}
      </div>
      <div className="flex flex-col gap-4 items-center pointer-events-auto">
        <button
          onClick={() => setLiked(l => !l)}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <Heart className={`w-5 h-5 ${liked ? "fill-red-500 text-red-500" : "text-white"}`} />
          </div>
        </button>
        <button className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <Share2 className="w-5 h-5 text-white" />
          </div>
        </button>
      </div>
    </div>
  );
}

// ── Section divider between projects ────────────────────────────────────────
function ProjectDivider({ title, subtitle }) {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-[#080808]" style={{ snapAlign: "start" }}>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-3">Siguiente proyecto</p>
      <h2 className="text-2xl font-black text-white text-center px-8" style={{ fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "-0.03em" }}>
        {title}
      </h2>
      {subtitle && <p className="text-white/40 text-sm mt-2">{subtitle}</p>}
      <div className="mt-6 animate-bounce">
        <svg className="w-5 h-5 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

// ── Main ForYouFeed ──────────────────────────────────────────────────────────
export default function ForYouFeed({ initialItem, allItems, onClose }) {
  // Build flat feed: current project first, then recommended
  const buildFeed = () => {
    const feed = [];

    const addProject = (item) => {
      const gallery = item.raw?.gallery || item.gallery || [];
      if (gallery.length === 0) return;
      feed.push({ type: "divider", title: item.title || item.raw?.title, subtitle: item.subtitle || item.raw?.subtitle });
      gallery.forEach(g => {
        feed.push({ type: "card", item: g, projectTitle: item.title || item.raw?.title });
      });
    };

    // Current project
    addProject(initialItem);

    // Other projects (those with gallery)
    if (allItems) {
      allItems
        .filter(i => {
          const id = i.id || i.raw?.id;
          const initId = initialItem.id || initialItem.raw?.id;
          return id !== initId;
        })
        .forEach(i => {
          const galleryItem = { ...i, gallery: i.raw?.gallery || i.gallery || [] };
          if ((galleryItem.gallery || []).length > 0) addProject(galleryItem);
        });
    }

    return feed;
  };

  const feed = buildFeed();

  if (feed.length === 0) {
    return createPortal(
      <div className="fixed inset-0 z-[1100] bg-black flex items-center justify-center">
        <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
          <X className="w-5 h-5 text-white" />
        </button>
        <p className="text-white/30 text-sm">Sin galería disponible</p>
      </div>,
      document.body
    );
  }

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1100] bg-black"
      style={{ overflowY: "scroll", scrollSnapType: "y mandatory", WebkitOverflowScrolling: "touch" }}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-[1200] w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-black/80 transition-colors"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      {feed.map((entry, i) => (
        <div key={i} style={{ scrollSnapAlign: "start", height: "100dvh", width: "100%", flexShrink: 0 }}>
          {entry.type === "divider" ? (
            <ProjectDivider title={entry.title} subtitle={entry.subtitle} />
          ) : (
            <FeedCard item={entry.item} projectTitle={entry.projectTitle} />
          )}
        </div>
      ))}
    </motion.div>,
    document.body
  );
}