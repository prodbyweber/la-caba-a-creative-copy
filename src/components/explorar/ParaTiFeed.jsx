import React, { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X, Heart, Bookmark, Music2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

function CreatorBadge({ uploaderUserId }) {
  const profile = useUploaderProfile(uploaderUserId);
  if (!profile) return null;

  const displayName = profile.artist_name || profile.display_name || profile.full_name;
  const username = profile.username;
  const avatar = profile.profile_photo_url || profile.avatar_url;
  const photoPosition = profile.photo_position || "center center";

  if (!username && !displayName) return null;

  return (
    <Link
      to={username ? `/${username}` : "#"}
      onClick={e => e.stopPropagation()}
      className="flex items-center gap-2.5 mb-2.5 group w-fit"
    >
      {/* Avatar circle — estilo Instagram */}
      <div
        className="relative flex-shrink-0 w-9 h-9 rounded-full overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
          padding: "2px",
        }}
      >
        <div className="w-full h-full rounded-full overflow-hidden bg-black border-2 border-black">
          {avatar ? (
            <img src={avatar} alt={displayName} className="w-full h-full object-cover" style={{ objectPosition: photoPosition }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#222]">
              <span className="text-xs font-black text-white/60">{displayName?.[0]?.toUpperCase()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Name + verified */}
      <div className="flex items-center gap-1.5 min-w-0">
        <div>
          <div className="flex items-center gap-1">
            <span className="text-white font-bold text-sm drop-shadow-lg leading-tight">
              {username ? `@${username}` : displayName}
            </span>
            {/* Verified badge */}
            <svg className="flex-shrink-0 w-4 h-4" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="10" fill="#ff5833" />
              <path d="M6 10l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {username && displayName && displayName !== username && (
            <p className="text-white/50 text-[10px] leading-none mt-0.5">{displayName}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

function Overlay({ entry, currentUser, savedShortIds, onSaveToggle, saving }) {
  const [liked, setLiked] = useState(false);
  const isSaved = savedShortIds.has(entry.id);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between">
      {/* Top gradient */}
      <div className="h-24 w-full" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)" }} />

      {/* Bottom */}
      <div
        className="flex items-end justify-between px-4 pb-10 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.4) 55%, transparent 100%)" }}
      >
        {/* Left: creator + title */}
        <div className="flex-1 min-w-0 pr-4 pointer-events-auto">
          <CreatorBadge uploaderUserId={entry.uploader_user_id} />
          <p
            className="text-white font-semibold text-sm leading-snug drop-shadow-lg mb-0.5"
            style={{ fontFamily: "'Helvetica Neue', sans-serif" }}
          >
            {entry.title || entry.caption || ""}
          </p>
          {entry.caption && entry.title && (
            <p className="text-white/60 text-xs leading-relaxed drop-shadow-lg line-clamp-2">{entry.caption}</p>
          )}
        </div>

        {/* Right: actions */}
        <div className="flex flex-col gap-5 items-center flex-shrink-0 pointer-events-auto">
          {/* Like */}
          <button onClick={() => setLiked(l => !l)} className="flex flex-col items-center gap-1">
            <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/10">
              <Heart className={`w-5 h-5 ${liked ? "fill-red-500 text-red-500" : "text-white"}`} />
            </div>
            <span className="text-white/60 text-[10px]">{liked ? "1" : ""}</span>
          </button>

          {/* Save */}
          <button
            onClick={() => onSaveToggle(entry)}
            disabled={saving || !currentUser}
            className="flex flex-col items-center gap-1"
            title={currentUser ? (isSaved ? "Quitar de guardados" : "Guardar") : "Inicia sesión para guardar"}
          >
            <div
              className="w-11 h-11 rounded-full backdrop-blur-sm flex items-center justify-center border transition-all"
              style={{
                background: isSaved ? "rgba(255,88,51,0.25)" : "rgba(0,0,0,0.4)",
                borderColor: isSaved ? "rgba(255,88,51,0.5)" : "rgba(255,255,255,0.1)",
              }}
            >
              <Bookmark
                className="w-5 h-5 transition-all"
                style={{ fill: isSaved ? "#ff5833" : "transparent", color: isSaved ? "#ff5833" : "white" }}
              />
            </div>
            <span className="text-white/60 text-[10px]">{isSaved ? "Guardado" : ""}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function FeedSlide({ entry, isActive, currentUser, savedShortIds, onSaveToggle, saving }) {
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
          <Overlay
            entry={entry}
            currentUser={currentUser}
            savedShortIds={savedShortIds}
            onSaveToggle={onSaveToggle}
            saving={saving}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
      {entry.url || entry.thumbnail_url ? (
        <img src={entry.url || entry.thumbnail_url} alt={entry.title || ""} className="w-full h-full object-cover" />
      ) : (
        <div className="flex items-center justify-center w-full h-full">
          <Music2 className="w-16 h-16 text-white/10" />
        </div>
      )}
      <Overlay
        entry={entry}
        currentUser={currentUser}
        savedShortIds={savedShortIds}
        onSaveToggle={onSaveToggle}
        saving={saving}
      />
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export default function ParaTiFeed({ currentUser, onClose }) {
  const qc = useQueryClient();
  const containerRef = useRef(null);
  const slideRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);

  // Load user profile to get/update saved_shorts
  const { data: userProfile } = useQuery({
    queryKey: ["user-profile-parati", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      const profiles = await base44.entities.UserProfile.filter({ user_id: currentUser.id });
      return profiles[0] || null;
    },
    enabled: !!currentUser?.id,
    staleTime: 30000,
  });

  const savedShortIds = useMemo(() => {
    const ids = new Set((userProfile?.saved_shorts || []).map(s => s.id));
    return ids;
  }, [userProfile]);

  const saveMutation = useMutation({
    mutationFn: async (entry) => {
      if (!userProfile) return;
      const current = userProfile.saved_shorts || [];
      const alreadySaved = current.some(s => s.id === entry.id);
      const updated = alreadySaved
        ? current.filter(s => s.id !== entry.id)
        : [...current, {
            id: entry.id,
            url: entry.url || "",
            title: entry.title || "",
            thumbnail_url: entry.thumbnail_url || "",
            saved_at: new Date().toISOString(),
          }];
      return base44.entities.UserProfile.update(userProfile.id, { saved_shorts: updated });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-profile-parati", currentUser?.id] });
      qc.invalidateQueries({ queryKey: ["user-profile-me", currentUser?.id] });
    },
  });

  // Fetch all public ExplorarItems
  const { data: explorarItems = [] } = useQuery({
    queryKey: ["para-ti-explorar-items"],
    queryFn: () => base44.entities.ExplorarItem.filter({ is_active: true }),
    staleTime: 30000,
  });

  // Fetch dashboard Shorts
  const { data: dashboardShorts = [] } = useQuery({
    queryKey: ["para-ti-dashboard-shorts"],
    queryFn: () => base44.entities.ExplorarItem.filter({ content_type: "short", is_active: true }),
    staleTime: 30000,
  });

  const feed = useMemo(() => {
    const result = [];

    dashboardShorts.forEach(short => {
      const ytUrl = short.youtube_url || short.youtube_music_url;
      if (!ytUrl) return;
      const ytId = getYtShortId(ytUrl);
      if (!ytId) return;
      result.push({
        id: short.id,
        url: ytUrl,
        title: short.title || "",
        caption: short.description || "",
        thumbnail_url: short.thumbnail_url || `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
        uploader_user_id: short.created_by,
        _source: "dashboard_short",
      });
    });

    explorarItems.forEach(item => {
      if (item.content_type === "short") return;
      const gallery = item.gallery || [];
      gallery.forEach(g => {
        if (g.type === "youtube_short" && g.url) {
          const ytId = getYtShortId(g.url);
          result.push({
            id: g.id || `${item.id}-${g.url}`,
            url: g.url,
            title: item.title || "",
            caption: g.caption || "",
            thumbnail_url: ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : item.thumbnail_url,
            uploader_user_id: item.created_by,
            _source: "gallery",
          });
        }
      });
    });

    return result.sort(() => Math.random() - 0.5);
  }, [explorarItems, dashboardShorts]);

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
              <FeedSlide
                entry={entry}
                isActive={activeIndex === i}
                currentUser={currentUser}
                savedShortIds={savedShortIds}
                onSaveToggle={(entry) => saveMutation.mutate(entry)}
                saving={saveMutation.isPending}
              />
            </div>
          ))}
        </div>
      )}
    </motion.div>,
    document.body
  );
}