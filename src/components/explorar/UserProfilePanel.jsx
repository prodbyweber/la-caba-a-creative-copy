import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Upload, Plus, Play, Trash2, ExternalLink,
  Youtube, Film, Music2, Image as ImageIcon, Link as LinkIcon,
  ChevronRight, Camera, Edit3, Check, Loader2, Heart, Bookmark,
  LayoutDashboard, ShieldCheck
} from "lucide-react";
import { Link } from "react-router-dom";
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

// ── Add Content Modal ──────────────────────────────────────────────────────
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

        {/* Tabs */}
        <div className="flex border-b border-white/[0.06] px-2">
          {[
            { key: "youtube", label: "YouTube", icon: Youtube },
            { key: "media", label: "Imagen / Video", icon: ImageIcon },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-all ${tab === t.key ? "text-white border-white/60" : "text-white/30 border-transparent hover:text-white/60"}`}
            >
              <t.icon className="w-3.5 h-3.5" />
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
            Añadir a mi perfil
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Panel ──────────────────────────────────────────────────────────────
export default function UserProfilePanel({ currentUser, explorarItems = [], artists = [], onClose }) {
  const qc = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState("");
  const [activeTab, setActiveTab] = useState("aparece");
  const [playingYt, setPlayingYt] = useState(null);

  // Load or create UserProfile for this user
  const { data: userProfile, isLoading } = useQuery({
    queryKey: ["user-profile-me", currentUser?.id],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_id: currentUser.id });
      if (profiles.length > 0) return profiles[0];
      // Create one
      const created = await base44.entities.UserProfile.create({
        user_id: currentUser.id,
        display_name: currentUser.full_name || "",
        avatar_url: "",
        bio: "",
        media_items: [],
        role_tags: [],
      });
      return created;
    },
    enabled: !!currentUser?.id,
  });

  useEffect(() => {
    if (userProfile) setBioText(userProfile.bio || "");
  }, [userProfile]);

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.entities.UserProfile.update(userProfile.id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user-profile-me", currentUser?.id] }),
  });

  const handleAvatarUpload = async (file) => {
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await updateProfileMutation.mutateAsync({ avatar_url: file_url });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleBioSave = () => {
    updateProfileMutation.mutate({ bio: bioText });
    setEditingBio(false);
  };

  const handleAddContent = (item) => {
    const current = userProfile?.media_items || [];
    updateProfileMutation.mutate({ media_items: [...current, { ...item, id: Date.now().toString() }] });
  };

  const handleRemoveContent = (id) => {
    const updated = (userProfile?.media_items || []).filter(m => m.id !== id);
    updateProfileMutation.mutate({ media_items: updated });
  };

  // Items where this user's linked artist appears (via credits or artist_id)
  const linkedArtist = artists.find(a => a.user_id === currentUser?.id);
  const appearsIn = explorarItems.filter(item => {
    if (!linkedArtist) return false;
    if (item.artist_id === linkedArtist.id) return true;
    if (item.credits?.some(c => c.artist_id === linkedArtist.id)) return true;
    return false;
  });

  const mediaItems = userProfile?.media_items || [];
  const displayName = userProfile?.display_name || currentUser?.full_name || "Usuario";
  const avatarUrl = userProfile?.avatar_url || linkedArtist?.avatar_url || "";
  const initials = displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  // Fetch likes and saves for this user
  const { data: likedItems = [] } = useQuery({
    queryKey: ["user-likes", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const likes = await base44.entities.Like.filter({ user_id: currentUser.id });
      const itemIds = likes.map(l => l.item_id);
      if (itemIds.length === 0) return [];
      const allItems = await base44.entities.ExplorarItem.filter({ is_active: true });
      return allItems.filter(item => itemIds.includes(item.id));
    },
    enabled: !!currentUser?.id,
  });

  const { data: savedItems = [] } = useQuery({
    queryKey: ["user-saves", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const saves = await base44.entities.Save.filter({ user_id: currentUser.id });
      const itemIds = saves.map(s => s.item_id);
      if (itemIds.length === 0) return [];
      const allItems = await base44.entities.ExplorarItem.filter({ is_active: true });
      return allItems.filter(item => itemIds.includes(item.id));
    },
    enabled: !!currentUser?.id,
  });

  const TABS = [
    { key: "aparece", label: "Aparece en" },
    { key: "likes", label: "Me gustas", count: likedItems.length },
    { key: "saves", label: "Guardados", count: savedItems.length },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-xl overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 32, stiffness: 300 }}
          className="absolute right-0 top-0 bottom-0 w-full sm:w-[420px] bg-[#0a0a0a] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Perfil</p>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="w-6 h-6 text-white/20 animate-spin" />
            </div>
          ) : (
            <>
              {/* Hero / Avatar section */}
              <div className="relative pb-4">
                {/* Background hero — avatar blur grande */}
                <div className="relative w-full overflow-hidden" style={{ height: 140 }}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="w-full h-full object-cover scale-110"
                      style={{ filter: "brightness(0.45) saturate(1.2) blur(2px)" }} />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]" />
                  )}
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 30%, #0a0a0a 100%)" }} />
                </div>

                {/* Avatar flotante */}
                <div className="relative px-5 -mt-14 flex flex-col items-center text-center">
                  <div className="relative mb-3">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#0a0a0a] shadow-2xl bg-[#1a1a1a] flex items-center justify-center"
                      style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.8)" }}>
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl font-black text-white/30">{initials}</span>
                      )}
                    </div>
                    <label className={`absolute bottom-0.5 right-0.5 w-7 h-7 rounded-full bg-[#1a1a1a] border border-white/15 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors shadow-lg ${uploadingAvatar ? "opacity-50 pointer-events-none" : ""}`}>
                      <input type="file" accept="image/*" className="hidden"
                        onChange={e => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])} />
                      {uploadingAvatar ? <Loader2 className="w-3 h-3 text-white animate-spin" /> : <Camera className="w-3 h-3 text-white/60" />}
                    </label>
                  </div>

                  {/* Name + account type */}
                  <h2 className="text-xl font-black text-white tracking-tight mb-0.5"
                    style={{ fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "-0.03em" }}>
                    {linkedArtist?.stageName || displayName}
                  </h2>
                  {linkedArtist?.stageName && displayName !== linkedArtist.stageName && (
                    <p className="text-[11px] text-white/25 mb-0.5">{displayName}</p>
                  )}
                  <p className="text-[10px] text-white/20 mb-1">{currentUser?.email}</p>
                  {userProfile?.country_of_residence && (
                    <p className="text-[10px] text-white/30 mb-3">{userProfile.country_of_residence}{userProfile.address ? `, ${userProfile.address}` : ''}</p>
                  )}

                  {/* Genre + role tags */}
                  {(linkedArtist?.genre || (userProfile?.role_tags?.length > 0)) && (
                    <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                      {linkedArtist?.genre && (
                        <span className="text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full text-white/50"
                          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                          {linkedArtist.genre}
                        </span>
                      )}
                      {(userProfile?.role_tags || []).slice(0, 3).map((tag, i) => (
                        <span key={i} className="text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full text-white/40"
                          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Dashboard access buttons */}
                  {currentUser?.role === "admin" ? (
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                      <Link to="/AdminDashboard" onClick={onClose}>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white/70 hover:text-white transition-all"
                          style={{ background: "rgba(255,88,51,0.12)", border: "1px solid rgba(255,88,51,0.25)" }}>
                          <ShieldCheck className="w-3.5 h-3.5 text-[#ff5833]" />
                          Admin
                        </button>
                      </Link>
                      {linkedArtist && (
                        <Link to={`/ArtistDashboard?artistId=${linkedArtist.id}`} onClick={onClose}>
                          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white/50 hover:text-white transition-all"
                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                            <LayoutDashboard className="w-3.5 h-3.5" />
                            Mi dashboard
                          </button>
                        </Link>
                      )}
                      <Link to="/ArtistPanelList" onClick={onClose}>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white/50 hover:text-white transition-all"
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                          <LayoutDashboard className="w-3.5 h-3.5" />
                          Panel artistas
                        </button>
                      </Link>
                    </div>
                  ) : (
                    linkedArtist && (
                      <Link to={`/ArtistDashboard?artistId=${linkedArtist.id}`} onClick={onClose} className="w-full">
                        <button className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white transition-all"
                          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)" }}>
                          <LayoutDashboard className="w-3.5 h-3.5" />
                          Mi dashboard
                        </button>
                      </Link>
                    )
                  )}
                  {!currentUser?.role === "admin" && !linkedArtist && (
                    <div className="w-full px-3 py-2 rounded-lg text-center text-xs text-white/30"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      Sin perfil de artista vinculado
                    </div>
                  )}

                  {/* Public profile link */}
                  {userProfile?.username && (
                    <a
                      href={`/${userProfile.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors mb-3"
                      onClick={e => e.stopPropagation()}
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      cabana.cc/{userProfile.username}
                    </a>
                  )}

                  {/* Bio */}
                  <div className="w-full">
                    {editingBio ? (
                      <div className="space-y-2">
                        <textarea
                          value={bioText}
                          onChange={e => setBioText(e.target.value)}
                          rows={3}
                          autoFocus
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-white/25 placeholder-white/20 resize-none text-center"
                          placeholder="Tu bio..."
                        />
                        <div className="flex gap-2">
                          <button onClick={() => setEditingBio(false)} className="flex-1 py-2 rounded-xl bg-white/5 text-white/50 text-xs font-semibold">Cancelar</button>
                          <button onClick={handleBioSave} className="flex-1 py-2 rounded-xl bg-white text-black text-xs font-bold flex items-center justify-center gap-1">
                            <Check className="w-3 h-3" /> Guardar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setEditingBio(true)}
                        className="group w-full text-center text-sm text-white/35 hover:text-white/55 transition-colors leading-relaxed px-2">
                        {bioText || <span className="flex items-center justify-center gap-1 text-white/15 text-xs"><Edit3 className="w-3 h-3" />Añadir bio</span>}
                        {bioText && <Edit3 className="w-3 h-3 inline ml-1.5 opacity-0 group-hover:opacity-40 transition-opacity" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/[0.06] px-2 sticky top-0 bg-[#0a0a0a] z-10">
                {TABS.map(t => (
                  <button key={t.key} onClick={() => setActiveTab(t.key)}
                    className={`flex-1 py-3 text-xs font-semibold border-b-2 transition-all ${activeTab === t.key ? "text-white border-white/50" : "text-white/25 border-transparent hover:text-white/50"}`}>
                    {t.label}
                    {t.count && t.count > 0 && (
                      <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/40">{t.count}</span>
                    )}
                    {(t.key === "aparece" && appearsIn.length > 0) && (
                      <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/40">{appearsIn.length}</span>
                    )}
                    {t.key === "material" && mediaItems.length > 0 && (
                      <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/40">{mediaItems.length}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* ── TAB: Aparece en ── */}
              {activeTab === "aparece" && (
                <div className="px-4 py-5">
                  {appearsIn.length === 0 ? (
                    <div className="py-16 text-center">
                      <Film className="w-10 h-10 text-white/8 mx-auto mb-3" />
                      <p className="text-xs text-white/20">Aún no apareces en ningún proyecto.</p>
                      <p className="text-[10px] text-white/10 mt-1">Tu contenido aparecerá aquí cuando seas acreditado.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {appearsIn.map((item, i) => {
                        const thumb = item.thumbnail_url || getYoutubeThumbnail(item.youtube_url || item.youtube_music_url);
                        const ytId = getYoutubeId(item.youtube_url || item.youtube_music_url);
                        const isDirector = item.artist_id === linkedArtist?.id;
                        const credit = item.credits?.find(c => c.artist_id === linkedArtist?.id);
                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="group relative rounded-xl overflow-hidden bg-[#111] cursor-pointer"
                            style={{ aspectRatio: "3/4" }}
                            onClick={() => ytId && setPlayingYt(ytId)}
                          >
                            {thumb ? (
                              <img src={thumb} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Music2 className="w-8 h-8 text-white/10" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                            {ytId && (
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
                                  <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                                </div>
                              </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 p-2.5">
                              <p className="text-[11px] font-bold text-white truncate leading-tight">{item.title}</p>
                              <p className="text-[9px] text-white/40 mt-0.5">
                                {isDirector ? "Artista principal" : credit?.role || "Colaboración"}
                              </p>
                              {item.year && <p className="text-[9px] text-white/25">{item.year}</p>}
                            </div>
                            {item.content_type && (
                              <div className="absolute top-2 left-2">
                                <span className="text-[8px] bg-black/70 text-white/60 px-1.5 py-0.5 rounded font-medium uppercase tracking-wider">
                                  {item.content_type}
                                </span>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}



              {/* ── TAB: Me gustas ── */}
              {activeTab === "likes" && (
                <div className="px-4 py-5">
                  {likedItems.length === 0 ? (
                    <div className="py-16 text-center">
                      <Heart className="w-10 h-10 text-white/8 mx-auto mb-3" />
                      <p className="text-xs text-white/20">Sin favoritos aún.</p>
                      <p className="text-[10px] text-white/10 mt-1">Los proyectos que marques como favoritos aparecerán aquí.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {likedItems.map((item, i) => {
                        const thumb = item.thumbnail_url || getYoutubeThumbnail(item.youtube_url || item.youtube_music_url);
                        const ytId = getYoutubeId(item.youtube_url || item.youtube_music_url);
                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="group relative rounded-xl overflow-hidden bg-[#111] cursor-pointer"
                            style={{ aspectRatio: "3/4" }}
                            onClick={() => ytId && setPlayingYt(ytId)}
                          >
                            {thumb ? (
                              <img src={thumb} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Music2 className="w-8 h-8 text-white/10" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                            {ytId && (
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
                                  <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                                </div>
                              </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 p-2.5">
                              <p className="text-[11px] font-bold text-white truncate leading-tight">{item.title}</p>
                              {item.subtitle && <p className="text-[9px] text-white/40 mt-0.5">{item.subtitle}</p>}
                              {item.year && <p className="text-[9px] text-white/25">{item.year}</p>}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB: Guardados ── */}
              {activeTab === "saves" && (
                <div className="px-4 py-5">
                  {savedItems.length === 0 ? (
                    <div className="py-16 text-center">
                      <Film className="w-10 h-10 text-white/8 mx-auto mb-3" />
                      <p className="text-xs text-white/20">Sin guardados aún.</p>
                      <p className="text-[10px] text-white/10 mt-1">Los proyectos que guardes aparecerán aquí.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {savedItems.map((item, i) => {
                        const thumb = item.thumbnail_url || getYoutubeThumbnail(item.youtube_url || item.youtube_music_url);
                        const ytId = getYoutubeId(item.youtube_url || item.youtube_music_url);
                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="group relative rounded-xl overflow-hidden bg-[#111] cursor-pointer"
                            style={{ aspectRatio: "3/4" }}
                            onClick={() => ytId && setPlayingYt(ytId)}
                          >
                            {thumb ? (
                              <img src={thumb} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Music2 className="w-8 h-8 text-white/10" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                            {ytId && (
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
                                  <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                                </div>
                              </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 p-2.5">
                              <p className="text-[11px] font-bold text-white truncate leading-tight">{item.title}</p>
                              {item.subtitle && <p className="text-[9px] text-white/40 mt-0.5">{item.subtitle}</p>}
                              {item.year && <p className="text-[9px] text-white/25">{item.year}</p>}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </motion.div>
      </motion.div>

      {/* Add Content Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddContentModal onClose={() => setShowAddModal(false)} onAdd={handleAddContent} />
        )}
      </AnimatePresence>

      {/* YouTube Player Modal */}
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
    </>
  );
}