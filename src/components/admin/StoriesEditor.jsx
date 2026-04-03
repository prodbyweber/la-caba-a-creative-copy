import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Upload, Film, X, ChevronDown, ExternalLink, Play } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "react-hot-toast";

// ── YouTube helper ─────────────────────────────────────────────────────────
function getYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:music\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function getYouTubeThumbnail(url) {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

function isVideoFile(url) {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url || "");
}

// ── Clip thumbnail preview ─────────────────────────────────────────────────
function ClipPreview({ clip }) {
  const [playing, setPlaying] = useState(false);
  const ytThumb = getYouTubeThumbnail(clip.video_url);
  const ytId = getYouTubeId(clip.video_url);
  const isFile = isVideoFile(clip.video_url);

  // Priority: YouTube thumbnail > explicit thumbnail_url > nothing
  const thumb = ytThumb || clip.thumbnail_url || null;

  if (!clip.video_url && !thumb) return null;

  return (
    <div className="mt-2 rounded-xl overflow-hidden border border-white/10 bg-black">
      {playing && ytId ? (
        <div className="aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
            title={clip.title}
            allow="autoplay; encrypted-media"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>
      ) : playing && isFile ? (
        <video
          src={clip.video_url}
          controls
          autoPlay
          className="w-full aspect-video object-cover"
        />
      ) : (
        <div className="relative aspect-video cursor-pointer group" onClick={() => setPlaying(true)}>
          {thumb ? (
            <img src={thumb} alt={clip.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-900">
              <Film className="w-10 h-10 text-white/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover:bg-white/25 transition-colors">
              <Play className="w-5 h-5 text-white ml-0.5" />
            </div>
          </div>
          {ytThumb && (
            <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-red-600 rounded text-[10px] font-bold text-white">
              YouTube
            </div>
          )}
        </div>
      )}
      {playing && (
        <button
          onClick={() => setPlaying(false)}
          className="w-full py-1.5 text-xs text-white/50 hover:text-white bg-zinc-900 transition-colors"
        >
          Cerrar previsualización
        </button>
      )}
    </div>
  );
}

// ── Single clip editor ─────────────────────────────────────────────────────
function ClipEditor({ clip, onUpdate, onRemove, uploading, onUploadFile }) {
  return (
    <div className="p-4 bg-zinc-800/70 rounded-xl space-y-3 border border-white/[0.08]">
      {/* Title row */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={clip.title || ""}
          onChange={(e) => onUpdate("title", e.target.value)}
          placeholder="Título del clip"
          className="flex-1 px-3 py-2 bg-white/5 rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
        />
        <button
          onClick={onRemove}
          className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* YouTube link */}
      <div>
        <label className="text-[11px] text-gray-500 mb-1 block">Link de YouTube</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={clip.video_url?.startsWith("http") && getYouTubeId(clip.video_url) ? clip.video_url : ""}
            onChange={(e) => onUpdate("video_url", e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="flex-1 px-3 py-2 bg-white/5 rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
          />
          {clip.video_url && getYouTubeId(clip.video_url) && (
            <a
              href={clip.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-red-500/20 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors flex-shrink-0"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* OR: upload video file */}
      <div>
        <label className="text-[11px] text-gray-500 mb-1 block">O subir archivo de video (máx 100MB)</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={isVideoFile(clip.video_url) ? clip.video_url : ""}
            onChange={(e) => onUpdate("video_url", e.target.value)}
            placeholder="URL directa de video (mp4, webm...)"
            className="flex-1 px-3 py-2 bg-white/5 rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
          />
          <label className="px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-400 cursor-pointer text-sm transition-colors flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap">
            <input
              type="file"
              accept="video/*"
              className="hidden"
              disabled={uploading}
              onChange={(e) => onUploadFile(e.target.files?.[0])}
            />
            {uploading ? (
              <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span>{uploading ? "Subiendo..." : "Subir"}</span>
          </label>
        </div>
      </div>

      {/* Thumbnail override (only shown if no YouTube) */}
      {!getYouTubeId(clip.video_url) && (
        <div>
          <label className="text-[11px] text-gray-500 mb-1 block">Miniatura (opcional)</label>
          <input
            type="text"
            value={clip.thumbnail_url || ""}
            onChange={(e) => onUpdate("thumbnail_url", e.target.value)}
            placeholder="URL de la miniatura"
            className="w-full px-3 py-2 bg-white/5 rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
          />
        </div>
      )}

      {/* Preview */}
      <ClipPreview clip={clip} />
    </div>
  );
}

// ── Single testimonial (story) editor ─────────────────────────────────────
function StoryEditor({ testimonial, index, onChange, onRemove, uploading, setUploading }) {
  const [clipsOpen, setClipsOpen] = useState(false);
  const [uploadingClip, setUploadingClip] = useState(null);

  const updateField = (field, value) => onChange({ ...testimonial, [field]: value });

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploading(index);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onChange({ ...testimonial, image: file_url });
      toast.success("Imagen subida");
    } catch {
      toast.error("Error al subir imagen");
    } finally {
      setUploading(null);
    }
  };

  const addClip = () => {
    const clips = [...(testimonial.clips || []), { title: "", video_url: "", thumbnail_url: "" }];
    onChange({ ...testimonial, clips });
    setClipsOpen(true);
  };

  const updateClip = (clipIdx, field, value) => {
    const clips = [...(testimonial.clips || [])];
    clips[clipIdx] = { ...clips[clipIdx], [field]: value };
    onChange({ ...testimonial, clips });
  };

  const removeClip = (clipIdx) => {
    const clips = (testimonial.clips || []).filter((_, i) => i !== clipIdx);
    onChange({ ...testimonial, clips });
  };

  const uploadClipFile = async (clipIdx, file) => {
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) { toast.error("Máx. 100MB"); return; }
    setUploadingClip(clipIdx);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      updateClip(clipIdx, "video_url", file_url);
      toast.success("Video subido");
    } catch {
      toast.error("Error al subir video");
    } finally {
      setUploadingClip(null);
    }
  };

  const clips = testimonial.clips || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="bg-white/[0.04] rounded-xl border border-white/10 overflow-hidden"
    >
      {/* Story header */}
      <div className="flex items-center gap-3 p-4 bg-white/[0.03]">
        <div className="w-14 h-14 rounded-lg overflow-hidden bg-white/5 flex-shrink-0 border border-white/10">
          <img src={testimonial.image} alt={testimonial.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-white truncate">{testimonial.name || "Sin nombre"}</div>
          <div className="text-xs text-gray-500">{testimonial.role}</div>
        </div>
        <button onClick={onRemove} className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors flex-shrink-0">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Name */}
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block font-medium">Nombre del artista</label>
          <input
            type="text"
            value={testimonial.name || ""}
            onChange={(e) => updateField("name", e.target.value)}
            className="w-full px-3 py-2.5 bg-white/5 rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            placeholder="Carlos Mendoza"
          />
        </div>

        {/* Role */}
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block font-medium">Rol / Especialidad</label>
          <input
            type="text"
            value={testimonial.role || ""}
            onChange={(e) => updateField("role", e.target.value)}
            className="w-full px-3 py-2.5 bg-white/5 rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            placeholder="Artista Urbano"
          />
        </div>

        {/* Quote */}
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block font-medium">Testimonio</label>
          <textarea
            value={testimonial.quote || ""}
            onChange={(e) => updateField("quote", e.target.value)}
            rows={3}
            className="w-full px-3 py-2.5 bg-white/5 rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors resize-none"
            placeholder="Escribe el testimonio..."
          />
        </div>

        {/* Image */}
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block font-medium">Imagen de fondo (carrusel)</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={testimonial.image || ""}
              onChange={(e) => updateField("image", e.target.value)}
              className="flex-1 px-3 py-2.5 bg-white/5 rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="URL de la imagen"
            />
            <label className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg text-emerald-400 cursor-pointer transition-colors flex items-center gap-1.5 flex-shrink-0">
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e.target.files?.[0])} />
              <Upload className="w-4 h-4" />
              <span className="text-sm">{uploading === index ? "Subiendo..." : "Subir"}</span>
            </label>
          </div>
        </div>

        {/* ── Video Clips section ── */}
        <div className="border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={() => setClipsOpen(!clipsOpen)}
            className="w-full flex items-center justify-between py-1 group"
          >
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-semibold text-white">Video Clips</span>
              <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{clips.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); addClip(); }}
                className="px-2.5 py-1 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-400 text-xs transition-colors"
              >
                + Añadir clip
              </button>
              <motion.div animate={{ rotate: clipsOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
              </motion.div>
            </div>
          </button>

          <AnimatePresence>
            {clipsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="pt-3 space-y-3">
                  {clips.length === 0 && (
                    <div className="text-center py-8 border border-dashed border-white/10 rounded-xl">
                      <Film className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 mb-3">No hay clips añadidos</p>
                      <button
                        type="button"
                        onClick={addClip}
                        className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-400 text-sm transition-colors"
                      >
                        Añadir primer clip
                      </button>
                    </div>
                  )}
                  {clips.map((clip, clipIdx) => (
                    <ClipEditor
                      key={clipIdx}
                      clip={clip}
                      onUpdate={(field, value) => updateClip(clipIdx, field, value)}
                      onRemove={() => removeClip(clipIdx)}
                      uploading={uploadingClip === clipIdx}
                      onUploadFile={(file) => uploadClipFile(clipIdx, file)}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────
export default function StoriesEditor({ testimonials = [], onUpdate }) {
  const [items, setItems] = useState(testimonials);
  const [uploading, setUploading] = useState(null);

  // sync external prop changes
  useEffect(() => { setItems(testimonials); }, [JSON.stringify(testimonials)]);

  const save = (newItems) => {
    setItems(newItems);
    onUpdate(newItems);
  };

  const addStory = () => {
    save([...items, {
      id: Date.now(),
      name: "Nombre del artista",
      role: "Rol",
      quote: "Testimonio del artista...",
      image: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=1920&h=1080&fit=crop&q=80",
      clips: []
    }]);
  };

  const updateStory = (index, updated) => {
    const newItems = [...items];
    newItems[index] = updated;
    save(newItems);
  };

  const removeStory = (index) => save(items.filter((_, i) => i !== index));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">{items.length} historia{items.length !== 1 ? "s" : ""}</span>
        <button
          onClick={addStory}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg text-emerald-400 text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Añadir Historia
        </button>
      </div>

      <AnimatePresence>
        {items.map((item, i) => (
          <StoryEditor
            key={item.id || i}
            testimonial={item}
            index={i}
            onChange={(updated) => updateStory(i, updated)}
            onRemove={() => removeStory(i)}
            uploading={uploading}
            setUploading={setUploading}
          />
        ))}
      </AnimatePresence>

      {items.length === 0 && (
        <div className="text-center py-12 border border-dashed border-white/20 rounded-xl">
          <p className="text-gray-500 mb-4">No hay historias todavía</p>
          <button onClick={addStory} className="px-6 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg text-emerald-400 text-sm font-medium transition-colors">
            Añadir primera historia
          </button>
        </div>
      )}
    </div>
  );
}