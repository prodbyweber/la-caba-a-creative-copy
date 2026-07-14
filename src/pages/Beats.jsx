import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGlobalAudio } from "@/context/GlobalAudioContext";
import { Search, Lock, Menu, ChevronDown, X, Check, Share2 } from "lucide-react";
import BeatSectionView from "@/components/beats/BeatSectionView";
import BeatCard from "@/components/beats/BeatCard";
import { shareBeatLink } from "@/lib/beatShare";

export default function Beats() {
  const qc = useQueryClient();
  const { playQueue, pauseTrack, resumeTrack, isPlaying, playingTrack } = useGlobalAudio();

  const [search, setSearch] = useState("");
  const [likedIds, setLikedIds] = useState(new Set());
  const [user, setUser] = useState(null);
  const [shareState, setShareState] = useState(null);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (authed) setUser(await base44.auth.me());
    });
  }, []);

  const { data: beats = [], isLoading } = useQuery({
    queryKey: ["beats-public"],
    queryFn: async () => {
      const all = await base44.entities.Beat.list("-created_date");
      return all.filter((b) => b.status === "Publicado" && !b.archived);
    },
  });

  const { data: sections = [] } = useQuery({
    queryKey: ["beat-sections"],
    queryFn: async () => {
      const all = await base44.entities.BeatSection.list("order");
      return all.filter((s) => s.is_visible !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
    },
  });

  const { data: likes = [] } = useQuery({
    queryKey: ["beat-likes-me", user?.id],
    queryFn: async () => (user?.id ? base44.entities.BeatLike.filter({ user_id: user.id }) : []),
    enabled: !!user?.id,
  });
  useEffect(() => { setLikedIds(new Set(likes.map((l) => l.beat_id))); }, [likes]);

  const likeMutation = useMutation({
    mutationFn: async (beat) => {
      if (likedIds.has(beat.id)) {
        const like = likes.find((l) => l.beat_id === beat.id);
        if (like) await base44.entities.BeatLike.delete(like.id);
      } else {
        await base44.entities.BeatLike.create({ beat_id: beat.id, user_id: user.id });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["beat-likes-me", user?.id] }),
  });

  const handlePlay = useCallback((beat, list) => {
    const queue = (list || beats).map((b) => ({ ...b, beat_id: b.id }));
    const idx = queue.findIndex((b) => b.beat_id === beat.id);
    // Toggle: if same beat playing -> pause; if paused -> resume
    if (playingTrack?.beat_id === beat.id) {
      if (isPlaying) pauseTrack();
      else resumeTrack();
      return;
    }
    playQueue(queue, idx >= 0 ? idx : 0);
  }, [beats, playQueue, playingTrack, isPlaying, pauseTrack, resumeTrack]);

  const handleDownload = useCallback(async (beat) => {
    if (!beat.free_mp3_url) return;
    try {
      if (user?.id) await base44.entities.BeatDownload.create({ beat_id: beat.id, user_id: user.id, license_type: "mp3_free" }).catch(() => {});
      const res = await fetch(beat.free_mp3_url);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const fn = new URL(beat.free_mp3_url).pathname.split("/").pop() || `${beat.title}.mp3`;
      a.download = decodeURIComponent(fn);
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      qc.invalidateQueries({ queryKey: ["beats-public"] });
    } catch { window.open(beat.free_mp3_url, "_blank"); }
  }, [user, qc]);

  const handleBuy = useCallback((beat) => {
    if (beat.buy_link) window.open(beat.buy_link, "_blank");
  }, []);

  const handleShare = useCallback(async (beat) => {
    const ok = await shareBeatLink(beat);
    setShareState({ id: beat.id, copied: ok });
    setTimeout(() => setShareState(null), 1800);
  }, []);

  // Search results override sections
  const searchResults = useMemo(() => {
    if (!search) return null;
    const q = search.toLowerCase();
    return beats.filter((b) =>
      b.title?.toLowerCase().includes(q) ||
      b.producer?.toLowerCase().includes(q) ||
      (b.genres || []).some((g) => g.toLowerCase().includes(q)) ||
      `${b.bpm}`.includes(q) ||
      (b.key || "").toLowerCase().includes(q) ||
      (b.scale || "").toLowerCase().includes(q)
    );
  }, [beats, search]);

  const sharedProps = { onPlay: handlePlay, onLike: user ? (b) => likeMutation.mutate(b) : null, onDownload: handleDownload, onBuy: handleBuy, onShare: handleShare, shareState, user, likedIds };

  return (
    <div className="min-h-screen pb-32" style={{ background: "#121212", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Promotional banner */}
      <div className="w-full px-4 py-2 text-center text-[11px] font-semibold text-white" style={{ background: "#7c4dff" }}>
        Únete y obtén acceso completo gratis por 3 días →
      </div>

      {/* Sticky nav + search */}
      <div className="sticky top-0 z-40" style={{ background: "rgba(18,18,18,0.95)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center justify-between px-4 sm:px-10 py-3">
          <Link to="/Explorar" className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-white/5 transition-colors text-white/70"><Menu className="w-5 h-5" /></Link>
          <Link to="/beats" className="absolute left-1/2 -translate-x-1/2">
            <img src="https://media.base44.com/images/public/6966ddf48947f217e81ea27c/6b7c4002a_Titulo.png" alt="Cabaña" className="h-6 w-auto opacity-90" />
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <Link to="/ArtistDashboard" className="text-xs font-semibold text-white/70 hover:text-white px-4 py-2 rounded-full bg-white/5 border border-white/10 transition-colors">Mi catálogo</Link>
            ) : (
              <>
                <Link to="/login" className="text-xs font-semibold text-white/70 hover:text-white px-2 sm:px-3 py-2 transition-colors">Login</Link>
                <Link to="/register" className="text-xs font-bold text-[#0e0e0e] px-3 sm:px-4 py-2 rounded-full transition-transform hover:scale-105" style={{ background: "#d4f7c7" }}>Empezar gratis →</Link>
              </>
            )}
          </div>
        </div>

        {/* Search bar */}
        <div className="px-4 sm:px-10 max-w-3xl mx-auto pb-3">
          <div className="flex items-center gap-2 w-full rounded-full px-4 py-3" style={{ background: "#1c1c1c", border: "1px solid #262626" }}>
            <button className="flex items-center gap-1.5 text-xs font-semibold text-white/70 hover:text-white transition-colors flex-shrink-0">Beats<ChevronDown className="w-3.5 h-3.5" /></button>
            <span className="w-px h-4 bg-white/10 flex-shrink-0" />
            <Search className="w-4 h-4 text-white/30 flex-shrink-0" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar beats, géneros, productores..." className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none min-w-0" />
            {search && <button onClick={() => setSearch("")} className="text-white/30 hover:text-white flex-shrink-0"><X className="w-4 h-4" /></button>}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-10 max-w-7xl mx-auto pt-5">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i}>
                <div className="aspect-square rounded-2xl animate-pulse" style={{ background: "#1a1a1a" }} />
                <div className="h-3.5 bg-white/5 rounded w-3/4 mt-3 animate-pulse" />
                <div className="h-3 bg-white/5 rounded w-1/2 mt-2 animate-pulse" />
              </div>
            ))}
          </div>
        ) : searchResults ? (
          // Search results
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-5" style={{ letterSpacing: "-0.03em" }}>
              {searchResults.length} resultado{searchResults.length !== 1 ? "s" : ""}
            </h2>
            {searchResults.length === 0 ? (
              <div className="text-center py-20"><p className="text-[#a0a0a0] text-sm">No se encontraron beats</p></div>
            ) : (
              <SearchResultsGrid beats={searchResults} {...sharedProps} />
            )}
          </div>
        ) : sections.length === 0 ? (
          // No sections configured — show all beats
          <BeatSectionView
            section={{ title: "Beats", layout: "grid", columns: 5, limit: 50, source_mode: "auto", filter_type: "recent", is_visible: true, color: "#8b5cf6", icon: "Music2" }}
            beats={beats}
            {...sharedProps}
          />
        ) : (
          // Dynamic CMS sections
          sections.map((section) => (
            <BeatSectionView key={section.id} section={section} beats={beats} {...sharedProps} />
          ))
        )}
      </div>

      {/* Share toast */}
      <AnimatePresence>
        {shareState?.copied && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[150] px-4 py-2.5 rounded-full flex items-center gap-2 text-sm font-semibold text-white"
            style={{ background: "#8b5cf6", boxShadow: "0 8px 32px rgba(139,92,246,0.4)" }}>
            <Check className="w-4 h-4" /> Enlace copiado
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SearchResultsGrid({ beats, onPlay, onLike, onDownload, onBuy, onShare, shareState, user, likedIds }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {beats.map((beat, i) => (
        <BeatCard key={beat.id} beat={beat} index={i} onPlay={onPlay} onLike={onLike} onDownload={onDownload} onBuy={onBuy} onShare={onShare} shareState={shareState} user={user} liked={likedIds?.has(beat.id)} />
      ))}
    </div>
  );
}