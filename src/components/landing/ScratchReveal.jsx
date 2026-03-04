import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2 } from "lucide-react";

export default function ScratchReveal({ topImage, revealImage, audioUrl, youtubeLink }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const topImgRef = useRef(null);
  const revealImgRef = useRef(null);
  const audioRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showAudio, setShowAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [canScratch, setCanScratch] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Draw top image onto canvas, cover-fit
  const drawTop = useCallback(() => {
    const canvas = canvasRef.current;
    const img = topImgRef.current;
    if (!canvas || !img || !img.naturalWidth) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = width / height;
    let dw, dh, dx, dy;
    if (imgRatio > canvasRatio) {
      dh = height; dw = img.naturalWidth * (height / img.naturalHeight);
      dx = (width - dw) / 2; dy = 0;
    } else {
      dw = width; dh = img.naturalHeight * (width / img.naturalWidth);
      dx = 0; dy = (height - dh) / 2;
    }
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(img, dx, dy, dw, dh);
  }, []);

  // Sync canvas size to container and redraw
  const syncCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const { width, height } = container.getBoundingClientRect();
    if (width === 0 || height === 0) return;
    canvas.width = width;
    canvas.height = height;
    drawTop();
  }, [drawTop]);

  // Preload both images, mark ready when top is done
  useEffect(() => {
    if (!topImage) return;
    setReady(false);

    const top = new Image();
    top.crossOrigin = "anonymous";
    top.onload = () => {
      topImgRef.current = top;
      syncCanvas();
      setReady(true);
    };
    top.src = topImage;

    if (revealImage) {
      const rev = new Image();
      rev.crossOrigin = "anonymous";
      rev.src = revealImage;
      revealImgRef.current = rev;
    }
  }, [topImage, revealImage, syncCanvas]);

  // Keep canvas in sync with container resize
  useEffect(() => {
    const ro = new ResizeObserver(() => syncCanvas());
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [syncCanvas]);

  const scratch = useCallback((clientX, clientY) => {
    if (!canvasRef.current || isRevealed || !canScratch) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 80, 0, Math.PI * 2);
    ctx.fill();

    // Sample only 10% of pixels for performance
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparent = 0;
    const step = 40; // every 10th pixel (4 channels each)
    let total = 0;
    for (let i = 3; i < pixels.length; i += step) {
      if (pixels[i] === 0) transparent++;
      total++;
    }
    const pct = (transparent / total) * 100;

    if (pct > 50) {
      setCanScratch(false);
      setIsRevealed(true);
      setTimeout(() => setShowAudio(true), 800);
    }
  }, [isRevealed, canScratch]);

  const handleMouseMove = (e) => {
    scratch(e.clientX, e.clientY);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    scratch(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleTouchStart = (e) => {
    scratch(e.touches[0].clientX, e.touches[0].clientY);
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); } else { audioRef.current.play(); }
    setIsPlaying(!isPlaying);
  };

  // Auto-reset after reveal
  useEffect(() => {
    if (!isRevealed) return;
    const t = setTimeout(() => {
      setShowAudio(false);
      setTimeout(() => {
        setIsTransitioning(true);
        setIsRevealed(false);
        syncCanvas();
        setTimeout(() => {
          setIsTransitioning(false);
          setCanScratch(true);
        }, 800);
      }, 500);
    }, 2000);
    return () => clearTimeout(t);
  }, [isRevealed, syncCanvas]);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black">
      {/* Loading state */}
      {!ready && (
        <div className="absolute inset-0 z-30 bg-black flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
        </div>
      )}

      {/* Reveal image behind */}
      {revealImage && (
        <img
          src={revealImage}
          alt="Revealed"
          className="absolute inset-0 w-full h-full object-contain object-center"
        />
      )}

      {/* Scratch canvas */}
      <AnimatePresence>
        {ready && !isRevealed && (
          <motion.canvas
            ref={canvasRef}
            className="absolute inset-0 cursor-pointer touch-none"
            style={{ width: "100%", height: "100%" }}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.6 } }}
          />
        )}
      </AnimatePresence>

      {/* Burnout transition */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-yellow-500 via-orange-500 to-red-500 mix-blend-screen pointer-events-none"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          />
        )}
      </AnimatePresence>

      {/* Audio player */}
      <AnimatePresence>
        {showAudio && (audioUrl || youtubeLink) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.6 }}
            className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/90 to-transparent p-4 lg:p-6"
          >
            <div className="max-w-md mx-auto">
              <p className="text-xs text-white/80 mb-3 text-center font-medium">
                ¿Quieres escuchar cómo sonaría esta escena?
              </p>
              {audioUrl && (
                <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3">
                  <button
                    onClick={toggleAudio}
                    className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-purple-500 flex items-center justify-center hover:scale-105 transition-transform"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 text-white" fill="white" /> : <Play className="w-4 h-4 text-white" fill="white" />}
                  </button>
                  <div className="flex items-center gap-2 flex-1">
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-white/70">Dale play</span>
                  </div>
                  <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />
                </div>
              )}
              {youtubeLink && !audioUrl && (
                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                  <iframe
                    src={`https://www.youtube.com/embed/${extractYouTubeID(youtubeLink)}?autoplay=0`}
                    className="w-full h-16 lg:h-20"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function extractYouTubeID(url) {
  if (!url) return "";
  const match = url.match(/(?:youtu\.be\/|v\/|watch\?v=|embed\/)([^#&?]{11})/);
  return match ? match[1] : "";
}