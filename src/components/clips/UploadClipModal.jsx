import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Youtube, Upload, Check, Loader2, Image as ImageIcon, Link } from "lucide-react";
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

const ic = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors";

export default function UploadClipModal({ onClose, artistId: passedArtistId }) {
  const qc = useQueryClient();
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [title, setTitle] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [thumbnailMode, setThumbnailMode] = useState("youtube"); // "youtube" | "upload"
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Resolver artist_id: usar el pasado o buscar del usuario actual
  const [artistId, setArtistId] = useState(passedArtistId || null);

  React.useEffect(() => {
    if (passedArtistId) {
      setArtistId(passedArtistId);
      return;
    }
    // Si no hay artistId, intentar resolver del usuario actual
    base44.auth.me().then(async (u) => {
      if (!u?.id) return;
      const artists = await base44.entities.Artist.filter({ user_id: u.id });
      if (artists[0]?.id) setArtistId(artists[0].id);
    }).catch(() => {});
  }, [passedArtistId]);

  const ytId = getYoutubeId(youtubeUrl);
  const ytThumb = getYoutubeThumbnail(youtubeUrl);
  const activeThumb = thumbnailMode === "youtube" ? ytThumb : thumbnailUrl;

  const { data: allTracks = [] } = useQuery({
    queryKey: ['allTracks', artistId],
    queryFn: async () => {
      if (!artistId) return [];
      const allProjectsData = await base44.entities.Project.list();
      const artistProjects = allProjectsData.filter(p => p.artist_id === artistId);
      const projectIds = artistProjects.map(p => p.id);
      const allTracksData = await base44.entities.Track.list();
      return allTracksData.filter(t => projectIds.includes(t.project_id));
    },
    enabled: !!artistId,
  });

  const [selectedTrack, setSelectedTrack] = useState("");

  const handleThumbUpload = async (file) => {
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      alert("La imagen de portada no puede superar los 15 MB");
      return;
    }
    setUploadingThumb(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setThumbnailUrl(file_url);
      setThumbnailMode("upload");
    } finally {
      setUploadingThumb(false);
    }
  };

  const handleSave = async () => {
    if (!ytId) { alert("Introduce un link de YouTube válido"); return; }
    if (!title.trim()) { alert("El título es obligatorio"); return; }
    if (!artistId) { alert("Error: No se pudo determinar el artista"); return; }
    setSaving(true);
    try {
      const selectedTrackData = allTracks.find(t => t.id === selectedTrack);
      await base44.entities.Clip.create({
        title: title.trim(),
        artist_id: artistId,
        project_id: selectedTrackData?.project_id || null,
        track_id: selectedTrack || null,
        file_url: youtubeUrl,
        thumbnail_url: activeThumb || ytThumb || "",
        clip_id: Math.random().toString(36).slice(2, 7),
        status: "draft",
        platforms: [],
        hashtags: [],
        tags: [],
        featuring_artists: [],
      });
      qc.invalidateQueries({ queryKey: ['clips'] });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#111113] rounded-2xl border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Youtube className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Nuevo Video</h2>
              <p className="text-xs text-white/30">Añadir video de YouTube al catálogo</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white/50" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* YouTube URL */}
          <div>
            <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">Link de YouTube *</label>
            <div className="relative">
              <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400/60" />
              <input
                type="text"
                value={youtubeUrl}
                onChange={e => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 transition-colors"
              />
            </div>
            {ytId && (
              <p className="text-[11px] text-emerald-400 mt-1.5 flex items-center gap-1">
                <Check className="w-3 h-3" /> Video detectado: {ytId}
              </p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">Título *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Nombre del video"
              className={ic}
            />
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">Portada</label>

            {/* Preview */}
            {(ytThumb || thumbnailUrl) && (
              <div className="relative mb-3 rounded-xl overflow-hidden bg-black" style={{ aspectRatio: "16/9" }}>
                <img
                  src={activeThumb || ytThumb}
                  alt="Portada"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 flex gap-1.5">
                  {ytThumb && (
                    <button
                      onClick={() => setThumbnailMode("youtube")}
                      className={`text-[9px] px-2 py-1 rounded-md font-semibold transition-all ${thumbnailMode === "youtube" ? "bg-red-500/80 text-white" : "bg-black/60 text-white/50 hover:text-white"}`}
                    >
                      YouTube
                    </button>
                  )}
                  {thumbnailUrl && (
                    <button
                      onClick={() => setThumbnailMode("upload")}
                      className={`text-[9px] px-2 py-1 rounded-md font-semibold transition-all ${thumbnailMode === "upload" ? "bg-purple-500/80 text-white" : "bg-black/60 text-white/50 hover:text-white"}`}
                    >
                      Subida
                    </button>
                  )}
                </div>
              </div>
            )}

            <label className={`flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/10 cursor-pointer hover:border-purple-500/40 transition-colors text-sm text-white/50 ${uploadingThumb ? "opacity-50 pointer-events-none" : ""}`}>
              <input type="file" accept="image/*,video/mp4,video/webm" className="hidden"
                onChange={e => e.target.files?.[0] && handleThumbUpload(e.target.files[0])} />
              {uploadingThumb ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploadingThumb ? "Subiendo portada..." : "Subir portada personalizada (img/video ≤15MB)"}
            </label>
            {ytThumb && !thumbnailUrl && (
              <p className="text-[10px] text-white/25 mt-1.5">Se usará la miniatura de YouTube por defecto.</p>
            )}
          </div>

          {/* Track (optional) */}
          <div>
            <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">Canción relacionada <span className="normal-case font-normal text-white/20">(opcional)</span></label>
            <select
              value={selectedTrack}
              onChange={e => setSelectedTrack(e.target.value)}
              className={ic}
            >
              <option value="">Sin canción</option>
              {allTracks.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/5 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!ytId || !title.trim() || saving}
            className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {saving ? "Guardando..." : "Añadir al catálogo"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}