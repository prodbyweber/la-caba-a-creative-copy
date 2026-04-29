import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Share2, Music2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

function getYtShortId(url) {
  if (!url) return null;
  const m = url.match(/(?:shorts\/|youtu\.be\/|watch\?v=)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

// ── Resolve uploader profile for a gallery item ──────────────────────────────
function useUploaderProfile(galleryItem, projectCredits) {
  // galleryItem may have uploader_user_id set when uploaded by a platform user
  const uploaderId = galleryItem?.uploader_user_id || null;

  const { data: profile } = useQuery({
    queryKey: ["uploader-profile", uploaderId],
    queryFn: async () => {
      if (!uploaderId) return null;
      const results = await base44.entities.UserProfile.filter({ user_id: uploaderId });
      return results[0] || null;
    },
    enabled: !!uploaderId,
    staleTime: 60000,
  });

  return profile;
}

// ── TikTok-style overlay with user info ──────────────────────────────────────
function Overlay({ item, projectTitle, projectItem, galleryItem, liked, setLiked, currentUser }) {
  const uploaderProfile = useUploaderProfile(galleryItem, projectItem?.raw?.credits);

  const displayName = uploaderProfile?.artist_name || uploaderProfile?.display_name || uploaderProfile?.full_name;
  const username = uploaderProfile?.username;
  const avatar = uploaderProfile?.avatar_url || uploaderProfile?.profile_photo_url;
  const photoPosition = uploaderProfile?.photo_position || "center center";
  const accountType = uploaderProfile?.account_type;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: projectTitle, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between">
      {/* Top gradient */}
      <div className="h-24 w-full" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)" }} />

      {/* Bottom area */}
      <div className="flex items-end justify-between px-4 pb-10 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.4) 55%, transparent 100%)" }}>

        {/* Left: user info + caption */}
        <div className="flex-1 min-w-0 pr-4 pointer-events-auto">

          {/* Reels-style user row */}
          {username && (
            <Link
              to={`/${username}`}
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-2.5 mb-3 group"
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0 w-9 h-9 rounded-full overflow-hidden border-2 shadow-lg"
                style={{ borderColor: "rgba(255,255,255,0.25)", background: "#222" }}>
                {avatar ? (
                  <img src={avatar} alt={displayName} className="w-full h-full object-cover"
                    style={{ objectPosition: photoPosition }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-xs font-black text-white/60">{displayName?.[0]?.toUpperCase()}</span>
                  </div>
                )}
              </div>

              {/* Username + verified badge */}
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-white font-bold text-sm drop-shadow-lg leading-tight truncate">
                  @{username}
                </span>
                {/* Orange verified checkmark */}
                <svg className="flex-shrink-0 w-4 h-4" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="10" fill="#ff5833"/>
                  <path d="M6 10l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </Link>
          )}

          {/* Project title */}
          <p className="text-white font-semibold text-sm leading-snug drop-shadow-lg mb-0.5"
            style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>
            {projectTitle}
          </p>

          {/* Caption */}
          {galleryItem?.caption && (
            <p className="text-white/70 text-xs leading-relaxed drop-shadow-lg line-clamp-2">
              {galleryItem.caption}
            </p>
          )}
        </div>

        {/* Right: action buttons */}
        <div className="flex flex-col gap-5 items-center flex-shrink-0 pointer-events-auto">
          <button onClick={() => setLiked(l => !l)} className="flex flex-col items-center gap-1">
            <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/10">
              <Heart className={`w-5 h-5 ${liked ? "fill-red-500 text-red-500" : "text-white"}`} />
            </div>
            <span className="text-white/60 text-[10px]">{liked ? "1" : ""}</span>
          </button>
          <button onClick={handleShare} className="flex flex-col items-center gap-1">
            <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/10">
              <Share2 className="w-5 h-5 text-white" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Image card ───────────────────────────────────────────────────────────────
function ImageCard({ item, projectTitle, projectItem, currentUser, isActive }) {
  const [liked, setLiked] = useState(false);
  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
      <img
        src={item.url}
        alt={item.caption || ""}
        className="w-full h-full object-cover"
      />
      <Overlay
        item={item}
        projectTitle={projectTitle}
        projectItem={projectItem}
        galleryItem={item}
        liked={liked}
        setLiked={setLiked}
        currentUser={currentUser}
      />
    </div>
  );
}

