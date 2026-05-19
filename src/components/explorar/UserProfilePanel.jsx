import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Heart, Bookmark, Plus, Play, Music2,
  ChevronRight, Loader2, ShieldCheck, Disc3
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

// ── Playlist detail view ─────────────────────────────────────────────────────
function PlaylistDetail({ title, icon, items, onBack, onPlayYt }) {
  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 32, stiffness: 300 }}
      className="absolute inset-0 bg-[#0a0a0a] overflow-y-auto z-10"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-safe pt-14 pb-4 sticky top-0 bg-[#0a0a0a]/95 backdrop-blur-sm z-10">
        <button onClick={onBack} className="p-1.5 rounded-full bg-white/8 hover:bg-white/15 transition-colors">
          <ChevronRight className="w-4 h-4 text-white rotate-180" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.08)" }}>
            {icon}
          </div>
          <p className="text-base font-black text-white tracking-tight">{title}</p>
        </div>
        <span className="ml-auto text-xs text-white/25">{items.length} items</span>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            {icon}
          </div>
          <p className="text-sm font-semibold text-white/40 mb-1">Vacío por ahora</p>
          <p className="text-xs text-white/20">Explora contenido y añade tus favoritos</p>
        </div>
      ) : (
        <div className="px-4 pb-8 space-y-1">
          {items.map((item, i) => {
            const thumb = item.thumbnail_url || getYoutubeThumbnail(item.youtube_url || item.youtube_music_url);
            const ytId = getYoutubeId(item.youtube_url || item.youtube_music_url);
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => ytId && onPlayYt(ytId)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-left"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#1a1a1a] flex-shrink-0">
                  {thumb ? (
                    <img src={thumb} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music2 className="w-5 h-5 text-white/15" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate leading-tight">{item.title}</p>
                  <p className="text-[11px] text-white/30 mt-0.5 truncate">{item.subtitle || item.content_type || "Cabaña Creative"}</p>
                </div>
                {ytId && <Play className="w-3.5 h-3.5 text-white/20 flex-shrink-0" />}
              </motion.button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

// ── Custom Playlist detail ────────────────────────────────────────────────────
function CustomPlaylistDetail({ playlist, onBack }) {
  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 32, stiffness: 300 }}
      className="absolute inset-0 bg-[#0a0a0a] overflow-y-auto z-10"
    >
      <div className="flex items-center gap-3 px-5 pt-14 pb-4 sticky top-0 bg-[#0a0a0a]/95 backdrop-blur-sm z-10">
        <button onClick={onBack} className="p-1.5 rounded-full bg-white/8 hover:bg-white/15 transition-colors">
          <ChevronRight className="w-4 h-4 text-white rotate-180" />
        </button>
        <p className="text-base font-black text-white tracking-tight">{playlist.name}</p>
        <span className="ml-auto text-xs text-white/25">0 items</span>
      </div>
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
          <Music2 className="w-7 h-7 text-white/20" />
        </div>
        <p className="text-sm font-semibold text-white/40 mb-1">Playlist vacía</p>
        <p className="text-xs text-white/20">Añade contenido desde Explorar</p>
      </div>
    </motion.div>
  );
}

// ── Create Playlist Modal ─────────────────────────────────────────────────────
function CreatePlaylistModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[600] bg-black/80 backdrop-blur-xl flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="w-full sm:max-w-md bg-[#111] rounded-t-2xl px-5 pt-5 pb-10"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <p className="text-base font-black text-white">Nueva playlist</p>
          <button onClick={onClose} className="p-1.5 rounded-full bg-white/8 hover:bg-white/15 transition-colors">
            <X className="w-4 h-4 text-white/50" />
          </button>
        </div>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          autoFocus
          placeholder="Nombre de la playlist..."
          className="w-full px-4 py-3 bg-white/[0.06] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/20 mb-4"
          onKeyDown={e => { if (e.key === "Enter" && name.trim()) onCreate(name.trim()); }}
        />
        <button
          onClick={() => name.trim() && onCreate(name.trim())}
          disabled={!name.trim()}
          className="w-full py-3.5 rounded-xl bg-white text-black text-sm font-black tracking-tight disabled:opacity-30 transition-opacity"
        >
          Crear
        </button>
      </motion.div>
    </motion.div>
  );
}

// ── Main Panel ───────────────────────────────────────────────────────────────
export default function UserProfilePanel({ currentUser, onClose }) {
  const qc = useQueryClient();
  const [activeDetail, setActiveDetail] = useState(null); // "likes" | "saves" | {id, name}
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [customPlaylists, setCustomPlaylists] = useState([]);
  const [playingYt, setPlayingYt] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Load UserProfile
  const { data: userProfile } = useQuery({
    queryKey: ["user-profile-me", currentUser?.id],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_id: currentUser.id });
      if (profiles.length > 0) return profiles[0];
      return base44.entities.UserProfile.create({
        user_id: currentUser.id,
        display_name: currentUser.full_name || "",
        avatar_url: "",
        bio: "",
        media_items: [],
        role_tags: [],
      });
    },
    enabled: !!currentUser?.id,
  });

  // Load playlists from userProfile extra field
  useEffect(() => {
    if (userProfile?.custom_playlists) {
      setCustomPlaylists(userProfile.custom_playlists);
    }
  }, [userProfile]);

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.entities.UserProfile.update(userProfile.id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user-profile-me", currentUser?.id] }),
  });

  const handleAvatarUpload = async (file) => {
    if (!file || !userProfile) return;
    setUploadingAvatar(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await updateProfileMutation.mutateAsync({ avatar_url: file_url });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCreatePlaylist = (name) => {
    const newList = [...customPlaylists, { id: Date.now().toString(), name }];
    setCustomPlaylists(newList);
    if (userProfile) updateProfileMutation.mutate({ custom_playlists: newList });
    setShowCreatePlaylist(false);
  };

  // Likes
  const { data: likedItems = [] } = useQuery({
    queryKey: ["user-likes", currentUser?.id],
    queryFn: async () => {
      const likes = await base44.entities.Like.filter({ user_id: currentUser.id });
      if (likes.length === 0) return [];
      const all = await base44.entities.ExplorarItem.filter({ is_active: true });
      const ids = new Set(likes.map(l => l.item_id));
      return all.filter(i => ids.has(i.id));
    },
    enabled: !!currentUser?.id,
  });

  // Saves
  const { data: savedItems = [] } = useQuery({
    queryKey: ["user-saves", currentUser?.id],
    queryFn: async () => {
      const saves = await base44.entities.Save.filter({ user_id: currentUser.id });
      if (saves.length === 0) return [];
      const all = await base44.entities.ExplorarItem.filter({ is_active: true });
      const ids = new Set(saves.map(s => s.item_id));
      return all.filter(i => ids.has(i.id));
    },
    enabled: !!currentUser?.id,
  });

  // Linked artist (creator/artist account)
  const { data: linkedArtist } = useQuery({
    queryKey: ["linked-artist-profile", currentUser?.id],
    queryFn: async () => {
      const results = await base44.entities.Artist.filter({ user_id: currentUser.id });
      return results[0] || null;
    },
    enabled: !!currentUser?.id,
    staleTime: 60000,
  });

  const displayName = userProfile?.display_name || currentUser?.full_name || "Usuario";
  const avatarUrl = userProfile?.avatar_url || linkedArtist?.avatar_url || "";
  const initials = displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  // Catalog URL: admin → Dashboard (catálogo general), artist/user → ArtistDashboard
  const catalogUrl = currentUser?.role === "admin"
    ? "/Dashboard"
    : linkedArtist
      ? `/ArtistDashboard?artistId=${linkedArtist.id}`
      : null;

  // Library items list
  const libraryItems = [
    {
      id: "likes",
      name: "Tus me gustas",
      subtitle: `Playlist · Cabaña`,
      count: likedItems.length,
      icon: <Heart className="w-5 h-5 text-white" fill="white" />,
      bgColor: "linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)",
    },
    {
      id: "saves",
      name: "Guardados",
      subtitle: `Playlist · Cabaña`,
      count: savedItems.length,
      icon: <Bookmark className="w-5 h-5 text-white" fill="white" />,
      bgColor: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)",
    },
    ...customPlaylists.map(pl => ({
      id: pl.id,
      name: pl.name,
      subtitle: "Playlist · Tú",
      count: 0,
      icon: <Music2 className="w-5 h-5 text-white/60" />,
      bgColor: "rgba(255,255,255,0.06)",
      isCustom: true,
      playlist: pl,
    })),
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-xl"
        onClick={onClose}
      />

      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] z-[500] bg-[#0a0a0a] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Main library view ── */}
        <div className="h-full overflow-y-auto">
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 pt-safe" style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 52px)" }}>
            <div className="flex items-center gap-3">
              {/* Avatar pequeño */}
              <label className="relative cursor-pointer flex-shrink-0">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-[#1a1a1a] flex items-center justify-center border border-white/10">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-black text-white/40">{initials}</span>
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])} />
                {uploadingAvatar && (
                  <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                    <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                  </div>
                )}
              </label>
              <h1 className="text-xl font-black text-white tracking-tight" style={{ letterSpacing: "-0.03em" }}>
                Tu biblioteca
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCreatePlaylist(true)}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-white/50 hover:text-white"
              >
                <Plus className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-white/40 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Admin / dashboard links */}
          {currentUser?.role === "admin" && (
            <div className="flex gap-2 px-5 mt-3">
              <Link to="/AdminDashboard" onClick={onClose}>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#ff5833] hover:text-white transition-all"
                  style={{ background: "rgba(255,88,51,0.12)", border: "1px solid rgba(255,88,51,0.2)" }}>
                  <ShieldCheck className="w-3 h-3" />
                  Admin
                </button>
              </Link>
            </div>
          )}

          {/* Tu catálogo — visible si tiene artista vinculado o es admin */}
          {catalogUrl && (
            <div className="px-5 mt-3">
              <Link to={catalogUrl} onClick={onClose}>
                <button
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all group"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(255,255,255,0.06)" }}>
                      <Disc3 className="w-3.5 h-3.5 text-white/50 group-hover:text-white transition-colors" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-white/70 group-hover:text-white transition-colors leading-tight">
                        Tu catálogo
                      </p>
                      {linkedArtist && (
                        <p className="text-[10px] text-white/25 mt-0.5 leading-tight">{linkedArtist.stageName}</p>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/40 transition-colors" />
                </button>
              </Link>

              {/* Perfil público */}
              {userProfile?.username && (
                <Link to={`/${userProfile.username}`} onClick={onClose}>
                  <button
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all group mt-1.5"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(255,255,255,0.06)" }}>
                        <ChevronRight className="w-3.5 h-3.5 text-white/50 group-hover:text-white transition-colors rotate-[-45deg]" />
                      </div>
                      <p className="text-xs font-bold text-white/70 group-hover:text-white transition-colors leading-tight">
                        Ver perfil público
                      </p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/40 transition-colors" />
                  </button>
                </Link>
              )}

            </div>
          )}

          {/* Sorting label */}
          <div className="flex items-center justify-between px-5 mt-5 mb-2">
            <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest">Recientes</p>
          </div>

          {/* Library list */}
          <div className="px-3 pb-safe pb-24 space-y-0.5">
            {libraryItems.map((item, i) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setActiveDetail(item.id === "likes" ? "likes" : item.id === "saves" ? "saves" : { id: item.id, name: item.name })}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.05] transition-colors text-left"
              >
                {/* Thumbnail / icon */}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                  style={{ background: item.bgColor }}
                >
                  {item.icon}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white truncate leading-tight">{item.name}</p>
                  <p className="text-[11px] text-white/30 mt-0.5 truncate">
                    {item.subtitle}
                    {item.count > 0 && ` · ${item.count}`}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Logout */}
          <div className="px-5 pb-8 mt-2">
            <button
              onClick={() => base44.auth.logout("/")}
              className="flex items-center gap-1.5 text-[10px] text-white/15 hover:text-red-400 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* ── Detail panels (Me gustas / Guardados / Custom) ── */}
        <AnimatePresence>
          {activeDetail === "likes" && (
            <PlaylistDetail
              title="Tus me gustas"
              icon={<Heart className="w-5 h-5 text-white/70" fill="currentColor" />}
              items={likedItems}
              onBack={() => setActiveDetail(null)}
              onPlayYt={setPlayingYt}
            />
          )}
          {activeDetail === "saves" && (
            <PlaylistDetail
              title="Guardados"
              icon={<Bookmark className="w-5 h-5 text-white/70" fill="currentColor" />}
              items={savedItems}
              onBack={() => setActiveDetail(null)}
              onPlayYt={setPlayingYt}
            />
          )}
          {activeDetail && typeof activeDetail === "object" && (
            <CustomPlaylistDetail
              playlist={activeDetail}
              onBack={() => setActiveDetail(null)}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Create playlist modal */}
      <AnimatePresence>
        {showCreatePlaylist && (
          <CreatePlaylistModal
            onClose={() => setShowCreatePlaylist(false)}
            onCreate={handleCreatePlaylist}
          />
        )}
      </AnimatePresence>

      {/* YouTube player */}
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