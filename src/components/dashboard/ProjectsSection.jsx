import React, { useState } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, FolderOpen, Music2, Pencil, Globe, Lock, X, Film,
  Check, Loader2, Image as ImageIcon, ChevronDown, Disc
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import useEmblaCarousel from "embla-carousel-react";

// Film-derived project types (excluding singles)
const FILM_PROJECT_TYPES = ["Film","MiniFilm","Serie","Videoclip","Visualizer","Album"];
const TYPE_LABELS = {
  Film: "Film", MiniFilm: "Mini Film", Serie: "Serie",
  Videoclip: "Videoclip", Visualizer: "Visualizer", Album: "Álbum",
};

function getYoutubeThumbnail(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null;
}

const ic = "w-full px-3 py-2.5 bg-white/5 border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:border-white/25 placeholder-white/20 transition-colors";
const currentYear = new Date().getFullYear();

// ── Create/Edit Project Modal ─────────────────────────────────────────────
function ProjectModal({ onClose, jlyArtistId, project = null, existingTracks = [] }) {
  const isEdit = !!project;
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState(() => ({
    title: project?.title || "",
    type: project?.type || "Album",
    year: project?.year || currentYear,
    cover_url: project?.cover_url || "",
    description: project?.description || "",
    track_ids: project?.track_ids || [],
  }));

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(f => ({ ...f, cover_url: file_url }));
    } finally { setUploading(false); }
  };

  const toggleTrack = (tid) => {
    setForm(f => ({
      ...f,
      track_ids: f.track_ids.includes(tid)
        ? f.track_ids.filter(x => x !== tid)
        : [...f.track_ids, tid],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        type: form.type,
        cover_url: form.cover_url || undefined,
        description: form.description || undefined,
        artist_id: jlyArtistId || undefined,
        status: "Draft",
      };
      if (isEdit) {
        await base44.entities.Project.update(project.id, payload);
        // Update linked tracks
        for (const t of existingTracks) {
          const shouldLink = form.track_ids.includes(t.id);
          const isLinked = t.project_id === project.id;
          if (shouldLink && !isLinked) await base44.entities.Track.update(t.id, { project_id: project.id });
          if (!shouldLink && isLinked) await base44.entities.Track.update(t.id, { project_id: null });
        }
      } else {
        const created = await base44.entities.Project.create(payload);
        for (const tid of form.track_ids) {
          await base44.entities.Track.update(tid, { project_id: created.id });
        }
      }
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["all-tracks"] });
      onClose();
    } finally { setLoading(false); }
  };

  return ReactDOM.createPortal(
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[600] bg-black/90 backdrop-blur-xl flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}>
      <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="bg-[#111] border border-white/[0.08] rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg overflow-hidden max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] flex-shrink-0">
          <p className="text-sm font-bold text-white">{isEdit ? "Editar proyecto" : "Nuevo álbum / proyecto"}</p>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Cover */}
          <div>
            <label className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-2 block">Portada</label>
            {form.cover_url ? (
              <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: "1/1", maxHeight: 140 }}>
                <img src={form.cover_url} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setForm(f => ({ ...f, cover_url: "" }))}
                  className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-lg"><X className="w-3 h-3 text-white" /></button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 py-5 rounded-xl border border-dashed border-white/10 cursor-pointer hover:border-white/25 transition-colors">
                <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
                {uploading ? <Loader2 className="w-5 h-5 text-white/30 animate-spin" /> : <ImageIcon className="w-5 h-5 text-white/20" />}
                <span className="text-xs text-white/25">{uploading ? "Subiendo..." : "Añadir portada"}</span>
              </label>
            )}
          </div>

          {/* Título */}
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className={ic} placeholder="Título del proyecto *" required />

          {/* Tipo */}
          <div>
            <label className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-2 block">Tipo</label>
            <div className="flex flex-wrap gap-2">
              {FILM_PROJECT_TYPES.map(t => (
                <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={{
                    background: form.type === t ? "white" : "rgba(255,255,255,0.06)",
                    color: form.type === t ? "black" : "rgba(255,255,255,0.4)",
                    border: form.type === t ? "1px solid white" : "1px solid rgba(255,255,255,0.08)",
                  }}>
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Soundtracks */}
          {existingTracks.length > 0 && (
            <div>
              <label className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-2 block">
                Soundtracks vinculados
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {existingTracks.map(t => (
                  <button key={t.id} type="button" onClick={() => toggleTrack(t.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${form.track_ids.includes(t.id) ? "bg-white/10 border border-white/15" : "bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06]"}`}>
                    <div className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                      {t.cover_url ? <img src={t.cover_url} alt="" className="w-full h-full object-cover" /> : <Music2 className="w-3.5 h-3.5 text-white/20 m-auto" />}
                    </div>
                    <span className="text-xs text-white flex-1 text-left truncate">{t.title}</span>
                    {form.track_ids.includes(t.id) && <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button type="submit" disabled={loading || !form.title.trim()}
            className="w-full py-3 rounded-xl bg-white text-black text-sm font-bold hover:bg-white/90 disabled:opacity-30 flex items-center justify-center gap-2 transition-colors">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> {isEdit ? "Guardar" : "Crear proyecto"}</>}
          </button>
        </form>
      </motion.div>
    </motion.div>,
    document.body
  );
}

// ── ProjectsSection ────────────────────────────────────────────────────────
export default function ProjectsSection({ jlyArtistId }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const qc = useQueryClient();
  const [emblaRef] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps" });

  const { data: allProjects = [], isLoading } = useQuery({
    queryKey: ["projects", jlyArtistId || "all"],
    queryFn: () => jlyArtistId
      ? base44.entities.Project.filter({ artist_id: jlyArtistId })
      : base44.entities.Project.list("-created_date"),
    initialData: [],
    staleTime: 0,
  });

  const { data: allTracks = [] } = useQuery({
    queryKey: ["all-tracks", jlyArtistId || "all"],
    queryFn: () => jlyArtistId
      ? base44.entities.Track.filter({ artist_id: jlyArtistId })
      : base44.entities.Track.list("-created_date"),
    initialData: [],
    staleTime: 0,
  });

  const { data: allFilms = [] } = useQuery({
    queryKey: ["artist-films", jlyArtistId],
    queryFn: async () => {
      if (!jlyArtistId) return [];
      const items = await base44.entities.ExplorarItem.filter({ artist_id: jlyArtistId });
      return items.filter(i => ["film","minifilm","series","videoclip","visualizer"].includes(i.content_type));
    },
    enabled: !!jlyArtistId,
    staleTime: 0,
  });

  // Only film-type projects (exclude Singles/EP)
  const FILM_TYPES = ["Film","MiniFilm","Serie","Videoclip","Visualizer","Album","ContentPack"];
  const projects = allProjects.filter(p => FILM_TYPES.includes(p.type));

  const artistTracks = allTracks;

  const getProjectTracks = (projectId) => allTracks.filter(t => t.project_id === projectId);
  const getProjectFilm = (project) => allFilms.find(f => f.title === project.title);
  const getProjectYear = (project) => project.start_date
    ? new Date(project.start_date).getFullYear()
    : new Date(project.created_date).getFullYear();

  const handleTogglePublic = async (e, project) => {
    e.preventDefault(); e.stopPropagation();
    await base44.entities.Project.update(project.id, { is_public: !project.is_public });
    qc.invalidateQueries({ queryKey: ["projects"] });
  };

  if (isLoading) return (
    <div className="bg-[#141414] rounded-2xl border border-white/5 p-8">
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-white/5 rounded w-1/4" />
        <div className="h-32 bg-white/5 rounded" />
      </div>
    </div>
  );

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="sm:bg-gradient-to-br sm:from-[#141414] sm:to-black sm:rounded-2xl sm:border sm:border-white/5 sm:overflow-hidden">
        {/* Header */}
        <div className="px-0 sm:px-4 sm:py-3 sm:border-b sm:border-white/5 flex items-center justify-between mb-3 sm:mb-0">
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex w-8 h-8 rounded-lg bg-white/5 items-center justify-center">
              <FolderOpen className="w-4 h-4 text-white/40" />
            </div>
            <h3 className="text-base font-bold text-white">Proyectos</h3>
            {projects.length > 0 && <span className="text-[10px] text-white/25 px-1.5 py-0.5 bg-white/5 rounded-full">{projects.length}</span>}
          </div>
          <button onClick={() => { setEditingProject(null); setShowCreateModal(true); }}
            className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all">
            <Plus className="w-3 h-3" />
            <span className="hidden lg:inline">Nuevo álbum</span>
          </button>
        </div>

        <div className="sm:p-4 lg:p-5">
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 mb-2 text-sm">Sin proyectos aún</p>
              <p className="text-white/20 text-xs mb-4">Los proyectos se crean automáticamente al subir un film, o crea un álbum manualmente.</p>
              <button onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors">
                Crear álbum
              </button>
            </div>
          ) : (
            <>
              {/* MOBILE */}
              <div className="sm:hidden -mx-4 px-4 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                <div className="flex gap-2.5" style={{ width: "max-content" }}>
                  {projects.map(project => {
                    const projectTracks = getProjectTracks(project.id);
                    const film = getProjectFilm(project);
                    const cover = project.cover_url || film?.thumbnail_url || getYoutubeThumbnail(film?.youtube_url) || projectTracks[0]?.cover_url;
                    return (
                      <div key={project.id} className="flex-shrink-0 w-[120px] relative group/proj">
                        <Link to={createPageUrl(`ProjectDetail?id=${project.id}`)}>
                          <div className="relative aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-white/10 to-white/5 mb-1.5">
                            {cover ? <img src={cover} alt={project.title} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center"><Music2 className="w-7 h-7 text-white/20" /></div>}

                            <div className="absolute bottom-1 left-1 flex items-center gap-1">
                              <button onClick={e => handleTogglePublic(e, project)}
                                className={`w-5 h-5 rounded-md flex items-center justify-center ${project.is_public ? "bg-emerald-500/30" : "bg-black/60"}`}>
                                {project.is_public ? <Globe className="w-2.5 h-2.5 text-emerald-400" /> : <Lock className="w-2.5 h-2.5 text-white/40" />}
                              </button>
                              <button onClick={e => { e.preventDefault(); e.stopPropagation(); setEditingProject(project); setShowCreateModal(true); }}
                                className="w-5 h-5 rounded-md bg-black/60 flex items-center justify-center">
                                <Pencil className="w-2.5 h-2.5 text-white/50" />
                              </button>
                            </div>
                          </div>
                          <p className="text-[11px] font-semibold text-white truncate leading-tight">{project.title}</p>
                          <p className="text-[10px] text-white/35 truncate">{getProjectYear(project)}{project.type ? ` · ${TYPE_LABELS[project.type] || project.type}` : ""}</p>
                        </Link>
                      </div>
                    );
                  })}
                  <div className="flex-shrink-0 w-1" />
                </div>
              </div>

              {/* DESKTOP */}
              <div className="hidden sm:block overflow-hidden" ref={emblaRef}>
                <div className="flex gap-4">
                  {projects.map((project, i) => {
                    const projectTracks = getProjectTracks(project.id);
                    const film = getProjectFilm(project);
                    const cover = project.cover_url || film?.thumbnail_url || getYoutubeThumbnail(film?.youtube_url) || projectTracks[0]?.cover_url;
                    return (
                      <div key={project.id} className="flex-[0_0_160px]">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                          className="group/proj bg-white/5 rounded-xl p-2 border border-white/5 hover:border-white/15 transition-all h-full">
                          <div className="relative aspect-square rounded-lg bg-gradient-to-br from-white/10 to-white/5 mb-2 overflow-hidden cursor-pointer">
                            <Link to={createPageUrl(`ProjectDetail?id=${project.id}`)}>
                              {cover ? <img src={cover} alt={project.title} className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center"><Music2 className="w-8 h-8 text-white/20" /></div>}
                            </Link>

                            <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 opacity-0 group-hover/proj:opacity-100 transition-opacity">
                              <button onClick={e => handleTogglePublic(e, project)}
                                className={`w-6 h-6 rounded-md flex items-center justify-center ${project.is_public ? "bg-emerald-500/30 hover:bg-emerald-500/40" : "bg-black/70 hover:bg-black/90"}`}>
                                {project.is_public ? <Globe className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3 text-white/40" />}
                              </button>
                              <button onClick={e => { e.preventDefault(); e.stopPropagation(); setEditingProject(project); setShowCreateModal(true); }}
                                className="w-6 h-6 rounded-md bg-black/70 hover:bg-black/90 flex items-center justify-center">
                                <Pencil className="w-3 h-3 text-white/50" />
                              </button>
                            </div>
                          </div>
                          <Link to={createPageUrl(`ProjectDetail?id=${project.id}`)}>
                            <div className="space-y-0.5 px-0.5">
                              <h4 className="font-semibold text-xs text-white group-hover/proj:text-white/80 transition-colors truncate">{project.title}</h4>
                              <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                <span className="font-medium text-white">{getProjectYear(project)}</span>
                                {project.type && <><span>·</span><span className="text-white/40">{TYPE_LABELS[project.type] || project.type}</span></>}
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {(showCreateModal || editingProject !== null) && (
          <ProjectModal
            onClose={() => { setShowCreateModal(false); setEditingProject(null); }}
            jlyArtistId={jlyArtistId}
            project={editingProject}
            existingTracks={artistTracks}
          />
        )}
      </AnimatePresence>
    </>
  );
}