import React from "react";
import { motion } from "framer-motion";
import { Images, Lock } from "lucide-react";

function getYtShortId(url) {
  if (!url) return null;
  const m = url.match(/(?:shorts\/|youtu\.be\/|watch\?v=)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

// Returns true if currentUser has access to this gallery item
// projectRaw may include credits[].artist_id linked to Artist.user_id (resolved externally)
// We pass linkedArtistId (the Artist record linked to currentUser) for credit matching
function hasGalleryAccess(galleryItem, projectRaw, currentUser, linkedArtistId) {
  if (!galleryItem.restricted) return true;          // public item
  if (!currentUser) return false;                    // guest: no access to restricted
  if (currentUser.role === "admin") return true;     // admin always sees all
  // Uploader matches
  if (galleryItem.uploader_user_id && galleryItem.uploader_user_id === currentUser.id) return true;
  // Artist in credits
  const credits = projectRaw?.credits || [];
  if (linkedArtistId && credits.some(c => c.artist_id === linkedArtistId)) return true;
  // Artist is the main artist
  if (linkedArtistId && projectRaw?.artist_id === linkedArtistId) return true;
  return false;
}

function GalleryCell({ item }) {
  if (item.type === "youtube_short") {
    const ytId = getYtShortId(item.url);
    const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;
    return (
      <div className="relative flex-shrink-0 overflow-hidden rounded-lg" style={{ width: 52, height: 74, background: "#111" }}>
        {thumb ? (
          <img src={thumb} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-white/5" />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 rounded-full bg-black/50 flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-white ml-0.5" fill="white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="relative flex-shrink-0 overflow-hidden rounded-lg" style={{ width: 52, height: 74, background: "#111" }}>
      <img src={item.url} alt={item.caption || ""} className="w-full h-full object-cover" />
    </div>
  );
}

export default function ProjectGalleryStrip({ gallery, projectRaw, currentUser, linkedArtistId, onOpenFeed }) {
  if (!gallery || gallery.length === 0) return null;

  // Filter based on access
  const visibleGallery = gallery.filter(g => hasGalleryAccess(g, projectRaw, currentUser, linkedArtistId));

  if (visibleGallery.length === 0) return null;

  const preview = visibleGallery.slice(0, 5);
  const remaining = visibleGallery.length - preview.length;
  const hasRestricted = gallery.some(g => g.restricted) && !currentUser;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="mt-5 pt-4 border-t border-white/[0.06]"
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <Images className="w-3 h-3 text-white/25" />
          <span className="text-[10px] font-semibold text-white/25 uppercase tracking-widest">Galería</span>
          {hasRestricted && (
            <span className="flex items-center gap-0.5 text-[9px] text-white/20">
              <Lock className="w-2.5 h-2.5" /> Exclusivo
            </span>
          )}
        </div>
        <button
          onClick={onOpenFeed}
          className="text-[10px] text-white/30 hover:text-white/60 transition-colors underline underline-offset-2"
        >
          Ver todo
        </button>
      </div>

      <button onClick={onOpenFeed} className="w-full text-left group">
        <div className="flex gap-1.5 items-stretch overflow-hidden">
          {preview.map((item, i) => (
            <GalleryCell key={item.id || i} item={item} />
          ))}
          {remaining > 0 && (
            <div
              className="flex-shrink-0 rounded-lg flex items-center justify-center bg-white/[0.05] border border-white/[0.08] text-white/30 text-xs font-bold"
              style={{ width: 52, height: 74 }}
            >
              +{remaining}
            </div>
          )}
        </div>
      </button>
    </motion.div>
  );
}