import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGlobalAudio } from "@/context/GlobalAudioContext";
import { Search, Lock, LogIn, TrendingUp, ChevronDown, X } from "lucide-react";
import BeatCard from "@/components/beats/BeatCard";
import BeatsFeaturedCarousel from "@/components/beats/BeatsFeaturedCarousel";
import BeatsTrendingList from "@/components/beats/BeatsTrendingList";
import BeatLicensesModal from "@/components/beats/BeatLicensesModal";

// Curation filter chips (not genre tags — cinematic curation)
const FILTER_CHIPS = [
  { id: "staff", label: "Staff Picks" },
  { id: "nuevos", label: "Nuevos" },
  { id: "populares", label: "Populares" },
  { id: "descargas", label: "Descargas" },
  { id: "gratis", label: "Gratis" },
];

// Section tabs
const TABS = ["EXPLORE", "NUEVOS", "TRENDING"];

export default function Beats() {
  const qc = useQueryClient();
  const { playingTrack, isPlaying, playQueue } = useGlobalAudio();

  const [search, setSearch] = useState("");
  const [activeChip, setActiveChip] = useState("staff");
  const [activeTab, setActiveTab] = useState("EXPLORE");
  const [licensesModal, setLicensesModal] = useState(null);
  const [likedIds, setLikedIds] = useState(new Set());
  const [savedIds, setSavedIds] = useState(new Set());
  const [authGate, setAuthGate] = useState(false);
  const [user, setUser] = useState(null);

  const trendingRef = useRef(null);
  const nuevosRef = useRef(null);

  // Check auth
  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (!authed) {
        const timer = setTimeout(() => setAuthGate(true), 5000);
        return () => clearTimeout(timer);
      }
      const u = await base44.auth.me();
      setUser(u);
    });
  }, []);

  // Fetch published beats
  const { data: beats = [], isLoading } = useQuery({
    queryKey: ["beats-public"],
    queryFn: async () => {
      const all = await base44.entities.Beat.filter({ status: "Publicado" });
      return all.filter(b => !b.archived);
    },
  });

  // Fetch user likes & saves
  const { data: likes = [] } = useQuery({
    queryKey: ["beat-likes-me", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return base44.entities.BeatLike.filter({ user_id: user.id });
    },
    enabled: !!user?.id,
  });

  const { data: saves = [] } = useQuery({
    queryKey: ["beat-saves-me", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return base44.entities.BeatSave.filter({ user_id: user.id });
    },
    enabled: !!user?.id,
  });

  useEffect(() => { setLikedIds(new Set(likes.map(l => l.beat_id))); }, [likes]);
  useEffect(() => { setSavedIds(new Set(saves.map(s => s.beat_id))); }, [saves]);

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async (beat) => {
      const isLiked = likedIds.has(beat.id);
      if (isLiked) {
        const like = likes.find(l => l.beat_id === beat.id);
        if (like) await base44.entities.BeatLike.delete(like.id);
      } else {
        await base44.entities.BeatLike.create({ beat_id: beat.id, user_id: user.id });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["beat-likes-me", user?.id] }),
  });

  const saveMutation = useMutation({
    mutationFn: async (beat) => {
      const isSaved = savedIds.has(beat.id);
      if (isSaved) {
        const save = saves.find(s => s.beat_id === beat.id);
        if (save) await base44.entities.BeatSave.delete(save.id);
      } else {
        await base44.entities.BeatSave.create({ beat_id: beat.id, user_id: user.id });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["beat-saves-me", user?.id] }),
  });

  // Download (preserves filename)
  const handleDownload = useCallback(async (beat) => {
    if (!beat.free_mp3_url) return;
    try {
      if (user?.id) {
        await base44.entities.BeatDownload.create({ beat_id: beat.id, user_id: user.id, license_type: "mp3_free" });
      }
      const response = await fetch(beat.free_mp3_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const urlPath = new URL(beat.free_mp3_url).pathname;
      const filename = urlPath.split("/").pop() || `${beat.title}.mp3`;
      a.download = decodeURIComponent(filename);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      qc.invalidateQueries({ queryKey: ["beats-public"] });
    } catch (e) {
      window.open(beat.free_mp3_url, "_blank");
    }
  }, [user, qc]);

  // Play handler
  const handlePlay = useCallback((beat, allBeats) => {
    const queue = allBeats.map(b => ({ ...b, beat_id: b.id }));
    const idx = queue.findIndex(b => b.beat_id === beat.id);
    playQueue(queue, idx >= 0 ? idx : 0);
  }, [playQueue]);

  // Featured beats (admin-featured, fallback to most-played)
  const featuredBeats = useMemo(() => {
    const featured = beats.filter(b => b.featured);
    if (featured.length >= 3) return featured.slice(0, 6);
    const sorted = [...beats].sort((a, b) => (b.plays_count || 0) - (a.plays_count || 0));
    return [...featured, ...sorted.filter(b => !featured.includes(b))].slice(0, 6);
  }, [beats]);

  // Trending (top 10 by plays + downloads)
  const trendingBeats = useMemo(() => {
    return [...beats]
      .sort((a, b) => ((b.plays_count || 0) + (b.downloads_count || 0)) - ((a.plays_count || 0) + (a.downloads_count || 0)))
      .slice(0, 10);
  }, [beats]);

  // New releases (recent)
  const newReleases = useMemo(() => {
    return [...beats].sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0));
  }, [beats]);

  // Filtered beats by chip + search
  const filteredBeats = useMemo(() => {
    let result = [...beats];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(b =>
        b.title?.toLowerCase().includes(q) ||
        b.producer?.toLowerCase().includes(q) ||
        `${b.bpm}`.includes(q) ||
        (b.key || "").toLowerCase().includes(q) ||
        (b.scale || "").toLowerCase().includes(q)
      );
    }
    switch (activeChip) {
      case "staff": result = result.filter(b => b.featured); break;
      case "nuevos": result.sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0)); break;
      case "populares": result.sort((a, b) => (b.plays_count || 0) - (a.plays_count || 0)); break;
      case "descargas": result.sort((a, b) => (b.downloads_count || 0) - (a.downloads_count || 0)); break;
      case "gratis": result = result.filter(b => (b.licenses || []).some(l => l.type === "mp3_free")); break;
      default: break;
    }
    return result;
  }, [beats, search, activeChip]);

  // Tab scroll
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "NUEVOS") nuevosRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (tab === "TRENDING") trendingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (tab === "EXPLORE") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen pb-32" style={{ background: "#0e0e0e", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* ── Top promotional banner ─────────────────────────────────── */}
      <div className="w-full px-4 py-2 text-center text-xs font-semibold text-white" style={{ background: "#6366f1" }}>
        Únete y obtén acceso completo gratis por 3 días →
      </div>

      {/* ── Navigation header ─────────────────────────────────────── */}
      <div
        className="sticky top-0 z-40 flex items-center justify-between px-5 sm:px-10 py-3.5"
        style={{ background: "rgba(14,14,14,0.95)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <Link to="/Explorar" className="flex items-center gap-2">
          <img src="https://media.base44.com/images/public/6966ddf48947f217e81ea27c/6b7c4002a_Titulo.png" alt="Cabaña" className="h-6 w-auto opacity-80" />
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <Link to="/ArtistDashboard" className="text-xs font-semibold text-white/70 hover:text-white px-4 py-2 rounded-full bg-white/5 border border-white/10 transition-colors">
              Mi catálogo
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-xs font-semibold text-white/70 hover:text-white px-3 py-2 transition-colors hidden sm:block">
                Login
              </Link>
              <Link
                to="/register"
                className="text-xs font-bold text-[#0e0e0e] px-4 py-2 rounded-full transition-transform hover:scale-105"
                style={{ background: "#a7f3d0" }}
              >
                Empezar gratis →
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ── Search bar + Tabs ─────────────────────────────────────── */}
      <div className="px-5 sm:px-10 max-w-7xl mx-auto pt-5">
        {/* Search pill */}
        <div className="flex items-center gap-2 w-full rounded-full px-4 py-3 mb-4" style={{ background: "#1a1a1a", border: "1px solid #262626" }}>
          <button className="flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white transition-colors flex-shrink-0">
            Beats
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <span className="w-px h-4 bg-white/10" />
          <Search className="w-4 h-4 text-white/30 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar beats..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none min-w-0"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-white/30 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-white/8 mb-5">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className="relative pb-3 text-xs font-bold tracking-wider transition-colors"
              style={{ color: activeTab === tab ? "#ffffff" : "#a0a0a0" }}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="beats-tab-underline"
                  className="absolute left-0 right-0 -bottom-px h-0.5 rounded-full"
                  style={{ background: "#ffffff" }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Featured carousel ─────────────────────────────────────── */}
      {featuredBeats.length > 0 && (
        <div className="px-5 sm:px-10 max-w-7xl mx-auto mb-10">
          <BeatsFeaturedCarousel
            beats={featuredBeats}
            isPlaying={isPlaying}
            onPlay={handlePlay}
            onLike={user ? (b) => likeMutation.mutate(b) : null}
            likedIds={likedIds}
          />
        </div>
      )}

      {/* ── New Releases ──────────────────────────────────────────── */}
      <div ref={nuevosRef} className="px-5 sm:px-10 max-w-7xl mx-auto mb-10 scroll-mt-20">
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-4" style={{ letterSpacing: "-0.03em" }}>
          {search ? "Resultados" : "New releases"}
        </h2>

        {/* Filter chips */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {FILTER_CHIPS.map((chip) => (
            <button
              key={chip.id}
              onClick={() => setActiveChip(chip.id)}
              className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors"
              style={{
                background: activeChip === chip.id ? "#ffffff" : "#1a1a1a",
                color: activeChip === chip.id ? "#0e0e0e" : "#a0a0a0",
                border: activeChip === chip.id ? "1px solid #ffffff" : "1px solid #262626",
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Card grid */}
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
        ) : filteredBeats.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#a0a0a0] text-sm">No se encontraron beats</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {filteredBeats.map((beat, i) => (
              <BeatCard
                key={beat.id}
                beat={beat}
                index={i}
                isPlaying={playingTrack?.beat_id === beat.id && isPlaying}
                onPlay={() => handlePlay(beat, filteredBeats)}
                onLike={user ? (b) => likeMutation.mutate(b) : null}
                liked={likedIds.has(beat.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Trending ───────────────────────────────────────────────── */}
      {trendingBeats.length > 0 && (
        <div ref={trendingRef} className="px-5 sm:px-10 max-w-7xl mx-auto mb-10 scroll-mt-20">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-[#8b5cf6]" />
            <h2 className="text-2xl sm:text-3xl font-black text-white" style={{ letterSpacing: "-0.03em" }}>
              Trending
            </h2>
          </div>
          <p className="text-sm text-[#a0a0a0] mb-5">Los beats más calientes ahora mismo.</p>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <div className="w-14 h-14 rounded-xl animate-pulse" style={{ background: "#1a1a1a" }} />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-white/5 rounded w-1/3 animate-pulse" />
                    <div className="h-3 bg-white/5 rounded w-1/4 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <BeatsTrendingList
              beats={trendingBeats}
              isPlaying={isPlaying}
              onPlay={handlePlay}
              onLike={user ? (b) => likeMutation.mutate(b) : null}
              onDownload={user ? handleDownload : null}
              likedIds={likedIds}
              user={user}
            />
          )}
        </div>
      )}

      {/* ── Auth gate ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {authGate && !user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150]"
            style={{ backdropFilter: "blur(16px)", background: "rgba(8,8,10,0.5)" }}
          >
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-sm rounded-3xl p-8 text-center"
                style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "rgba(139,92,246,0.15)" }}>
                  <Lock className="w-6 h-6 text-[#a78bfa]" />
                </div>
                <h2 className="text-xl font-black text-white mb-2" style={{ letterSpacing: "-0.03em" }}>
                  Accede a Cabaña Beats
                </h2>
                <p className="text-sm text-[#a0a0a0] mb-6 leading-relaxed">
                  Inicia sesión para descargar, guardar y reproducir beats completos.
                </p>
                <div className="space-y-2">
                  <Link to="/login" className="block w-full py-3 rounded-xl text-sm font-bold text-white transition-colors" style={{ background: "#8b5cf6" }}>
                    Iniciar sesión
                  </Link>
                  <Link to="/register" className="block w-full py-3 rounded-xl text-sm font-semibold text-[#a0a0a0] hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    Crear cuenta gratis
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Licenses modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {licensesModal && (
          <BeatLicensesModal beat={licensesModal} onClose={() => setLicensesModal(null)} user={user} />
        )}
      </AnimatePresence>

      {/* Expanded player is rendered globally in App.jsx */}
    </div>
  );
}