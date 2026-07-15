import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBeatPlayer } from "@/hooks/useBeatPlayer";
import { resolveSectionBeats } from "@/lib/beatSections";
import { getOriginalFilename } from "@/lib/beatsUtils";
import { Search, Lock, Menu, ChevronDown, X, TrendingUp, ShoppingBag } from "lucide-react";
import BeatCard from "@/components/beats/BeatCard";
import BeatsFeaturedCarousel from "@/components/beats/BeatsFeaturedCarousel";
import BeatsTrendingList from "@/components/beats/BeatsTrendingList";
import BeatsRankingList from "@/components/beats/BeatsRankingList";
import BeatLicensesModal from "@/components/beats/BeatLicensesModal";
import BeatExpandedPanel from "@/components/beats/BeatExpandedPanel";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav";

// Curation + genre category chips (horizontal scroll on mobile)
const CURATION_CHIPS = [
  { id: "todos", label: "Todos" },
  { id: "staff", label: "Staff Picks" },
  { id: "nuevos", label: "Nuevos" },
  { id: "populares", label: "Populares" },
  { id: "descargas", label: "Descargas" },
  { id: "gratis", label: "Gratis" },
];
const GENRE_CHIPS = [
  "Reggaetón", "Afrobeats", "Jersey Club", "Trap", "House",
  "R&B", "Drill", "Hip-Hop", "Lo-Fi", "Experimental",
];
const TABS = ["Explorar", "Nuevos", "Trending"];

