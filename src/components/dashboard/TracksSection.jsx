import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import MobileTrackPoster, { MobileAudioProvider } from "./MobileTrackPoster";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Music2, Upload, Edit, Image as ImageIcon, Check, X, Link } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import NetflixTrackCard from "./NetflixTrackCard";

export default function TracksSection({ jlyArtistId }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTrack, setEditingTrack] = useState(null);

  const queryClient = useQueryClient();

  const { data: tracks = [], isLoading } = useQuery({
    queryKey: ['tracks', jlyArtistId || 'all'],
    queryFn: async () => {
      if (jlyArtistId) {
        // Tracks directos del artista
        const byArtist = await base44.entities.Track.filter({ artist_id: jlyArtistId });
        // También tracks vinculados por proyecto del artista
        const projects = await base44.entities.Project.filter({ artist_id: jlyArtistId });
        const projectIds = new Set(projects.map(p => p.id));
        // Buscar tracks sin artist_id pero con project_id del artista
        if (projectIds.size > 0) {
          const allTracks = await base44.entities.Track.list('-created_date', 200);
          const byProject = allTracks.filter(t => !t.artist_id && projectIds.has(t.project_id));
          const seen = new Set(byArtist.map(t => t.id));
          return [...byArtist, ...byProject.filter(t => !seen.has(t.id))];
        }
        return byArtist;
      }
      return base44.entities.Track.list('-created_date', 50);
    },
    initialData: [],
    staleTime: 0,
  });

  const { data: allProjects = [] } = useQuery({
    queryKey: ['projects', jlyArtistId || 'all'],
    queryFn: () => jlyArtistId
      ? base44.entities.Project.filter({ artist_id: jlyArtistId })
      : base44.entities.Project.list('-created_date'),
    initialData: [],
    staleTime: 0,
  });

  const projects = allProjects;

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Track.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
    },
  });

  const statusColors = {
    idea: "bg-gray-500/10 text-gray-400",
    production: "bg-blue-500/10 text-blue-400",
    mixing: "bg-purple-500/10 text-purple-400",
    mastering: "bg-orange-500/10 text-orange-400",
    completed: "bg-emerald-500/10 text-emerald-400"
  };

  const statusLabels = {
    idea: "Idea",
    production: "Producción",
    mixing: "Mezcla",
    mastering: "Masterización",
    completed: "Completado"
  };

  if (isLoading) {
    return (
      <div className="bg-[#141414] rounded-2xl border border-white/5 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/5 rounded w-1/4" />
          <div className="h-32 bg-white/5 rounded" />
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ overflow: "visible" }}
      >
        {/* Visual wrapper — border/bg only, no overflow clipping */}
        <div className="sm:bg-gradient-to-br sm:from-[#141414] sm:to-black sm:rounded-2xl sm:border sm:border-white/5" style={{ overflow: "visible" }}>

        {/* Header */}
        <div className="px-0 sm:px-4 sm:py-3 sm:border-b sm:border-white/5 flex items-center justify-between mb-3 sm:mb-0"
          style={{ borderRadius: "1rem 1rem 0 0" }}>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex w-8 h-8 rounded-lg bg-white/5 items-center justify-center">
              <Music2 className="w-4 h-4 text-white/40" />
            </div>
            <h3 className="text-base font-bold text-white">Soundtracks</h3>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3 h-3" />
            <span className="hidden lg:inline">Nuevo soundtrack</span>
          </button>
        </div>

        {/* MOBILE: poster-style Netflix carousel edge-to-edge */}
        <div className="sm:hidden -mx-4 px-4">
          {tracks.length === 0 ? (
            <div className="text-center py-8 px-4">
              <Music2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm mb-3">No tienes soundtracks aún</p>
              <button onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors">
                Crear tu primer soundtrack
              </button>
            </div>
          ) : (
            <MobileAudioProvider>
              <div className="overflow-x-auto" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                <div className="flex gap-2.5" style={{ width: "max-content" }}>
                  {tracks.map((track) => (
                    <MobileTrackPoster key={track.id} track={track} onEdit={setEditingTrack} />
                  ))}
                  <div className="flex-shrink-0 w-1" />
                </div>
              </div>
            </MobileAudioProvider>
          )}
        </div>

        {/* DESKTOP: existing Netflix hover cards */}
        <div className="hidden sm:block" style={{ overflowX: "auto", overflowY: "visible", padding: "80px 16px 240px", margin: "-80px 0 -240px", scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {tracks.length === 0 ? (
            <div className="text-center py-8 px-4">
              <Music2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm mb-3">No tienes soundtracks aún</p>
              <button onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors">
                Crear tu primer soundtrack
              </button>
            </div>
          ) : (
            <div className="flex gap-3" style={{ width: "max-content" }}>
              {tracks.map((track, index) => (
                <NetflixTrackCard key={track.id} track={track} index={index} onEdit={setEditingTrack} />
              ))}
            </div>
          )}
        </div>
        </div>{/* end visual wrapper */}
      </motion.div>

      {/* Create/Edit Modal — rendered via portal to avoid clipping */}
      {(showCreateModal || !!editingTrack) && ReactDOM.createPortal(
        <TrackModal
          isOpen={true}
          track={editingTrack}
          projects={projects}
          jlyArtistId={jlyArtistId}
          onClose={() => {
            setShowCreateModal(false);
            setEditingTrack(null);
          }}
        />,
        document.body
      )}
    </>
  );
}

