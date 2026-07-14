import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBeatPlayer } from "@/hooks/useBeatPlayer";
import { Play, Pause, Plus, Search, Grid3x3, List, MoreVertical, Download, FolderOpen, Music2, TrendingUp, BarChart3, Heart, Archive, Copy, Trash2, Eye, EyeOff, Pencil, X, Star, LayoutPanelTop, ExternalLink, ChevronDown, Users } from "lucide-react";
import { GENRES, MOODS, KEYS, BEAT_STATUS } from "@/lib/musicConstants";
import BeatFormModal from "@/components/beats/BeatFormModal";
import BeatsPageBuilder from "@/components/beats/BeatsPageBuilder";
import AdminBottomNav from "@/components/admin/AdminBottomNav";

export default function BeatsAdmin() {
  const qc = useQueryClient();
  const { toggle, playingTrack, isPlaying } = useBeatPlayer();

  const [tab, setTab] = useState("beats"); // beats | page
  const [view, setView] = useState("grid"); // grid | list
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [genreFilter, setGenreFilter] = useState("");
  const [sort, setSort] = useState("recent");
  const [showForm, setShowForm] = useState(false);
  const [editingBeat, setEditingBeat] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [genreExpanded, setGenreExpanded] = useState(false);
  const [moodExpanded, setMoodExpanded] = useState(false);

  // Fetch all beats
  const { data: beats = [], isLoading } = useQuery({
    queryKey: ["beats-admin"],
    queryFn: async () => base44.entities.Beat.list("-created_date"),
  });

  // Engagement data
  const { data: allLikes = [] } = useQuery({
    queryKey: ["beat-likes-all"],
    queryFn: async () => base44.entities.BeatLike.list(),
  });
  const { data: allSaves = [] } = useQuery({
    queryKey: ["beat-saves-all"],
    queryFn: async () => base44.entities.BeatSave.list(),
  });
  const { data: allDownloads = [] } = useQuery({
    queryKey: ["beat-downloads-all"],
    queryFn: async () => base44.entities.BeatDownload.list(),
  });

  // Users — para mostrar quién guardó / descargó / dio like
  const { data: users = [] } = useQuery({
    queryKey: ["users-all"],
    queryFn: async () => base44.entities.User.list(),
  });

  const userMap = useMemo(() => {
    const m = {};
    (users || []).forEach(u => { m[u.id] = u; });
    return m;
  }, [users]);

  const nameFor = useCallback((uid) => {
    const u = userMap[uid];
    if (!u) return null;
    return u.full_name || (u.email ? u.email.split("@")[0] : null);
  }, [userMap]);

  const namesForBeat = useCallback((beatId, arr) => {
    const ids = (arr || []).filter(x => x.beat_id === beatId).map(x => x.user_id).filter(Boolean);
    const names = ids.map(nameFor).filter(Boolean);
    return names;
  }, [nameFor]);

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Beat.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["beats-admin"] }); setMenuOpen(null); },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (beat) => {
      const { id, created_date, updated_date, plays_count, downloads_count, saves_count, ...rest } = beat;
      return base44.entities.Beat.create({ ...rest, title: `${beat.title} (copia)`, status: "Borrador", featured: false });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["beats-admin"] }); setMenuOpen(null); },
  });

  const archiveMutation = useMutation({
    mutationFn: ({ id, archived }) => base44.entities.Beat.update(id, { archived: !archived }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["beats-admin"] }); setMenuOpen(null); },
  });

  const publishMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Beat.update(id, { status: status === "Publicado" ? "Borrador" : "Publicado" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["beats-admin"] }); setMenuOpen(null); },
  });

  const featureMutation = useMutation({
    mutationFn: ({ id, featured }) => base44.entities.Beat.update(id, { featured: !featured }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["beats-admin"] }); },
  });

  // Analytics
  const analytics = useMemo(() => {
    const published = beats.filter(b => b.status === "Publicado" && !b.archived).length;
    const drafts = beats.filter(b => b.status === "Borrador" && !b.archived).length;
    const likeCount = (b) => allLikes.filter(l => l.beat_id === b.id).length;
    const mostLiked = [...beats].sort((a, b) => likeCount(b) - likeCount(a)).slice(0, 5);
    const mostSaved = [...beats].sort((a, b) => (allSaves.filter(s => s.beat_id === b.id).length) - (allSaves.filter(s => s.beat_id === a.id).length)).slice(0, 5);
    const mostDownloaded = [...beats].sort((a, b) => (allDownloads.filter(d => d.beat_id === b.id).length) - (allDownloads.filter(d => d.beat_id === a.id).length)).slice(0, 5);
    const mostPlayed = [...beats].sort((a, b) => (b.plays_count || 0) - (a.plays_count || 0)).slice(0, 5);
    const genreCounts = {};
    beats.forEach(b => (b.genres || []).forEach(g => { genreCounts[g] = (genreCounts[g] || 0) + 1; }));
    const topGenres = Object.entries(genreCounts).sort(([, a], [, b]) => b - a);
    const moodCounts = {};
    beats.forEach(b => (b.moods || []).forEach(m => { moodCounts[m] = (moodCounts[m] || 0) + 1; }));
    const topMoods = Object.entries(moodCounts).sort(([, a], [, b]) => b - a);
    return { published, drafts, mostLiked, mostSaved, mostDownloaded, mostPlayed, topGenres, topMoods, totalLikes: allLikes.length };
  }, [beats, allLikes, allSaves, allDownloads]);

  // Filter
  const filteredBeats = useMemo(() => {
    let result = [...beats];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(b => b.title?.toLowerCase().includes(q) || b.producer?.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") result = result.filter(b => b.status === statusFilter);
    if (genreFilter) result = result.filter(b => (b.genres || []).includes(genreFilter));
    if (sort === "recent") result.sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0));
    if (sort === "title") result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    return result;
  }, [beats, search, statusFilter, genreFilter, sort]);

  const handlePlay = useCallback((beat) => {
    toggle(beat, filteredBeats);
  }, [filteredBeats, toggle]);

  const downloadMp3 = async (beat) => {
    if (!beat.free_mp3_url) return;
    try {
      const response = await fetch(beat.free_mp3_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const urlPath = new URL(beat.free_mp3_url).pathname;
      a.download = decodeURIComponent(urlPath.split("/").pop()) || `${beat.title}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(beat.free_mp3_url, "_blank");
    }
  };

  const statPills = [
    { label: "Total", value: beats.length, icon: Music2, color: "#ffffff" },
    { label: "Publicados", value: analytics.published, icon: Eye, color: "#10b981" },
    { label: "Borradores", value: analytics.drafts, icon: Pencil, color: "#f59e0b" },
    { label: "Likes", value: analytics.totalLikes, icon: Heart, color: "#ff5833" },
    { label: "Descargas", value: allDownloads.length, icon: Download, color: "#ff8866" },
  ];

  return (
    <div className="min-h-screen pb-32" style={{ background: "#0a0a0b" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 px-4 sm:px-10 py-3 flex flex-wrap items-center justify-between gap-3"
        style={{ background: "rgba(10,10,11,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-black text-white tracking-tight">Beats</h1>
          <span className="text-xs text-white/30">{beats.length} total</span>
          <Link to="/beats" target="_blank"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-white/60 hover:text-white transition-colors"
            style={{ background: "#141416", border: "1px solid rgba(255,255,255,0.08)" }}
            title="Ver página pública de Beats"
          >
            <ExternalLink className="w-3 h-3" />
            Ver página
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "#141416", border: "1px solid rgba(255,255,255,0.06)" }}>
            <button
              onClick={() => setTab("beats")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${tab === "beats" ? "bg-white text-black" : "text-white/50 hover:text-white"}`}
            >
              <Music2 className="w-3.5 h-3.5" />
              Beats
            </button>
            <button
              onClick={() => setTab("page")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${tab === "page" ? "bg-white text-black" : "text-white/50 hover:text-white"}`}
            >
              <LayoutPanelTop className="w-3.5 h-3.5" />
              Página
            </button>
          </div>
          {tab === "beats" && (
            <button
              onClick={() => { setEditingBeat(null); setShowForm(true); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-white transition-colors"
              style={{ background: "linear-gradient(135deg, #ff5833, #e0451f)" }}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Crear Beat</span>
              <span className="sm:hidden">Subir</span>
            </button>
          )}
        </div>
      </div>

      {/* Page builder tab */}
      {tab === "page" && (
        <div className="px-4 sm:px-10 max-w-7xl mx-auto mt-6">
          <BeatsPageBuilder />
        </div>
      )}

      {tab === "beats" && (
      <div className="px-4 sm:px-10 max-w-7xl mx-auto">
        {/* Compact stats strip */}
        <div className="flex flex-wrap gap-2 mt-5 mb-5">
          {statPills.map(p => (
            <div key={p.label} className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: "#141416", border: "1px solid rgba(255,255,255,0.05)" }}>
              <p.icon className="w-3.5 h-3.5" style={{ color: p.color }} />
              <span className="text-sm font-black text-white leading-none">{p.value}</span>
              <span className="text-[10px] font-bold text-white/35 uppercase tracking-wider leading-none">{p.label}</span>
            </div>
          ))}
        </div>

        {/* Toolbar — priorizar la gestión */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar beats..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-white/[0.05] border border-white/[0.08] text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl text-sm bg-white/[0.05] border border-white/[0.08] text-white focus:outline-none">
            <option value="all">Todos los estados</option>
            {BEAT_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={genreFilter} onChange={(e) => setGenreFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl text-sm bg-white/[0.05] border border-white/[0.08] text-white focus:outline-none">
            <option value="">Todos los géneros</option>
            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.05] border border-white/[0.08]">
            <button onClick={() => setView("grid")} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${view === "grid" ? "bg-white text-black" : "text-white/40 hover:text-white"}`}>
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button onClick={() => setView("list")} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${view === "list" ? "bg-white text-black" : "text-white/40 hover:text-white"}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Beats grid/list */}
        {isLoading ? (
          <div className="text-center py-20 text-white/30 text-sm">Cargando...</div>
        ) : filteredBeats.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/30 text-sm mb-3">No hay beats</p>
            <button onClick={() => { setEditingBeat(null); setShowForm(true); }}
              className="text-sm font-semibold text-[#ff8866] hover:text-white transition-colors">
              Crear el primer beat
            </button>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {filteredBeats.map(beat => (
              <BeatAdminCard
                key={beat.id}
                beat={beat}
                isPlaying={playingTrack?.beat_id === beat.id && isPlaying}
                onPlay={() => handlePlay(beat)}
                onEdit={() => { setEditingBeat(beat); setShowForm(true); }}
                onDelete={() => deleteMutation.mutate(beat.id)}
                onDuplicate={() => duplicateMutation.mutate(beat)}
                onArchive={() => archiveMutation.mutate({ id: beat.id, archived: beat.archived })}
                onPublish={() => publishMutation.mutate({ id: beat.id, status: beat.status })}
                onFeature={() => featureMutation.mutate({ id: beat.id, featured: beat.featured })}
                onDownload={() => downloadMp3(beat)}
                menuOpen={menuOpen === beat.id}
                setMenuOpen={(v) => setMenuOpen(v ? beat.id : null)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredBeats.map(beat => (
              <BeatAdminRow
                key={beat.id}
                beat={beat}
                isPlaying={playingTrack?.beat_id === beat.id && isPlaying}
                onPlay={() => handlePlay(beat)}
                onEdit={() => { setEditingBeat(beat); setShowForm(true); }}
                onDelete={() => deleteMutation.mutate(beat.id)}
                onDuplicate={() => duplicateMutation.mutate(beat)}
                onArchive={() => archiveMutation.mutate({ id: beat.id, archived: beat.archived })}
                onPublish={() => publishMutation.mutate({ id: beat.id, status: beat.status })}
                onFeature={() => featureMutation.mutate({ id: beat.id, featured: beat.featured })}
                onDownload={() => downloadMp3(beat)}
                menuOpen={menuOpen === beat.id}
                setMenuOpen={(v) => setMenuOpen(v ? beat.id : null)}
              />
            ))}
          </div>
        )}

        {/* Analytics — plegable */}
        <div className="mt-8">
          <button
            onClick={() => setShowAnalytics(v => !v)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-colors w-full justify-between"
            style={{ background: "#141416", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#ff5833]" />
              Analíticas
            </span>
            <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${showAnalytics ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {showAnalytics && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 space-y-4">
                  {/* Top lists con detalle de usuarios */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    <EngagementList title="Más Likes" icon={Heart} beats={analytics.mostLiked} arr={allLikes} userMap={userMap} namesForBeat={namesForBeat} />
                    <EngagementList title="Más Guardados" icon={Star} beats={analytics.mostSaved} arr={allSaves} userMap={userMap} namesForBeat={namesForBeat} />
                    <EngagementList title="Más Descargados" icon={Download} beats={analytics.mostDownloaded} arr={allDownloads} userMap={userMap} namesForBeat={namesForBeat} />
                  </div>

                  {/* Más reproducidos (plays_count) */}
                  <div className="p-3 rounded-xl" style={{ background: "#141416", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-3.5 h-3.5 text-white/40" />
                      <h3 className="text-xs font-bold text-white">Más Reproducidos</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {analytics.mostPlayed.filter(b => (b.plays_count || 0) > 0).length === 0 ? (
                        <p className="text-xs text-white/30">Sin reproducciones</p>
                      ) : analytics.mostPlayed.filter(b => (b.plays_count || 0) > 0).map((beat, i) => (
                        <span key={beat.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] text-white/70" style={{ background: "rgba(255,255,255,0.04)" }}>
                          <span className="text-white/30">{i + 1}</span>
                          <span className="truncate max-w-[120px]">{beat.title}</span>
                          <span className="font-bold text-[#ff8866]">{beat.plays_count || 0}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Genre / Mood bars expandibles */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <BarsCard title="Géneros más usados" data={analytics.topGenres} expanded={genreExpanded} setExpanded={setGenreExpanded} defaultCount={10} />
                    <BarsCard title="Moods más usados" data={analytics.topMoods} expanded={moodExpanded} setExpanded={setMoodExpanded} defaultCount={15} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      )}

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <BeatFormModal beat={editingBeat} onClose={() => { setShowForm(false); setEditingBeat(null); }} />
        )}
      </AnimatePresence>

      <AdminBottomNav />
    </div>
  );
}

function EngagementList({ title, icon: Icon, beats, arr, namesForBeat }) {
  return (
    <div className="p-3 rounded-xl" style={{ background: "#141416", border: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-3.5 h-3.5 text-white/40" />
        <h3 className="text-xs font-bold text-white">{title}</h3>
      </div>
      <div className="space-y-2">
        {beats.filter(b => (arr || []).some(x => x.beat_id === b.id)).slice(0, 5).map((beat, i) => {
          const count = (arr || []).filter(x => x.beat_id === beat.id).length;
          const names = namesForBeat(beat.id, arr);
          return (
            <div key={beat.id} className="flex items-start gap-2.5">
              <span className="text-[10px] text-white/30 w-3 pt-0.5">{i + 1}</span>
              {beat.cover_url ? (
                <img src={beat.cover_url} alt="" className="w-7 h-7 rounded-md object-cover flex-shrink-0" />
              ) : (
                <div className="w-7 h-7 rounded-md bg-white/5 flex items-center justify-center flex-shrink-0"><Music2 className="w-3 h-3 text-white/20" /></div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-white/70 truncate">{beat.title}</span>
                  <span className="text-[11px] font-bold text-[#ff8866] flex-shrink-0">{count}</span>
                </div>
                {names.length > 0 ? (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Users className="w-2.5 h-2.5 text-white/25 flex-shrink-0" />
                    <p className="text-[9px] text-white/35 truncate">
                      {names.slice(0, 3).join(", ")}{names.length > 3 ? ` +${names.length - 3}` : ""}
                    </p>
                  </div>
                ) : (
                  <p className="text-[9px] text-white/20 mt-0.5">Usuarios no identificados</p>
                )}
              </div>
            </div>
          );
        })}
        {beats.filter(b => (arr || []).some(x => x.beat_id === b.id)).length === 0 && (
          <p className="text-xs text-white/30">Sin datos</p>
        )}
      </div>
    </div>
  );
}

function BarsCard({ title, data, expanded, setExpanded, defaultCount }) {
  const max = data[0]?.[1] || 1;
  const visible = expanded ? data : data.slice(0, defaultCount);
  return (
    <div className="p-3 rounded-xl" style={{ background: "#141416", border: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-3.5 h-3.5 text-white/40" />
          <h3 className="text-xs font-bold text-white">{title}</h3>
        </div>
        {data.length > defaultCount && (
          <button onClick={() => setExpanded(v => !v)} className="text-[10px] font-bold text-[#ff8866] hover:text-white transition-colors">
            {expanded ? "Ver menos" : `Ver todos (${data.length})`}
          </button>
        )}
      </div>
      <div className="space-y-1.5">
        {data.length === 0 ? (
          <p className="text-xs text-white/30">Sin datos</p>
        ) : visible.map(([name, count]) => (
          <div key={name} className="flex items-center gap-2">
            <span className="text-[10px] text-white/60 w-24 truncate">{name}</span>
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${(count / max) * 100}%`, background: "linear-gradient(90deg, #ff5833, #e0451f)" }} />
            </div>
            <span className="text-[10px] text-white/40 w-5 text-right">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BeatAdminCard({ beat, isPlaying, onPlay, onEdit, onDelete, onDuplicate, onArchive, onPublish, onFeature, onDownload, menuOpen, setMenuOpen }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div className="group relative rounded-xl overflow-hidden" style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="relative aspect-square overflow-hidden" style={{ background: "#1a1a1c" }} onClick={onPlay}>
        {beat.cover_url && !imgError ? (
          <img src={beat.cover_url} alt="" className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-500" onError={() => setImgError(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center cursor-pointer"><Music2 className="w-8 h-8 text-white/15" /></div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #ff5833, #e0451f)" }}>
            {isPlaying ? <Pause className="w-4 h-4 text-white" fill="white" /> : <Play className="w-4 h-4 text-white ml-0.5" fill="white" />}
          </div>
        </div>
        {/* Status badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1">
          {beat.featured && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold text-white" style={{ background: "#f59e0b" }}>Destacado</span>}
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${beat.status === "Publicado" ? "bg-emerald-500/80 text-white" : "bg-white/10 text-white/60"}`}>{beat.status}</span>
          {beat.archived && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/10 text-white/40">Archivado</span>}
        </div>
        {/* Menu button */}
        <button onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }} className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
          <MoreVertical className="w-3.5 h-3.5 text-white/70" />
        </button>
        {/* Menu dropdown */}
        {menuOpen && (
          <div className="absolute top-9 right-2 z-10 rounded-lg overflow-hidden py-1" style={{ background: "#1a1a1c", border: "1px solid rgba(255,255,255,0.1)" }} onClick={(e) => e.stopPropagation()}>
            <MenuItem icon={Pencil} label="Editar" onClick={(e) => { e.stopPropagation(); onEdit(); setMenuOpen(false); }} />
            <MenuItem icon={Copy} label="Duplicar" onClick={(e) => { e.stopPropagation(); onDuplicate(); setMenuOpen(false); }} />
            <MenuItem icon={Eye} label={beat.status === "Publicado" ? "Despublicar" : "Publicar"} onClick={(e) => { e.stopPropagation(); onPublish(); setMenuOpen(false); }} />
            <MenuItem icon={Star} label={beat.featured ? "Quitar destaque" : "Destacar"} onClick={(e) => { e.stopPropagation(); onFeature(); setMenuOpen(false); }} />
            <MenuItem icon={Archive} label={beat.archived ? "Desarchivar" : "Archivar"} onClick={(e) => { e.stopPropagation(); onArchive(); setMenuOpen(false); }} />
            {beat.free_mp3_url && <MenuItem icon={Download} label="Descargar MP3" onClick={(e) => { e.stopPropagation(); onDownload(); setMenuOpen(false); }} />}
            <div className="h-px bg-white/5 my-1" />
            <MenuItem icon={Trash2} label="Eliminar" onClick={(e) => { e.stopPropagation(); if (confirm("¿Eliminar este beat?")) onDelete(); setMenuOpen(false); }} danger />
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-xs font-bold text-white truncate">{beat.title}</h3>
        <p className="text-[10px] text-white/40 truncate">{beat.producer}</p>
        <div className="flex items-center gap-1 mt-1.5">
          {beat.bpm != null && <span className="text-[9px] text-white/40">{beat.bpm} BPM</span>}
          {beat.key && <span className="text-[9px] text-white/40">· {beat.key}</span>}
        </div>
      </div>
    </div>
  );
}

function BeatAdminRow({ beat, isPlaying, onPlay, onEdit, onDelete, onDuplicate, onArchive, onPublish, onFeature, onDownload, menuOpen, setMenuOpen }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "#141416", border: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0" style={{ background: "#1a1a1c" }} onClick={onPlay}>
        {beat.cover_url && !imgError ? (
          <img src={beat.cover_url} alt="" className="w-full h-full object-cover cursor-pointer" onError={() => setImgError(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center cursor-pointer"><Music2 className="w-4 h-4 text-white/15" /></div>
        )}
      </div>
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onPlay}>
        <h3 className="text-sm font-bold text-white truncate">{beat.title}</h3>
        <p className="text-xs text-white/40 truncate">{beat.producer}</p>
      </div>
      <div className="hidden sm:flex items-center gap-3 text-xs text-white/40">
        {beat.bpm != null && <span>{beat.bpm} BPM</span>}
        {beat.key && <span>{beat.key}</span>}
        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${beat.status === "Publicado" ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-white/40"}`}>{beat.status}</span>
        {beat.featured && <Star className="w-3 h-3 text-amber-400" fill="currentColor" />}
      </div>
      <button onClick={onPlay} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
        {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white/60" />}
      </button>
      <div className="relative">
        <button onClick={() => setMenuOpen(!menuOpen)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
          <MoreVertical className="w-4 h-4 text-white/50" />
        </button>
        {menuOpen && (
          <div className="absolute top-9 right-0 z-10 rounded-lg overflow-hidden py-1" style={{ background: "#1a1a1c", border: "1px solid rgba(255,255,255,0.1)" }}>
            <MenuItem icon={Pencil} label="Editar" onClick={() => { onEdit(); setMenuOpen(false); }} />
            <MenuItem icon={Copy} label="Duplicar" onClick={() => { onDuplicate(); setMenuOpen(false); }} />
            <MenuItem icon={Eye} label={beat.status === "Publicado" ? "Despublicar" : "Publicar"} onClick={() => { onPublish(); setMenuOpen(false); }} />
            <MenuItem icon={Star} label={beat.featured ? "Quitar destaque" : "Destacar"} onClick={() => { onFeature(); setMenuOpen(false); }} />
            <MenuItem icon={Archive} label={beat.archived ? "Desarchivar" : "Archivar"} onClick={() => { onArchive(); setMenuOpen(false); }} />
            {beat.free_mp3_url && <MenuItem icon={Download} label="Descargar MP3" onClick={() => { onDownload(); setMenuOpen(false); }} />}
            <div className="h-px bg-white/5 my-1" />
            <MenuItem icon={Trash2} label="Eliminar" onClick={() => { if (confirm("¿Eliminar este beat?")) onDelete(); setMenuOpen(false); }} danger />
          </div>
        )}
      </div>
    </div>
  );
}

function MenuItem({ icon: Icon, label, onClick, danger }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium hover:bg-white/10 transition-colors w-full text-left ${danger ? "text-red-400" : "text-white/70"}`}>
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </button>
  );
}