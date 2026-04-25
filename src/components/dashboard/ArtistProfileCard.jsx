import React from "react";
import { motion } from "framer-motion";
import { Edit } from "lucide-react";

export default function ArtistProfileCard({ compact = false, artist, onEditProfile }) {
  if (!artist) return null;

  // Both compact and full render the same minimal Instagram-style profile
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 px-3 py-2 rounded-xl border border-white/[0.06] bg-white/[0.02]"
    >
      {/* Avatar — small circle, cinematic, no color */}
      <div className="relative flex-shrink-0">
        <div className="w-9 h-9 rounded-full overflow-hidden bg-[#1c1c1e] border border-white/10">
          {artist.avatar_url ? (
            <img
              src={artist.avatar_url}
              alt={artist.stageName}
              className="w-full h-full object-cover object-top grayscale"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/30 font-semibold text-sm">
              {artist.stageName?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-white text-xs font-semibold leading-tight truncate">{artist.stageName}</p>
        {artist.genre && (
          <p className="text-white/25 text-[10px] truncate">{artist.genre}</p>
        )}
      </div>

      {/* Edit icon */}
      {onEditProfile && (
        <button
          onClick={onEditProfile}
          className="p-1.5 rounded-lg hover:bg-white/5 transition-colors flex-shrink-0"
        >
          <Edit className="w-3 h-3 text-white/25 hover:text-white/60" />
        </button>
      )}
    </motion.div>
  );
}