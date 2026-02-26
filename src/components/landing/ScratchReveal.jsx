import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2 } from "lucide-react";

export default function ScratchReveal({ 
  topImage, 
  revealImage, 
  audioUrl, 
  youtubeLink 
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchPercentage, setScratchPercentage] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [showingTop, setShowingTop] = useState(true);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || dimensions.width === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // Fill with top image maintaining aspect ratio (cover)
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = topImage;
    img.onload = () => {
      const imgRatio = img.width / img.height;
      const canvasRatio = canvas.width / canvas.height;
      
      let drawWidth, drawHeight, offsetX, offsetY;
      
      if (imgRatio > canvasRatio) {
        // Image is wider than canvas
        drawHeight = canvas.height;
        drawWidth = img.width * (canvas.height / img.height);
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = 0;
      } else {
        // Image is taller than canvas
        drawWidth = canvas.width;
        drawHeight = img.height * (canvas.width / img.width);
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
      }
      
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };
  }, [topImage, dimensions]);

  const scratch = (e) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    let x, y;
    
    if (e.type.includes('touch')) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    // Scale coordinates
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    x *= scaleX;
    y *= scaleY;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 80, 0, Math.PI * 2);
    ctx.fill();

    // Calculate scratch percentage
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparent = 0;
    
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparent++;
    }
    
    const percentage = (transparent / (pixels.length / 4)) * 100;
    setScratchPercentage(percentage);

    if (showingTop && percentage > 50 && !isRevealed) {
      setIsRevealed(true);
      setShowingTop(false);
      setTimeout(() => {
        setShowAudioPlayer(true);
      }, 1000);
    } else if (!showingTop && percentage < 50) {
      setIsRevealed(false);
      setShowingTop(true);
      setShowAudioPlayer(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
    }
  };

  const handleMouseMove = (e) => {
    if (showingTop) {
      scratch(e);
    } else {
      paint(e);
    }
  };

  const paint = (e) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    let x, y;
    
    if (e.type.includes('touch')) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    x *= scaleX;
    y *= scaleY;

    ctx.globalCompositeOperation = 'source-over';
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = topImage;
    img.onload = () => {
      const imgRatio = img.width / img.height;
      const canvasRatio = canvas.width / canvas.height;
      
      let drawWidth, drawHeight, offsetX, offsetY;
      
      if (imgRatio > canvasRatio) {
        drawHeight = canvas.height;
        drawWidth = img.width * (canvas.height / img.height);
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = 0;
      } else {
        drawWidth = canvas.width;
        drawHeight = img.height * (canvas.width / img.width);
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
      }
      
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, 80, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      ctx.restore();
    };

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparent = 0;
    
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparent++;
    }
    
    const percentage = (transparent / (pixels.length / 4)) * 100;
    setScratchPercentage(percentage);

    if (percentage < 50) {
      scratch(e);
    }
  };

  const handleTouchStart = (e) => {
    setIsScratching(true);
    scratch(e);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    scratch(e);
  };

  const handleTouchEnd = () => {
    setIsScratching(false);
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const resetScratch = () => {
    setIsRevealed(false);
    setShowAudioPlayer(false);
    setScratchPercentage(0);
    setIsPlaying(false);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = topImage;
    img.onload = () => {
      ctx.globalCompositeOperation = 'source-over';
      
      const imgRatio = img.width / img.height;
      const canvasRatio = canvas.width / canvas.height;
      
      let drawWidth, drawHeight, offsetX, offsetY;
      
      if (imgRatio > canvasRatio) {
        drawHeight = canvas.height;
        drawWidth = img.width * (canvas.height / img.height);
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = 0;
      } else {
        drawWidth = canvas.width;
        drawHeight = img.height * (canvas.width / img.width);
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
      }
      
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };
  };



  return (
    <div ref={containerRef} className="relative w-full h-full">
      {/* Reveal Image (Behind) */}
      <div className="absolute inset-0">
        <img
          src={revealImage}
          alt="Revealed"
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Scratch Canvas */}
      <motion.canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-pointer touch-none"
        style={{ width: '100%', height: '100%', opacity: showingTop ? 1 : 0.99 }}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      {/* Scratch Instruction */}
      {scratchPercentage < 5 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="px-6 py-3 bg-black/60 backdrop-blur-xl rounded-xl border border-white/10">
            <p className="text-sm text-white/90 font-medium">
              <span className="hidden lg:inline">{showingTop ? 'Pasa el mouse para revelar' : 'Pasa el mouse para volver'}</span>
              <span className="lg:hidden">{showingTop ? 'Rasca con el dedo para revelar' : 'Pinta con el dedo para volver'}</span>
            </p>
          </div>
        </motion.div>
      )}

      {/* Audio Player Section */}
      <AnimatePresence>
        {showAudioPlayer && (audioUrl || youtubeLink) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/90 to-transparent p-4 lg:p-6"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="max-w-md mx-auto"
            >
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-xs lg:text-sm text-white/80 mb-3 text-center font-medium"
              >
                ¿Quieres escuchar cómo sonaría esta escena?
              </motion.p>
              
              {audioUrl && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3"
                >
                  <button
                    onClick={toggleAudio}
                    className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-r from-emerald-500 to-purple-500 flex items-center justify-center hover:scale-105 transition-transform"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 lg:w-5 lg:h-5 text-white" fill="white" />
                    ) : (
                      <Play className="w-4 h-4 lg:w-5 lg:h-5 text-white" fill="white" />
                    )}
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs text-white/70">Dale play</span>
                    </div>
                  </div>

                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    onEnded={() => setIsPlaying(false)}
                  />
                </motion.div>
              )}

              {youtubeLink && !audioUrl && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden"
                >
                  <iframe
                    src={`https://www.youtube.com/embed/${extractYouTubeID(youtubeLink)}?autoplay=0`}
                    className="w-full h-16 lg:h-20"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function extractYouTubeID(url) {
  if (!url) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : '';
}