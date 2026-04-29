import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, User, Music2, Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ArtistPanelList() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = React.useState(null);
  const [authChecked, setAuthChecked] = React.useState(false);

  React.useEffect(() => {
    base44.auth.me().then(u => {
      setCurrentUser(u);
      setAuthChecked(true);
      // Solo admins pueden ver esta página
      if (u?.role !== 'admin') {
        navigate('/');
      }
    }).catch(() => {
      navigate('/');
    });
  }, []);

  const { data: artists, isLoading } = useQuery({
    queryKey: ['artists'],
    queryFn: () => base44.entities.Artist.list('-created_date'),
    enabled: authChecked && currentUser?.role === 'admin'
  });

  const { data: userProfile } = useQuery({
    queryKey: ['adminProfile', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      const profiles = await base44.entities.UserProfile.filter({ user_id: currentUser.id });
      return profiles[0] || null;
    },
    enabled: !!currentUser?.id
  });

  const { data: myArtist } = useQuery({
    queryKey: ['myArtist', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      const myArtists = await base44.entities.Artist.filter({ user_id: currentUser.id });
      return myArtists[0] || null;
    },
    enabled: !!currentUser?.id
  });

  const handleViewDashboard = (artistId) => {
    const url = createPageUrl("ArtistDashboard") + `?artistId=${artistId}`;
    navigate(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-black to-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl("Landing"))}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Panel de Artistas</h1>
            <p className="text-sm text-gray-400">Accede al dashboard de cada artista</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Tu cuenta - Destacada */}
        {currentUser && (
          <div className="mb-12">
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-4">Tu Cuenta</p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl overflow-hidden border-2 border-emerald-500/50 bg-gradient-to-b from-emerald-950/40 to-black shadow-2xl shadow-emerald-500/20 p-6"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center border-2 border-emerald-500/50">
                  <span className="text-2xl font-black text-white">{currentUser.full_name?.[0]?.toUpperCase() || "A"}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{currentUser.full_name}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">Admin</span>
                  </div>
                  <p className="text-sm text-gray-400">{currentUser.email}</p>
                </div>
              </div>

              {myArtist && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-gray-400 mb-1">Tu Artista Vinculado</p>
                    <p className="text-sm font-bold text-emerald-400">{myArtist.stageName}</p>
                  </div>
                  <button
                    onClick={() => handleViewDashboard(myArtist.id)}
                    className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/40 hover:bg-emerald-500/30 transition-colors"
                  >
                    <p className="text-xs text-gray-400 mb-1">Ver Mi Dashboard</p>
                    <p className="text-sm font-bold text-emerald-400">Acceder →</p>
                  </button>
                </div>
              )}

              <button
                onClick={() => navigate(createPageUrl("AdminDashboard"))}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold transition-all"
              >
                Panel de Admin
              </button>
            </motion.div>
          </div>
        )}
        
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && artists?.length === 0 && (
          <div className="text-center py-20">
            <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No hay artistas registrados</h3>
            <p className="text-sm text-gray-500">Los artistas aparecerán aquí cuando se registren en el sistema</p>
          </div>
        )}

        {!isLoading && artists && artists.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artists.map((artist, idx) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                whileHover={{ y: -4 }}
                className="relative rounded-2xl overflow-hidden border border-emerald-500/20 bg-gradient-to-b from-[#141414] to-black shadow-xl hover:shadow-emerald-500/10 transition-all"
              >
                <div className="p-6 space-y-4">
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    {artist.avatar_url ? (
                      <img
                        src={artist.avatar_url}
                        alt={artist.stageName}
                        className="w-16 h-16 rounded-xl object-cover border-2 border-emerald-500/50"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center border-2 border-emerald-500/50">
                        <span className="text-2xl font-black text-white">
                          {artist.stageName?.[0]?.toUpperCase() || "A"}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white truncate">{artist.stageName}</h3>
                      {artist.genre && (
                        <p className="text-sm text-gray-400 truncate">{artist.genre}</p>
                      )}
                      {artist.location && (
                        <p className="text-xs text-gray-500 truncate">{artist.location}</p>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Music2 className="w-3 h-3 text-emerald-400" />
                        <span className="text-xs text-gray-400">Status</span>
                      </div>
                      <span className={`text-xs font-bold ${
                        artist.status === 'Active' ? 'text-emerald-400' :
                        artist.status === 'Lead' ? 'text-yellow-400' :
                        'text-gray-400'
                      }`}>
                        {artist.status || 'Lead'}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Calendar className="w-3 h-3 text-purple-400" />
                        <span className="text-xs text-gray-400">Creado</span>
                      </div>
                      <span className="text-xs font-bold text-purple-400">
                        {new Date(artist.created_date).toLocaleDateString('es-ES', { 
                          day: '2-digit', 
                          month: 'short' 
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Bio Preview */}
                  {artist.bio && (
                    <p className="text-xs text-gray-400 line-clamp-2">{artist.bio}</p>
                  )}

                  {/* Action Button */}
                  <Button
                    onClick={() => handleViewDashboard(artist.id)}
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-medium"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver Dashboard
                  </Button>
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}