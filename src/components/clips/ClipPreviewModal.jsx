import React, { useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Play } from "lucide-react";

export default function ClipPreviewModal({ clip, onClose }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = React.useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-lg">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-auto rounded-2xl bg-[#111113] border border-white/10"
      >
        {/* Header with Back Button */}
        <div className="sticky top-0 z-10 bg-[#111113]/95 backdrop-blur border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          <h2 className="text-lg font-bold text-white flex-1 text-center px-4 line-clamp-1">{clip.title}</h2>
          <div className="w-16" />
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Video Player */}
          <div className="relative aspect-[9/16] max-w-sm mx-auto bg-black rounded-2xl overflow-hidden mb-6">
            <video
              ref={videoRef}
              src={clip.file_url}
              className="w-full h-full object-contain"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              controls
            />

            {/* Play Overlay */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={togglePlay}
                  className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                >
                  <Play className="w-6 h-6 text-white" fill="white" />
                </button>
              </div>
            )}
          </div>

          {/* Clip Info */}
          <div className="space-y-4 max-w-sm mx-auto">
            {/* Clip ID & Status */}
            <div className="flex items-center justify-between gap-3">
              <span className="px-3 py-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30 text-sm text-purple-300 font-mono font-bold">
                ID: {clip.clip_id || clip.id.slice(0, 5)}
              </span>
              <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                clip.status === 'draft' ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' :
                clip.status === 'published' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                clip.status === 'scheduled' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                'bg-gray-500/10 text-gray-400 border-gray-500/20'
              }`}>
                {clip.status}
              </span>
            </div>

            {/* Platforms */}
            {clip.platforms && clip.platforms.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Plataformas</p>
                <div className="flex gap-2 flex-wrap">
                  {clip.platforms.map(p => (
                    <span key={p} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Caption Preview */}
            {clip.caption_master && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Caption</p>
                <p className="text-sm text-gray-300 line-clamp-3">{clip.caption_master}</p>
              </div>
            )}

            {/* Hashtags */}
            {clip.hashtags && clip.hashtags.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Hashtags</p>
                <div className="flex gap-2 flex-wrap">
                  {clip.hashtags.map(tag => (
                    <span key={tag} className="text-xs text-purple-400">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}