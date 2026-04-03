import React, { useState, useRef, useCallback, useEffect } from "react";
import { Plus, Trash2, Upload, Film, X, ExternalLink, Play, Save, CheckCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

// ── YouTube helpers ────────────────────────────────────────────────────────
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

function isVideoFile(url) {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url || "");
}

// ── Mini video preview inside editor ─────────────────────────────────────
function ClipPreview({ clip }) {
  const [playing, setPlaying] = useState(false);
  const ytId = getYouTubeId(clip.video_url);
  const isFile = isVideoFile(clip.video_url);
  const thumb = ytId
    ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
    : clip.thumbnail_url || null;

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
        <video src={clip.video_url} controls autoPlay className="w-full aspect-video object-cover" />
      ) : (
        <div className="relative aspect-video cursor-pointer group" onClick={() => setPlaying(true)}>
          {thumb ? (
            <img src={thumb} alt={clip.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
              <Film className="w-10 h-10 text-white/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
            <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover:bg-white/25 transition-colors">
              <Play className="w-5 h-5 text-white ml-0.5" />
            </div>
          </div>
          {ytId && (
            <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-red-600 rounded text-[10px] font-bold text-white">
              YouTube
            </div>
          )}
        </div>
      )}
      {playing && (
        <button onClick={() => setPlaying(false)} className="w-full py-1.5 text-xs text-white/50 hover:text-white bg-zinc-900 transition-colors">
          Cerrar previsualización
        </button>
      )}
    </div>
  );
}

