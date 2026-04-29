import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { X, Save, Loader, Upload, Image as ImageIcon } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

export default function EditClipModal({ clip, onClose, onUpdate }) {
  const [saving, setSaving] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [formData, setFormData] = useState({
    title: clip.title || "",
    artist_id: clip.artist_id || "",
    tags: clip.tags || [],
    project_id: clip.project_id || "",
    track_id: clip.track_id || "",
    featuring_artists: clip.featuring_artists || [],
    status: clip.status || "published",
    thumbnail_url: clip.thumbnail_url || ""
  });

  const [newTag, setNewTag] = useState("");
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

  const { data: allProjectsForEdit = [] } = useQuery({
    queryKey: ['allProjectsForEdit', formData.artist_id],
    queryFn: async () => {
      if (!formData.artist_id) return [];
      return base44.entities.Project.filter({ artist_id: formData.artist_id });
    },
    enabled: !!formData.artist_id,
  });

  const { data: tracks = [] } = useQuery({
    queryKey: ['tracks', formData.artist_id],
    queryFn: async () => {
      if (!formData.artist_id) return [];
      const projectsData = await base44.entities.Project.filter({ artist_id: formData.artist_id });
      const projectIds = projectsData.map(p => p.id);
      const allTracksData = await base44.entities.Track.list();
      return allTracksData.filter(t => projectIds.includes(t.project_id));
    },
    enabled: !!formData.artist_id,
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


        </div>

        {/* Content */}
         <div className="flex-1 overflow-y-auto p-6">
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

              {/* Artist - Fixed */}
              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 block">
                  Artista
                </label>
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <p className="text-sm text-purple-300 font-medium">
                    {artists.find(a => a.id === formData.artist_id)?.stageName || artists.find(a => a.id === formData.artist_id)?.name || "N/A"}
                  </p>
                </div>
              </div>

              {/* Project */}
              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 block">
                  Proyecto (Opcional)
                </label>
                <select
                  value={formData.project_id}
                  onChange={(e) => {
                    setFormData({ ...formData, project_id: e.target.value, track_id: "" });
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50 transition-colors"
                  disabled={!formData.artist_id}
                >
                  <option value="">Sin proyecto</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Track */}
              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 block">
                  Canción (Opcional)
                </label>
                <select
                  value={formData.track_id}
                  onChange={(e) => setFormData({ ...formData, track_id: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50 transition-colors"
                  disabled={!formData.artist_id}
                >
                  <option value="">Sin canción</option>
                  {tracks.map(track => (
                    <option key={track.id} value={track.id}>
                      {track.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Collaborators */}
              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 block">
                  Artistas Colaboradores
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto bg-white/5 border border-white/10 rounded-xl p-3">
                  {artists.filter(a => a.id !== formData.artist_id).map(artist => (
                    <label key={artist.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.featuring_artists.includes(artist.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              featuring_artists: [...formData.featuring_artists, artist.id]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              featuring_artists: formData.featuring_artists.filter(id => id !== artist.id)
                            });
                          }
                        }}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm">{artist.stageName || artist.name}</span>
                    </label>
                  ))}
                </div>
                {formData.featuring_artists.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {formData.featuring_artists.map(collabId => {
                      const artist = artists.find(a => a.id === collabId);
                      return (
                        <span key={collabId} className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs flex items-center gap-2">
                          {artist?.stageName || artist?.name}
                          <button
                            type="button"
                            onClick={() => setFormData({
                              ...formData,
                              featuring_artists: formData.featuring_artists.filter(id => id !== collabId)
                            })}
                            className="hover:text-purple-300"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Thumbnail */}
              <div>
                <label className="text-sm font-medium text-gray-400 mb-3 block">
                  Portada
                </label>
                <div className="relative aspect-[9/16] max-w-sm mx-auto bg-[#0a0a0b] rounded-2xl overflow-hidden mb-3">
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
                  className="w-full py-3 rounded-xl border-2 border-dashed border-white/10 hover:border-purple-500/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {uploadingThumbnail ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Cambiar portada
                    </>
                  )}
                </button>
              </div>

              {/* Status */}
              <div>
                <label className="text-sm font-medium text-gray-400 mb-3 block">
                  Estado del clip
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["draft", "scheduled", "published"].map(status => (
                    <button
                      key={status}
                      onClick={() => setFormData({ ...formData, status })}
                      className={`p-3 rounded-xl border-2 transition-all font-medium text-sm ${
                        formData.status === status
                          ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                          : "bg-white/5 border-white/10 hover:border-white/20 text-gray-400"
                      }`}
                    >
                      {status === "draft" && "Borrador"}
                      {status === "scheduled" && "Programado"}
                      {status === "published" && "Publicado"}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {formData.status === "draft" && "Visible solo para ti"}
                  {formData.status === "scheduled" && "Programado para publicar"}
                  {formData.status === "published" && "Visible en tu perfil público"}
                </p>
              </div>
              </div>


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