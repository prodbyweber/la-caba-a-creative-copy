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
      className="bg-gradient-to-b from-[#141414] to-black rounded-2xl border border-white/5 overflow-hidden shadow-2xl"
    >
      <div className="relative">
        {/* Artist Image - Full Width */}
        <div className="relative h-96 sm:h-[450px] overflow-visible">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6965118e2b17684fa124077e/5cdacd140_jlytransparente.png"
            alt="JLY"
            className="w-full h-full object-contain object-center scale-110"
          />
        </div>

        {/* Content overlay */}
        <div className="relative -mt-24 px-6 pb-6 z-20">
          <div className="grid grid-cols-[1fr,auto] gap-4 items-end">
            {/* Left Section - Info */}
            <div className="space-y-3">
              {/* Artist Info */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight drop-shadow-lg">JLY</h3>
                  <Verified className="w-6 h-6 text-red-500" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-400">Urban / Catalan Trap</span>
                </div>
              </div>

              {/* Stats Compact */}
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-2xl font-bold text-white">2.4M</div>
                  <div className="text-xs text-gray-500">Streams</div>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div>
                  <div className="text-2xl font-bold text-red-500">#24</div>
                  <div className="text-xs text-gray-500">Ranking</div>
                </div>
              </div>
            </div>

            {/* Right Section - Rating Badge */}
            <div className="flex flex-col items-end gap-3">
              <div className="flex flex-col items-center justify-center w-20 h-24 bg-gradient-to-b from-red-600 to-red-800 rounded-lg shadow-2xl border-2 border-red-500/50">
                <div className="text-4xl font-black text-white">92</div>
                <div className="text-[10px] font-bold text-red-200 uppercase tracking-wider">Overall</div>
              </div>
              
              {/* Pro Badge */}
              <div className="px-3 py-1.5 bg-red-600 rounded-lg flex items-center gap-1.5 shadow-lg">
                <Star className="w-3.5 h-3.5 text-white" fill="white" />
                <span className="text-xs font-bold text-white uppercase tracking-wide">Pro</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-4 px-6 pb-6 grid grid-cols-3 gap-3">
          {stats.slice(0, 3).map((stat, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/5">
              <div className="text-xs text-gray-500 mb-1 uppercase">{stat.label}</div>
              <div className="text-xl font-bold text-white">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}