function TrackModal({ isOpen, track, projects, jlyArtistId, onClose }) {
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  const [formData, setFormData] = useState({
    title: "", project_id: "", cover_url: "", audio_file_url: "",
    youtube_music_url: "", composers: [], producers: [],
    genre: "", bpm: null, key: "", status: "demo", notes: "", versions: {}
  });
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [audioMode, setAudioMode] = useState("file");
  const [newComposer, setNewComposer] = useState("");
  const [newProducer, setNewProducer] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (track) {
      setFormData({ ...track });
      setAudioMode(track.youtube_music_url ? "link" : "file");
    } else {
      setFormData({
        title: "", project_id: "", cover_url: "", audio_file_url: "",
        youtube_music_url: "", composers: [], producers: [],
        genre: "", bpm: null, key: "", status: "demo", notes: "", versions: {}
      });
      setAudioMode("file");
    }
  }, [track, isOpen]);

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const clean = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== "" && v !== null && v !== undefined)
      );
      if (track) return base44.entities.Track.update(track.id, clean);
      return base44.entities.Track.create({ ...clean, artist_id: jlyArtistId });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tracks'] }); onClose(); },
  });

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploadingCover(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData(f => ({ ...f, cover_url: file_url }));
    setUploadingCover(false);
  };

  const handleAudioUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 70 * 1024 * 1024) { alert('El archivo supera los 70MB'); return; }
    setUploadingAudio(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData(f => ({ ...f, audio_file_url: file_url }));
    setUploadingAudio(false);
  };

  const addTag = (field, val, setter) => {
    if (!val.trim()) return;
    setFormData(f => ({ ...f, [field]: [...(f[field] || []), val.trim()] }));
    setter("");
  };
  const removeTag = (field, idx) => setFormData(f => ({ ...f, [field]: f[field].filter((_, i) => i !== idx) }));

  const STATUS_OPTIONS = [
    { value: "demo", label: "Demo" },
    { value: "premix", label: "Premix" },
    { value: "completed", label: "Clean Master" },
  ];

  const inp = "w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors";
  const lbl = "block text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-1.5";

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 flex items-end sm:items-center justify-center sm:p-4" style={{ zIndex: 999999 }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="relative w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          style={{ background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.07)", maxHeight: "92vh" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] flex-shrink-0">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                {track ? 'Editar soundtrack' : 'Nuevo soundtrack'}
              </h3>
              <p className="text-[11px] text-white/25 mt-0.5">{track?.title || "Completa la información"}</p>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/8 transition-colors">
              <X className="w-3.5 h-3.5 text-white/40" />
            </button>
          </div>

          {/* Scrollable body */}
          <form onSubmit={(e) => { e.preventDefault(); if (!formData.title.trim()) { alert('El título es requerido'); return; } saveMutation.mutate(formData); }}
            className="overflow-y-auto flex-1 px-5 py-5 space-y-5">

            {/* Cover + Título — row */}
            <div className="flex gap-4 items-start">
              {/* Cover square */}
              <label className="cursor-pointer flex-shrink-0 relative group">
                <div className="w-20 h-20 rounded-xl overflow-hidden flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  {formData.cover_url
                    ? <img src={formData.cover_url} alt="Cover" className="w-full h-full object-cover" />
                    : <ImageIcon className="w-7 h-7 text-white/15" />}
                </div>
                {uploadingCover && (
                  <div className="absolute inset-0 rounded-xl bg-black/60 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" disabled={uploadingCover} />
              </label>

              {/* Título + Proyecto */}
              <div className="flex-1 space-y-3">
                <div>
                  <label className={lbl}>Título *</label>
                  <input type="text" value={formData.title}
                    onChange={(e) => setFormData(f => ({ ...f, title: e.target.value }))}
                    placeholder="Nombre de la pista" className={inp} required />
                </div>
                {projects?.length > 0 && (
                  <div>
                    <label className={lbl}>Proyecto</label>
                    <select value={formData.project_id}
                      onChange={(e) => setFormData(f => ({ ...f, project_id: e.target.value }))}
                      className={inp}>
                      <option value="">Sin proyecto</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Audio */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={lbl} style={{ marginBottom: 0 }}>Audio</label>
                <div className="flex items-center gap-0.5 rounded-lg p-0.5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  {[{ id: "file", icon: <Upload className="w-3 h-3" />, text: "MP3" }, { id: "link", icon: <Link className="w-3 h-3" />, text: "YouTube" }].map(opt => (
                    <button key={opt.id} type="button" onClick={() => setAudioMode(opt.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${audioMode === opt.id ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"}`}>
                      {opt.icon} {opt.text}
                    </button>
                  ))}
                </div>
              </div>

              {audioMode === "file" ? (
                <label className="cursor-pointer flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: formData.audio_file_url ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.06)" }}>
                    {formData.audio_file_url ? <Check className="w-4 h-4 text-emerald-400" /> : <Music2 className="w-4 h-4 text-white/30" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white/70">
                      {uploadingAudio ? "Subiendo..." : formData.audio_file_url ? "MP3 cargado ✓" : "Subir MP3"}
                    </p>
                    <p className="text-[10px] text-white/25">Máx 70MB</p>
                  </div>
                  <input type="file" accept=".mp3,audio/mpeg" onChange={handleAudioUpload} className="hidden" disabled={uploadingAudio} />
                </label>
              ) : (
                <input type="url" value={formData.youtube_music_url || ""}
                  onChange={(e) => setFormData(f => ({ ...f, youtube_music_url: e.target.value }))}
                  placeholder="https://music.youtube.com/watch?v=..." className={inp} />
              )}
            </div>

            {/* Técnica: Género · BPM · Tonalidad · Estado */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Género</label>
                <input type="text" value={formData.genre || ""}
                  onChange={(e) => setFormData(f => ({ ...f, genre: e.target.value }))}
                  placeholder="Trap, Pop…" className={inp} />
              </div>
              <div>
                <label className={lbl}>Estado</label>
                <div className="flex gap-1.5">
                  {STATUS_OPTIONS.map(s => (
                    <button key={s.value} type="button"
                      onClick={() => setFormData(f => ({ ...f, status: s.value }))}
                      className="flex-1 py-2 rounded-lg text-[10px] font-semibold transition-all"
                      style={{
                        background: formData.status === s.value ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
                        color: formData.status === s.value ? "white" : "rgba(255,255,255,0.3)",
                        border: formData.status === s.value ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.06)",
                      }}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={lbl}>BPM</label>
                <input type="number" value={formData.bpm || ""}
                  onChange={(e) => setFormData(f => ({ ...f, bpm: parseInt(e.target.value) || null }))}
                  placeholder="120" className={inp} />
              </div>
              <div>
                <label className={lbl}>Tonalidad</label>
                <input type="text" value={formData.key || ""}
                  onChange={(e) => setFormData(f => ({ ...f, key: e.target.value }))}
                  placeholder="Am, C#m…" className={inp} />
              </div>
            </div>

            {/* Créditos */}
            <div className="space-y-3">
              <p className={lbl}>Créditos</p>
              {[
                { field: "composers", label: "Compositores", state: newComposer, setter: setNewComposer },
                { field: "producers", label: "Productores musicales", state: newProducer, setter: setNewProducer },
              ].map(({ field, label, state, setter }) => (
                <div key={field}>
                  <label className="text-[10px] text-white/25 mb-1.5 block">{label}</label>
                  {formData[field]?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {formData[field].map((item, i) => (
                        <span key={i} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-white/60"
                          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                          {item}
                          <button type="button" onClick={() => removeTag(field, i)} className="hover:text-white/90 transition-colors ml-0.5">
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input type="text" value={state} onChange={(e) => setter(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag(field, state, setter))}
                      placeholder={`Añadir ${label.toLowerCase()}`} className={inp + " flex-1"} />
                    <button type="button" onClick={() => addTag(field, state, setter)}
                      className="px-3 py-2 rounded-xl text-xs font-medium text-white/50 hover:text-white transition-colors"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Drive */}
            <div>
              <label className={lbl}>Carpeta Drive</label>
              <input type="text" value={formData.versions?.drive_folder || ""}
                onChange={(e) => setFormData(f => ({ ...f, versions: { ...(f.versions || {}), drive_folder: e.target.value } }))}
                placeholder="https://drive.google.com/drive/folders/…" className={inp} />
            </div>

            {/* Notes */}
            <div>
              <label className={lbl}>Notas</label>
              <textarea value={formData.notes || ""}
                onChange={(e) => setFormData(f => ({ ...f, notes: e.target.value }))}
                placeholder="Notas sobre la pista…" rows={2}
                className={inp + " resize-none"} />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1 pb-2">
              <button type="button" onClick={onClose}
                className="flex-1 py-3 rounded-xl text-sm font-medium text-white/40 hover:text-white transition-colors"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                Cancelar
              </button>
              <button type="submit" disabled={saveMutation.isPending}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-black transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: "white" }}>
                {saveMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <><Check className="w-4 h-4" />{track ? 'Guardar' : 'Crear soundtrack'}</>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}