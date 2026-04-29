import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Share2, Music2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import SavedAndLikesPanel from "@/components/profile/SavedAndLikesPanel";

function getYoutubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export default function UserPublicProfile() {
  const { username } = useParams();
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: userProfile, isLoading } = useQuery({
    queryKey: ["public-profile-username", username],
    queryFn: async () => {
      if (!username) return null;
      const profiles = await base44.entities.UserProfile.filter({ username });
      return profiles[0] || null;
    },
    enabled: !!username,
  });

  const { data: artist } = useQuery({
    queryKey: ["profile-artist", userProfile?.user_id],
    queryFn: async () => {
      if (!userProfile?.user_id) return null;
      const artists = await base44.entities.Artist.filter({ user_id: userProfile.user_id });
      return artists[0] || null;
    },
    enabled: !!userProfile?.user_id,
  });

  const { data: explorarItems = [] } = useQuery({
    queryKey: ["profile-explorar-items", artist?.id, userProfile?.user_id],
    queryFn: async () => {
      const allItems = await base44.entities.ExplorarItem.filter({ is_active: true });
      if (!artist?.id) return allItems.filter(item =>
        // fallback: items whose gallery items were uploaded by this user
        (item.gallery || []).some(g => g.uploader_user_id === userProfile?.user_id)
      );
      return allItems.filter(item => {
        if (item.artist_id === artist.id) return true;
        if (item.credits?.some(c => c.artist_id === artist.id)) return true;
        // Also items where user uploaded gallery content
        if ((item.gallery || []).some(g => g.uploader_user_id === userProfile?.user_id)) return true;
        return false;
      });
    },
    enabled: !!userProfile,
  });

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
          <img src="https://media.base44.com/images/public/6966ddf48947f217e81ea27c/6b7c4002a_Titulo.png" alt="" className="w-12 h-12 object-contain opacity-50" />
        </motion.div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex flex-col items-center justify-center gap-4">
        <p className="text-white/30 text-sm">@{username} no existe</p>
        <Link to="/Explorar" className="text-white/50 hover:text-white text-xs underline underline-offset-2 transition-colors">
          Ir a Explorar
        </Link>
      </div>
    );
  }

  const displayName = userProfile.artist_name || userProfile.display_name || userProfile.full_name || username;
  const avatarUrl = userProfile.avatar_url || userProfile.profile_photo_url || artist?.avatar_url || "";
  const initials = displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const photos = (userProfile.media_items || []).filter(m => m.type === "image");
  const youtubeItems = (userProfile.media_items || []).filter(m => m.type === "youtube");

  // Collect all public gallery items from explorar items (for this user/artist)
  const publicGalleryItems = explorarItems.flatMap(item =>
    (item.gallery || [])
      .filter(g => !g.restricted)
      .map(g => ({ ...g, projectTitle: item.title }))
  );

  return (
    <div className="min-h-screen bg-[#080808] text-white overflow-hidden">
      {/* Hero */}
      <div className="relative">
        {avatarUrl && (
          <div className="absolute inset-0 h-[420px]">
            <img src={avatarUrl} alt="" className="w-full h-full object-cover blur-2xl opacity-15" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#080808]/60 to-[#080808]" />
          </div>
        )}

        <div className="relative z-10 px-5 sm:px-10 pt-6 pb-20">
          <Link to="/Explorar">
            <button className="flex items-center gap-2 text-white/30 hover:text-white transition-colors mb-10 text-sm">
              <ArrowLeft className="w-4 h-4" />
              Explorar
            </button>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-center sm:items-end gap-6"
          >
            {/* Avatar */}
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-2 border-white/10 shadow-2xl bg-white/5 flex items-center justify-center flex-shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" style={{ objectPosition: userProfile.photo_position || "center" }} />
              ) : (
                <span className="text-4xl font-black text-white/20">{initials}</span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/25 mb-1.5">
                {userProfile.account_type === "artist" ? "Artista" : userProfile.account_type === "creator" ? "Creador" : "Marca"} · Cabaña Creative
              </p>
              <h1 className="text-3xl sm:text-5xl font-black text-white leading-none mb-2"
                style={{ fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "-0.03em" }}>
                {displayName}
              </h1>
              <p className="text-white/30 text-sm mb-1">@{userProfile.username}</p>
              {artist?.genre && <p className="text-white/40 text-sm mb-3">{artist.genre}</p>}
              {(userProfile.role_tags || []).length > 0 && (
                <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 mb-4">
                  {userProfile.role_tags.slice(0, 4).map((tag, i) => (
                    <span key={i} className="text-[9px] px-2.5 py-1 rounded-full bg-white/6 border border-white/8 text-white/40 uppercase tracking-widest">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2 justify-center sm:justify-start">
                <button onClick={() => setLiked(!liked)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/8 hover:bg-white/15 border border-white/10 transition-all text-xs font-semibold">
                  <Heart className={`w-3.5 h-3.5 ${liked ? "fill-red-500 text-red-500" : "text-white/60"}`} />
                  {liked ? "Guardado" : "Guardar"}
                </button>
                <button onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:border-white/25 transition-all text-xs font-semibold text-white/50 hover:text-white">
                  <Share2 className="w-3.5 h-3.5" />
                  {copied ? "¡Copiado!" : "Compartir"}
                </button>
                {artist?.social_links?.instagram && (
                  <a href={artist.social_links.instagram} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:border-white/25 transition-all text-xs font-semibold text-white/50 hover:text-white">
                    <ExternalLink className="w-3.5 h-3.5" />
                    Instagram
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-5 sm:px-10 pb-16 max-w-5xl mx-auto">
        {/* Bio */}
        {userProfile.bio && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="text-white/50 text-sm leading-relaxed mb-12 max-w-xl">
            {userProfile.bio}
          </motion.p>
        )}

        {/* Me gustas y Guardado */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-12">
          <SavedAndLikesPanel userId={userProfile?.user_id} />
        </motion.div>

        {/* Explorar Items */}
        {explorarItems.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-12">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/20 mb-4">Proyectos</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {explorarItems.slice(0, 12).map((item, idx) => {
                const ytId = getYoutubeId(item.youtube_url || item.youtube_music_url);
                const thumb = item.thumbnail_url || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : "");
                return (
                  <motion.div key={item.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.03 }}
                    className="group relative rounded-xl overflow-hidden bg-white/5 aspect-square cursor-pointer hover:scale-[1.02] transition-transform duration-300">
                    {thumb ? (
                      <img src={thumb} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music2 className="w-8 h-8 text-white/10" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                      <p className="text-xs font-bold text-white line-clamp-2">{item.title}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* YouTube content */}
        {youtubeItems.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-12">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/20 mb-4">Videos</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {youtubeItems.slice(0, 4).map((m, i) => {
                const ytId = getYoutubeId(m.url);
                const thumb = m.thumbnail || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : "");
                return (
                  <div key={m.id || i} className="group relative rounded-xl overflow-hidden bg-white/5 aspect-video cursor-pointer hover:scale-[1.01] transition-transform duration-300">
                    {thumb && <img src={thumb} alt={m.title} className="w-full h-full object-cover" />}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white ml-0.5" fill="white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                      <p className="text-xs font-semibold text-white truncate">{m.title}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Photos */}
        {photos.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-12">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/20 mb-4">Galería</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {photos.map((photo, idx) => (
                <div key={photo.id || idx} className="group relative rounded-xl overflow-hidden aspect-square">
                  <img src={photo.url} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Project Gallery — public items from this user's projects, TikTok-grid style */}
        {publicGalleryItems.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-12">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/20 mb-4">Contenido del catálogo</p>
            <div className="grid grid-cols-3 gap-1">
              {publicGalleryItems.slice(0, 12).map((g, idx) => {
                const ytId = g.type === "youtube_short"
                  ? (g.url?.match(/(?:shorts\/|youtu\.be\/|watch\?v=)([a-zA-Z0-9_-]{11})/) || [])[1]
                  : null;
                const thumb = g.type === "youtube_short" && ytId
                  ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
                  : g.url;
                return (
                  <div key={g.id || idx} className="group relative overflow-hidden bg-white/5" style={{ aspectRatio: "9/16" }}>
                    {thumb ? (
                      <img src={thumb} alt={g.caption || g.projectTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Music2 className="w-6 h-6 text-white/10" /></div>
                    )}
                    {g.type === "youtube_short" && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-white ml-0.5" fill="white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                      <p className="text-[10px] font-bold text-white line-clamp-1">{g.projectTitle}</p>
                      {g.caption && <p className="text-[9px] text-white/50 line-clamp-1">{g.caption}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {explorarItems.length === 0 && photos.length === 0 && youtubeItems.length === 0 && publicGalleryItems.length === 0 && (
          <div className="text-center py-20">
            <p className="text-white/20 text-sm">Perfil en construcción</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center pb-10 px-4">
        <Link to="/Explorar">
          <img src="https://media.base44.com/images/public/6966ddf48947f217e81ea27c/6b7c4002a_Titulo.png" alt="Cabaña" className="h-8 w-auto mx-auto opacity-20 hover:opacity-40 transition-opacity" />
        </Link>
      </div>
    </div>
  );
}