import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Trash2, ExternalLink, Play, Loader2, Upload, Film, Check, ChevronRight } from "lucide-react";
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

const FILM_GENRES = [
  "Drama", "Documental", "Comedia", "Acción", "Thriller", 
  "Horror", "Fantasía", "Ciencia Ficción", "Romance", "Aventura",
  "Musical", "Cortometraje", "Experimental", "Animación"
];

const CREDITS = [
  { key: "director", label: "Dirección" },
  { key: "producer", label: "Producción" },
  { key: "cinematographer", label: "Cinematografía" },
  { key: "editor", label: "Edición" },
  { key: "sound_engineer", label: "Ingeniero de audio" },
  { key: "mix_engineer", label: "Ingeniero de mezcla" },
  { key: "art_direction", label: "Dirección de arte" },
  { key: "photography", label: "Fotografía" },
  { key: "actress", label: "Actriz" },
  { key: "actor", label: "Actor" },
  { key: "music_producer", label: "Productor musical" },
  { key: "composer", label: "Compositor" },
  { key: "other", label: "Otro" },
];

function VideoFormModal({ onClose, onSave, jlyArtistId, allArtists = [] }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [form, setForm] = useState({
    title: "",
    genre: "",
    description: "",
    youtube_url: "",
    video_file_url: "",
    thumbnail_url: "",
    featured_artists: [],
    credits: [],
  });

  const [newCredit, setNewCredit] = useState({ role: "", artist_id: "" });
  const ytId = getYoutubeId(form.youtube_url);
  const ytThumb = ytId ? getYoutubeThumbnail(form.youtube_url) : null;

  const handleFileUpload = async (file, type) => {
    if (!file || file.size > 100 * 1024 * 1024) {
      alert("El archivo no debe exceder 100MB");
      return;
    }
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      if (type === "video") {
        setForm(f => ({ ...f, video_file_url: file_url }));
      } else if (type === "thumbnail") {
        setForm(f => ({ ...f, thumbnail_url: file_url }));
      }
    } finally {
      setUploading(false);
    }
  };

  const addCredit = () => {
    if (newCredit.role && (newCredit.artist_id || newCredit.role === "other")) {
      setForm(f => ({
        ...f,
        credits: [...f.credits, { ...newCredit, id: Date.now().toString() }]
      }));
      setNewCredit({ role: "", artist_id: "" });
    }
  };

  const removeCredit = (id) => {
    setForm(f => ({ ...f, credits: f.credits.filter(c => c.id !== id) }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.genre || (!form.youtube_url && !form.video_file_url)) {
      alert("Completa los campos obligatorios");
      return;
    }
    setLoading(true);
    try {
      const videoData = {
        artist_id: jlyArtistId,
        title: form.title,
        genre: form.genre,
        description: form.description,
        youtube_url: form.youtube_url,
        video_file_url: form.video_file_url,
        thumbnail_url: form.thumbnail_url || ytThumb,
        featured_artists: form.featured_artists,
        credits: form.credits,
      };
      await base44.entities.ExplorarItem.create(videoData);
      onSave();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const ic = "w-full px-3 py-2.5 bg-white/5 border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:border-white/25 placeholder-white/20 transition-colors";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[600] bg-black/90 backdrop-blur-xl flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="bg-[#111] border border-white/[0.08] rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] sticky top-0 bg-[#111] z-10">
          <p className="text-sm font-bold text-white">Nuevo Video</p>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Basic Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white/60 uppercase tracking-widest">Información</h4>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className={ic}
              placeholder="Título del video *"
            />
            <select
              value={form.genre}
              onChange={e => setForm(f => ({ ...f, genre: e.target.value }))}
              className={ic}
            >
              <option value="">Género de película *</option>
              {FILM_GENRES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className={ic + " resize-none"}
              rows={3}
              placeholder="Descripción"
            />
          </div>

          {/* Video Source */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white/60 uppercase tracking-widest">Contenido</h4>
            <div>
              <label className="text-[10px] text-white/40 mb-1 block">URL de YouTube</label>
              <input
                value={form.youtube_url}
                onChange={e => setForm(f => ({ ...f, youtube_url: e.target.value }))}
                className={ic}
                placeholder="https://youtube.com/watch?v=..."
              />
              {ytThumb && (
                <div className="mt-2 rounded-lg overflow-hidden aspect-video bg-black/50">
                  <img src={ytThumb} alt="" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div>
              <label className="text-[10px] text-white/40 mb-1 block">O archivo de video (máx. 100MB)</label>
              {form.video_file_url ? (
                <div className="relative rounded-lg overflow-hidden aspect-video bg-black/50">
                  <video src={form.video_file_url} className="w-full h-full object-cover" muted loop />
                  <button
                    onClick={() => setForm(f => ({ ...f, video_file_url: "" }))}
                    className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-lg hover:bg-black/90"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              ) : (
                <label className={`flex flex-col items-center justify-center gap-2 py-6 rounded-lg border border-dashed border-white/10 cursor-pointer hover:border-white/25 transition-colors ${uploading ? "opacity-50" : ""}`}>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], "video")}
                  />
                  {uploading ? <Loader2 className="w-6 h-6 text-white/30 animate-spin" /> : <Upload className="w-6 h-6 text-white/20" />}
                  <span className="text-xs text-white/25">{uploading ? "Subiendo..." : "Sube un video"}</span>
                </label>
              )}
            </div>

            <div>
              <label className="text-[10px] text-white/40 mb-1 block">Miniatura personalizada</label>
              {form.thumbnail_url ? (
                <div className="relative rounded-lg overflow-hidden aspect-video bg-black/50">
                  <img src={form.thumbnail_url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setForm(f => ({ ...f, thumbnail_url: "" }))}
                    className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-lg hover:bg-black/90"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 py-4 rounded-lg border border-dashed border-white/10 cursor-pointer hover:border-white/25 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], "thumbnail")}
                  />
                  <Upload className="w-5 h-5 text-white/20" />
                  <span className="text-xs text-white/25">Sube una imagen</span>
                </label>
              )}
            </div>
          </div>

          {/* Credits */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white/60 uppercase tracking-widest">Créditos</h4>
            
            <div className="grid grid-cols-2 gap-2">
              <select
                value={newCredit.role}
                onChange={e => setNewCredit(c => ({ ...c, role: e.target.value }))}
                className={ic}
              >
                <option value="">Rol *</option>
                {CREDITS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
              
              <select
                value={newCredit.artist_id}
                onChange={e => setNewCredit(c => ({ ...c, artist_id: e.target.value }))}
                className={ic}
              >
                <option value="">Selecciona artista</option>
                {allArtists.map(a => <option key={a.id} value={a.id}>{a.stageName}</option>)}
              </select>
            </div>

            <button
              onClick={addCredit}
              disabled={!newCredit.role}
              className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-semibold disabled:opacity-30 flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Añadir crédito
            </button>

            {form.credits.length > 0 && (
              <div className="space-y-2">
                {form.credits.map(c => {
                  const creditLabel = CREDITS.find(cr => cr.key === c.role)?.label || c.role;
                  const artistName = allArtists.find(a => a.id === c.artist_id)?.stageName || "Desconocido";
                  return (
                    <div key={c.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                      <span className="text-xs text-white/70">{creditLabel} - {artistName}</span>
                      <button onClick={() => removeCredit(c.id)} className="p-1 hover:bg-red-500/20 rounded text-white/40 hover:text-red-400">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg bg-white text-black text-sm font-bold hover:bg-white/90 disabled:opacity-30 flex items-center justify-center gap-2"
            >
              {loading ? "Guardando..." : <><Check className="w-4 h-4" /> Crear Video</>}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function VideosSection({ artistId }) {
  const [showModal, setShowModal] = useState(false);
  const [playingYt, setPlayingYt] = useState(null);
  const qc = useQueryClient();

  const { data: videos = [], isLoading, refetch } = useQuery({
    queryKey: ['artist-videos', artistId],
    queryFn: async () => {
      if (!artistId) return [];
      const items = await base44.entities.ExplorarItem.filter({ artist_id: artistId });
      return items.filter(i => i.content_type === "film" || i.content_type === "minifilm");
    },
    enabled: !!artistId,
  });

  const { data: allArtists = [] } = useQuery({
    queryKey: ['artists'],
    queryFn: () => base44.entities.Artist.list(),
  });

  const deleteVideoMutation = useMutation({
    mutationFn: (id) => base44.entities.ExplorarItem.delete(id),
    onSuccess: () => refetch(),
  });

  const handleDelete = (id) => {
    if (confirm("¿Eliminar este video?")) {
      deleteVideoMutation.mutate(id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sm:bg-gradient-to-br sm:from-[#141414] sm:to-black sm:rounded-2xl sm:border sm:border-white/5"
    >
      <div className="px-0 sm:px-4 sm:py-3 sm:border-b sm:border-white/5 flex items-center justify-between mb-3 sm:mb-0 p-4">
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex w-8 h-8 rounded-lg bg-white/5 items-center justify-center">
            <Film className="w-4 h-4 text-white/40" />
          </div>
          <h3 className="text-base font-bold text-white">Videos</h3>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-3 h-3" />
          <span className="hidden lg:inline">Nuevo</span>
        </button>
      </div>

      <div className="sm:p-4">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <button
            onClick={() => setShowModal(true)}
            className="w-full py-12 rounded-2xl border border-dashed border-white/[0.06] flex flex-col items-center gap-3 text-center hover:border-white/15 transition-colors"
          >
            <Plus className="w-8 h-8 text-white/15" />
            <div>
              <p className="text-xs text-white/25">Sin videos</p>
              <p className="text-[10px] text-white/12 mt-0.5">Crea tu primer video con créditos</p>
            </div>
          </button>
        ) : (
          <div className="space-y-2">
            {videos.map((video, i) => {
              const thumb = video.thumbnail_url || getYoutubeThumbnail(video.youtube_url);
              return (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="group relative rounded-xl overflow-hidden bg-[#111] border border-white/[0.05] p-3 flex gap-3"
                >
                  <div className="w-32 h-20 rounded-lg overflow-hidden bg-black/50 flex-shrink-0">
                    {thumb ? (
                      <img src={thumb} alt={video.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="w-6 h-6 text-white/10" />
                      </div>
                    )}
                    {video.youtube_url && (
                      <button
                        onClick={() => setPlayingYt(getYoutubeId(video.youtube_url))}
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40"
                      >
                        <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                      </button>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-white truncate">{video.title}</h4>
                    <p className="text-[10px] text-white/40 mt-0.5">{video.genre}</p>
                    {video.credits?.length > 0 && (
                      <p className="text-[9px] text-white/30 mt-1 truncate">
                        {video.credits.slice(0, 2).map(c => {
                          const label = CREDITS.find(cr => cr.key === c.role)?.label;
                          return label;
                        }).join(", ")}
                        {video.credits.length > 2 && `...`}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDelete(video.id)}
                      className="p-1.5 bg-black/60 rounded-lg hover:bg-red-900/60"
                    >
                      <Trash2 className="w-3 h-3 text-white/60 hover:text-red-400" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <VideoFormModal
            onClose={() => setShowModal(false)}
            onSave={refetch}
            jlyArtistId={artistId}
            allArtists={allArtists}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {playingYt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[700] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setPlayingYt(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative w-full max-w-3xl"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setPlayingYt(null)} className="absolute -top-10 right-0 p-2 text-white/50 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <div className="relative rounded-xl overflow-hidden" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${playingYt}?autoplay=1&rel=0`}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}