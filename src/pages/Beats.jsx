import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGlobalAudio } from "@/context/GlobalAudioContext";
import { Sparkles, Download, FolderOpen, Lock, LogIn } from "lucide-react";
import BeatCard from "@/components/beats/BeatCard";
import BeatsFilters from "@/components/beats/BeatsFilters";
import BeatLicensesModal from "@/components/beats/BeatLicensesModal";
import ExpandedPlayer from "@/components/audio/ExpandedPlayer";

export default function Beats() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const {
    playingTrack, isPlaying, playQueue, pauseTrack, resumeTrack,
    playTrack, setExpanded,
  } = useGlobalAudio();

  const [filters, setFilters] = useState({ search: "", genres: [], moods: [], key: null, bpmRange: null });
  const [sort, setSort] = useState("recent");
  const [licensesModal, setLicensesModal] = useState(null);
  const [likedIds, setLikedIds] = useState(new Set());
  const [savedIds, setSavedIds] = useState(new Set());
  const [authGate, setAuthGate] = useState(false);
  const [user, setUser] = useState(null);

  // Check auth
  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (!authed) {
        // Start 5-second timer for auth gate
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

  useEffect(() => {
    setLikedIds(new Set(likes.map(l => l.beat_id)));
  }, [likes]);

  useEffect(() => {
    setSavedIds(new Set(saves.map(s => s.beat_id)));
  }, [saves]);

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
      // Record download
      if (user?.id) {
        await base44.entities.BeatDownload.create({ beat_id: beat.id, user_id: user.id, license_type: "mp3_free" });
      }
      // Fetch the file as blob to preserve filename
      const response = await fetch(beat.free_mp3_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // Extract filename from URL or use beat title
      const urlPath = new URL(beat.free_mp3_url).pathname;
      const filename = urlPath.split("/").pop() || `${beat.title}.mp3`;
      a.download = decodeURIComponent(filename);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      qc.invalidateQueries({ queryKey: ["beats-public"] });
    } catch (e) {
      // Fallback: direct link
      window.open(beat.free_mp3_url, "_blank");
    }
  }, [user, qc]);

  // Play handler — plays the beat and sets up queue with all filtered beats
  const handlePlay = useCallback((beat, allBeats) => {
    const queue = allBeats.map(b => ({ ...b, beat_id: b.id }));
    const idx = queue.findIndex(b => b.beat_id === beat.id);
    playQueue(queue, idx >= 0 ? idx : 0);
  }, [playQueue]);

  // Filter + sort
  const filteredBeats = useMemo(() => {
    let result = [...beats];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(b =>
        b.title?.toLowerCase().includes(q) ||
        b.producer?.toLowerCase().includes(q) ||
        (b.genres || []).some(g => g.toLowerCase().includes(q)) ||
        (b.moods || []).some(m => m.toLowerCase().includes(q)) ||
        `${b.bpm}`.includes(q) ||
        (b.key || "").toLowerCase().includes(q)
      );
    }
    if (filters.genres?.length) {
      result = result.filter(b => filters.genres.some(g => (b.genres || []).includes(g)));
    }
    if (filters.moods?.length) {
      result = result.filter(b => filters.moods.some(m => (b.moods || []).includes(m)));
    }
    if (filters.key) {
      result = result.filter(b => b.scale === filters.key || b.key === filters.key);
    }
    if (filters.bpmRange) {
      const [min, max] = filters.bpmRange.split("-").map(Number);
      result = result.filter(b => b.bpm >= min && b.bpm <= max);
    }
    switch (sort) {
      case "popular": result.sort((a, b) => (b.saves_count || 0) - (a.saves_count || 0)); break;
      case "downloads": result.sort((a, b) => (b.downloads_count || 0) - (a.downloads_count || 0)); break;
      case "plays": result.sort((a, b) => (b.plays_count || 0) - (a.plays_count || 0)); break;
      default: result.sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0));
    }
    return result;
  }, [beats, filters, sort]);

  // Featured beats (admin-featured)
  const featuredBeats = useMemo(() => beats.filter(b => b.featured), [beats]);

  // Recommendations (based on liked/saved genres)
  const recommendedBeats = useMemo(() => {
    if (!user) return [];
    const likedGenres = new Set();
    likedIds.forEach(id => {
      const b = beats.find(x => x.id === id);
      (b?.genres || []).forEach(g => likedGenres.add(g));
    });
    savedIds.forEach(id => {
      const b = beats.find(x => x.id === id);
      (b?.genres || []).forEach(g => likedGenres.add(g));
    });
    if (likedGenres.size === 0) return [];
    return beats.filter(b =>
      (b.genres || []).some(g => likedGenres.has(g)) &&
      !likedIds.has(b.id)
    ).slice(0, 6);
  }, [beats, likedIds, savedIds, user]);

  return (
    <div className="min-h-screen pb-32" style={{ background: "#0a0a0b" }}>
      {/* Nav */}
      <div className="sticky top-0 z-40 flex items-center justify-between px-5 sm:px-10 py-4"
        style={{ background: "rgba(10,10,11,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <Link to="/Explorar" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm">
          <img src="https://media.base44.com/images/public/6966ddf48947f217e81ea27c/6b7c4002a_Titulo.png" alt="" className="h-6 w-auto opacity-70" />
        </Link>
        <h1 className="text-lg font-black text-white tracking-tight hidden sm:block">Beats</h1>
        <div className="flex items-center gap-2">
          {user ? (
            <Link to="/ArtistDashboard" className="text-xs font-semibold text-white/60 hover:text-white px-3 py-1.5 rounded-full bg-white/5 border border-white/10 transition-colors">
              Mi catálogo
            </Link>
          ) : (
            <Link to="/login" className="text-xs font-semibold text-white px-4 py-1.5 rounded-full transition-colors"
              style={{ background: "linear-gradient(135deg, #7c4dff, #a78bfa)" }}>
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>

      <div className="px-5 sm:px-10 max-w-7xl mx-auto">
        {/* Hero / featured */}
        {featuredBeats.length > 0 && (
          <div className="pt-6 pb-4">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.25em] mb-3">Destacado</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {featuredBeats.slice(0, 3).map(beat => (
                <BeatCard
                  key={beat.id}
                  beat={beat}
                  isPlaying={playingTrack?.beat_id === beat.id && isPlaying}
                  onPlay={() => handlePlay(beat, featuredBeats)}
                  onLike={user ? (b) => likeMutation.mutate(b) : null}
                  onDownload={user ? handleDownload : null}
                  onDrive={() => {}}
                  onLicenses={(b) => setLicensesModal(b)}
                  liked={likedIds.has(beat.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <BeatsFilters filters={filters} setFilters={setFilters} sort={sort} setSort={setSort} />

        {/* Recommendations */}
        {recommendedBeats.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-[#a78bfa]" />
              <h2 className="text-sm font-bold text-white">Recomendado para ti</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {recommendedBeats.map((beat, i) => (
                <BeatCard
                  key={beat.id}
                  beat={beat}
                  index={i}
                  isPlaying={playingTrack?.beat_id === beat.id && isPlaying}
                  onPlay={() => handlePlay(beat, recommendedBeats)}
                  onLike={user ? (b) => likeMutation.mutate(b) : null}
                  onDownload={user ? handleDownload : null}
                  onDrive={() => {}}
                  onLicenses={(b) => setLicensesModal(b)}
                  liked={likedIds.has(beat.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* All beats */}
        <div className="mb-4">
          <h2 className="text-sm font-bold text-white mb-3">
            {filters.search ? "Resultados" : "Todos los beats"}
            <span className="ml-2 text-white/30 font-normal">{filteredBeats.length}</span>
          </h2>
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="rounded-xl overflow-hidden" style={{ background: "#161616" }}>
                  <div className="aspect-square animate-pulse bg-white/5" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-white/5 rounded w-3/4 animate-pulse" />
                    <div className="h-2.5 bg-white/5 rounded w-1/2 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredBeats.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white/30 text-sm">No se encontraron beats</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {filteredBeats.map((beat, i) => (
                <BeatCard
                  key={beat.id}
                  beat={beat}
                  index={i}
                  isPlaying={playingTrack?.beat_id === beat.id && isPlaying}
                  onPlay={() => handlePlay(beat, filteredBeats)}
                  onLike={user ? (b) => likeMutation.mutate(b) : null}
                  onDownload={user ? handleDownload : null}
                  onDrive={() => {}}
                  onLicenses={(b) => setLicensesModal(b)}
                  liked={likedIds.has(beat.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Auth gate — blur + login modal after 5s */}
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
                className="w-full max-w-sm rounded-2xl p-8 text-center"
                style={{ background: "#141416", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ background: "linear-gradient(135deg, rgba(124,77,255,0.15), rgba(167,139,250,0.05))" }}
                >
                  <Lock className="w-6 h-6 text-[#a78bfa]" />
                </div>
                <h2 className="text-xl font-black text-white mb-2" style={{ fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "-0.03em" }}>
                  Accede a Cabaña Beats
                </h2>
                <p className="text-sm text-white/40 mb-6 leading-relaxed">
                  Inicia sesión para descargar, guardar y reproducir beats completos.
                </p>
                <div className="space-y-2">
                  <Link to="/login" className="block w-full py-3 rounded-xl text-sm font-bold text-white transition-colors"
                    style={{ background: "linear-gradient(135deg, #7c4dff, #a78bfa)" }}>
                    Iniciar sesión
                  </Link>
                  <Link to="/register" className="block w-full py-3 rounded-xl text-sm font-semibold text-white/60 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    Crear cuenta gratis
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Licenses modal */}
      <AnimatePresence>
        {licensesModal && (
          <BeatLicensesModal beat={licensesModal} onClose={() => setLicensesModal(null)} user={user} />
        )}
      </AnimatePresence>

      {/* Expanded player */}
      <ExpandedPlayer
        onLike={user ? () => {
          if (playingTrack?.beat_id) {
            const beat = beats.find(b => b.id === playingTrack.beat_id);
            if (beat) likeMutation.mutate(beat);
          }
        } : null}
        onSave={user ? () => {
          if (playingTrack?.beat_id) {
            const beat = beats.find(b => b.id === playingTrack.beat_id);
            if (beat) saveMutation.mutate(beat);
          }
        } : null}
        onDownload={user && playingTrack?.beat_id ? () => {
          const beat = beats.find(b => b.id === playingTrack.beat_id);
          if (beat) handleDownload(beat);
        } : null}
        onDrive={() => {}}
        onLicenses={playingTrack?.beat_id ? () => {
          const beat = beats.find(b => b.id === playingTrack.beat_id);
          if (beat) setLicensesModal(beat);
        } : null}
        liked={playingTrack?.beat_id ? likedIds.has(playingTrack.beat_id) : false}
        saved={playingTrack?.beat_id ? savedIds.has(playingTrack.beat_id) : false}
      />
    </div>
  );
}