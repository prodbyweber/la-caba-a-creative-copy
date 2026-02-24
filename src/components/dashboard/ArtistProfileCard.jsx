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
        className="bg-gradient-to-r from-[#141414] to-black rounded-lg border border-white/5 p-2.5"
      >
        <div className="flex items-center gap-2.5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500 to-emerald-700">
              {artist.avatar_url ? (
                <img 
                  src={artist.avatar_url}
                  alt={artist.stageName}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                  {artist.stageName?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <h3 className="font-bold text-white text-sm">{artist.stageName}</h3>
              <Verified className="w-3 h-3 text-emerald-500" />
            </div>
            <p className="text-[10px] text-gray-500">{artist.genre || 'Artista'}</p>
          </div>

          {/* Rating & Pro Badge */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center justify-center w-9 h-11 bg-gradient-to-b from-emerald-600 to-emerald-800 rounded-lg border border-emerald-500/50">
              <div className="text-base font-black text-white">92</div>
              <div className="text-[7px] font-bold text-emerald-200 uppercase">Overall</div>
            </div>
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
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700">
              <span className="text-6xl font-black text-white/30">
                {artist.stageName?.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Content overlay */}
        <div className="relative px-3 pb-3 z-20">
          <div className="grid grid-cols-[1fr,auto] gap-2 items-start">
            {/* Left Section - Info */}
            <div className="space-y-1.5 bg-black/40 backdrop-blur-sm rounded-lg p-2.5 border border-white/10">
              {/* Artist Info */}
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">{artist.stageName}</h3>
                  <Verified className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium text-gray-400">{artist.genre || 'Artista'}</span>
                </div>
              </div>

              {/* Stats Compact */}
              <div className="flex items-center gap-2 pt-1">
                <div>
                  <div className="text-sm font-bold text-white">2.4M</div>
                  <div className="text-[8px] text-gray-500">Streams</div>
                </div>
                <div className="w-px h-6 bg-white/10" />
                <div>
                  <div className="text-sm font-bold text-emerald-500">#24</div>
                  <div className="text-[8px] text-gray-500">Ranking</div>
                </div>
              </div>
            </div>

            {/* Right Section - Rating Badge */}
            <div className="flex flex-col items-end gap-1.5">
              <div className="flex flex-col items-center justify-center w-12 h-16 bg-gradient-to-b from-emerald-600 to-emerald-800 rounded-lg border-2 border-emerald-500/50">
                <div className="text-2xl font-black text-white">92</div>
                <div className="text-[7px] font-bold text-emerald-200 uppercase">Overall</div>
              </div>
              
              {/* Pro Badge */}
              <div className="px-2 py-0.5 bg-emerald-600 rounded flex items-center gap-1">
                <Star className="w-2.5 h-2.5 text-white" fill="white" />
                <span className="text-[8px] font-bold text-white uppercase">Pro</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-2 px-3 pb-3 grid grid-cols-3 gap-1.5">
          {stats.slice(0, 3).map((stat, i) => (
            <div key={i} className="bg-black/40 backdrop-blur-sm rounded-lg p-2 border border-white/10">
              <div className="text-[8px] text-gray-500 mb-0.5 uppercase">{stat.label}</div>
              <div className="text-sm font-bold text-white">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}