// ── YouTube Short card ───────────────────────────────────────────────────────
function YoutubeCard({ item, projectTitle, projectItem, currentUser, isActive }) {
  const [liked, setLiked] = useState(false);
  const ytId = getYtShortId(item.url);
  // Only render iframe when active (prevents autoplay on hidden slides)
  const src = ytId
    ? `https://www.youtube.com/embed/${ytId}?autoplay=${isActive ? 1 : 0}&mute=0&controls=1&rel=0&modestbranding=1&loop=1&playlist=${ytId}`
    : null;

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center">
      {src ? (
        <iframe
          key={`${ytId}-${isActive}`}
          src={src}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ pointerEvents: "all" }}
        />
      ) : (
        <div className="text-white/20 text-sm">Video no disponible</div>
      )}
      {/* Overlay must be on top of iframe but pointer-events-none except buttons */}
      <div className="absolute inset-0" style={{ pointerEvents: "none" }}>
        <Overlay
          item={item}
          projectTitle={projectTitle}
          projectItem={projectItem}
          galleryItem={item}
          liked={liked}
          setLiked={setLiked}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
}

// ── Single feed slide ────────────────────────────────────────────────────────
function FeedSlide({ entry, isActive, currentUser }) {
  if (entry.type === "youtube_short") {
    return (
      <YoutubeCard
        item={entry}
        projectTitle={entry.projectTitle}
        projectItem={entry.projectItem}
        currentUser={currentUser}
        isActive={isActive}
      />
    );
  }
  return (
    <ImageCard
      item={entry}
      projectTitle={entry.projectTitle}
      projectItem={entry.projectItem}
      currentUser={currentUser}
      isActive={isActive}
    />
  );
}

// Check gallery item access (same logic as ProjectGalleryStrip)
function hasAccess(galleryItem, projectRaw, currentUser, linkedArtistId) {
  if (!galleryItem.restricted) return true;
  if (!currentUser) return false;
  if (currentUser.role === "admin") return true;
  if (galleryItem.uploader_user_id && galleryItem.uploader_user_id === currentUser.id) return true;
  const credits = projectRaw?.credits || [];
  if (linkedArtistId && credits.some(c => c.artist_id === linkedArtistId)) return true;
  if (linkedArtistId && projectRaw?.artist_id === linkedArtistId) return true;
  return false;
}

// ── Main ForYouFeed ──────────────────────────────────────────────────────────
export default function ForYouFeed({ initialItem, allItems, currentUser, linkedArtistId, onClose }) {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Build flat feed of gallery items — current project first, then others
  const feed = useMemo(() => {
    const result = [];

    const addProjectItems = (projectItem) => {
      const gallery = projectItem.raw?.gallery || projectItem.gallery || [];
      if (!gallery.length) return;
      // Filter by access
      const visibleGallery = gallery.filter(g =>
        hasAccess(g, projectItem.raw || projectItem, currentUser, linkedArtistId)
      );
      if (!visibleGallery.length) return;
      visibleGallery.forEach(g => {
        result.push({
          ...g,
          projectTitle: projectItem.title || projectItem.raw?.title || "",
          projectItem,
        });
      });
    };

    // Current project always first
    addProjectItems(initialItem);

    // Other projects with galleries
    if (allItems) {
      allItems
        .filter(i => {
          const id = i.id || i.raw?.id;
          const initId = initialItem.id || initialItem.raw?.id;
          return id !== initId && ((i.raw?.gallery || i.gallery || []).length > 0);
        })
        .forEach(i => addProjectItems(i));
    }

    return result;
  }, [initialItem, allItems, currentUser, linkedArtistId]);

  // Track active slide via IntersectionObserver on each slide
  const slideRefs = useRef([]);

  useEffect(() => {
    const observers = [];
    slideRefs.current.forEach((el, idx) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveIndex(idx); },
        { root: containerRef.current, threshold: 0.6 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, [feed.length]);

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
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-[1200] w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-black/80 transition-colors"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      {/* Scroll container */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-y-scroll"
        style={{ scrollSnapType: "y mandatory", WebkitOverflowScrolling: "touch", scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {feed.map((entry, i) => (
          <div
            key={`${entry.id || i}-${i}`}
            ref={el => slideRefs.current[i] = el}
            style={{ scrollSnapAlign: "start", height: "100dvh", width: "100%", flexShrink: 0, position: "relative" }}
          >
            <FeedSlide
              entry={entry}
              isActive={activeIndex === i}
              currentUser={currentUser}
            />
          </div>
        ))}
      </div>

      {/* Progress dots */}
      <div className="fixed right-3 top-1/2 -translate-y-1/2 z-[1150] flex flex-col gap-1.5">
        {feed.slice(0, 12).map((_, i) => (
          <button
            key={i}
            onClick={() => {
              slideRefs.current[i]?.scrollIntoView({ behavior: "smooth" });
            }}
            className="rounded-full transition-all"
            style={{
              width: 3,
              height: activeIndex === i ? 16 : 6,
              background: activeIndex === i ? "white" : "rgba(255,255,255,0.25)",
            }}
          />
        ))}
      </div>
    </motion.div>,
    document.body
  );
}