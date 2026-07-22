import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import DashboardNav from "@/components/dashboard/DashboardNav";
import {
  ArrowLeft, Plus, Music2,
  Play, Pause, X, Loader2
} from "lucide-react";
import ProjectAssetPicker from "@/components/project/ProjectAssetPicker";

const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const TYPE_LABELS = {
  Single: "Single", EP: "EP", Album: "Álbum",
  Film: "Film", MiniFilm: "Mini Film", Serie: "Serie",
  Videoclip: "Videoclip", Visualizer: "Visualizer",
  ContentPack: "Content Pack", MixMaster: "Mix & Master",
};

// ── Mini audio player row ────────────────────────────────────────────────────
function TrackRow({ track, index, playing, onPlay, onRemove }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [playing]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
      style={{ background: playing ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      {track.audio_file_url && (
        <audio ref={audioRef} src={track.audio_file_url} preload="metadata" onEnded={() => onPlay(null)} />
      )}

      {/* Cover / play */}
      <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
        style={{ background: "rgba(255,255,255,0.06)" }}>
        {track.cover_url
          ? <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
          : <Music2 className="w-4 h-4 text-white/20" />}
        {track.audio_file_url && (
          <button
            onClick={() => onPlay(playing ? null : track.id)}
            className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {playing
              ? <Pause className="w-3.5 h-3.5 text-white" fill="white" />
              : <Play className="w-3.5 h-3.5 text-white ml-0.5" fill="white" />}
          </button>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate font-semibold" style={{ fontFamily: FONT, letterSpacing: "-0.01em" }}>
          {track.title}
        </p>
        <div className="flex items-center gap-2">
          {track.duration && (
            <p className="text-[10px] text-white/30">
              {Math.floor(track.duration / 60)}:{String(Math.floor(track.duration % 60)).padStart(2, "0")}
            </p>
          )}
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${track.is_public ? "bg-emerald-500/15 text-emerald-400" : "bg-white/5 text-white/30"}`}>
            {track.is_public ? "Público" : "Privado"}
          </span>
        </div>
      </div>

      <button
        onClick={() => onRemove(track.id)}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-all"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProjectDetail() {
  const [playingId, setPlayingId] = useState(null);
  const [picker, setPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get("id");
  const queryClient = useQueryClient();

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
    queryKey: ["user-tracks", selfArtist?.id],
    queryFn: () => selfArtist?.id
      ? base44.entities.Track.filter({ artist_id: selfArtist.id })
      : base44.entities.Track.list("-created_date", 200),
    enabled: !!currentUser,
  });

  // Asociar soundtracks seleccionados (diff frente a los actuales)
  const handlePickerConfirm = async (selectedIds) => {
    setSaving(true);
    try {
      const currentIds = projectTracks.map(t => t.id);
      const toAdd = selectedIds.filter(id => !currentIds.includes(id));
      const toRemove = currentIds.filter(id => !selectedIds.includes(id));
      // Asociar nuevos
      for (const id of toAdd) {
        await base44.entities.Track.update(id, { project_id: projectId });
      }
      // Desasociar los que ya no están
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

  const getProjectYear = (project) => project?.start_date
    ? new Date(project.start_date).getFullYear()
    : new Date(project?.created_date || Date.now()).getFullYear();

  if (!project) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <DashboardNav />

      <main className="pt-14">
        {/* ── HERO ── */}
        <div className="relative overflow-hidden" style={{ minHeight: 280 }}>
          {project.cover_url && (
            <div className="absolute inset-0">
              <img src={project.cover_url} alt="" className="w-full h-full object-cover scale-110 blur-2xl opacity-25" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(10,10,11,0.3), #0a0a0b)" }} />
            </div>
          )}
          {!project.cover_url && (
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 100%)" }} />
          )}

          <div className="relative z-10 px-5 sm:px-8 lg:px-12 pt-8 pb-10 max-w-5xl mx-auto">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 mb-6 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Volver
            </button>

            <div className="flex items-end gap-5 sm:gap-8">
              {/* Cover */}
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden flex-shrink-0 shadow-2xl"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                {project.cover_url
                  ? <img src={project.cover_url} alt={project.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><Music2 className="w-10 h-10 text-white/15" /></div>}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 pb-1">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2">
                  {TYPE_LABELS[project.type] || project.type}
                </p>
                <h1
                  className="text-3xl sm:text-5xl font-black text-white leading-[0.95] mb-3 truncate"
                  style={{ fontFamily: FONT, letterSpacing: "-0.04em" }}
                >
                  {project.title}
                </h1>
                <div className="flex items-center gap-3 flex-wrap">
                  {project.year && (
                    <span className="text-sm text-white/40" style={{ fontFamily: FONT }}>{project.year}</span>
                  )}
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span className="text-sm text-white/30">{projectTracks.length} soundtracks</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SOUNDTRACKS ── */}
        <div className="px-5 sm:px-8 lg:px-12 max-w-5xl mx-auto pb-16">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold text-white/25 uppercase tracking-[0.18em]">Soundtracks del proyecto</p>
            <button
              onClick={() => setPicker(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white/50 hover:text-white transition-all"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <Plus className="w-3 h-3" /> Añadir soundtrack
            </button>
          </div>

          {loadingTracks ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-5 h-5 text-white/20 animate-spin" />
            </div>
          ) : projectTracks.length === 0 ? (
            <button
              onClick={() => setPicker(true)}
              className="w-full py-16 rounded-2xl border border-dashed border-white/[0.07] flex flex-col items-center gap-3 hover:border-white/15 transition-colors"
            >
              <Music2 className="w-8 h-8 text-white/10" />
              <p className="text-xs text-white/20">Añade soundtracks de tu catálogo a este proyecto</p>
            </button>
          ) : (
            <div className="space-y-2">
              {projectTracks.map((t, i) => (
                <TrackRow
                  key={t.id}
                  track={t}
                  index={i}
                  playing={playingId === t.id}
                  onPlay={setPlayingId}
                  onRemove={removeTrack}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Asset Picker — solo soundtracks */}
      <AnimatePresence>
        {picker && (
          <ProjectAssetPicker
            mode="tracks"
            items={allUserTracks}
            selectedIds={projectTracks.map(t => t.id)}
            onConfirm={handlePickerConfirm}
            onClose={() => setPicker(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}