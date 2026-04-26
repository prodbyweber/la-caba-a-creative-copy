import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Info, X } from "lucide-react";

function getYoutubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export default function ExplorarHero({ item, artist, onExplore }) {
  const [showModal, setShowModal] = useState(false);
  const ytUrl = item?.youtube_url || item?.youtube_music_url;
  const ytId = getYoutubeId(ytUrl);
  const bg = item?.image || artist?.avatar_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1600&q=80";

  return (
    <>
    {/* YouTube Modal */}
    <AnimatePresence>
      {showModal && ytId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-4xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <p className="text-white font-bold text-sm truncate pr-4">{item?.title}</p>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            <div className="relative w-full rounded-xl overflow-hidden shadow-2xl" style={{ paddingBottom: "56.25%" }}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
                title={item?.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    <div className="relative w-full" style={{ height: "85vh", minHeight: 500 }}>
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.img
          src={bg}
          alt={item?.title}
          className="w-full h-full object-cover"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 8, ease: "easeOut" }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(8,8,8,0.93) 35%, rgba(8,8,8,0.2) 100%)" }} />
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
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#ff5833]">Destacado</span>
            {item?.subtitle && (
              <>
                <span className="text-white/20 text-xs">·</span>
                <span className="text-[10px] text-white/50 uppercase tracking-wider">{item.subtitle}</span>
              </>
            )}
          </div>

          <h1
            className="text-5xl sm:text-7xl font-black text-white mb-4 leading-none"
            style={{ fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "-0.03em" }}
          >
            {item?.title || "Cabaña Creative"}
          </h1>

          {artist && (
            <p className="text-white/60 text-sm mb-6 font-medium">
              por{" "}
              <span
                className="text-white cursor-pointer hover:text-[#ff5833] transition-colors"
                onClick={onExplore}
              >
                {artist.stageName}
              </span>
            </p>
          )}

          <div className="flex items-center gap-3">
            {ytId && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-white/90 transition-colors text-sm"
              >
                <Play className="w-4 h-4" fill="black" />
                Reproducir
              </motion.button>
            )}
            {artist && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onExplore}
                className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-bold rounded-lg hover:bg-white/20 transition-colors text-sm border border-white/10"
              >
                <Info className="w-4 h-4" />
                Ver artista
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
    </>
  );
}