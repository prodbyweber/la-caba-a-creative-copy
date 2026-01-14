import React from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Star, TrendingUp, Award, Verified } from "lucide-react";

export default function ArtistProfileCard({ compact = false }) {
  const { data: artists = [] } = useQuery({
    queryKey: ['artists'],
    queryFn: () => base44.entities.Artist.list()
  });

  const jlyArtist = artists.find(artist => artist.stageName === "JLY");

  const stats = [
    { label: "Streams", value: 88 },
    { label: "Engagement", value: 92 },
    { label: "Reach", value: 85 },
    { label: "Growth", value: 94 },
    { label: "Content", value: 90 },
    { label: "Impact", value: 87 }
  ];

  const avatarUrl = jlyArtist?.avatar_url || "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6965118e2b17684fa124077e/5cdacd140_jlytransparente.png";
  const artistName = jlyArtist?.stageName || "JLY";
  const artistGenre = jlyArtist?.genre || "Urban / Trap";

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#141414] to-black rounded-xl border border-white/5 p-3"
      >
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-red-500/30 bg-gradient-to-br from-red-500 to-red-700">
              <img 
                src={avatarUrl}
                alt={artistName}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <h3 className="font-bold text-white text-sm">{artistName}</h3>
              <Verified className="w-3 h-3 text-red-500" />
            </div>
            <p className="text-xs text-gray-500">{artistGenre}</p>
          </div>

          {/* Rating & Pro Badge */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center justify-center w-10 h-12 bg-gradient-to-b from-red-600 to-red-800 rounded-lg border border-red-500/50">
              <div className="text-lg font-black text-white">92</div>
              <div className="text-[8px] font-bold text-red-200 uppercase">Overall</div>
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
      className="bg-gradient-to-b from-[#141414] to-black rounded-2xl border border-white/5 overflow-hidden shadow-2xl"
    >
      <div className="relative">
        {/* Artist Image - Full Width */}
        <div className="relative h-[450px] sm:h-[500px] overflow-visible pt-8">
          <img 
            src={avatarUrl}
            alt={artistName}
            className="w-full h-full object-contain object-top scale-100"
          />
        </div>

        {/* Content overlay */}
        <div className="relative px-6 pb-6 z-20">
          <div className="grid grid-cols-[1fr,auto] gap-4 items-start">
            {/* Left Section - Info */}
            <div className="space-y-2 bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              {/* Artist Info */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">{artistName}</h3>
                  <Verified className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-400">{artistGenre}</span>
                </div>
              </div>

              {/* Stats Compact */}
              <div className="flex items-center gap-3 pt-2">
                <div>
                  <div className="text-xl font-bold text-white">2.4M</div>
                  <div className="text-[10px] text-gray-500">Streams</div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div>
                  <div className="text-xl font-bold text-red-500">#24</div>
                  <div className="text-[10px] text-gray-500">Ranking</div>
                </div>
              </div>
            </div>

            {/* Right Section - Rating Badge */}
            <div className="flex flex-col items-end gap-2">
              <div className="flex flex-col items-center justify-center w-16 h-20 bg-gradient-to-b from-red-600 to-red-800 rounded-lg shadow-2xl border-2 border-red-500/50">
                <div className="text-3xl font-black text-white">92</div>
                <div className="text-[9px] font-bold text-red-200 uppercase tracking-wider">Overall</div>
              </div>
              
              {/* Pro Badge */}
              <div className="px-2.5 py-1 bg-red-600 rounded-lg flex items-center gap-1.5 shadow-lg">
                <Star className="w-3 h-3 text-white" fill="white" />
                <span className="text-[10px] font-bold text-white uppercase tracking-wide">Pro</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-3 px-6 pb-6 grid grid-cols-3 gap-2">
          {stats.slice(0, 3).map((stat, i) => (
            <div key={i} className="bg-black/40 backdrop-blur-sm rounded-lg p-2.5 border border-white/10">
              <div className="text-[10px] text-gray-500 mb-0.5 uppercase">{stat.label}</div>
              <div className="text-lg font-bold text-white">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}