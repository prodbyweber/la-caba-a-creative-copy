import React from "react";
import { motion } from "framer-motion";
import { Star, TrendingUp, Award, Verified } from "lucide-react";

export default function ArtistProfileCard({ compact = false, artist }) {
  if (!artist) return null;

  const stats = [
    { label: "Streams", value: 88 },
    { label: "Interacción", value: 92 },
    { label: "Alcance", value: 85 },
    { label: "Crecimiento", value: 94 },
    { label: "Contenido", value: 90 },
    { label: "Impacto", value: 87 }
  ];

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#141414] rounded-xl border border-white/5 p-4"
      >
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/10 bg-white/10">
              {artist.avatar_url ? (
                <img 
                  src={artist.avatar_url}
                  alt={artist.stageName}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                  {artist.stageName?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-white text-base">{artist.stageName}</h3>
              <Verified className="w-4 h-4 text-white/40" />
            </div>
            <p className="text-xs text-gray-500">{artist.genre || 'Artista'}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-gradient-to-b from-[#141414] to-black rounded-lg border border-white/5 overflow-hidden"
    >
      <div className="relative">
        {/* Artist Image - Reducido */}
        <div className="relative h-[180px] overflow-hidden">
          {artist.avatar_url ? (
            <img 
              src={artist.avatar_url}
              alt={artist.stageName}
              className="w-full h-full object-contain object-top"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white/10">
              <span className="text-6xl font-black text-white/30">
                {artist.stageName?.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Content overlay */}
        <div className="relative px-4 pb-4 z-20">
          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            {/* Artist Info */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-white">{artist.stageName}</h3>
                  <Verified className="w-5 h-5 text-white/40" />
                </div>
                <span className="text-sm text-gray-400">{artist.genre || 'Artista'}</span>
              </div>
              
              {/* Pro Badge */}
              <div className="px-3 py-1.5 bg-white/10 border border-white/10 rounded-lg flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-white" fill="white" />
                <span className="text-xs font-bold text-white uppercase">Pro</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}