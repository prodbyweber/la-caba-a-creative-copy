import React from "react";
import { motion } from "framer-motion";
import { Star, TrendingUp, Award, Verified } from "lucide-react";

export default function ArtistProfileCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-[#111113] rounded-2xl border border-white/5 overflow-hidden"
    >
      {/* Header Banner */}
      <div className="h-24 bg-gradient-to-r from-purple-600/30 via-pink-500/30 to-orange-500/30 relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiMxMTExMTMiIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNNjAgMEgwdjYwaDYwVjB6TTU5IDFIMXY1OGg1OFYxeiIgZmlsbD0iIzFhMWExYSIgZmlsbC1vcGFjaXR5PSIuMyIvPjwvZz48L3N2Zz4=')] opacity-30" />
      </div>

      {/* Profile Content */}
      <div className="px-6 pb-6 -mt-12 relative">
        {/* Avatar */}
        <div className="relative mb-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-4 border-[#111113] shadow-xl">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6965118e2b17684fa124077e/93ad1adc0_71b1d502-02cd-4c8e-8abb-31974036fa67.png"
              alt="JLY Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center border-2 border-[#111113]">
            <Verified className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Name & Info */}
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-1">JLY</h3>
          <p className="text-sm text-gray-500">Urban / Catalan Trap</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-[#0a0a0b] rounded-xl p-3">
            <div className="text-xs text-gray-500 mb-1">Rendimiento</div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-emerald-400">92</span>
              <div className="flex items-center text-xs text-emerald-400">
                <TrendingUp className="w-3 h-3 mr-0.5" />
                +8%
              </div>
            </div>
          </div>
          <div className="bg-[#0a0a0b] rounded-xl p-3">
            <div className="text-xs text-gray-500 mb-1">Rango</div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-orange-400">#24</span>
              <Award className="w-4 h-4 text-orange-400" />
            </div>
          </div>
        </div>

        {/* Membership Badge */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-medium">Miembro Pro</span>
          </div>
          <span className="text-xs text-gray-500">Desde 2023</span>
        </div>
      </div>
    </motion.div>
  );
}