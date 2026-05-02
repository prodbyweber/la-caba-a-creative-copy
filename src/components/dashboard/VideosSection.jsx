import React, { useState } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Trash2, Play, Loader2, Upload, Film, Check, ExternalLink, Pencil, Globe, Lock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function getYoutubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function getYoutubeThumbnail(url) {
  const id = getYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

const CONTENT_TYPES = [
  { value: "minifilm", label: "Mini Film" },
  { value: "film", label: "Film / Cortometraje" },
  { value: "series", label: "Serie" },
];

const GENRES = [
  "Drama", "Documental", "Comedia", "Acción", "Thriller",
  "Horror", "Fantasía", "Ciencia Ficción", "Romance", "Aventura",
  "Musical", "Experimental", "Animación", "Otro",
];

const CREDIT_ROLES = [
  { key: "director", label: "Dirección" },
  { key: "producer", label: "Producción" },
  { key: "cinematographer", label: "Cinematografía" },
  { key: "editor", label: "Edición" },
  { key: "sound_engineer", label: "Sonido" },
  { key: "art_direction", label: "Dirección de arte" },
  { key: "actress", label: "Actriz" },
  { key: "actor", label: "Actor" },
  { key: "music_producer", label: "Productor musical" },
  { key: "composer", label: "Compositor" },
  { key: "other", label: "Otro" },
];

const ic = "w-full px-3 py-2.5 bg-white/5 border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:border-white/25 placeholder-white/20 transition-colors";

// ── Form Modal (create or edit) ────────────────────────────────────────────
function VideoFormModal({ onClose, onSave, artistId, allArtists = [], editingVideo = null }) {
  const isEdit = !!editingVideo;
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState(() => {
    if (editingVideo) {
      return {
        title: editingVideo.title || "",
        content_type: editingVideo.content_type || "minifilm",
        genre: editingVideo.genres?.[0] || editingVideo.subtitle || "",
        year: editingVideo.year || new Date().getFullYear(),
        description: editingVideo.description || "",
        youtube_url: editingVideo.youtube_url || "",
        video_file_url: editingVideo.preview_media_url || "",
        thumbnail_url: editingVideo.thumbnail_url || "",
        credits: (editingVideo.credits || []).map((c, i) => ({
          ...c,
          id: c.id || i.toString(),
          role: CREDIT_ROLES.find(r => r.label === c.role)?.key || c.role || "",
        })),
      };
    }
    return {
      title: "", content_type: "minifilm", genre: "", year: new Date().getFullYear(),
      description: "", youtube_url: "", video_file_url: "", thumbnail_url: "", credits: [],
    };
  });
  const [newCredit, setNewCredit] = useState({ role: "", name: "", artist_id: "" });

  const ytId = getYoutubeId(form.youtube_url);
  const ytThumb = ytId ? getYoutubeThumbnail(form.youtube_url) : null;

  const handleUpload = async (file, type) => {
    if (!file || file.size > 100 * 1024 * 1024) { alert("El archivo no debe exceder 100MB"); return; }
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(f => ({ ...f, [type === "video" ? "video_file_url" : "thumbnail_url"]: file_url }));
    } finally { setUploading(false); }
  };

  const addCredit = () => {
    if (!newCredit.role || (!newCredit.name && !newCredit.artist_id)) return;
    const artist = allArtists.find(a => a.id === newCredit.artist_id);
    setForm(f => ({
      ...f,
      credits: [...f.credits, {
        id: Date.now().toString(),
        role: newCredit.role,
        artist_id: newCredit.artist_id || null,
        name: newCredit.name || artist?.stageName || "",
      }]
    }));
    setNewCredit({ role: "", name: "", artist_id: "" });
  };

  const handleSubmit = async () => {
    if (!form.title) { alert("El título es obligatorio"); return; }
    if (!form.youtube_url && !form.video_file_url) { alert("Añade un video (YouTube o archivo)"); return; }
    setLoading(true);
    const payload = {
      title: form.title,
      content_type: form.content_type,
      subtitle: form.genre,
      genres: form.genre ? [form.genre] : [],
      year: Number(form.year),
      description: form.description,
      youtube_url: form.youtube_url || undefined,
      preview_media_url: form.video_file_url || undefined,
      preview_media_type: form.video_file_url ? "video" : "image",
      thumbnail_url: form.thumbnail_url || ytThumb || undefined,
      artist_id: artistId || undefined,
      credits: form.credits.map(c => ({
        artist_id: c.artist_id || undefined,
        role: CREDIT_ROLES.find(r => r.key === c.role)?.label || c.role,
        name: c.name,
      })),
    };
    try {
      if (isEdit) {
        await base44.entities.ExplorarItem.update(editingVideo.id, payload);
      } else {
        await base44.entities.ExplorarItem.create({ ...payload, is_active: true });
      }
      onSave();
      onClose();
    } finally { setLoading(false); }
  };

  return ReactDOM.createPortal(
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[600] bg-black/90 backdrop-blur-xl flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="bg-[#111] border border-white/[0.08] rounded-t-2xl sm:rounded-2xl w-full sm:max-w-xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <p className="text-sm font-bold text-white">{isEdit ? "Editar video" : "Nuevo video"}</p>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Información</p>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={ic} placeholder="Título *" />
            <div className="grid grid-cols-2 gap-2">
              <select value={form.content_type} onChange={e => setForm(f => ({ ...f, content_type: e.target.value }))} className={ic}>
                {CONTENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <select value={form.genre} onChange={e => setForm(f => ({ ...f, genre: e.target.value }))} className={ic}>
                <option value="">Género</option>
                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <input value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} className={ic} placeholder="Año" type="number" min={1990} max={2099} />
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={ic + " resize-none"} rows={2} placeholder="Descripción" />
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Contenido</p>
            <div>
              <label className="text-[10px] text-white/40 mb-1 block">URL de YouTube</label>
              <input value={form.youtube_url} onChange={e => setForm(f => ({ ...f, youtube_url: e.target.value }))} className={ic} placeholder="https://youtube.com/watch?v=..." />
              {ytThumb && <div className="mt-2 rounded-lg overflow-hidden aspect-video bg-black/50"><img src={ytThumb} alt="" className="w-full h-full object-cover" /></div>}
            </div>
            {!form.youtube_url && (
              <div>
                <label className="text-[10px] text-white/40 mb-1 block">Archivo de video (máx. 100MB)</label>
                {form.video_file_url ? (
                  <div className="relative rounded-lg overflow-hidden aspect-video bg-black/50">
                    <video src={form.video_file_url} className="w-full h-full object-cover" muted loop />
                    <button onClick={() => setForm(f => ({ ...f, video_file_url: "" }))} className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-lg"><X className="w-3.5 h-3.5 text-white" /></button>
                  </div>
                ) : (
                  <label className={`flex flex-col items-center justify-center gap-2 py-5 rounded-lg border border-dashed border-white/10 cursor-pointer hover:border-white/25 transition-colors ${uploading ? "opacity-50" : ""}`}>
                    <input type="file" accept="video/*" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], "video")} />
                    {uploading ? <Loader2 className="w-5 h-5 text-white/30 animate-spin" /> : <Upload className="w-5 h-5 text-white/20" />}
                    <span className="text-xs text-white/25">{uploading ? "Subiendo..." : "Sube un video"}</span>
                  </label>
                )}
              </div>
            )}
            <div>
              <label className="text-[10px] text-white/40 mb-1 block">Miniatura</label>
              {form.thumbnail_url ? (
                <div className="relative rounded-lg overflow-hidden" style={{ aspectRatio: "16/9" }}>
                  <img src={form.thumbnail_url} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => setForm(f => ({ ...f, thumbnail_url: "" }))} className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-lg"><X className="w-3.5 h-3.5 text-white" /></button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 py-4 rounded-lg border border-dashed border-white/10 cursor-pointer hover:border-white/25 transition-colors">
                  <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], "thumbnail")} />
                  <Upload className="w-4 h-4 text-white/20" />
                  <span className="text-xs text-white/25">Portada / Miniatura</span>
                </label>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Créditos</p>
            <div className="grid grid-cols-3 gap-2">
              <select value={newCredit.role} onChange={e => setNewCredit(c => ({ ...c, role: e.target.value }))} className={ic}>
                <option value="">Rol</option>
                {CREDIT_ROLES.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
              </select>
              <input value={newCredit.name} onChange={e => setNewCredit(c => ({ ...c, name: e.target.value }))} className={ic} placeholder="Nombre" />
              <select value={newCredit.artist_id} onChange={e => setNewCredit(c => ({ ...c, artist_id: e.target.value }))} className={ic}>
                <option value="">Artista (opc.)</option>
                {allArtists.map(a => <option key={a.id} value={a.id}>{a.stageName}</option>)}
              </select>
            </div>
            <button onClick={addCredit} disabled={!newCredit.role || (!newCredit.name && !newCredit.artist_id)}
              className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-semibold disabled:opacity-30 flex items-center justify-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Añadir crédito
            </button>
            {form.credits.length > 0 && (
              <div className="space-y-1.5">
                {form.credits.map(c => {
                  const roleLabel = CREDIT_ROLES.find(r => r.key === c.role)?.label || c.role;
                  return (
                    <div key={c.id} className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg">
                      <span className="text-xs text-white/60">{roleLabel} — {c.name}</span>
                      <button onClick={() => setForm(f => ({ ...f, credits: f.credits.filter(x => x.id !== c.id) }))}
                        className="p-1 hover:bg-red-500/20 rounded text-white/30 hover:text-red-400 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 p-5 border-t border-white/[0.06]">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-colors">
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-white text-black text-sm font-bold hover:bg-white/90 disabled:opacity-30 flex items-center justify-center gap-2 transition-colors">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> {isEdit ? "Guardar cambios" : "Guardar video"}</>}
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function VideosSection({ artistId, userProfileId }) {
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [playingYt, setPlayingYt] = useState(null);
  const qc = useQueryClient();

  const { data: videos = [], isLoading, refetch } = useQuery({
    queryKey: ["artist-videos", artistId, userProfileId],
    queryFn: async () => {
      let items = [];
      if (artistId) {
        items = await base44.entities.ExplorarItem.filter({ artist_id: artistId });
      } else {
        items = await base44.entities.ExplorarItem.list("-created_date", 100);
        const me = await base44.auth.me();
        items = items.filter(i => i.created_by === me?.email);
      }
      return items.filter(i => ["film", "minifilm", "series"].includes(i.content_type));
    },
    enabled: !!(artistId || userProfileId),
  });

  const { data: allArtists = [] } = useQuery({
    queryKey: ["artists"],
    queryFn: () => base44.entities.Artist.list(),
  });

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este video?")) return;
    await base44.entities.ExplorarItem.delete(id);
    refetch();
  };

  const handleTogglePublic = async (video) => {
    await base44.entities.ExplorarItem.update(video.id, { is_active: !video.is_active });
    refetch();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-white/30" />
          <h3 className="text-sm font-bold text-white">Videos</h3>
          {videos.length > 0 && <span className="text-[10px] text-white/25 px-1.5 py-0.5 bg-white/5 rounded-full">{videos.length}</span>}
        </div>
        <button onClick={() => { setEditingVideo(null); setShowModal(true); }}
          className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all">
          <Plus className="w-3 h-3" /> Nuevo video
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />)}</div>
      ) : videos.length === 0 ? (
        <button onClick={() => setShowModal(true)}
          className="w-full py-16 rounded-2xl border border-dashed border-white/[0.06] flex flex-col items-center gap-3 hover:border-white/15 transition-colors">
          <Film className="w-8 h-8 text-white/10" />
          <div className="text-center">
            <p className="text-xs text-white/25">Sin videos</p>
            <p className="text-[10px] text-white/12 mt-0.5">Sube un mini film, cortometraje o serie</p>
          </div>
        </button>
      ) : (
        <div className="space-y-2">
          {videos.map((video, i) => {
            const thumb = video.thumbnail_url || getYoutubeThumbnail(video.youtube_url || video.youtube_music_url);
            const ytId = getYoutubeId(video.youtube_url);
            const typeLabel = CONTENT_TYPES.find(t => t.value === video.content_type)?.label || video.content_type;
            const isPublic = video.is_active !== false;
            return (
              <motion.div key={video.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="group flex gap-3 items-center p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] transition-colors">
                {/* Thumbnail */}
                <div className="relative w-28 h-16 rounded-lg overflow-hidden bg-black/50 flex-shrink-0">
                  {thumb ? <img src={thumb} alt={video.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Film className="w-5 h-5 text-white/10" /></div>}
                  {ytId && (
                    <button onClick={() => setPlayingYt(ytId)}
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                      <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                    </button>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{video.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {typeLabel && <span className="text-[9px] text-white/30 uppercase tracking-wider">{typeLabel}</span>}
                    {(video.subtitle || video.genres?.[0]) && <span className="text-[9px] text-white/20">· {video.subtitle || video.genres?.[0]}</span>}
                    {video.year && <span className="text-[9px] text-white/20">· {video.year}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {/* Toggle público/privado */}
                  <button
                    onClick={() => handleTogglePublic(video)}
                    title={isPublic ? "Público — clic para privado" : "Privado — clic para público"}
                    className={`p-1.5 rounded-lg transition-colors ${isPublic ? "bg-emerald-500/15 hover:bg-emerald-500/25" : "bg-white/5 hover:bg-white/10"}`}
                  >
                    {isPublic ? <Globe className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3 text-white/30" />}
                  </button>
                  {/* Editar */}
                  <button onClick={() => { setEditingVideo(video); setShowModal(true); }}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <Pencil className="w-3 h-3 text-white/40 hover:text-white" />
                  </button>
                  {/* Link externo */}
                  {video.youtube_url && (
                    <a href={video.youtube_url} target="_blank" rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-black/40 hover:bg-black/70 transition-colors">
                      <ExternalLink className="w-3 h-3 text-white/40" />
                    </a>
                  )}
                  {/* Eliminar */}
                  <button onClick={() => handleDelete(video.id)}
                    className="p-1.5 rounded-lg bg-black/40 hover:bg-red-900/60 transition-colors">
                    <Trash2 className="w-3 h-3 text-white/40 hover:text-red-400" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {(showModal) && (
          <VideoFormModal
            onClose={() => { setShowModal(false); setEditingVideo(null); }}
            onSave={refetch}
            artistId={artistId}
            allArtists={allArtists}
            editingVideo={editingVideo}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {playingYt && ReactDOM.createPortal(
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[700] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setPlayingYt(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="relative w-full max-w-3xl" onClick={e => e.stopPropagation()}>
              <button onClick={() => setPlayingYt(null)} className="absolute -top-10 right-0 p-2 text-white/50 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <div className="relative rounded-xl overflow-hidden" style={{ paddingBottom: "56.25%" }}>
                <iframe src={`https://www.youtube-nocookie.com/embed/${playingYt}?autoplay=1&rel=0`}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen />
              </div>
            </motion.div>
          </motion.div>,
          document.body
        )}
      </AnimatePresence>
    </motion.div>
  );
}