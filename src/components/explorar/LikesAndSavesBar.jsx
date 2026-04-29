import React, { useState } from "react";
import { motion } from "framer-motion";
import { Heart, BookmarkPlus } from "lucide-react";

export default function LikesAndSavesBar({ userId }) {
  const [likeCount, setLikeCount] = useState(0);
  const [saveCount, setSaveCount] = useState(0);

  return (
    <div className="flex items-center gap-4 py-3 border-b border-white/10">
      {/* Me gustas */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 hover:border-red-500/40 hover:bg-red-500/15 text-red-400 transition-all"
      >
        <Heart className="w-4 h-4 fill-current" />
        <span className="text-sm font-semibold">Me gustas {likeCount > 0 && `(${likeCount})`}</span>
      </motion.button>

      {/* Guardado */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/15 text-blue-400 transition-all"
      >
        <BookmarkPlus className="w-4 h-4" />
        <span className="text-sm font-semibold">Guardado {saveCount > 0 && `(${saveCount})`}</span>
      </motion.button>
    </div>
  );
}