export default function Beats() {
  const qc = useQueryClient();
  const { toggle, playingTrack, isPlaying } = useBeatPlayer();

  const [search, setSearch] = useState("");
  const [activeCuration, setActiveCuration] = useState("todos");
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [activeTab, setActiveTab] = useState("Explorar");
  const [licensesModal, setLicensesModal] = useState(null);
  const [likedIds, setLikedIds] = useState(new Set());
  const [savedIds, setSavedIds] = useState(new Set());
  const [authGate, setAuthGate] = useState(false);
  const [cinematicBeat, setCinematicBeat] = useState(null);
  const [user, setUser] = useState(null);

  const trendingRef = useRef(null);
  const nuevosRef = useRef(null);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (!authed) {
        const timer = setTimeout(() => setAuthGate(true), 120000);
        return () => clearTimeout(timer);
      }
      setUser(await base44.auth.me());
    });
  }, []);

  const { data: beats = [], isLoading } = useQuery({
    queryKey: ["beats-public"],
    queryFn: async () => {
      const all = await base44.entities.Beat.filter({ status: "Publicado" });
      return all.filter(b => !b.archived);
    },
  });

  const { data: likes = [] } = useQuery({
    queryKey: ["beat-likes-me", user?.id],
    queryFn: async () => user?.id ? base44.entities.BeatLike.filter({ user_id: user.id }) : [],
    enabled: !!user?.id,
  });
  const { data: saves = [] } = useQuery({
    queryKey: ["beat-saves-me", user?.id],
    queryFn: async () => user?.id ? base44.entities.BeatSave.filter({ user_id: user.id }) : [],
    enabled: !!user?.id,
  });

  // Secciones editables de la página (título, beats, visibilidad, orden)
  const { data: sections = [] } = useQuery({
    queryKey: ["beats-page-sections"],
    queryFn: async () => base44.entities.BeatSection.list("order"),
  });

  useEffect(() => { setLikedIds(new Set(likes.map(l => l.beat_id))); }, [likes]);
  useEffect(() => { setSavedIds(new Set(saves.map(s => s.beat_id))); }, [saves]);

  const likeMutation = useMutation({
    mutationFn: async (beat) => {
      if (likedIds.has(beat.id)) {
        const like = likes.find(l => l.beat_id === beat.id);
        if (like) await base44.entities.BeatLike.delete(like.id);
      } else {
        await base44.entities.BeatLike.create({ beat_id: beat.id, user_id: user.id });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["beat-likes-me", user?.id] });
      qc.invalidateQueries({ queryKey: ["beat-likes"] });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (beat) => {
      if (savedIds.has(beat.id)) {
        const save = saves.find(s => s.beat_id === beat.id);
        if (save) await base44.entities.BeatSave.delete(save.id);
      } else {
        await base44.entities.BeatSave.create({ beat_id: beat.id, user_id: user.id });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["beat-saves-me", user?.id] });
      qc.invalidateQueries({ queryKey: ["saved-beats"] });
      qc.invalidateQueries({ queryKey: ["saved-beats", user?.id] });
    },
  });

  const handleDownload = useCallback(async (beat) => {
    if (!beat.free_mp3_url) return;
    try {
      if (user?.id) await base44.entities.BeatDownload.create({ beat_id: beat.id, user_id: user.id, license_type: "mp3_free" });
      const res = await fetch(beat.free_mp3_url);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = getOriginalFilename(beat.free_mp3_url) || `${beat.title}.mp3`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      qc.invalidateQueries({ queryKey: ["beats-public"] });
    } catch { window.open(beat.free_mp3_url, "_blank"); }
  }, [user, qc]);

  const handleBuy = useCallback((beat) => {
    // Buy link directo o licencias (modal)
    if (beat.buy_link) {
      window.open(beat.buy_link, "_blank", "noopener,noreferrer");
    } else if (beat.licenses && beat.licenses.length > 0) {
      setLicensesModal(beat);
    }
  }, []);

  // handlePlay usa el toggle del hook (play/pause/resume, una sola reproducción)
  const handlePlay = useCallback((beat, allBeats) => {
    toggle(beat, allBeats);
  }, [toggle]);

  // Secciones por layout (editable desde el admin). Fallback al comportamiento actual.
  const featuredSection = useMemo(() => sections.find(s => s.layout === "carousel"), [sections]);
  const gridSection = useMemo(() => sections.find(s => s.layout === "grid"), [sections]);
  const listSection = useMemo(() => sections.find(s => s.layout === "list"), [sections]);
  const rankingSection = useMemo(() => sections.find(s => s.layout === "ranking"), [sections]);
  const isVisible = (s) => !s || s.is_visible !== false;

  const featuredBeats = useMemo(() => {
    if (featuredSection) return resolveSectionBeats(featuredSection, beats);
    const featured = beats.filter(b => b.featured);
    if (featured.length >= 3) return featured.slice(0, 6);
    const sorted = [...beats].sort((a, b) => (b.plays_count || 0) - (a.plays_count || 0));
    return [...featured, ...sorted.filter(b => !featured.includes(b))].slice(0, 6);
  }, [beats, featuredSection]);

  const trendingBeats = useMemo(() => {
    if (listSection) return resolveSectionBeats(listSection, beats);
    return [...beats]
      .sort((a, b) => ((b.plays_count || 0) + (b.downloads_count || 0)) - ((a.plays_count || 0) + (a.downloads_count || 0)))
      .slice(0, 10);
  }, [beats, listSection]);

  const gridBeats = useMemo(() => {
    if (gridSection) return resolveSectionBeats(gridSection, beats);
    return [...beats].sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0));
  }, [beats, gridSection]);

  const rankingBeats = useMemo(() => {
    if (rankingSection) return resolveSectionBeats(rankingSection, beats);
    return [...beats]
      .sort((a, b) => ((b.plays_count || 0) + (b.downloads_count || 0)) - ((a.plays_count || 0) + (a.downloads_count || 0)))
      .slice(0, 5);
  }, [beats, rankingSection]);

  const toggleGenre = useCallback((g) => {
    setSelectedGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : (prev.length >= 4 ? prev : [...prev, g]));
  }, []);

  const filteredBeats = useMemo(() => {
    let result = [...beats];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(b =>
        b.title?.toLowerCase().includes(q) ||
        b.producer?.toLowerCase().includes(q) ||
        `${b.bpm}`.includes(q) ||
        (b.key || "").toLowerCase().includes(q) ||
        (b.scale || "").toLowerCase().includes(q) ||
        (b.genres || []).some(g => g.toLowerCase().includes(q))
      );
    }
    switch (activeCuration) {
      case "staff": result = result.filter(b => b.featured); break;
      case "nuevos": result.sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0)); break;
      case "populares": result.sort((a, b) => (b.plays_count || 0) - (a.plays_count || 0)); break;
      case "descargas": result.sort((a, b) => (b.downloads_count || 0) - (a.downloads_count || 0)); break;
      case "gratis": result = result.filter(b => (b.licenses || []).some(l => l.type === "mp3_free")); break;
      default: break;
    }
    if (selectedGenres.length > 0) {
      result = result.filter(b => selectedGenres.every(g => (b.genres || []).includes(g)));
    }
    return result;
  }, [beats, search, activeCuration, selectedGenres]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "Nuevos") nuevosRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (tab === "Trending") trendingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (tab === "Explorar") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Render dinámico de cada sección configurada en el editor (admin → público).
  const renderSection = (section) => {
    if (!isVisible(section)) return null;
    const sBeats = resolveSectionBeats(section, beats);
    switch (section.layout) {
      case "carousel":
        if (sBeats.length === 0) return null;
        return (
          <div key={section.id} className="px-4 sm:px-10 max-w-7xl mx-auto mb-10">
            <BeatsFeaturedCarousel beats={sBeats} isPlaying={isPlaying} onPlay={handlePlay} onOpen={setCinematicBeat} section={section} />
          </div>
        );
      case "grid": {
        const browsing = !!search || activeCuration !== "todos" || selectedGenres.length > 0;
        const displayBeats = browsing ? filteredBeats : sBeats;
        return (
          <div key={section.id} ref={nuevosRef} className="px-4 sm:px-10 max-w-7xl mx-auto mb-10 scroll-mt-40">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-4" style={{ letterSpacing: "-0.03em" }}>
              {search ? "Resultados" : (section.title || "New releases")}
            </h2>
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {CURATION_CHIPS.map((chip) => {
                const active = activeCuration === chip.id;
                return (
                  <button key={chip.id} onClick={() => setActiveCuration(chip.id)} className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
                    style={{ background: active ? "#ffffff" : "#1c1c1c", color: active ? "#0e0e0e" : "#a0a0a0", border: active ? "1px solid #ffffff" : "1px solid #262626" }}>
                    {chip.label}
                  </button>
                );
              })}
              <span className="w-px h-4 bg-white/10 flex-shrink-0" />
              {GENRE_CHIPS.map((g) => {
                const active = selectedGenres.includes(g);
                const disabled = !active && selectedGenres.length >= 4;
                return (
                  <button key={g} onClick={() => toggleGenre(g)} disabled={disabled} className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all disabled:opacity-30"
                    style={{ background: active ? "#ff5833" : "#1c1c1c", color: active ? "#ffffff" : "#a0a0a0", border: active ? "1px solid #ff5833" : "1px solid #262626" }}>
                    {g}{active ? " ×" : ""}
                  </button>
                );
              })}
              {selectedGenres.length > 0 && (
                <button onClick={() => setSelectedGenres([])} className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold text-white/50 hover:text-white transition-colors">
                  Limpiar
                </button>
              )}
            </div>
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i}><div className="aspect-square rounded-2xl animate-pulse" style={{ background: "#1a1a1a" }} /><div className="h-3.5 bg-white/5 rounded w-3/4 mt-3 animate-pulse" /><div className="h-3 bg-white/5 rounded w-1/2 mt-2 animate-pulse" /></div>
                ))}
              </div>
            ) : displayBeats.length === 0 ? (
              <div className="text-center py-20"><p className="text-[#a0a0a0] text-sm">No se encontraron beats</p></div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {displayBeats.map((beat, i) => (
                  <BeatCard key={beat.id} beat={beat} index={i} user={user} liked={likedIds.has(beat.id)} saved={savedIds.has(beat.id)}
                    onLike={user ? (b) => likeMutation.mutate(b) : null} onSave={user ? (b) => saveMutation.mutate(b) : null}
                    onDownload={user ? handleDownload : null} onBuy={handleBuy} onPlay={handlePlay} onOpen={setCinematicBeat} listBeats={displayBeats} />
                ))}
              </div>
            )}
          </div>
        );
      }
      case "ranking":
        if (sBeats.length === 0) return null;
        return (
          <div key={section.id} className="px-4 sm:px-10 max-w-7xl mx-auto mb-10 scroll-mt-40">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-1" style={{ letterSpacing: "-0.03em" }}>{section.title || "Hot Right Now"}</h2>
            <p className="text-sm text-[#a0a0a0] mb-5">{section.subtitle || "The hottest samples right now."}</p>
            <BeatsRankingList beats={sBeats} isPlaying={isPlaying} onPlay={handlePlay} onLike={user ? (b) => likeMutation.mutate(b) : null} onDownload={user ? handleDownload : null}
              onShare={(beat) => { const url = `${window.location.origin}/beats/${beat.slug || beat.id}`; if (navigator.share) navigator.share({ title: beat.title, url }).catch(() => {}); else navigator.clipboard?.writeText(url).catch(() => {}); }}
              likedIds={likedIds} user={user} onOpen={setCinematicBeat} listBeats={sBeats} />
          </div>
        );
      case "list":
      case "compact":
        if (sBeats.length === 0) return null;
        return (
          <div key={section.id} ref={section.layout === "list" ? trendingRef : null} className="px-4 sm:px-10 max-w-7xl mx-auto mb-10 scroll-mt-40">
            <div className="flex items-center gap-2 mb-1"><TrendingUp className="w-5 h-5" style={{ color: section.color || "#ff5833" }} /><h2 className="text-2xl sm:text-3xl font-black text-white" style={{ letterSpacing: "-0.03em" }}>{section.title || "Trending"}</h2></div>
            <p className="text-sm text-[#a0a0a0] mb-5">{section.subtitle || "Los beats más calientes ahora mismo."}</p>
            <BeatsTrendingList beats={sBeats} isPlaying={isPlaying} onPlay={handlePlay} onLike={user ? (b) => likeMutation.mutate(b) : null} onDownload={user ? handleDownload : null} likedIds={likedIds} user={user} />
          </div>
        );
      case "horizontal":
        if (sBeats.length === 0) return null;
        return (
          <div key={section.id} className="px-4 sm:px-10 max-w-7xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-4" style={{ letterSpacing: "-0.03em" }}>{section.title || "Beats"}</h2>
            {section.subtitle && <p className="text-sm text-[#a0a0a0] mb-4">{section.subtitle}</p>}
            <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
              {sBeats.map((beat, i) => (
                <div key={beat.id} className="w-44 flex-shrink-0">
                  <BeatCard beat={beat} index={i} user={user} liked={likedIds.has(beat.id)} saved={savedIds.has(beat.id)} onLike={user ? (b) => likeMutation.mutate(b) : null} onSave={user ? (b) => saveMutation.mutate(b) : null} onDownload={user ? handleDownload : null} onBuy={handleBuy} onPlay={handlePlay} onOpen={setCinematicBeat} listBeats={sBeats} />
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pb-32" style={{ background: "#121212", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* ── Sticky nav + search + tabs ─────────────────────────────── */}
      <div className="sticky top-0 z-40" style={{ background: "rgba(18,18,18,0.95)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        {/* Nav header */}
        <div className="flex items-center justify-between px-4 sm:px-10 py-3">
          {/* Left: menu */}
          <Link to="/Explorar" className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-white/5 transition-colors text-white/70">
            <Menu className="w-5 h-5" />
          </Link>
          {/* Center: logo */}
          <Link to="/beats" className="absolute left-1/2 -translate-x-1/2">
            <img src="https://media.base44.com/images/public/6966ddf48947f217e81ea27c/6b7c4002a_Titulo.png" alt="Cabaña" className="h-6 w-auto opacity-90" />
          </Link>
          {/* Right: actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <Link to="/ArtistDashboard" className="text-xs font-semibold text-white/70 hover:text-white px-4 py-2 rounded-full bg-white/5 border border-white/10 transition-colors">
                Mi catálogo
              </Link>
            ) : (
              <Link to="/login" className="text-xs font-semibold text-white/60 hover:text-white px-2 sm:px-3 py-2 transition-colors">
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Search bar */}
        <div className="px-4 sm:px-10 max-w-3xl mx-auto pb-3">
          <div className="flex items-center gap-2 w-full rounded-full px-4 py-3" style={{ background: "#1c1c1c", border: "1px solid #262626" }}>
            <button className="flex items-center gap-1.5 text-xs font-semibold text-white/70 hover:text-white transition-colors flex-shrink-0">
              Beats
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <span className="w-px h-4 bg-white/10 flex-shrink-0" />
            <Search className="w-4 h-4 text-white/30 flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar beats..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none min-w-0"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-white/30 hover:text-white flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 sm:px-10 max-w-3xl mx-auto">
          <div className="flex items-center gap-6 border-b border-white/8 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className="relative pb-3 pt-1 text-xs font-bold tracking-wider transition-colors whitespace-nowrap"
                style={{ color: activeTab === tab ? "#ffffff" : "#a0a0a0" }}
              >
                {tab.toUpperCase()}
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
      </div>

      {/* ── Hero carrusel (primer bloque único de la página) ───────── */}
      {featuredBeats.length > 0 && (!featuredSection || isVisible(featuredSection)) && (
        <div className="px-4 sm:px-10 max-w-7xl mx-auto pt-5 mb-10">
          <BeatsFeaturedCarousel beats={featuredBeats} isPlaying={isPlaying} onPlay={handlePlay} onOpen={setCinematicBeat} section={featuredSection || { auto_play: true, auto_play_interval: 6 }} />
        </div>
      )}

      {/* ── Secciones dinámicas (editor de la página Beats) ─────────── */}
      <div className={featuredBeats.length > 0 && (!featuredSection || isVisible(featuredSection)) ? "" : "pt-5"}>
        {sections.filter((section) => section.id !== featuredSection?.id).map((section) => renderSection(section))}
      </div>

      {!isLoading && sections.filter(isVisible).length === 0 && (
        <div className="px-4 sm:px-10 max-w-7xl mx-auto pt-10 text-center">
          <p className="text-white/30 text-sm">No hay secciones configuradas en el panel de BEATS.</p>
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
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "rgba(255,88,51,0.15)" }}>
                  <Lock className="w-6 h-6 text-[#ff8866]" />
                </div>
                <h2 className="text-xl font-black text-white mb-2" style={{ letterSpacing: "-0.03em" }}>
                  Accede a Cabaña Beats
                </h2>
                <p className="text-sm text-[#a0a0a0] mb-6 leading-relaxed">
                  Inicia sesión para descargar, guardar y reproducir beats completos.
                </p>
                <div className="space-y-2">
                  <Link to="/login" className="block w-full py-3 rounded-xl text-sm font-bold text-white transition-colors" style={{ background: "#ff5833" }}>
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

      {/* ── Cinematic beat view ───────────────────────────────────── */}
      <AnimatePresence>
        {cinematicBeat && (
          <BeatExpandedPanel
            beat={cinematicBeat}
            onClose={() => setCinematicBeat(null)}
            user={user}
            liked={likedIds.has(cinematicBeat.id)}
            saved={savedIds.has(cinematicBeat.id)}
            active={playingTrack?.beat_id === cinematicBeat.id}
            isPlaying={isPlaying}
            onLike={user ? (b) => likeMutation.mutate(b) : null}
            onSave={user ? (b) => saveMutation.mutate(b) : null}
            onDownload={user ? handleDownload : null}
            onBuy={handleBuy}
            onPlay={() => handlePlay(cinematicBeat, beats)}
          />
        )}
      </AnimatePresence>

      {/* Mobile bottom nav */}
      <MobileBottomNav isAdmin={user?.role === "admin"} />
    </div>
  );
}