import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { base44 } from "@/api/base44Client";
import DashboardNav from "@/components/dashboard/DashboardNav";
import ProjectAssetPicker from "@/components/project/ProjectAssetPicker";
import {
  ArrowLeft, Plus, Music2,
  Play, Pause, SkipBack, SkipForward, X, Loader2, GripVertical, Clock, ListMusic,
} from "lucide-react";

const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const ACCENT = "#ff5833";

const TYPE_LABELS = {
  Single: "Single", EP: "EP", Album: "Álbum",
  Film: "Film", MiniFilm: "Mini Film", Serie: "Serie",
  Videoclip: "Videoclip", Visualizer: "Visualizer",
  ContentPack: "Content Pack", MixMaster: "Mix & Master",
};

const fmtTime = (s) => {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

// ── Equalizer animation for the currently playing row ────────────────────────
function Equalizer({ color = ACCENT }) {
  return (
    <div className="flex items-end gap-[2px] h-3.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-[2.5px] rounded-full"
          style={{
            background: color,
            animation: `eqbar 0.9s ${i * 0.18}s ease-in-out infinite alternate`,
            height: "100%",
            transformOrigin: "bottom",
          }}
        />
      ))}
      <style>{`@keyframes eqbar { 0% { transform: scaleY(0.25); } 100% { transform: scaleY(1); } }`}</style>
    </div>
  );
}