// ── Single clip editor ─────────────────────────────────────────────────────
function ClipEditor({ clip, onUpdate, onRemove }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpload = async (file) => {
    if (!file) return;
    if (file.size > 150 * 1024 * 1024) {
      alert("El archivo no puede superar 150MB");
      return;
    }
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onUpdate("video_url", file_url);
    } catch (e) {
      alert("Error al subir el video: " + e.message);
    } finally {
      setUploading(false);
    }
  };

  const ytId = getYouTubeId(clip.video_url);
  const isFile = isVideoFile(clip.video_url);

  return (
    <div className="p-4 bg-zinc-800/60 rounded-xl space-y-3 border border-white/[0.08]">
      {/* Title + remove */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={clip.title || ""}
          onChange={(e) => onUpdate("title", e.target.value)}
          placeholder="Título del clip"
          className="flex-1 px-3 py-2 bg-white/5 rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
        />
        <button onClick={onRemove} className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* YouTube URL */}
      <div>
        <label className="text-[11px] text-gray-500 mb-1 block">🔗 Link de YouTube</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={ytId ? clip.video_url : ""}
            onChange={(e) => onUpdate("video_url", e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="flex-1 px-3 py-2 bg-white/5 rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-red-500"
          />
          {ytId && (
            <a href={clip.video_url} target="_blank" rel="noopener noreferrer"
              className="p-2 bg-red-500/20 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors">
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* OR upload file */}
      <div>
        <label className="text-[11px] text-gray-500 mb-1 block">📁 O subir archivo de video</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={isFile ? clip.video_url : ""}
            onChange={(e) => onUpdate("video_url", e.target.value)}
            placeholder="URL directa (mp4, webm...)"
            className="flex-1 px-3 py-2 bg-white/5 rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 disabled:opacity-50 rounded-lg text-purple-400 cursor-pointer text-sm transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            {uploading ? (
              <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span>{uploading ? "Subiendo..." : "Subir"}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/ogg,video/mov,video/quicktime"
            className="hidden"
            onChange={(e) => handleUpload(e.target.files?.[0])}
          />
        </div>
        <p className="text-[10px] text-gray-600 mt-1">MP4, WebM, MOV — máx. 150MB</p>
      </div>

      {/* If no YouTube, show thumbnail field */}
      {!ytId && (
        <div>
          <label className="text-[11px] text-gray-500 mb-1 block">Miniatura (opcional)</label>
          <input
            type="text"
            value={clip.thumbnail_url || ""}
            onChange={(e) => onUpdate("thumbnail_url", e.target.value)}
            placeholder="URL de miniatura"
            className="w-full px-3 py-2 bg-white/5 rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
          />
        </div>
      )}

      <ClipPreview clip={clip} />
    </div>
  );
}

// ── Single story editor ────────────────────────────────────────────────────
function StoryEditor({ story, onChange, onRemove }) {
  const [imgUploading, setImgUploading] = useState(false);

  const set = (field, value) => onChange({ ...story, [field]: value });

  const handleImageUpload = async (file) => {
    if (!file) return;
    setImgUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      set("image", file_url);
    } catch (e) {
      alert("Error al subir imagen");
    } finally {
      setImgUploading(false);
    }
  };

  const clips = story.clips || [];

  const addClip = () => onChange({ ...story, clips: [...clips, { title: "", video_url: "", thumbnail_url: "" }] });

  const updateClip = (i, field, value) => {
    const next = clips.map((c, idx) => idx === i ? { ...c, [field]: value } : c);
    onChange({ ...story, clips: next });
  };

  const removeClip = (i) => onChange({ ...story, clips: clips.filter((_, idx) => idx !== i) });

  return (
    <div className="bg-white/[0.04] rounded-xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-white/[0.03] border-b border-white/[0.06]">
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 border border-white/10 flex-shrink-0">
          {story.image
            ? <img src={story.image} alt={story.name} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-white/20 text-lg font-bold">{story.name?.[0] || "?"}</div>
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-white truncate">{story.name || "Sin nombre"}</div>
          <div className="text-xs text-gray-500">{story.role || "—"}</div>
          <div className="text-xs text-purple-400 mt-0.5">{clips.length} clip{clips.length !== 1 ? "s" : ""}</div>
        </div>
        <button onClick={onRemove} className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Name */}
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Nombre del artista</label>
          <input type="text" value={story.name || ""} onChange={(e) => set("name", e.target.value)}
            className="w-full px-3 py-2 bg-white/5 rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
            placeholder="Carlos Mendoza" />
        </div>

        {/* Role */}
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Rol</label>
          <input type="text" value={story.role || ""} onChange={(e) => set("role", e.target.value)}
            className="w-full px-3 py-2 bg-white/5 rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
            placeholder="Artista Urbano" />
        </div>

        {/* Quote */}
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Testimonio</label>
          <textarea value={story.quote || ""} onChange={(e) => set("quote", e.target.value)} rows={3}
            className="w-full px-3 py-2 bg-white/5 rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500 resize-none"
            placeholder="Escribe el testimonio..." />
        </div>

        {/* Image */}
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Imagen de fondo (se usa solo si no hay video)</label>
          <div className="flex gap-2">
            <input type="text" value={story.image || ""} onChange={(e) => set("image", e.target.value)}
              className="flex-1 px-3 py-2 bg-white/5 rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
              placeholder="URL de imagen" />
            <label className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg text-emerald-400 cursor-pointer transition-colors flex items-center gap-1.5 flex-shrink-0 text-sm">
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e.target.files?.[0])} />
              <Upload className="w-4 h-4" />
              {imgUploading ? "Subiendo..." : "Subir"}
            </label>
          </div>
        </div>

        {/* ── Clips section — always open ── */}
        <div className="border-t border-white/10 pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-semibold text-white">Video Clips</span>
              <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{clips.length}</span>
            </div>
            <button type="button" onClick={addClip}
              className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-400 text-xs font-medium transition-colors flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" />
              Añadir clip
            </button>
          </div>

          <div className="space-y-3">
            {clips.length === 0 ? (
              <div className="py-6 border border-dashed border-white/10 rounded-xl text-center">
                <Film className="w-7 h-7 text-gray-600 mx-auto mb-2" />
                <p className="text-xs text-gray-500 mb-3">Sin clips. El fondo usará la imagen.</p>
                <button type="button" onClick={addClip}
                  className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-400 text-xs transition-colors">
                  + Añadir clip de video
                </button>
              </div>
            ) : (
              clips.map((clip, i) => (
                <ClipEditor
                  key={i}
                  clip={clip}
                  onUpdate={(field, value) => updateClip(i, field, value)}
                  onRemove={() => removeClip(i)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────
export default function StoriesEditor({ testimonials = [], onUpdate }) {
  // Local state — completely independent from parent prop after first load
  const initialized = useRef(false);
  const [items, setItems] = useState(() => testimonials);
  const [saved, setSaved] = useState(false);

  // Only sync from prop on first real load (when going from [] to actual data)
  const prevLength = useRef(testimonials.length);
  useEffect(() => {
    if (!initialized.current && testimonials.length > 0) {
      initialized.current = true;
      setItems(testimonials);
    }
    // Also sync if items were added externally (e.g. page reload)
    if (testimonials.length !== prevLength.current && initialized.current) {
      prevLength.current = testimonials.length;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testimonials.length]);

  const handleSave = useCallback(() => {
    onUpdate(items);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }, [items, onUpdate]);

  const addStory = () => {
    setItems(prev => [...prev, {
      id: Date.now(),
      name: "Nombre del artista",
      role: "Rol",
      quote: "Testimonio del artista...",
      image: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=1920&h=1080&fit=crop&q=80",
      clips: []
    }]);
  };

  const updateStory = (index, updated) => {
    setItems(prev => prev.map((item, i) => i === index ? updated : item));
  };

  const removeStory = (index) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-gray-400">{items.length} historia{items.length !== 1 ? "s" : ""}</span>
        <div className="flex items-center gap-2">
          <button onClick={addStory}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 text-sm transition-colors">
            <Plus className="w-4 h-4" />
            Añadir Historia
          </button>
          <button onClick={handleSave}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              saved
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-emerald-500 hover:bg-emerald-600 text-white"
            }`}>
            {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? "¡Guardado!" : "Guardar historias"}
          </button>
        </div>
      </div>

      {/* Stories list */}
      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-white/20 rounded-xl">
            <p className="text-gray-500 mb-4">No hay historias todavía</p>
            <button onClick={addStory}
              className="px-6 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg text-emerald-400 text-sm font-medium transition-colors">
              Añadir primera historia
            </button>
          </div>
        ) : (
          items.map((item, i) => (
            <StoryEditor
              key={item.id || i}
              story={item}
              onChange={(updated) => updateStory(i, updated)}
              onRemove={() => removeStory(i)}
            />
          ))
        )}
      </div>
    </div>
  );
}