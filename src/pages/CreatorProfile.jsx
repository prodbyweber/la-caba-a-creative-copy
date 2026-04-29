import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Share2, User, MapPin, Users, Plus, X, Music2 } from "lucide-react";
import { Link } from "react-router-dom";

const COUNTRY_ISO = {
  "España": "es", "México": "mx", "Argentina": "ar", "Colombia": "co",
  "Venezuela": "ve", "Perú": "pe", "Chile": "cl", "Ecuador": "ec",
  "Cuba": "cu", "Panamá": "pa", "Brasil": "br", "Uruguay": "uy",
  "Bolivia": "bo", "Paraguay": "py", "República Dominicana": "do",
  "Puerto Rico": "pr", "Estados Unidos": "us", "Canadá": "ca",
  "Reino Unido": "gb", "Francia": "fr", "Alemania": "de", "Italia": "it", "Portugal": "pt",
};

export default function CreatorProfile() {
  const { username } = useParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const qc = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(u => setCurrentUser(u)).catch(() => {});
  }, []);

  // Fetch user profile by username
  const { data: userProfile, isLoading } = useQuery({
    queryKey: ["creator-profile", username],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ username });
      return profiles[0] || null;
    },
    enabled: !!username,
  });

  // Fetch linked artist by user_id
  const { data: artist } = useQuery({
    queryKey: ["creator-artist", userProfile?.user_id],
    queryFn: async () => {
      if (!userProfile?.user_id) return null;
      const artists = await base44.entities.Artist.filter({ user_id: userProfile.user_id });
      return artists[0] || null;
    },
    enabled: !!userProfile?.user_id,
  });

  // Fetch follower count
  const { data: followers = [] } = useQuery({
    queryKey: ["followers", userProfile?.user_id],
    queryFn: () => base44.entities.Follow.filter({ following_user_id: userProfile?.user_id }),
    enabled: !!userProfile?.user_id,
  });

  // Fetch current user's follow status
  const { data: myFollow = [] } = useQuery({
    queryKey: ["my-follow", currentUser?.id, userProfile?.user_id],
    queryFn: () => base44.entities.Follow.filter({ 
      follower_user_id: currentUser?.id,
      following_user_id: userProfile?.user_id
    }),
    enabled: !!currentUser?.id && !!userProfile?.user_id,
  });

  // Fetch projects/explorar items from BOTH artist AND userProfile routes
  const { data: explorarItems = [] } = useQuery({
    queryKey: ["creator-content", artist?.id, userProfile?.id],
    queryFn: async () => {
      const items = [];
      // Si hay artista vinculado, obtener sus proyectos
      if (artist?.id) {
        const artistItems = await base44.entities.ExplorarItem.filter({ artist_id: artist.id });
        items.push(...artistItems);
      }
      // También obtener items donde el userProfile es el creador directo
      if (userProfile?.id) {
        const userItems = await base44.entities.ExplorarItem.filter({ user_profile_id: userProfile.id });
        items.push(...userItems);
      }
      // Remover duplicados
      const uniqueItems = Array.from(new Map(items.map(item => [item.id, item])).values());
      return uniqueItems.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: !!artist?.id || !!userProfile?.id,
  });

  // Toggle follow
  const toggleFollowMutation = useMutation({
    mutationFn: async () => {
      if (myFollow.length > 0) {
        await base44.entities.Follow.delete(myFollow[0].id);
      } else {
        await base44.entities.Follow.create({
          follower_user_id: currentUser?.id,
          following_user_id: userProfile?.user_id
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["followers", userProfile?.user_id] });
      qc.invalidateQueries({ queryKey: ["my-follow", currentUser?.id, userProfile?.user_id] });
      setIsFollowing(!isFollowing);
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white flex items-center justify-center">
        <p className="text-gray-400">Creador no encontrado</p>
      </div>
    );
  }

  const displayName = userProfile.artist_name || userProfile.display_name || userProfile.full_name || username;
  const avatarUrl = userProfile.avatar_url || userProfile.profile_photo_url;
  const countryCode = COUNTRY_ISO[userProfile.country_of_residence];
  const hasCountry = !!userProfile.country_of_residence;
  const hasCity = !!userProfile.address;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative w-full h-64 sm:h-80 bg-gradient-to-br from-purple-500/20 via-[#0a0a0b] to-[#0a0a0b] overflow-hidden"
      >
        {avatarUrl && (
          <img
            src={avatarUrl}
            alt={displayName}
            className="absolute inset-0 w-full h-full object-cover opacity-30 blur-lg"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/60 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <div className="flex items-end justify-between gap-6 w-full">
            {/* Avatar + Info */}
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl flex-shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-white/10 flex items-center justify-center">
                    <User className="w-12 h-12 text-white/30" />
                  </div>
                )}
              </div>
              <div className="flex-1 pb-2">
                <p className="text-xs sm:text-sm text-white/50 mb-1">Creador</p>
                <h1 className="text-3xl sm:text-5xl font-black leading-tight" style={{ letterSpacing: "-0.02em" }}>
                  {displayName}
                </h1>
              </div>
            </div>

            {/* Follow Button */}
            {currentUser && currentUser.id !== userProfile.user_id && (
              <button
                onClick={() => toggleFollowMutation.mutate()}
                disabled={toggleFollowMutation.isPending}
                className={`flex-shrink-0 px-6 py-2.5 rounded-full font-bold text-sm transition-all ${
                  isFollowing || myFollow.length > 0
                    ? "bg-white/10 border border-white/20 text-white hover:bg-white/20"
                    : "bg-white text-black hover:bg-white/90"
                }`}
              >
                {isFollowing || myFollow.length > 0 ? "Siguiendo" : "Seguir"}
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 text-center">
            <p className="text-3xl font-black mb-2">{followers.length}</p>
            <p className="text-xs text-white/50 uppercase tracking-widest">Manada</p>
          </div>
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 text-center">
            <p className="text-3xl font-black mb-2">{explorarItems.length}</p>
            <p className="text-xs text-white/50 uppercase tracking-widest">Proyectos</p>
          </div>
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 text-center">
            {hasCountry ? (
              <>
                {countryCode && (
                  <img src={`https://flagcdn.com/w60/${countryCode}.png`} alt={userProfile.country_of_residence} className="h-8 mx-auto mb-2" />
                )}
                <p className="text-xs text-white/60">{userProfile.country_of_residence}{hasCity ? `, ${userProfile.address}` : ""}</p>
              </>
            ) : (
              <p className="text-xs text-white/50">Sin ubicación</p>
            )}
          </div>
        </div>

        {/* Bio */}
        {userProfile.bio && (
          <div className="mb-12">
            <p className="text-lg text-white/80 leading-relaxed max-w-2xl">{userProfile.bio}</p>
          </div>
        )}

        {/* Projects Grid — Spotify-style banners */}
        <div>
          <h2 className="text-2xl font-black mb-6">Proyectos</h2>
          {explorarItems.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-white/40 text-sm">Sin proyectos aún</p>
            </div>
          ) : (
            <div className="space-y-6">
              {explorarItems.map((item, idx) => {
                const hasGallery = item.gallery && item.gallery.length > 0;
                const galleryImages = hasGallery ? item.gallery.filter(g => g.type === "image") : [];
                const galleryVideos = hasGallery ? item.gallery.filter(g => g.type === "youtube_short") : [];
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group relative rounded-2xl overflow-hidden bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-white/10 hover:border-white/30 transition-all"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-0">
                      {/* Main banner */}
                      <div className="sm:col-span-2 relative h-48 sm:h-64 overflow-hidden bg-black/40">
                        {item.thumbnail_url ? (
                          <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : item.preview_media_url ? (
                          <img src={item.preview_media_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                            <Music2 className="w-16 h-16 text-white/10" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                      </div>

                      {/* Info side */}
                      <div className="p-6 sm:p-8 flex flex-col justify-between bg-gradient-to-br from-white/5 to-transparent">
                        <div>
                          <p className="text-xs text-white/50 uppercase tracking-widest mb-2">{item.content_type || "Proyecto"}</p>
                          <h3 className="text-xl sm:text-2xl font-black mb-2 line-clamp-3">{item.title}</h3>
                          {item.description && <p className="text-sm text-white/60 line-clamp-2">{item.description}</p>}
                          {item.genres && item.genres.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {item.genres.slice(0, 3).map(g => (
                                <span key={g} className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/70">{g}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Gallery strip */}
                    {hasGallery && (
                      <div className="border-t border-white/10 p-4 bg-black/20">
                        <p className="text-xs text-white/50 uppercase tracking-widest mb-3">Galería</p>
                        <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
                          {galleryImages.map((img, i) => (
                            <button
                              key={`img-${i}`}
                              onClick={() => setSelectedMedia({ type: "image", url: img.url, caption: img.caption })}
                              className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-white/10 hover:border-white/30 transition-all hover:scale-105"
                            >
                              <img src={img.url} alt="" className="w-full h-full object-cover" />
                            </button>
                          ))}
                          {galleryVideos.map((vid, i) => {
                            const youtubeId = vid.url?.match(/(?:youtube\.com\/shorts\/|youtu\.be\/)([^\?&]+)/)?.[1];
                            return youtubeId ? (
                              <button
                                key={`vid-${i}`}
                                onClick={() => setSelectedMedia({ type: "youtube", videoId: youtubeId, caption: vid.caption })}
                                className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-white/10 hover:border-white/30 transition-all hover:scale-105 relative"
                              >
                                <img src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`} alt="" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                                  <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">▶</div>
                                </div>
                              </button>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Media Viewer Modal */}
        <AnimatePresence>
          {selectedMedia && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMedia(null)}
              className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={e => e.stopPropagation()}
                className="relative max-w-4xl w-full"
              >
                <button
                  onClick={() => setSelectedMedia(null)}
                  className="absolute -top-10 right-0 text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-8 h-8" />
                </button>
                
                {selectedMedia.type === "image" && (
                  <img src={selectedMedia.url} alt="" className="w-full rounded-xl" />
                )}
                
                {selectedMedia.type === "youtube" && (
                  <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-xl bg-black">
                    <iframe
                      className="absolute top-0 left-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${selectedMedia.videoId}`}
                      title="YouTube video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
                
                {selectedMedia.caption && (
                  <p className="mt-4 text-center text-white/70 text-sm">{selectedMedia.caption}</p>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}