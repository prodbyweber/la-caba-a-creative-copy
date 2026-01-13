import React, { useRef } from "react";
import { motion } from "framer-motion";
import { X, Play, Pause } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 hover:bg-white/10 rounded-lg transition-colors text-white z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Video Player */}
        <div className="relative aspect-[9/16] bg-black rounded-2xl overflow-hidden">
          <video
            ref={videoRef}
            src={clip.file_url}
            className="w-full h-full object-contain"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            controls
          />

          {/* Play/Pause Overlay */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={togglePlay}
                className="p-6 bg-purple-500/80 rounded-full hover:bg-purple-600/80 transition-colors"
              >
                <Play className="w-8 h-8 text-white" fill="white" />
              </button>
            </div>
          )}
        </div>

        {/* Title */}
        <div className="mt-4 text-center">
          <h3 className="text-lg font-semibold text-white">{clip.title}</h3>
        </div>
      </motion.div>
    </div>
  );
}