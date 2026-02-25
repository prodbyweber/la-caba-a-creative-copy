import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Loader, Calendar, Youtube, Instagram, Music2, Upload, Image as ImageIcon, Video } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

const platformConfig = {
  youtube: { name: "YouTube Shorts", icon: Youtube, maxChars: 5000 },
  instagram: { name: "Instagram Reels", icon: Instagram, maxChars: 2200 },
  tiktok: { name: "TikTok", icon: Music2, maxChars: 2200 }
};

export default function EditClipModal({ clip, onClose, onUpdate }) {
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [formData, setFormData] = useState({
    title: clip.title || "",
    artist_id: clip.artist_id || "",
    tags: clip.tags || [],
    project_id: clip.project_id || "",
    track_id: clip.track_id || "",
    featuring_artists: clip.featuring_artists || [],
    platforms: clip.platforms || [],
    caption_master: clip.caption_master || "",
    caption_youtube: clip.caption_youtube || "",
    caption_instagram: clip.caption_instagram || "",
    caption_tiktok: clip.caption_tiktok || "",
    hashtags: clip.hashtags || [],
    status: clip.status || "draft",
    scheduled_at: clip.scheduled_at || "",
    thumbnail_url: clip.thumbnail_url || ""
  });

  const [newTag, setNewTag] = useState("");
  const [newHashtag, setNewHashtag] = useState("");
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const { data: artists = [] } = useQuery({
    queryKey: ['artists'],
    queryFn: () => base44.entities.Artist.list(),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects', formData.artist_id],
    queryFn: () => {
      if (!formData.artist_id) return [];
      return base44.entities.Project.filter({ artist_id: formData.artist_id });
    },
    enabled: !!formData.artist_id,
  });

  const { data: tracks = [] } = useQuery({
    queryKey: ['tracks', formData.project_id],
    queryFn: () => {
      if (!formData.project_id) return [];
      return base44.entities.Track.filter({ project_id: formData.project_id });
    },
    enabled: !!formData.project_id,
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.entities.Clip.update(clip.id, formData);
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error saving clip:", error);
      alert("Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  const togglePlatform = (platform) => {
    const newPlatforms = formData.platforms.includes(platform)
      ? formData.platforms.filter(p => p !== platform)
      : [...formData.platforms, platform];
    setFormData({ ...formData, platforms: newPlatforms });
  };

  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData({ ...formData, tags: [...formData.tags, newTag] });
      setNewTag("");
    }
  };

  const removeTag = (tag) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const addHashtag = () => {
    if (newHashtag && !formData.hashtags.includes(newHashtag)) {
      setFormData({ ...formData, hashtags: [...formData.hashtags, newHashtag.replace('#', '')] });
      setNewHashtag("");
    }
  };

  const removeHashtag = (hashtag) => {
    setFormData({ ...formData, hashtags: formData.hashtags.filter(h => h !== hashtag) });
  };

  const copyCaptionToAll = () => {
    setFormData({
      ...formData,
      caption_youtube: formData.caption_master,
      caption_instagram: formData.caption_master,
      caption_tiktok: formData.caption_master
    });
  };

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingThumbnail(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, thumbnail_url: file_url });
    } catch (error) {
      alert("Error al subir la portada");
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const captureFrameFromVideo = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      
      setUploadingThumbnail(true);
      try {
        const file = new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' });
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setFormData({ ...formData, thumbnail_url: file_url });
      } catch (error) {
        alert("Error al capturar el frame");
      } finally {
        setUploadingThumbnail(false);
      }
    }, 'image/jpeg', 0.9);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#111113] rounded-2xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Editar Clip</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              disabled={saving}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6">
            {["general", "thumbnail", "captions", "schedule"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab
                    ? "bg-purple-500 text-white"
                    : "bg-white/5 text-gray-400 hover:text-white"
                }`}
              >
                {tab === "general" && "General"}
                {tab === "thumbnail" && "Portada"}
                {tab === "captions" && "Captions"}
                {tab === "schedule" && "Programar"}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "general" && (
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 block">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50 transition-colors"
                  placeholder="Título del clip"
                />
              </div>

              {/* Artist */}
              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 block">
                  Artista *
                </label>
                <select
                  value={formData.artist_id}
                  onChange={(e) => setFormData({ ...formData, artist_id: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50 transition-colors"
                >
                  <option value="">Seleccionar artista...</option>
                  {artists.map(artist => (
                    <option key={artist.id} value={artist.id}>
                      {artist.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Project */}
              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 block">
                  Proyecto / Campaña
                </label>
                <select
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50 transition-colors"
                >
                  <option value="">Sin proyecto</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Platforms */}
              <div>
                <label className="text-sm font-medium text-gray-400 mb-3 block">
                  Plataformas de publicación
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(platformConfig).map(([key, platform]) => {
                    const Icon = platform.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => togglePlatform(key)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.platforms.includes(key)
                            ? "bg-purple-500/10 border-purple-500/50 text-purple-400"
                            : "bg-white/5 border-white/10 hover:border-white/20 text-gray-400"
                        }`}
                      >
                        <Icon className="w-6 h-6 mx-auto mb-2" />
                        <div className="text-xs font-medium">{platform.name}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 block">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                    placeholder="Agregar tag..."
                  />
                  <button
                    onClick={addTag}
                    className="px-4 py-2 rounded-xl bg-purple-500 text-sm font-medium hover:bg-purple-600 transition-colors"
                  >
                    Agregar
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-white/5 text-sm flex items-center gap-2"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "thumbnail" && (
            <div className="space-y-6">
              {/* Current Thumbnail Preview */}
              <div>
                <label className="text-sm font-medium text-gray-400 mb-3 block">
                  Portada Actual
                </label>
                <div className="relative aspect-[9/16] max-w-sm mx-auto bg-[#0a0a0b] rounded-2xl overflow-hidden">
                  {formData.thumbnail_url ? (
                    <img 
                      src={formData.thumbnail_url} 
                      alt="Thumbnail" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-600" />
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Custom Thumbnail */}
              <div>
                <label className="text-sm font-medium text-gray-400 mb-3 block">
                  Subir Portada Personalizada
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingThumbnail}
                  className="w-full py-4 rounded-xl border-2 border-dashed border-white/10 hover:border-purple-500/50 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {uploadingThumbnail ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Subir imagen desde dispositivo
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Proporción recomendada: 9:16 (vertical)
                </p>
              </div>

              {/* Capture from Video */}
              <div>
                <label className="text-sm font-medium text-gray-400 mb-3 block">
                  Capturar desde Video
                </label>
                <div className="bg-[#0a0a0b] rounded-2xl p-4 space-y-4">
                  <div className="relative aspect-[9/16] max-w-xs mx-auto bg-black rounded-xl overflow-hidden">
                    <video
                      ref={videoRef}
                      src={clip.file_url}
                      className="w-full h-full object-contain"
                      controls
                    />
                  </div>
                  <button
                    onClick={captureFrameFromVideo}
                    disabled={uploadingThumbnail}
                    className="w-full py-3 rounded-xl bg-purple-500 hover:bg-purple-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {uploadingThumbnail ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Capturando...
                      </>
                    ) : (
                      <>
                        <Video className="w-4 h-4" />
                        Capturar frame actual
                      </>
                    )}
                  </button>
                  <p className="text-xs text-gray-500 text-center">
                    Reproduce el video y pausa en el momento que desees capturar
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "captions" && (
            <div className="space-y-6">
              {/* Master Caption */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-400">
                    Caption Principal
                  </label>
                  <button
                    onClick={copyCaptionToAll}
                    className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Copiar a todas las plataformas
                  </button>
                </div>
                <textarea
                  value={formData.caption_master}
                  onChange={(e) => setFormData({ ...formData, caption_master: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 h-32 resize-none focus:outline-none focus:border-purple-500/50 transition-colors"
                  placeholder="Escribe tu caption principal..."
                />
              </div>

              {/* Platform-specific Captions */}
              {Object.entries(platformConfig).map(([key, platform]) => {
                const Icon = platform.icon;
                const captionKey = `caption_${key}`;
                const currentLength = formData[captionKey]?.length || 0;
                
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {platform.name}
                      </label>
                      <span className={`text-xs ${
                        currentLength > platform.maxChars ? 'text-red-400' : 'text-gray-500'
                      }`}>
                        {currentLength} / {platform.maxChars}
                      </span>
                    </div>
                    <textarea
                      value={formData[captionKey]}
                      onChange={(e) => setFormData({ ...formData, [captionKey]: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 h-24 resize-none focus:outline-none focus:border-purple-500/50 transition-colors"
                      placeholder={`Caption para ${platform.name}...`}
                    />
                  </div>
                );
              })}

              {/* Hashtags */}
              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 block">
                  Hashtags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newHashtag}
                    onChange={(e) => setNewHashtag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addHashtag()}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                    placeholder="#hashtag"
                  />
                  <button
                    onClick={addHashtag}
                    className="px-4 py-2 rounded-xl bg-purple-500 text-sm font-medium hover:bg-purple-600 transition-colors"
                  >
                    Agregar
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.hashtags.map(hashtag => (
                    <span
                      key={hashtag}
                      className="px-3 py-1 rounded-full bg-purple-500/10 text-sm text-purple-400 flex items-center gap-2"
                    >
                      #{hashtag}
                      <button
                        onClick={() => removeHashtag(hashtag)}
                        className="hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "schedule" && (
            <div className="space-y-6">
              {/* Status */}
              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 block">
                  Estado
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50 transition-colors"
                >
                  <option value="draft">Borrador</option>
                  <option value="scheduled">Programado</option>
                  <option value="published">Publicado</option>
                </select>
              </div>

              {/* Schedule Date/Time */}
              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 block">
                  Fecha y hora de publicación
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_at ? new Date(formData.scheduled_at).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50 transition-colors"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Deja vacío para publicar manualmente
                </p>
              </div>

              {/* Quick Schedule Buttons */}
              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 block">
                  Programación rápida
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      const date = new Date();
                      date.setHours(date.getHours() + 1);
                      setFormData({ ...formData, scheduled_at: date.toISOString() });
                    }}
                    className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 text-sm transition-colors"
                  >
                    En 1 hora
                  </button>
                  <button
                    onClick={() => {
                      const date = new Date();
                      date.setDate(date.getDate() + 1);
                      setFormData({ ...formData, scheduled_at: date.toISOString() });
                    }}
                    className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 text-sm transition-colors"
                  >
                    Mañana
                  </button>
                  <button
                    onClick={() => {
                      const date = new Date();
                      date.setDate(date.getDate() + 7);
                      setFormData({ ...formData, scheduled_at: date.toISOString() });
                    }}
                    className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 text-sm transition-colors"
                  >
                    En 1 semana
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, scheduled_at: '' })}
                    className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-red-500/50 text-sm transition-colors"
                  >
                    Limpiar
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <p className="text-sm text-blue-400">
                  <strong>Nota:</strong> Los clips programados se publicarán automáticamente en las plataformas seleccionadas a la hora indicada. Asegúrate de haber conectado tus cuentas sociales.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl border border-white/10 font-medium text-sm hover:bg-white/5 transition-all disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !formData.title || !formData.artist_id}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 font-medium text-sm hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}