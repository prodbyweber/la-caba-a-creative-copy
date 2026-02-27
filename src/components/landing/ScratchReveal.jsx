import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2 } from "lucide-react";

export default function ScratchReveal({ topImage, revealImage, audioUrl, youtubeLink }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const audioRef = useRef(null);
  const topImgRef = useRef(null);
  const cycleRef = useRef(0);

  const [phase, setPhase] = useState("scratching"); // "scratching" | "revealed" | "resetting"
  const [canvasKey, setCanvasKey] = useState(0);
  const [topReady, setTopReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Preload images once
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      topImgRef.current = img;
      setTopReady(true);
    };
    img.src = topImage;

    // Preload reveal image silently
    const rev = new Image();
    rev.crossOrigin = "anonymous";
    rev.src = revealImage;
  }, [topImage, revealImage]);

  // Draw top image on canvas whenever canvas is ready or key changes
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !topImgRef.current) return;

    const { width, height } = container.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = topImgRef.current;
    const imgRatio = img.width / img.height;
    const canvasRatio = width / height;

    let dw, dh, dx, dy;
    if (imgRatio > canvasRatio) {
      dh = height;
      dw = img.width * (height / img.height);
      dx = (width - dw) / 2;
      dy = 0;
    } else {
      dw = width;
      dh = img.height * (width / img.width);
      dx = 0;
      dy = (height - dh) / 2;
    }

    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, dx, dy, dw, dh);
  }, []);

  useEffect(() => {
    if (topReady && phase === "scratching") {
      // Small delay to ensure canvas DOM is mounted
      const t = setTimeout(initCanvas, 50);
      return () => clearTimeout(t);
    }
  }, [topReady, phase, canvasKey, initCanvas]);

  // Handle resize
  useEffect(() => {
    const onResize = () => {
      if (phase === "scratching") initCanvas();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [phase, initCanvas]);

  const getScratchPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e.touches && e.touches.length > 0) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const doScratch = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas || phase !== "scratching") return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getScratchPos(e, canvas);
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 80, 0, Math.PI * 2);
    ctx.fill();

    // Check reveal percentage
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let transparent = 0;
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] === 0) transparent++;
    }
    const pct = (transparent / (imageData.data.length / 4)) * 100;

    if (pct > 50) {
      setPhase("revealed");
    }
  }, [phase]);

  // Auto-reset after reveal
  useEffect(() => {
    if (phase !== "revealed") return;

    const showDuration = (audioUrl || youtubeLink) ? 5000 : 2500;
    const timer = setTimeout(() => {
      setPhase("resetting");

      setTimeout(() => {
        cycleRef.current += 1;
        setCanvasKey(k => k + 1);
        setIsPlaying(false);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        setPhase("scratching");
      }, 800);
    }, showDuration);

    return () => clearTimeout(timer);
  }, [phase, audioUrl, youtubeLink]);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div ref={containerRef} className="relative w-full h-full select-none overflow-hidden">
      {/* Reveal image behind */}
      {topReady && (
        <div className="absolute inset-0 bg-black">
          <img src={revealImage} alt="Revealed" className="w-full h-full object-cover object-center" />
        </div>
      )}

      {/* Scratch canvas */}
      {phase === "scratching" && topReady && (
        <canvas
          key={canvasKey}
          ref={canvasRef}
          className="absolute inset-0 touch-none"
          style={{ width: "100%", height: "100%", cursor: "crosshair" }}
          onMouseMove={(e) => doScratch(e)}
          onTouchStart={(e) => doScratch(e)}
          onTouchMove={(e) => { e.preventDefault(); doScratch(e); }}
        />
      )}

      {/* Reset flash overlay */}
      <AnimatePresence>
        {phase === "resetting" && (
          <motion.div
            className="absolute inset-0 bg-black pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        )}
      </AnimatePresence>

      {/* Scratch hint - show briefly at start */}
      <AnimatePresence>
        {phase === "scratching" && topReady && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 1 }}
            animate={{ opacity: [1, 0.6, 1, 0] }}
            transition={{ duration: 3, times: [0, 0.3, 0.6, 1] }}
          >
            <div className="bg-black/50 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2.5">
              <p className="text-white/80 text-sm font-medium tracking-wide">✦ Rasca para revelar</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audio / media player after reveal */}
      <AnimatePresence>
        {phase === "revealed" && (audioUrl || youtubeLink) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 lg:p-6"
          >
            <div className="max-w-md mx-auto">
              <p className="text-xs lg:text-sm text-white/80 mb-3 text-center font-medium">
                ¿Quieres escuchar cómo sonaría esta escena?
              </p>

              {audioUrl && (
                <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3">
                  <button
                    onClick={toggleAudio}
                    className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center hover:scale-105 transition-all"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 text-white" fill="white" />
                    ) : (
                      <Play className="w-4 h-4 text-white" fill="white" />
                    )}
                  </button>
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-white/50" />
                    <span className="text-xs text-white/70">Dale play</span>
                  </div>
                  <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />
                </div>
              )}

              {youtubeLink && !audioUrl && (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
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
  const match = url.match(/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
  return match && match[2].length === 11 ? match[2] : "";
}