import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RefreshCw, Smartphone, Monitor } from "lucide-react";
import { TEMPLATES, STOCK_VIDEOS, SUBTITLE_TEMPLATES } from "./templates";
import SubtitlePreview from "./SubtitlePreview";

const SPEED_MAP = { slow: 1.2, normal: 0.7, fast: 0.35 };

// Detect video orientation once metadata loaded
function useVideoOrientation(src) {
  const [orientation, setOrientation] = useState("vertical"); // default vertical (9:16)
  const ref = useRef();
  useEffect(() => {
    if (!src) { setOrientation("vertical"); return; }
    const vid = document.createElement("video");
    vid.src = src;
    vid.onloadedmetadata = () => {
      setOrientation(vid.videoWidth > vid.videoHeight ? "horizontal" : "vertical");
    };
  }, [src]);
  return orientation;
}

function AnimatedText({ settings, playing, fontSize }) {
  const tpl = TEMPLATES[settings.template] || TEMPLATES.mono_cinema;
  const speed = SPEED_MAP[settings.animSpeed] || 0.7;
  const ls = `${settings.letterSpacing * 0.05}em`;
  const opacity = settings.opacity / 100;
  const shadow = settings.shadow ? "0 4px 40px rgba(0,0,0,0.95), 0 2px 10px rgba(0,0,0,0.8)" : "none";
  const glow = settings.glow ? `0 0 24px ${settings.primaryColor}66` : "";
  const textShadow = [shadow, glow].filter(Boolean).join(", ");

  const posMap = { arriba: "14%", centro: "50%", abajo: "78%" };
  const top = posMap[settings.position] || "50%";
  const transform = settings.position === "centro" ? "translate(-50%, -50%)" : "translateX(-50%)";

  const base = { fontFamily: tpl.fontFamily, fontWeight: tpl.fontWeight, textTransform: tpl.textTransform, letterSpacing: ls, textShadow, opacity };
  const line1Style = { ...base, color: settings.primaryColor, fontSize: `${fontSize}px`, lineHeight: 1.1 };
  const line2Style = { ...base, fontSize: `${fontSize * 0.58}px`, color: settings.secondaryColor, fontFamily: tpl.layout === "double" ? "'Inter', sans-serif" : tpl.fontFamily, fontWeight: tpl.layout === "double" ? "300" : tpl.fontWeight, letterSpacing: `${settings.letterSpacing * 0.03}em` };
  const line3Style = { ...base, fontSize: `${fontSize * 0.36}px`, letterSpacing: "0.2em", color: settings.secondaryColor, fontFamily: "'Inter', sans-serif", fontWeight: "600" };

  const containerStyle = { position: "absolute", top, left: "50%", transform, width: "88%", textAlign: "center", zIndex: 10 };
  const bgBlurStyle = settings.bgBlur ? { background: "rgba(0,0,0,0.45)", backdropFilter: "blur(10px)", borderRadius: "10px", padding: "14px 20px" } : { padding: "4px 12px" };

  const fadeSlide = { initial: { opacity: 0, y: 18 }, animate: playing ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 } };
  const sideReveal = { initial: { opacity: 0, x: -24 }, animate: playing ? { opacity: 1, x: 0 } : { opacity: 0, x: -24 } };
  const wordPop = { initial: { opacity: 0, scale: 0.8 }, animate: playing ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 } };
  const v = tpl.animationType === "side_reveal" ? sideReveal : tpl.animationType === "word_pop" ? wordPop : fadeSlide;

  const showLine2 = ["double", "subtitle", "triple", "stagger"].includes(tpl.layout);
  const showLine3 = tpl.layout === "triple";

  return (
    <div style={containerStyle}>
      <div style={bgBlurStyle}>
        {/* Line 1 – Glitch or normal */}
        {settings.template === "fashion_glitch" ? (
          <div style={{ position: "relative" }}>
            <motion.div {...v} transition={{ duration: speed }}>
              <div style={{ position: "relative" }}>
                <span style={line1Style}>{settings.textLine1}</span>
                {playing && (
                  <motion.span
                    animate={{ x: [0, -3, 3, 0], opacity: [0, 0.6, 0] }}
                    transition={{ duration: 0.12, repeat: Infinity, repeatDelay: 2.5 }}
                    style={{ ...line1Style, position: "absolute", top: 0, left: 0, color: settings.secondaryColor, clipPath: "inset(25% 0 50% 0)", width: "100%", display: "block" }}
                  >{settings.textLine1}</motion.span>
                )}
              </div>
            </motion.div>
            {/* Reflection */}
            <div style={{ transform: "scaleY(-1)", opacity: 0.15, WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 55%)", maskImage: "linear-gradient(to bottom, black 0%, transparent 55%)" }}>
              <span style={line1Style}>{settings.textLine1}</span>
            </div>
          </div>
        ) : (
          <motion.div {...v} transition={{ duration: speed }}>
            <span style={line1Style}>{settings.textLine1}</span>
          </motion.div>
        )}

        {showLine2 && settings.textLine2 && (
          <motion.div initial={v.initial} animate={playing ? v.animate : v.initial} transition={{ duration: speed, delay: speed * 0.45 }}>
            {tpl.animationType === "side_reveal" && (
              <motion.div
                animate={playing ? { scaleX: 1, opacity: 0.7 } : { scaleX: 0, opacity: 0 }}
                transition={{ duration: speed * 0.5, delay: speed * 0.3 }}
                style={{ height: 1, background: settings.secondaryColor, transformOrigin: "left", marginBottom: 6, marginTop: 4 }}
              />
            )}
            <span style={line2Style}>{settings.textLine2}</span>
          </motion.div>
        )}

        {showLine3 && settings.textLine3 && (
          <motion.div initial={v.initial} animate={playing ? v.animate : v.initial} transition={{ duration: speed, delay: speed * 0.9 }}>
            <span style={line3Style}>{settings.textLine3}</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function PreviewPanel({ settings, updateSettings }) {
  const [playing, setPlaying] = useState(true);
  const [activeStock, setActiveStock] = useState(null);
  const videoRef = useRef();

  const videoSrc = settings.videoUrl || (activeStock !== null ? STOCK_VIDEOS[activeStock]?.url : null);
  const orientation = useVideoOrientation(videoSrc);
  const isVertical = orientation === "vertical";

  // adaptive font size based on container
  const fontSize = isVertical ? 22 + (settings.textSize / 100) * 22 : 16 + (settings.textSize / 100) * 20;

  const togglePlay = () => {
    if (videoRef.current) playing ? videoRef.current.pause() : videoRef.current.play();
    setPlaying(!playing);
  };
  const resetAnim = () => { setPlaying(false); setTimeout(() => setPlaying(true), 60); };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between flex-shrink-0">
        <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/40">Preview en vivo</span>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
            <div className={`p-1.5 rounded-md transition-all ${isVertical ? "bg-white/10" : "bg-transparent"}`}>
              <Smartphone className="w-3.5 h-3.5 text-white/50" />
            </div>
            <div className={`p-1.5 rounded-md transition-all ${!isVertical ? "bg-white/10" : "bg-transparent"}`}>
              <Monitor className="w-3.5 h-3.5 text-white/50" />
            </div>
          </div>
          <button onClick={resetAnim} className="p-1.5 rounded-lg hover:bg-white/8 text-white/30 hover:text-white transition-all">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">

        {/* ─── Main Preview Canvas ─── */}
        <div className="flex items-center justify-center w-full">
          <div
            className="relative rounded-2xl overflow-hidden bg-[#111] border border-white/[0.07] shadow-2xl"
            style={isVertical
              ? { width: "100%", maxWidth: "220px", aspectRatio: "9/16" }
              : { width: "100%", aspectRatio: "16/9" }
            }
          >
            {videoSrc ? (
              <video
                ref={videoRef}
                key={videoSrc}
                src={videoSrc}
                className="w-full h-full object-cover"
                autoPlay loop muted playsInline
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#1c1c1c] to-[#0a0a0a] gap-2">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-white/15" />
                </div>
                <p className="text-[10px] text-white/20 text-center px-6">Sube un vídeo o elige un stock para previsualizar</p>
              </div>
            )}

            {/* Grain */}
            {settings.grain && (
              <div className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay" style={{
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
              }} />
            )}

            <AnimatePresence mode="wait">
              {playing && <AnimatedText settings={settings} playing={playing} fontSize={fontSize} />}
            </AnimatePresence>

            {/* Play/Pause overlay */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="p-2 rounded-xl bg-black/70 backdrop-blur-sm border border-white/10 text-white hover:bg-black/90 transition-all"
              >
                {playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </button>
              <div className="flex-1 h-0.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#FF6A00]/60"
                  animate={playing ? { width: ["0%", "100%"] } : { width: "0%" }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ─── Stock Videos ─── */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/25 mb-2.5">Vídeos de muestra</p>
          <div className="grid grid-cols-3 gap-2">
            {STOCK_VIDEOS.map((v, i) => (
              <button
                key={i}
                onClick={() => { setActiveStock(i); updateSettings({ videoUrl: null, stockIndex: i }); }}
                className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                  activeStock === i && !settings.videoUrl
                    ? "border-[#FF6A00] shadow-[0_0_10px_rgba(255,106,0,0.3)]"
                    : "border-transparent hover:border-white/20"
                }`}
                style={{ aspectRatio: v.orientation === "vertical" ? "9/16" : "16/9" }}
              >
                <img src={v.poster} alt={v.label} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute bottom-1 left-1 right-1">
                  <p className="text-[8px] text-white/80 font-medium leading-tight text-center">{v.label}</p>
                </div>
                {activeStock === i && !settings.videoUrl && (
                  <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#FF6A00] flex items-center justify-center">
                    <span className="text-[7px] text-black font-black">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}