import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
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

function getYoutubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export default function CreatorProfile() {
  const { username } = useParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
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

  // Fetch linked artist
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

  // Fetch explorer items (projects/content)
  const { data: explorarItems = [] } = useQuery({
    queryKey: ["creator-content", artist?.id],
    queryFn: async () => {
      if (!artist?.id) return [];
      const items = await base44.entities.ExplorarItem.filter({ artist_id: artist.id });
      return items;
    },
    enabled: !!artist?.id,
  });

  // Fetch published clips
  const { data: clips = [] } = useQuery({
    queryKey: ["creator-clips", artist?.id],
    queryFn: async () => {
      if (!artist?.id) return [];
      const allClips = await base44.entities.Clip.filter({ artist_id: artist.id });
      return allClips.filter(c => c.status === "published");
    },
    enabled: !!artist?.id,
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

        {/* Clips de Video */}
        {clips.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-black mb-6">Videos</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {clips.map((clip, i) => {
                const ytId = getYoutubeId(clip.file_url);
                const thumb = clip.thumbnail_url || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : "");
                return (
                  <motion.div
                    key={clip.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group relative rounded-xl overflow-hidden bg-gradient-to-br from-white/[0.04] to-white/[0.02] border border-white/[0.08] hover:border-white/15 transition-all aspect-square cursor-pointer"
                  >
                    {thumb ? (
                      <img src={thumb} alt={clip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/10 to-transparent">
                        <Music2 className="w-8 h-8 text-white/10" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                      <p className="text-xs font-bold text-white line-clamp-2">{clip.title}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Catálogo - Proyectos */}
         {explorarItems.length > 0 && (
           <div className="mb-12">
             <h2 className="text-2xl font-black mb-6">Catálogo</h2>
             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
               {explorarItems.map((item) => {
                 const ytId = getYoutubeId(item.youtube_url || item.youtube_music_url);
                 const thumb = item.thumbnail_url || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : "");
                 return (
                   <motion.div
                     key={item.id}
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="group relative rounded-xl overflow-hidden bg-gradient-to-br from-white/[0.04] to-white/[0.02] border border-white/[0.08] hover:border-white/15 transition-all cursor-pointer aspect-square"
                   >
                     {thumb ? (
                       <img src={thumb} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/10 to-transparent">
                         <Music2 className="w-8 h-8 text-white/10" />
                       </div>
                     )}
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                       <p className="text-xs font-bold text-white line-clamp-2">{item.title}</p>
                       <p className="text-[10px] text-white/50 mt-1">{item.content_type || "Proyecto"}</p>
                     </div>
                   </motion.div>
                 );
               })}
             </div>
           </div>
         )}
      </div>
    </div>
  );
}