export default function ProjectDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get("id");
  const queryClient = useQueryClient();

  const [order, setOrder] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [savingOrder, setSavingOrder] = useState(false);
  const [picker, setPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const audioRef = useRef(null);

  // Current user
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  // Project
  const { data: project } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const r = await base44.entities.Project.filter({ id: projectId });
      return r[0];
    },
    enabled: !!projectId,
  });

  // Artist linked to user
  const { data: selfArtist } = useQuery({
    queryKey: ["self-artist", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      const r = await base44.entities.Artist.filter({ user_id: currentUser.id });
      return r[0] || null;
    },
    enabled: !!currentUser?.id,
  });

  // Soundtracks vinculados a este proyecto (fuente de verdad: Track.project_id)
  const { data: projectTracks = [], isLoading: loadingTracks } = useQuery({
    queryKey: ["project-tracks", projectId],
    queryFn: () => base44.entities.Track.filter({ project_id: projectId }),
    enabled: !!projectId,
  });

  // Todos los soundtracks del artista/usuario (para el picker)
  const { data: allUserTracks = [] } = useQuery({
    queryKey: ["user-tracks", selfArtist?.id, currentUser?.email],
    queryFn: async () => {
      if (!currentUser) return [];
      const byArtist = selfArtist?.id
        ? await base44.entities.Track.filter({ artist_id: selfArtist.id })
        : [];
      const all = await base44.entities.Track.list("-created_date", 200);
      const byCreator = all.filter((t) => t.created_by === currentUser.email);
      const seen = new Set(byArtist.map((t) => t.id));
      return [...byArtist, ...byCreator.filter((t) => !seen.has(t.id))];
    },
    enabled: !!currentUser,
  });

  // Sincroniza el orden local cuando llegan los tracks (ordenados por track_number).
  useEffect(() => {
    if (!projectTracks.length) { setOrder([]); return; }
    const sorted = [...projectTracks].sort(
      (a, b) => (a.track_number ?? 9999) - (b.track_number ?? 9999)
    );
    setOrder(sorted);
  }, [projectTracks]);

  const playableCount = useMemo(
    () => order.filter((t) => t.audio_file_url).length,
    [order]
  );

  const totalDuration = useMemo(
    () => order.reduce((acc, t) => acc + (t.duration || 0), 0),
    [order]
  );

  const findNextPlayable = useCallback(
    (from) => {
      for (let i = from; i < order.length; i++) {
        if (order[i]?.audio_file_url) return i;
      }
      return -1;
    },
    [order]
  );
  const findPrevPlayable = useCallback(
    (from) => {
      for (let i = from; i >= 0; i--) {
        if (order[i]?.audio_file_url) return i;
      }
      return -1;
    },
    [order]
  );

  // Carga / reproduce la pista actual cuando cambia el índice o el estado.
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const track = order[currentIndex];
    if (!track?.audio_file_url) { el.pause(); return; }
    if (el.getAttribute("src") !== track.audio_file_url) {
      el.src = track.audio_file_url;
      el.load();
    }
    if (isPlaying) {
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [currentIndex, isPlaying, order]);

  const togglePlay = () => {
    if (currentIndex === -1 || !order[currentIndex]?.audio_file_url) {
      const first = findNextPlayable(0);
      if (first !== -1) { setCurrentIndex(first); setIsPlaying(true); }
      return;
    }
    setIsPlaying((p) => !p);
  };

  const playTrackAt = (index) => {
    if (!order[index]?.audio_file_url) return;
    if (index === currentIndex) { setIsPlaying((p) => !p); return; }
    setCurrentIndex(index);
    setIsPlaying(true);
  };

  const handleNext = () => {
    const next = findNextPlayable(currentIndex + 1);
    if (next !== -1) { setCurrentIndex(next); setIsPlaying(true); }
    else setIsPlaying(false);
  };

  const handlePrev = () => {
    const el = audioRef.current;
    if (el && el.currentTime > 3) { el.currentTime = 0; return; }
    const prev = findPrevPlayable(currentIndex - 1);
    if (prev !== -1) { setCurrentIndex(prev); setIsPlaying(true); }
  };

  const handleEnded = () => {
    const next = findNextPlayable(currentIndex + 1);
    if (next !== -1) { setCurrentIndex(next); setIsPlaying(true); }
    else { setIsPlaying(false); setCurrentTime(0); }
  };

  // ── Reordenamiento drag & drop ──────────────────────────────────────────────
  const onDragEnd = async (result) => {
    if (!result.destination || result.source.index === result.destination.index) return;
    const from = result.source.index;
    const to = result.destination.index;
    const newOrder = Array.from(order);
    const [moved] = newOrder.splice(from, 1);
    newOrder.splice(to, 0, moved);
    setOrder(newOrder);
    // Ajusta el índice de reproducción si la pista movida era la actual.
    if (currentIndex === from) setCurrentIndex(to);
    else if (currentIndex > from && currentIndex <= to) setCurrentIndex(currentIndex - 1);
    else if (currentIndex < from && currentIndex >= to) setCurrentIndex(currentIndex + 1);

    setSavingOrder(true);
    try {
      await base44.entities.Track.bulkUpdate(
        newOrder.map((t, i) => ({ id: t.id, track_number: i }))
      );
      queryClient.invalidateQueries({ queryKey: ["project-tracks", projectId] });
    } catch (e) {
      console.error("[ProjectDetail] order persist failed", e);
    } finally {
      setSavingOrder(false);
    }
  };

  // ── Picker (añadir / quitar soundtracks) ────────────────────────────────────
  const handlePickerConfirm = async (selectedIds) => {
    setSaving(true);
    try {
      const currentIds = order.map((t) => t.id);
      const toAdd = selectedIds.filter((id) => !currentIds.includes(id));
      const toRemove = currentIds.filter((id) => !selectedIds.includes(id));
      for (const id of toAdd) {
        await base44.entities.Track.update(id, { project_id: projectId });
      }
      for (const id of toRemove) {
        await base44.entities.Track.update(id, { project_id: null });
      }
      queryClient.invalidateQueries({ queryKey: ["project-tracks", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["all-tracks"] });
      queryClient.invalidateQueries({ queryKey: ["tracks"] });
    } finally {
      setSaving(false);
      setPicker(false);
    }
  };

  const removeTrack = async (trackId) => {
    await base44.entities.Track.update(trackId, { project_id: null });
    queryClient.invalidateQueries({ queryKey: ["project-tracks", projectId] });
    queryClient.invalidateQueries({ queryKey: ["projects"] });
    queryClient.invalidateQueries({ queryKey: ["all-tracks"] });
    queryClient.invalidateQueries({ queryKey: ["tracks"] });
  };

  const getProjectYear = (p) =>
    p?.start_date ? new Date(p.start_date).getFullYear() : new Date(p?.created_date || Date.now()).getFullYear();

  const currentTrack = order[currentIndex];
  const seekMax = duration || 0;

  const onSeek = (clientX, barEl) => {
    const el = audioRef.current;
    if (!el || !seekMax || !barEl) return;
    const rect = barEl.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    el.currentTime = (x / rect.width) * seekMax;
    setCurrentTime(el.currentTime);
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white" style={{ fontFamily: FONT }}>
      <DashboardNav />

      <main className="pt-14 pb-40">
        {/* ── HERO ── */}
        <div className="relative overflow-hidden" style={{ minHeight: 320 }}>
          {project.cover_url && (
            <div className="absolute inset-0">
              <img src={project.cover_url} alt="" className="w-full h-full object-cover scale-110 blur-2xl opacity-30" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(10,10,11,0.2), #0a0a0b)" }} />
            </div>
          )}
          {!project.cover_url && (
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(255,88,51,0.06) 0%, transparent 100%)" }} />
          )}

          <div className="relative z-10 px-5 sm:px-8 lg:px-12 pt-8 pb-10 max-w-5xl mx-auto">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 mb-6 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Volver
            </button>

            <div className="flex items-end gap-5 sm:gap-8">
              <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-2xl overflow-hidden flex-shrink-0 shadow-2xl"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                {project.cover_url
                  ? <img src={project.cover_url} alt={project.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><Music2 className="w-12 h-12 text-white/15" /></div>}
              </div>

              <div className="flex-1 min-w-0 pb-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-2" style={{ color: ACCENT }}>
                  {TYPE_LABELS[project.type] || project.type}
                </p>
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-[0.95] mb-3 truncate"
                  style={{ letterSpacing: "-0.04em" }}>
                  {project.title}
                </h1>
                <div className="flex items-center gap-3 flex-wrap text-sm text-white/40">
                  {project.year && <span>{project.year}</span>}
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span>{order.length} soundtracks</span>
                  {totalDuration > 0 && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{fmtTime(totalDuration)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Controles del álbum */}
            <div className="flex items-center gap-3 mt-7">
              <button
                onClick={togglePlay}
                disabled={playableCount === 0}
                className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: ACCENT, color: "#0a0a0b", boxShadow: `0 10px 30px ${ACCENT}40` }}
              >
                {isPlaying && currentIndex !== -1
                  ? <Pause className="w-4 h-4" fill="#0a0a0b" />
                  : <Play className="w-4 h-4 ml-0.5" fill="#0a0a0b" />}
                {isPlaying && currentIndex !== -1 ? "Pausar álbum" : "Reproducir álbum"}
              </button>
              <button
                onClick={() => setPicker(true)}
                className="flex items-center gap-1.5 px-4 py-3 rounded-full text-xs font-semibold text-white/60 hover:text-white transition-all"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <Plus className="w-3.5 h-3.5" /> Añadir
              </button>
              {savingOrder && (
                <span className="flex items-center gap-1.5 text-[11px] text-white/30">
                  <Loader2 className="w-3 h-3 animate-spin" /> Guardando orden…
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── TRACKLIST ── */}
        <div className="px-3 sm:px-8 lg:px-12 max-w-5xl mx-auto">
          {/* Header de columnas (desktop) */}
          <div className="hidden sm:grid grid-cols-[28px_1fr_auto_28px] gap-3 px-3 pb-2 mb-1 border-b border-white/[0.06]">
            <span className="text-[10px] font-bold text-white/25 uppercase tracking-widest text-center">#</span>
            <span className="text-[10px] font-bold text-white/25 uppercase tracking-widest">Título</span>
            <span className="text-[10px] font-bold text-white/25 uppercase tracking-widest flex items-center gap-1"><Clock className="w-3 h-3" /></span>
            <span />
          </div>

          {loadingTracks ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-5 h-5 text-white/20 animate-spin" />
            </div>
          ) : order.length === 0 ? (
            <button
              onClick={() => setPicker(true)}
              className="w-full py-16 rounded-2xl border border-dashed border-white/[0.07] flex flex-col items-center gap-3 hover:border-white/15 transition-colors"
            >
              <Music2 className="w-8 h-8 text-white/10" />
              <p className="text-xs text-white/20">Añade soundtracks de tu catálogo a este proyecto</p>
            </button>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="album-tracks">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-1">
                    {order.map((track, i) => {
                      const playing = currentIndex === i && isPlaying;
                      const isCurrent = currentIndex === i;
                      const hasAudio = !!track.audio_file_url;
                      return (
                        <Draggable key={track.id} draggableId={track.id} index={i}>
                          {(p) => (
                            <div
                              ref={p.innerRef}
                              {...p.draggableProps}
                              className="group flex items-center gap-3 px-2 sm:px-3 py-2.5 rounded-xl transition-colors"
                              style={{
                                background: isCurrent ? "rgba(255,88,51,0.08)" : "transparent",
                                border: "1px solid transparent",
                                ...p.draggableProps.style,
                              }}
                            >
                              {/* # / play / equalizer */}
                              <div className="w-7 flex-shrink-0 flex items-center justify-center">
                                {isCurrent && isPlaying ? (
                                  <Equalizer />
                                ) : (
                                  <button
                                    onClick={() => playTrackAt(i)}
                                    className="relative w-7 h-7 flex items-center justify-center"
                                    title={hasAudio ? "Reproducir" : "Sin audio"}
                                  >
                                    <span
                                      className="text-sm tabular-nums transition-colors"
                      style={{ color: isCurrent ? ACCENT : "rgba(255,255,255,0.35)" }}
                    >
                      {i + 1}
                    </span>
                    {hasAudio && (
                      <span
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: "rgba(0,0,0,0.4)", borderRadius: 8 }}
                      >
                        <Play className="w-3.5 h-3.5 text-white ml-0.5" fill="white" />
                      </span>
                    )}
                  </button>
                )}
              </div>

              {/* Cover + título + metadata */}
              <button
                onClick={() => playTrackAt(i)}
                className="flex items-center gap-3 flex-1 min-w-0 text-left"
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.06)" }}>
                  {track.cover_url
                    ? <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
                    : <Music2 className="w-4 h-4 text-white/20" />}
                </div>
                <div className="min-w-0">
                  <p
                    className="text-sm font-semibold truncate"
                    style={{ color: isCurrent ? ACCENT : "#fff", letterSpacing: "-0.01em" }}
                  >
                    {track.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {track.display_artist && (
                      <span className="text-[11px] text-white/40 truncate">{track.display_artist}</span>
                    )}
                    <span
                      className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                      style={
                        track.is_public
                          ? { background: "rgba(16,185,129,0.15)", color: "#34d399" }
                          : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)" }
                      }
                    >
                      {track.is_public ? "Público" : "Privado"}
                    </span>
                    {!hasAudio && (
                      <span className="text-[9px] text-white/20">Sin audio</span>
                    )}
                  </div>
                </div>
              </button>

              {/* Duración */}
              <div className="hidden sm:block text-[11px] text-white/30 tabular-nums w-12 text-right">
                {track.duration ? fmtTime(track.duration) : "—"}
              </div>

              {/* Acciones: quitar + drag handle */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => removeTrack(track.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-all"
                  title="Quitar del proyecto"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <button
                  {...p.dragHandleProps}
                  className="p-1.5 rounded-lg text-white/20 hover:text-white/60 hover:bg-white/5 transition-colors cursor-grab active:cursor-grabbing"
                  title="Arrastra para reordenar"
                >
                  <GripVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}

          {order.length > 0 && (
            <p className="flex items-center gap-1.5 mt-6 text-[11px] text-white/25">
              <ListMusic className="w-3 h-3" /> Arrastra el icono <GripVertical className="w-3 h-3" /> para reordenar las pistas. El orden se guarda automáticamente.
            </p>
          )}
        </div>
      </main>

      {/* ── PLAYER BAR (sticky) ── */}
      {currentTrack && (
        <div
          className="fixed bottom-0 left-0 right-0 z-40"
          style={{
            background: "rgba(15,15,15,0.92)",
            backdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* Progreso superior */}
          <div
            className="h-1 w-full cursor-pointer group"
            onClick={(e) => onSeek(e.clientX, e.currentTarget)}
          >
            <div
              className="h-full transition-all"
              style={{
                width: seekMax ? `${(currentTime / seekMax) * 100}%` : "0%",
                background: ACCENT,
              }}
            />
          </div>

          <div className="px-4 sm:px-6 py-3 max-w-5xl mx-auto flex items-center gap-4">
            {/* Cover + info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.06)" }}>
                {currentTrack.cover_url
                  ? <img src={currentTrack.cover_url} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><Music2 className="w-4 h-4 text-white/20" /></div>}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{currentTrack.title}</p>
                <p className="text-[11px] text-white/40 truncate">
                  {currentTrack.display_artist || "Cabaña Creative"}
                </p>
              </div>
            </div>

            {/* Controles */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={handlePrev}
                className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                title="Anterior"
              >
                <SkipBack className="w-4 h-4" fill="currentColor" />
              </button>
              <button
                onClick={togglePlay}
                className="p-2.5 rounded-full text-[#0a0a0b] transition-transform hover:scale-105 active:scale-95"
                style={{ background: ACCENT }}
                title={isPlaying ? "Pausar" : "Reproducir"}
              >
                {isPlaying
                  ? <Pause className="w-4 h-4" fill="#0a0a0b" />
                  : <Play className="w-4 h-4 ml-0.5" fill="#0a0a0b" />}
              </button>
              <button
                onClick={handleNext}
                className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                title="Siguiente"
              >
                <SkipForward className="w-4 h-4" fill="currentColor" />
              </button>
            </div>

            {/* Tiempos (desktop) */}
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-white/40 tabular-nums w-24 justify-end">
              <span>{fmtTime(currentTime)}</span>
              <span className="text-white/20">/</span>
              <span>{fmtTime(seekMax)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Audio element único del álbum */}
      <audio
        ref={audioRef}
        preload="metadata"
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime || 0)}
        onEnded={handleEnded}
      />

      {/* Asset Picker */}
      <AnimatePresence>
        {picker && (
          <ProjectAssetPicker
            mode="tracks"
            items={allUserTracks}
            selectedIds={order.map((t) => t.id)}
            onConfirm={handlePickerConfirm}
            onClose={() => setPicker(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}