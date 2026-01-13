import React from "react";
import { motion } from "framer-motion";
import { Star, TrendingUp, Award, Verified } from "lucide-react";

export default function ArtistProfileCard() {
  const stats = [
    { label: "Streams", value: 88 },
    { label: "Engagement", value: 92 },
    { label: "Reach", value: 85 },
    { label: "Growth", value: 94 },
    { label: "Content", value: 90 },
    { label: "Impact", value: 87 }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-gradient-to-br from-emerald-600/20 via-purple-600/20 to-pink-600/20 rounded-2xl border border-emerald-500/30 overflow-hidden backdrop-blur-sm"
    >
      <div className="relative p-6">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiLz48cGF0aCBkPSJNMjAgMGwyMCAyMEgyMHoiIGZpbGw9IiNmZmYiLz48L2c+PC9zdmc+')] opacity-20" />
        </div>

        <div className="relative grid grid-cols-[1fr,auto] gap-4">
          {/* Left Section - Stats */}
          <div className="space-y-4">
            {/* Rating Badge */}
            <div className="inline-flex flex-col items-center justify-center w-16 h-20 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-lg shadow-lg">
              <div className="text-3xl font-black text-white">92</div>
              <div className="text-[9px] font-bold text-emerald-900 uppercase tracking-wider">Overall</div>
            </div>

            {/* Artist Info */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">JLY</h3>
                <Verified className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400 uppercase">Urban Trap</span>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-400">Lleida, CAT</span>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-2">
              {stats.map((stat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-400 uppercase w-20">{stat.label}</span>
                  <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.value}%` }}
                      transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                    />
                  </div>
                  <span className="text-sm font-bold text-white w-7 text-right">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Section - Artist Image */}
          <div className="relative">
            <div className="w-32 h-48 sm:w-36 sm:h-52 relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-400/30 via-transparent to-transparent rounded-lg blur-xl" />
              
              {/* Image Container */}
              <div className="relative h-full rounded-lg overflow-hidden">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6965118e2b17684fa124077e/7c769de29_71b1d502-02cd-4c8e-8abb-31974036fa67.png"
                  alt="JLY"
                  className="w-full h-full object-cover object-top"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>

              {/* Pro Badge */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center gap-1.5 shadow-lg">
                <Star className="w-3 h-3 text-white" fill="white" />
                <span className="text-[10px] font-bold text-white uppercase tracking-wide">Pro</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-lg font-bold text-white">2.4M</div>
              <div className="text-[10px] text-gray-500 uppercase">Streams</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-400">#24</div>
              <div className="text-[10px] text-gray-500 uppercase">Ranking</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-400">+18%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}