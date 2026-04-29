import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Trash2, ExternalLink, Play, Loader2, Upload, Film } from "lucide-react";
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

function AddContentModal({ onClose, onAdd }) {
  const [tab, setTab] = useState("youtube");
  const [ytUrl, setYtUrl] = useState("");
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState("");
  const [fileType, setFileType] = useState("image");

  const ytId = getYoutubeId(ytUrl);
  const ytThumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;

  const handleUpload = async (file) => {
    if (!file) return;
    const maxMB = 20;
    if (file.size > maxMB * 1024 * 1024) {
      alert(`El archivo excede ${maxMB}MB`);
      return;
    }
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFileUrl(file_url);
      setFileType(file.type.startsWith("video/") ? "video" : "image");
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = () => {
    if (tab === "youtube" && ytId) {
      onAdd({ type: "youtube", url: ytUrl, title: title || "Sin título", thumbnail: ytThumb });
    } else if (tab === "media" && fileUrl) {
      onAdd({ type: fileType, url: fileUrl, title: title || "Sin título", thumbnail: fileType === "image" ? fileUrl : null });
    }
    onClose();
  };

  const canAdd = (tab === "youtube" && ytId) || (tab === "media" && fileUrl);
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
        className="bg-[#111] border border-white/[0.08] rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <p className="text-sm font-bold text-white">Añadir contenido</p>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex border-b border-white/[0.06] px-2">
          {[
            { key: "youtube", label: "YouTube" },
            { key: "media", label: "Imagen / Video" },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-all ${tab === t.key ? "text-white border-white/60" : "text-white/30 border-transparent hover:text-white/60"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-1.5 block">Título</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className={ic} placeholder="Nombre del contenido" />
          </div>

          {tab === "youtube" && (
            <div>
              <label className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-1.5 block">URL de YouTube</label>
              <input value={ytUrl} onChange={e => setYtUrl(e.target.value)} className={ic} placeholder="https://www.youtube.com/watch?v=..." />
              {ytThumb && (
                <div className="mt-2 rounded-xl overflow-hidden aspect-video bg-black/50">
                  <img src={ytThumb} alt="" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          )}

          {tab === "media" && (
            <div>
              <label className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-1.5 block">Archivo (máx. 20MB)</label>
              {fileUrl ? (
                <div className="relative rounded-xl overflow-hidden aspect-video bg-black/50">
                  {fileType === "video" ? (
                    <video src={fileUrl} className="w-full h-full object-cover" muted loop autoPlay playsInline />
                  ) : (
                    <img src={fileUrl} alt="" className="w-full h-full object-cover" />
                  )}
                  <button onClick={() => setFileUrl("")}
                    className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-lg text-white hover:bg-black/90 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className={`flex flex-col items-center justify-center gap-2 py-8 rounded-xl border border-dashed border-white/10 cursor-pointer hover:border-white/25 transition-colors ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                  <input type="file" accept="image/*,video/mp4,video/webm,video/mov" className="hidden"
                    onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
                  {uploading ? <Loader2 className="w-6 h-6 text-white/30 animate-spin" /> : <Upload className="w-6 h-6 text-white/20" />}
                  <span className="text-xs text-white/25">{uploading ? "Subiendo..." : "Imagen, video loop o portada"}</span>
                </label>
              )}
            </div>
          )}

          <button
            onClick={handleAdd}
            disabled={!canAdd}
            className="w-full py-3 rounded-xl bg-white text-black font-bold text-sm transition-all hover:bg-white/90 disabled:opacity-30 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Añadir a mi material
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ArtistMaterial({ artistId }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [playingYt, setPlayingYt] = useState(null);
  const qc = useQueryClient();

  const { data: userProfile } = useQuery({
    queryKey: ["user-profile-artist", artistId],
    queryFn: async () => {
      if (!artistId) return null;
      const artist = await base44.entities.Artist.filter({ id: artistId });
      if (!artist[0]?.user_id) return null;
      const profiles = await base44.entities.UserProfile.filter({ user_id: artist[0].user_id });
      return profiles[0] || null;
    },
    enabled: !!artistId,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.entities.UserProfile.update(userProfile.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-profile-artist", artistId] });
    },
  });

  const handleAddContent = (item) => {
    if (!userProfile) return;
    const current = userProfile?.media_items || [];
    updateProfileMutation.mutate({ media_items: [...current, { ...item, id: Date.now().toString() }] });
  };

  const handleRemoveContent = (id) => {
    if (!userProfile) return;
    const updated = (userProfile?.media_items || []).filter(m => m.id !== id);
    updateProfileMutation.mutate({ media_items: updated });
  };

  const mediaItems = userProfile?.media_items || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sm:bg-gradient-to-br sm:from-[#141414] sm:to-black sm:rounded-2xl sm:border sm:border-white/5 p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-white">Mi Material</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/[0.08] text-white/50 hover:text-white text-xs font-semibold transition-colors"
        >
          <Plus className="w-3 h-3" />
          Añadir
        </button>
      </div>

      {mediaItems.length === 0 ? (
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full py-12 rounded-2xl border border-dashed border-white/[0.06] flex flex-col items-center gap-3 text-center hover:border-white/15 transition-colors"
        >
          <Plus className="w-8 h-8 text-white/15" />
          <div>
            <p className="text-xs text-white/25">Añade tu material</p>
            <p className="text-[10px] text-white/12 mt-0.5">YouTube, imágenes, videos loop</p>
          </div>
        </button>
      ) : (
        <div className="space-y-2">
          {mediaItems.map((m, i) => {
            const thumb = m.thumbnail || (m.type === "youtube" ? getYoutubeThumbnail(m.url) : m.type === "image" ? m.url : null);
            return (
              <motion.div
                key={m.id || i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="group relative rounded-xl overflow-hidden bg-[#111] border border-white/[0.05]"
                style={{ aspectRatio: "16/9" }}
              >
                {thumb ? (
                  <img src={thumb} alt={m.title} className="w-full h-full object-cover" />
                ) : m.type === "video" ? (
                  <video src={m.url} className="w-full h-full object-cover" muted loop autoPlay playsInline />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Film className="w-8 h-8 text-white/10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {m.type === "youtube" && (
                  <button
                    onClick={() => setPlayingYt(getYoutubeId(m.url))}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
                      <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                    </div>
                  </button>
                )}

                {m.url && m.type !== "youtube" && (
                  <a href={m.url} target="_blank" rel="noopener noreferrer"
                    className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                    onClick={e => e.stopPropagation()}>
                    <ExternalLink className="w-3 h-3 text-white/60" />
                  </a>
                )}

                <button
                  onClick={() => handleRemoveContent(m.id)}
                  className="absolute top-2 left-2 p-1.5 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-900/60"
                >
                  <Trash2 className="w-3 h-3 text-white/60 hover:text-red-400" />
                </button>

                <div className="absolute bottom-0 left-0 right-0 p-2.5">
                  <p className="text-xs font-semibold text-white truncate">{m.title}</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider">{m.type}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showAddModal && (
          <AddContentModal onClose={() => setShowAddModal(false)} onAdd={handleAddContent} />
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
              <button onClick={() => setPlayingYt(null)}
                className="absolute -top-10 right-0 p-2 text-white/50 hover:text-white transition-colors">
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