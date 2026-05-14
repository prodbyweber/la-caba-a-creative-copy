import React, { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X, Heart, Share2, Music2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

function getYtShortId(url) {
  if (!url) return null;
  const m = url.match(/(?:shorts\/|youtu\.be\/|watch\?v=)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function useUploaderProfile(uploaderId) {
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
  return profile || null;
}

function Overlay({ entry, liked, setLiked }) {
  const profile = useUploaderProfile(entry.uploader_user_id);
  const displayName = profile?.artist_name || profile?.display_name || profile?.full_name;
  const username = profile?.username;
  const avatar = profile?.avatar_url || profile?.profile_photo_url;
  const photoPosition = profile?.photo_position || "center center";

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: entry.title || "", url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between">
      {/* Top gradient */}
      <div className="h-24 w-full" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)" }} />

      {/* Bottom */}
      <div
        className="flex items-end justify-between px-4 pb-10 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.4) 55%, transparent 100%)" }}
      >
        {/* Left: user + title */}
        <div className="flex-1 min-w-0 pr-4 pointer-events-auto">
          {username && (
            <Link
              to={`/${username}`}
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-2.5 mb-3 group"
            >
              <div
                className="relative flex-shrink-0 w-9 h-9 rounded-full overflow-hidden border-2 shadow-lg"
                style={{ borderColor: "rgba(255,255,255,0.25)", background: "#222" }}
              >
                {avatar ? (
                  <img src={avatar} alt={displayName} className="w-full h-full object-cover" style={{ objectPosition: photoPosition }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-xs font-black text-white/60">{displayName?.[0]?.toUpperCase()}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-white font-bold text-sm drop-shadow-lg leading-tight truncate">@{username}</span>
                <svg className="flex-shrink-0 w-4 h-4" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="10" fill="#ff5833" />
                  <path d="M6 10l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </Link>
          )}
          <p className="text-white font-semibold text-sm leading-snug drop-shadow-lg mb-0.5"
            style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>
            {entry.title || entry.caption || ""}
          </p>
          {entry.caption && entry.title && (
            <p className="text-white/60 text-xs leading-relaxed drop-shadow-lg line-clamp-2">{entry.caption}</p>
          )}
        </div>

        {/* Right: actions */}
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

function FeedSlide({ entry, isActive }) {
  const [liked, setLiked] = useState(false);
  const ytId = getYtShortId(entry.url || entry.youtube_url || entry.youtube_music_url || "");

  if (ytId) {
    const src = `https://www.youtube.com/embed/${ytId}?autoplay=${isActive ? 1 : 0}&mute=0&controls=1&rel=0&modestbranding=1&loop=1&playlist=${ytId}`;
    return (
      <div className="relative w-full h-full bg-black flex items-center justify-center">
        <iframe
          key={`${ytId}-${isActive}`}
          src={src}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ pointerEvents: "all" }}
        />
        <div className="absolute inset-0" style={{ pointerEvents: "none" }}>
          <Overlay entry={entry} liked={liked} setLiked={setLiked} />
        </div>
      </div>
    );
  }

  // Image
  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
      {entry.url || entry.thumbnail_url ? (
        <img src={entry.url || entry.thumbnail_url} alt={entry.title || ""} className="w-full h-full object-cover" />
      ) : (
        <div className="flex items-center justify-center w-full h-full">
          <Music2 className="w-16 h-16 text-white/10" />
        </div>
      )}
      <Overlay entry={entry} liked={liked} setLiked={setLiked} />
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export default function ParaTiFeed({ currentUser, onClose }) {
  const containerRef = useRef(null);
  const slideRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);

  // Fetch all public ExplorarItems with galleries or youtube_music_url/youtube_url
  const { data: explorarItems = [] } = useQuery({
    queryKey: ["para-ti-explorar-items"],
    queryFn: () => base44.entities.ExplorarItem.filter({ is_active: true }),
    staleTime: 30000,
  });

  // Fetch all UserProfile to find uploads
  const { data: userProfiles = [] } = useQuery({
    queryKey: ["para-ti-user-profiles"],
    queryFn: () => base44.entities.UserProfile.list("-created_date", 50),
    staleTime: 60000,
  });

  // Build feed: gallery items from ExplorarItems + standalone youtube shorts from ExplorarItems
  const feed = useMemo(() => {
    const result = [];
    explorarItems.forEach(item => {
      // Gallery entries (images/videos uploaded)
      const gallery = item.gallery || [];
      gallery.forEach(g => {
        if (g.url) {
          result.push({
            ...g,
            title: item.title || "",
            uploader_user_id: g.uploader_user_id || item.created_by_user_id,
            _source: "gallery",
          });
        }
      });

      // YouTube shorts from the item itself (no gallery entry)
      const ytUrl = item.youtube_url || item.youtube_music_url;
      const ytId = ytUrl ? ytUrl.match(/(?:shorts\/|youtu\.be\/|watch\?v=)([a-zA-Z0-9_-]{11})/) : null;
      if (ytId && gallery.length === 0) {
        result.push({
          id: item.id,
          url: ytUrl,
          title: item.title || "",
          thumbnail_url: item.thumbnail_url,
          uploader_user_id: item.created_by,
          _source: "item",
        });
      }
    });

    // Shuffle for variety
    return result.sort(() => Math.random() - 0.5);
  }, [explorarItems]);

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

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1100] bg-black"
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-[1200] w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-black/80 transition-colors"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      {/* Label */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[1200] pointer-events-none">
        <span className="text-white font-bold text-sm tracking-wide drop-shadow-lg"
          style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>
          Para Ti
        </span>
      </div>

      {feed.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-white/30 text-sm">Sin contenido disponible aún</p>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="w-full h-full overflow-y-scroll"
          style={{
            scrollSnapType: "y mandatory",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {feed.map((entry, i) => (
            <div
              key={`${entry.id || i}-${i}`}
              ref={el => slideRefs.current[i] = el}
              style={{ scrollSnapAlign: "start", height: "100dvh", width: "100%", flexShrink: 0, position: "relative" }}
            >
              <FeedSlide entry={entry} isActive={activeIndex === i} />
            </div>
          ))}
        </div>
      )}
    </motion.div>,
    document.body
  );
}