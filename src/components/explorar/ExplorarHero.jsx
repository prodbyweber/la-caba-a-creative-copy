import React, { useState } from "react";
import { motion } from "framer-motion";
import { Play, Info } from "lucide-react";

export default function ExplorarHero({ project, artist, onArtistClick }) {
  const [imgError, setImgError] = useState(false);

  const bg = !imgError && project?.cover_url
    ? project.cover_url
    : artist?.avatar_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1600&q=80";

  return (
    <div className="relative w-full" style={{ height: "85vh", minHeight: 500 }}>
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.img
          src={bg}
          alt={project?.title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 8, ease: "easeOut" }}
        />
        {/* Gradients */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(8,8,8,0.92) 35%, rgba(8,8,8,0.2) 100%)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(8,8,8,1) 0%, transparent 50%)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(8,8,8,0.4) 0%, transparent 30%)" }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end h-full px-6 sm:px-12 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-xl"
        >
          {/* Label */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#ff5833]">Destacado</span>
            {project?.type && (
              <>
                <span className="text-white/20 text-xs">·</span>
                <span className="text-[10px] text-white/50 uppercase tracking-wider">{project.type}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h1
            className="text-5xl sm:text-7xl font-black text-white mb-4 leading-none"
            style={{ fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "-0.03em" }}
          >
            {project?.title || "Cabaña Creative"}
          </h1>

          {/* Artist */}
          {artist && (
            <p className="text-white/60 text-sm mb-3 font-medium">
              por{" "}
              <span
                className="text-white cursor-pointer hover:text-[#ff5833] transition-colors"
                onClick={onArtistClick}
              >
                {artist.stageName}
              </span>
            </p>
          )}

          {/* Description */}
          {project?.description && (
            <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-sm line-clamp-3">
              {project.description}
            </p>
          )}

          {/* Buttons */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onArtistClick}
              className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-white/90 transition-colors text-sm"
            >
              <Play className="w-4 h-4" fill="black" />
              Explorar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onArtistClick}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-bold rounded-lg hover:bg-white/20 transition-colors text-sm border border-white/10"
            >
              <Info className="w-4 h-4" />
              Ver más
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}