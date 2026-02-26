import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Loader, Check, AlertCircle, Save, Video, Image as ImageIcon } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const platformConfig = {
  youtube: { name: "YouTube Shorts", maxChars: 5000 },
  instagram: { name: "Instagram Reels", maxChars: 2200 },
  tiktok: { name: "TikTok", maxChars: 2200 }
};

export default function ClipFormModal({ clip, onClose, artistId, mode = "edit" }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [newTag, setNewTag] = useState("");
  const [newHashtag, setNewHashtag] = useState("");
  
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState(
    clip ? {
      title: clip.title || "",
      artist_id: clip.artist_id || artistId || "",
      project_id: clip.project_id || "",
      track_id: clip.track_id || "",
      featuring_artists: clip.featuring_artists || [],
      platforms: clip.platforms || [],
      caption_master: clip.caption_master || "",
      caption_youtube: clip.caption_youtube || "",
      caption_instagram: clip.caption_instagram || "",
      caption_tiktok: clip.caption_tiktok || "",
      hashtags: clip.hashtags || [],
      tags: clip.tags || [],
      scheduled_at: clip.scheduled_at || "",
      thumbnail_url: clip.thumbnail_url || "",
      status: clip.status || "draft"
    } : {
      title: "",
      artist_id: artistId || "",
      project_id: "",
      track_id: "",
      featuring_artists: [],
      platforms: [],
      caption_master: "",
      caption_youtube: "",
      caption_instagram: "",
      caption_tiktok: "",
      hashtags: [],
      tags: [],
      scheduled_at: "",
      thumbnail_url: "",
      status: "draft"
    }
  );

  const { data: artists = [] } = useQuery({
    queryKey: ['artists'],
    queryFn: () => base44.entities.Artist.list(),
  });

  const { data: allTracks = [] } = useQuery({
    queryKey: ['allTracks', formData.artist_id],
    queryFn: async () => {
      if (!formData.artist_id) return [];
      const allProjectsData = await base44.entities.Project.list();
      const artistProjects = allProjectsData.filter(p => p.artist_id === formData.artist_id);
      const projectIds = artistProjects.map(p => p.id);
      
      const allTracksData = await base44.entities.Track.list();
      return allTracksData.filter(t => projectIds.includes(t.project_id));
    },
    enabled: !!formData.artist_id,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects', formData.artist_id],
    queryFn: () => {
      if (!formData.artist_id) return [];
      return base44.entities.Project.filter({ artist_id: formData.artist_id });
    },
    enabled: !!formData.artist_id,
  });

  const generateBriefId = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(file => {
      const isVideo = file.type.startsWith('video/');
      const isValidFormat = file.name.match(/\.(mp4|mov)$/i);
      return isVideo && isValidFormat;
    });

    setFiles(prev => [...prev, ...validFiles.map(file => ({
      file,
      id: generateBriefId(),
      status: 'pending',
      title: file.name.replace(/\.[^/.]+$/, "")
    }))]);
  };

  const handleUpload = async () => {
    if (!formData.artist_id) {
      alert("Por favor selecciona un artista");
      return;
    }

    setUploading(true);

    for (const fileObj of files) {
      if (fileObj.status === 'success') continue;

      try {
        setUploadProgress(prev => ({ ...prev, [fileObj.id]: 0 }));

        const uploadResponse = await base44.integrations.Core.UploadFile({
          file: fileObj.file
        });

        setUploadProgress(prev => ({ ...prev, [fileObj.id]: 50 }));

        const newClip = await base44.entities.Clip.create({
          title: fileObj.title,
          artist_id: formData.artist_id,
          project_id: formData.project_id || null,
          track_id: formData.track_id || null,
          file_url: uploadResponse.file_url,
          thumbnail_url: uploadResponse.file_url,
          clip_id: fileObj.id,
          status: "draft",
          platforms: [],
          hashtags: [],
          tags: [],
          featuring_artists: formData.featuring_artists
        });

        setUploadProgress(prev => ({ ...prev, [fileObj.id]: 100 }));
        setFiles(prev => prev.map(f => 
          f.id === fileObj.id ? { ...f, status: 'success', clipId: newClip.id } : f
        ));
        
        setFormData(prev => ({
          ...prev,
          clip_id: newClip.id,
          file_url: uploadResponse.file_url
        }));

      } catch (error) {
        console.error("Upload error:", error);
        setFiles(prev => prev.map(f => 
          f.id === fileObj.id ? { ...f, status: 'error', error: error.message } : f
        ));
      }
    }

    setUploading(false);
  };

  const handleSave = async () => {
    if (mode === "edit" && clip) {
      setSaving(true);
      try {
        await base44.entities.Clip.update(clip.id, formData);
        queryClient.invalidateQueries({ queryKey: ['clips'] });
        onClose();
      } catch (error) {
        console.error("Error saving clip:", error);
        alert("Error al guardar los cambios");
      } finally {
        setSaving(false);
      }
    }
  };

  const captureRandomFrame = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const randomTime = Math.random() * video.duration;
    video.currentTime = randomTime;

    video.onloadeddata = () => {
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
          setFormData(prev => ({
            ...prev,
            thumbnail_url: file_url
          }));
        } catch (error) {
          alert("Error al capturar el frame");
        } finally {
          setUploadingThumbnail(false);
        }
      }, 'image/jpeg', 0.9);
    };
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

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const updateFileTitle = (id, title) => {
    setFiles(prev => prev.map(f => 
      f.id === id ? { ...f, title } : f
    ));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#111113] rounded-2xl border border-white/10 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {mode === "edit" ? "Editar Clip" : "Subir y Editar Clips"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              disabled={uploading || saving}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 pt-6 border-b border-white/5 overflow-x-auto">
          {[
            { id: "general", label: "General" },
            { id: "thumbnail", label: "Portada" },
            { id: "captions", label: "Captions" },
            { id: "schedule", label: "Programar" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "text-white border-b-2 border-purple-500"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Upload Section (only in create mode) */}
          {mode === "upload" && activeTab === "general" && (
            <div className="space-y-4 mb-6">
              {files.length === 0 ? (
                <label className="block">
                  <input
                    type="file"
                    multiple
                    accept="video/mp4,video/quicktime,.mp4,.mov"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={uploading}
                  />
                  <div className="border-2 border-dashed border-white/10 rounded-2xl p-12 text-center hover:border-purple-500/50 transition-colors cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">
                      Arrastra archivos aquí o haz clic para seleccionar
                    </p>
                    <p className="text-sm text-gray-500">
                      Formatos: MP4, MOV • Orientación: 9:16 (vertical)
                    </p>
                  </div>
                </label>
              ) : (
                <div className="space-y-3">
                  {files.map(fileObj => (
                    <div
                      key={fileObj.id}
                      className="bg-[#0a0a0b] rounded-xl p-4 border border-white/5"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20">
                          <p className="text-xs font-mono font-semibold text-purple-400">{fileObj.id}</p>
                        </div>

                        <div className="mt-1">
                          {fileObj.status === 'pending' && (
                            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                              <Upload className="w-5 h-5 text-purple-400" />
                            </div>
                          )}
                          {fileObj.status === 'success' && (
                            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                              <Check className="w-5 h-5 text-green-400" />
                            </div>
                          )}
                          {fileObj.status === 'error' && (
                            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                              <AlertCircle className="w-5 h-5 text-red-400" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={fileObj.title}
                            onChange={(e) => updateFileTitle(fileObj.id, e.target.value)}
                            className="w-full bg-transparent border-none text-sm font-medium mb-1 focus:outline-none"
                            placeholder="Título del clip"
                            disabled={uploading}
                          />
                          <p className="text-xs text-gray-500">
                            {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          {fileObj.error && (
                            <p className="text-xs text-red-400 mt-1">{fileObj.error}</p>
                          )}
                          {uploadProgress[fileObj.id] !== undefined && fileObj.status !== 'success' && (
                            <div className="mt-2">
                              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-purple-500 transition-all duration-300"
                                  style={{ width: `${uploadProgress[fileObj.id]}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {!uploading && (
                          <button
                            onClick={() => removeFile(fileObj.id)}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {!uploading && (
                    <label className="block">
                      <input
                        type="file"
                        multiple
                        accept="video/mp4,video/quicktime,.mp4,.mov"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <div className="border border-dashed border-white/10 rounded-xl p-6 text-center hover:border-purple-500/50 transition-colors cursor-pointer">
                        <Upload className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Agregar más clips</p>
                      </div>
                    </label>
                  )}
                </div>
              )}
            </div>
          )}

          {/* General Tab */}
          {activeTab === "general" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 block">Título *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50"
                  placeholder="Título del clip"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 block">Artista</label>
                {mode === "edit" ? (
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <p className="text-sm text-purple-300 font-medium">
                      {artists.find(a => a.id === formData.artist_id)?.stageName || "N/A"}
                    </p>
                  </div>
                ) : (
                  <select
                    value={formData.artist_id}
                    onChange={(e) => setFormData({ ...formData, artist_id: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="">Seleccionar artista</option>
                    {artists.map(artist => (
                      <option key={artist.id} value={artist.id}>
                        {artist.stageName || artist.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 block">Proyecto (Opcional)</label>
                <select
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value, track_id: "" })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50"
                >
                  <option value="">Sin proyecto</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 block">Canción (Opcional)</label>
                <select
                  value={formData.track_id}
                  onChange={(e) => setFormData({ ...formData, track_id: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50"
                >
                  <option value="">Sin canción</option>
                  {allTracks.map(track => (
                    <option key={track.id} value={track.id}>{track.title}</option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 block">Tags</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500/50"
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
                    <span key={tag} className="px-3 py-1 rounded-full bg-white/5 text-sm flex items-center gap-2">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-red-400">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Thumbnail Tab */}
          {activeTab === "thumbnail" && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-400 mb-3 block">Portada Actual</label>
                <div className="relative aspect-[9/16] max-w-sm mx-auto bg-[#0a0a0b] rounded-2xl overflow-hidden">
                  {formData.thumbnail_url ? (
                    <img src={formData.thumbnail_url} alt="Thumbnail" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-600" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-400 mb-3 block">Subir Portada Personalizada</label>
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
                      Subir imagen
                    </>
                  )}
                </button>
              </div>

              {clip && (
                <div>
                  <label className="text-sm font-medium text-gray-400 mb-3 block">Capturar desde Video</label>
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
                      onClick={captureRandomFrame}
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
                          Capturar frame aleatorio
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Captions Tab */}
          {activeTab === "captions" && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-400">Caption Principal</label>
                  <button
                    onClick={copyCaptionToAll}
                    className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Copiar a todas
                  </button>
                </div>
                <textarea
                  value={formData.caption_master}
                  onChange={(e) => setFormData({ ...formData, caption_master: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 h-32 resize-none focus:outline-none focus:border-purple-500/50"
                  placeholder="Caption principal..."
                />
              </div>

              {Object.entries(platformConfig).map(([key, platform]) => {
                const captionKey = `caption_${key}`;
                const currentLength = formData[captionKey]?.length || 0;
                
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-400">{platform.name}</label>
                      <span className={`text-xs ${
                        currentLength > platform.maxChars ? 'text-red-400' : 'text-gray-500'
                      }`}>
                        {currentLength} / {platform.maxChars}
                      </span>
                    </div>
                    <textarea
                      value={formData[captionKey]}
                      onChange={(e) => setFormData({ ...formData, [captionKey]: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 h-24 resize-none focus:outline-none focus:border-purple-500/50"
                      placeholder={`Caption para ${platform.name}...`}
                    />
                  </div>
                );
              })}

              {/* Hashtags */}
              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 block">Hashtags</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newHashtag}
                    onChange={(e) => setNewHashtag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addHashtag()}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500/50"
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
                    <span key={hashtag} className="px-3 py-1 rounded-full bg-purple-500/10 text-sm text-purple-400 flex items-center gap-2">
                      #{hashtag}
                      <button onClick={() => removeHashtag(hashtag)} className="hover:text-red-400">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === "schedule" && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-400 mb-3 block">Plataformas</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(platformConfig).map(([key, platform]) => (
                    <button
                      key={key}
                      onClick={() => togglePlatform(key)}
                      className={`p-3 rounded-xl border-2 transition-all text-sm ${
                        formData.platforms.includes(key)
                          ? "bg-purple-500/10 border-purple-500/50 text-purple-400"
                          : "bg-white/5 border-white/10 hover:border-white/20"
                      }`}
                    >
                      {platform.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 block">Fecha y hora</label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_at ? new Date(formData.scheduled_at).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 flex items-center justify-between">
          {mode === "upload" && files.length > 0 && (
            <div className="text-sm text-gray-500">
              {files.length} archivo{files.length !== 1 ? 's' : ''} seleccionado{files.length !== 1 ? 's' : ''}
            </div>
          )}
          {mode === "edit" && <div />}
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={uploading || saving}
              className="px-6 py-2.5 rounded-xl border border-white/10 font-medium text-sm hover:bg-white/5 transition-all disabled:opacity-50"
            >
              {mode === "upload" ? "Cancelar" : "Cerrar"}
            </button>
            {mode === "upload" && files.length > 0 && (
              <button
                onClick={handleUpload}
                disabled={uploading || !formData.artist_id}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 font-medium text-sm hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Subir clips
                  </>
                )}
              </button>
            )}
            {mode === "edit" && (
              <button
                onClick={handleSave}
                disabled={saving || !formData.title}
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
                    Guardar
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}