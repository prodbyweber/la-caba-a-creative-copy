import React from "react";
import { motion } from "framer-motion";
import { Images, Lock, Plus } from "lucide-react";
import GalleryUploadButton from "@/components/explorar/GalleryUploadButton";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

function getYtShortId(url) {
  if (!url) return null;
  const m = url.match(/(?:shorts\/|youtu\.be\/|watch\?v=)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function hasGalleryAccess(galleryItem, projectRaw, currentUser, linkedArtistId) {
  if (!galleryItem.restricted) return true;
  if (!currentUser) return false;
  if (currentUser.role === "admin") return true;
  if (galleryItem.uploader_user_id && galleryItem.uploader_user_id === currentUser.id) return true;
  const credits = projectRaw?.credits || [];
  if (linkedArtistId && credits.some(c => c.artist_id === linkedArtistId)) return true;
  if (linkedArtistId && projectRaw?.artist_id === linkedArtistId) return true;
  return false;
}

// Mini uploader profile badge on each cell
function UploaderBadge({ uploaderUserId }) {
  const { data: profile } = useQuery({
    queryKey: ["uploader-badge", uploaderUserId],
    queryFn: async () => {
      if (!uploaderUserId) return null;
      const results = await base44.entities.UserProfile.filter({ user_id: uploaderUserId });
      return results[0] || null;
    },
    enabled: !!uploaderUserId,
    staleTime: 120000,
  });

  if (!profile) return null;
  const avatar = profile.avatar_url || profile.profile_photo_url;
  const name = profile.artist_name || profile.display_name || profile.full_name || profile.username;
  const initials = name?.[0]?.toUpperCase() || "?";

  return (
    <div className="absolute bottom-1 left-1 flex items-center gap-1 pointer-events-none">
      <div className="w-4 h-4 rounded-full overflow-hidden border border-white/30 bg-black/60 flex-shrink-0 flex items-center justify-center">
        {avatar
          ? <img src={avatar} alt={name} className="w-full h-full object-cover" />
          : <span className="text-[7px] font-black text-white/70">{initials}</span>
        }
      </div>
      {/* Orange verified dot */}
      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 flex items-center justify-center"
        style={{ background: "#ff5833" }}>
        <svg className="w-1.5 h-1.5" fill="white" viewBox="0 0 24 24">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}

function GalleryCell({ item }) {
  if (item.type === "youtube_short") {
    const ytId = getYtShortId(item.url);
    const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;
    return (
      <div className="relative flex-shrink-0 overflow-hidden rounded-lg" style={{ width: 52, height: 74, background: "#111" }}>
        {thumb
          ? <img src={thumb} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-white/5" />
        }
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 rounded-full bg-black/50 flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-white ml-0.5" fill="white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
        {item.uploader_user_id && <UploaderBadge uploaderUserId={item.uploader_user_id} />}
      </div>
    );
  }
  return (
    <div className="relative flex-shrink-0 overflow-hidden rounded-lg" style={{ width: 52, height: 74, background: "#111" }}>
      <img src={item.url} alt={item.caption || ""} className="w-full h-full object-cover" />
      {item.uploader_user_id && <UploaderBadge uploaderUserId={item.uploader_user_id} />}
    </div>
  );
}

export default function ProjectGalleryStrip({
  gallery, projectRaw, currentUser, linkedArtistId, onOpenFeed, onUploaded
}) {
  const canAdd = !!currentUser && (
    currentUser.role === "admin" ||
    (linkedArtistId && (
      projectRaw?.artist_id === linkedArtistId ||
      (projectRaw?.credits || []).some(c => c.artist_id === linkedArtistId)
    ))
  );

  const hasAny = gallery && gallery.length > 0;
  const visibleGallery = hasAny
    ? gallery.filter(g => hasGalleryAccess(g, projectRaw, currentUser, linkedArtistId))
    : [];

  // Show section if there's content OR if user can add
  if (!hasAny && !canAdd) return null;
  if (visibleGallery.length === 0 && !canAdd) return null;

  const preview = visibleGallery.slice(0, 4);
  const remaining = visibleGallery.length - preview.length;
  const hasRestricted = hasAny && gallery.some(g => g.restricted) && !currentUser;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="mt-5 pt-4 border-t border-white/[0.06]"
    >
      {/* Header row */}
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

      {/* Thumbnails row + inline add button */}
      <div className="flex gap-1.5 items-stretch overflow-hidden">
        {visibleGallery.length > 0 && (
          <button onClick={onOpenFeed} className="contents">
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
          </button>
        )}

        {/* Inline add button — same size as cells */}
        {canAdd && (
          <GalleryUploadButton
            projectRaw={projectRaw}
            currentUser={currentUser}
            onUploaded={onUploaded}
            compact
          />
        )}
      </div>
    </motion.div>
  );
}