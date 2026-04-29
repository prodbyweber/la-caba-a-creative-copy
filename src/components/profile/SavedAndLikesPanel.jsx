import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, BookmarkPlus, X, Plus, FolderPlus, Music2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function SavedAndLikesPanel({ userId }) {
  const [tab, setTab] = useState("likes"); // "likes" | "saved"
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const qc = useQueryClient();

  // Fetch saved clips/projects (usar Like entity para me gustas)
  const { data: likes = [] } = useQuery({
    queryKey: ["user-likes", userId],
    queryFn: async () => {
      if (!userId) return [];
      const allLikes = await base44.entities.Like.filter({ user_id: userId });
      return allLikes || [];
    },
    enabled: !!userId,
  });

  // Fetch saved (usar Save entity)
  const { data: saved = [] } = useQuery({
    queryKey: ["user-saved", userId],
    queryFn: async () => {
      if (!userId) return [];
      const allSaved = await base44.entities.Save.filter({ user_id: userId });
      return allSaved || [];
    },
    enabled: !!userId,
  });

  // Fetch playlists del usuario
  const { data: playlists = [] } = useQuery({
    queryKey: ["user-playlists", userId],
    queryFn: async () => {
      if (!userId) return [];
      // Aquí se asume que hay una entidad Playlist o similar
      // Si no existe, se puede crear o usar Save con un type="playlist"
      return [];
    },
    enabled: !!userId,
  });

  const createPlaylistMutation = useMutation({
    mutationFn: async (name) => {
      // Aquí se implementaría la creación de playlist
      // Por ahora es un placeholder
      return { id: Date.now(), name, items: [] };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-playlists", userId] });
      setNewPlaylistName("");
      setShowPlaylistModal(false);
    },
  });

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      createPlaylistMutation.mutate(newPlaylistName);
    }
  };

  function getYoutubeId(url) {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-0 border-b border-white/10">
        <button
          onClick={() => setTab("likes")}
          className={`relative flex items-center gap-2 px-4 pb-3 pt-1 text-sm font-semibold transition-colors ${
            tab === "likes" ? "text-white" : "text-white/30 hover:text-white/60"
          }`}
        >
          <Heart className="w-4 h-4" />
          Me gustas
          {likes.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-bold">
              {likes.length}
            </span>
          )}
          {tab === "likes" && (
            <motion.div
              layoutId="savedTabUnderline"
              className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-white"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
        </button>

        <button
          onClick={() => setTab("saved")}
          className={`relative flex items-center gap-2 px-4 pb-3 pt-1 text-sm font-semibold transition-colors ${
            tab === "saved" ? "text-white" : "text-white/30 hover:text-white/60"
          }`}
        >
          <BookmarkPlus className="w-4 h-4" />
          Guardado
          {saved.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">
              {saved.length}
            </span>
          )}
          {tab === "saved" && (
            <motion.div
              layoutId="savedTabUnderline"
              className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-white"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {tab === "likes" && (
          <motion.div
            key="likes"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {likes.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-12 h-12 text-white/10 mx-auto mb-3" />
                <p className="text-white/40 text-sm">No hay videos que te gusten aún</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {likes.map((like, idx) => (
                  <motion.div
                    key={like.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group relative rounded-lg overflow-hidden bg-white/[0.04] aspect-square cursor-pointer"
                  >
                    <div className="w-full h-full bg-gradient-to-br from-red-500/10 to-transparent flex items-center justify-center">
                      <Heart className="w-8 h-8 text-red-400/40 group-hover:text-red-400 transition-colors" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                      <p className="text-xs font-semibold text-white line-clamp-2">{like.item_title || "Item"}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {tab === "saved" && (
          <motion.div
            key="saved"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Playlists */}
            {playlists.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Playlists</h3>
                  <button
                    onClick={() => setShowPlaylistModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white text-xs font-medium transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    Nueva
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {playlists.map((playlist) => (
                    <div
                      key={playlist.id}
                      className="group relative rounded-lg overflow-hidden bg-gradient-to-br from-blue-500/10 to-purple-500/10 aspect-square cursor-pointer border border-white/[0.08] hover:border-white/20 transition-all p-4 flex flex-col justify-end"
                    >
                      <FolderPlus className="w-6 h-6 text-blue-400/60 mb-2" />
                      <p className="text-sm font-bold text-white line-clamp-2">{playlist.name}</p>
                      <p className="text-[10px] text-white/40 mt-1">{playlist.items?.length || 0} items</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Saved Items */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4">
                {playlists.length === 0 && (
                  <button
                    onClick={() => setShowPlaylistModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white text-sm font-medium transition-all mb-4"
                  >
                    <FolderPlus className="w-4 h-4" />
                    Crear playlist
                  </button>
                )}
                Guardados
              </h3>
              {saved.length === 0 ? (
                <div className="text-center py-12">
                  <BookmarkPlus className="w-12 h-12 text-white/10 mx-auto mb-3" />
                  <p className="text-white/40 text-sm">No hay videos guardados aún</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {saved.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group relative rounded-lg overflow-hidden bg-white/[0.04] aspect-square cursor-pointer"
                    >
                      <div className="w-full h-full bg-gradient-to-br from-blue-500/10 to-transparent flex items-center justify-center">
                        <BookmarkPlus className="w-8 h-8 text-blue-400/40 group-hover:text-blue-400 transition-colors" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                        <p className="text-xs font-semibold text-white line-clamp-2">{item.item_title || "Item"}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Playlist Modal */}
      <AnimatePresence>
        {showPlaylistModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#111113] rounded-2xl border border-white/10 w-full max-w-sm p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Nueva Playlist</h3>
                <button onClick={() => setShowPlaylistModal(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-white/50" />
                </button>
              </div>
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleCreatePlaylist()}
                placeholder="Nombre de la playlist"
                className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPlaylistModal(false)}
                  className="flex-1 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/60 text-sm font-medium transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreatePlaylist}
                  disabled={!newPlaylistName.trim() || createPlaylistMutation.isPending}
                  className="flex-1 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold transition-all disabled:opacity-50"
                >
                  Crear
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}