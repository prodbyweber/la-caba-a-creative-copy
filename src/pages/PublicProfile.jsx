import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Share2, Music2, Film, Image as ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

function getYoutubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export default function PublicProfile() {
  const urlParams = new URLSearchParams(window.location.search);
  const profileId = urlParams.get("id");
  const [liked, setLiked] = useState(false);

  const { data: userProfile, isLoading } = useQuery({
    queryKey: ["public-profile", profileId],
    queryFn: async () => {
      if (!profileId) return null;
      const profiles = await base44.entities.UserProfile.list();
      return profiles.find(p => p.id === profileId);
    },
    enabled: !!profileId,
  });

  const { data: artist } = useQuery({
    queryKey: ["profile-artist", userProfile?.user_id],
    queryFn: async () => {
      if (!userProfile?.user_id) return null;
      const artists = await base44.entities.Artist.list();
      return artists.find(a => a.user_id === userProfile.user_id);
    },
    enabled: !!userProfile?.user_id,
  });

  const { data: explorarItems = [] } = useQuery({
    queryKey: ["profile-explorar-items", artist?.id],
    queryFn: async () => {
      if (!artist?.id) return [];
      const allItems = await base44.entities.ExplorarItem.filter({ is_active: true });
      return allItems.filter(item => {
        if (item.artist_id === artist.id) return true;
        if (item.credits?.some(c => c.artist_id === artist.id)) return true;
        return false;
      });
    },
    enabled: !!artist?.id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white flex items-center justify-center">
        <div className="animate-pulse">Cargando perfil...</div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white flex items-center justify-center">
        <p className="text-white/40">Perfil no encontrado</p>
      </div>
    );
  }

  const displayName = userProfile.display_name || userProfile.full_name || "Perfil";
  const avatarUrl = userProfile.avatar_url || artist?.avatar_url || "";
  const initials = displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  const photos = (userProfile.media_items || []).filter(m => m.type === "image");

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0b] via-[#0f0f10] to-[#0a0a0b] text-white overflow-hidden">
      {/* Hero Section */}
      <div className="relative">
        {/* Background blur effect */}
        {avatarUrl && (
          <div className="absolute inset-0 h-[400px]">
            <img
              src={avatarUrl}
              alt=""
              className="w-full h-full object-cover blur-2xl opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0b]/50 to-[#0a0a0b]" />
          </div>
        )}

        {/* Header */}
        <div className="relative z-10 px-4 sm:px-8 pt-6 pb-32">
          <Link to={createPageUrl("Explorar")}>
            <button className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Volver a Explorar</span>
            </button>
          </Link>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-center sm:items-end gap-6 relative"
          >
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl font-black text-white/30">{initials}</span>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center sm:text-left pb-4">
              <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Artista</p>
              <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-2" style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>
                {userProfile.artist_name || displayName}
              </h1>
              {artist?.genre && (
                <p className="text-white/60 text-sm mb-4">{artist.genre}</p>
              )}
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4">
                {(userProfile.role_tags || []).slice(0, 3).map((tag, i) => (
                  <span key={i} className="text-[10px] px-3 py-1 rounded-full bg-white/10 text-white/50">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex gap-3 justify-center sm:justify-start">
                <button
                  onClick={() => setLiked(!liked)}
                  className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <Heart className={`w-4 h-4 ${liked ? "fill-red-500 text-red-500" : ""}`} />
                  <span className="text-xs font-medium">{liked ? "Guardado" : "Guardar"}</span>
                </button>
                <button className="flex items-center gap-2 px-5 py-2 rounded-full border border-white/20 hover:border-white/40 transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="relative z-10 px-4 sm:px-8 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Bio */}
          {userProfile.bio && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-16"
            >
              <p className="text-white/70 text-sm leading-relaxed">{userProfile.bio}</p>
            </motion.div>
          )}

          {/* Projects Section */}
          {explorarItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-16"
            >
              <div className="flex items-center gap-2 mb-6">
                <Music2 className="w-5 h-5 text-white" />
                <h2 className="text-2xl font-bold text-white">Proyectos</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {explorarItems.slice(0, 12).map((item, idx) => {
                  const ytId = getYoutubeId(item.youtube_url || item.youtube_music_url);
                  const thumb = item.thumbnail_url || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : "");
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      className="group relative rounded-lg overflow-hidden bg-white/5 aspect-square cursor-pointer hover:shadow-lg transition-all"
                    >
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5">
                          <Music2 className="w-8 h-8 text-white/20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                        <p className="text-xs font-bold text-white line-clamp-2">{item.title}</p>
                        {item.year && <p className="text-[10px] text-white/50 mt-1">{item.year}</p>}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Photos Section */}
          {photos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-16"
            >
              <div className="flex items-center gap-2 mb-6">
                <ImageIcon className="w-5 h-5 text-white" />
                <h2 className="text-2xl font-bold text-white">Galería</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {photos.map((photo, idx) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    className="group relative rounded-lg overflow-hidden aspect-square"
                  >
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {explorarItems.length === 0 && photos.length === 0 && (
            <div className="text-center py-20">
              <p className="text-white/40 text-sm">Este perfil aún no tiene contenido</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}