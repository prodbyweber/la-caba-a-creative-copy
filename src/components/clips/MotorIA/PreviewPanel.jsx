import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Maximize2, RefreshCw } from "lucide-react";
import { TEMPLATES, STOCK_VIDEOS } from "./templates";

const SPEED_MAP = { slow: 1.2, normal: 0.7, fast: 0.35 };

function AnimatedText({ settings, playing }) {
  const tpl = TEMPLATES[settings.template] || TEMPLATES.mono_cinema;
  const speed = SPEED_MAP[settings.animSpeed] || 0.7;
  const fontSize = `${10 + (settings.textSize / 100) * 28}px`;
  const ls = `${settings.letterSpacing * 0.05}em`;
  const opacity = settings.opacity / 100;

  const shadow = settings.shadow ? "0 4px 32px rgba(0,0,0,0.9), 0 2px 8px rgba(0,0,0,0.7)" : "none";
  const glow = settings.glow ? `0 0 20px ${settings.primaryColor}55` : "none";
  const textShadow = [shadow, glow].filter(Boolean).join(", ");

  const posMap = { arriba: "15%", centro: "50%", abajo: "78%" };
  const top = posMap[settings.position] || "50%";
  const transform = settings.position === "centro" ? "translate(-50%, -50%)" : "translateX(-50%)";

  const line1Style = {
    fontFamily: tpl.fontFamily,
    fontWeight: tpl.fontWeight,
    textTransform: tpl.textTransform,
    letterSpacing: ls,
    color: settings.primaryColor,
    textShadow,
    opacity,
    fontSize,
    lineHeight: 1.2,
  };

  const line2Style = {
    ...line1Style,
    fontSize: `${parseFloat(fontSize) * 0.62}px`,
    color: settings.template === "editorial_noir" ? settings.secondaryColor : settings.primaryColor,
    fontFamily: settings.template === "editorial_noir" ? "'Inter', sans-serif" : tpl.fontFamily,
    fontWeight: settings.template === "editorial_noir" ? "300" : tpl.fontWeight,
    letterSpacing: `${settings.letterSpacing * 0.03}em`,
  };

  const line3Style = {
    ...line1Style,
    fontSize: `${parseFloat(fontSize) * 0.38}px`,
    letterSpacing: "0.2em",
    color: settings.secondaryColor,
    fontFamily: "'Inter', sans-serif",
    fontWeight: "600",
  };

  const containerStyle = {
    position: "absolute",
    top,
    left: "50%",
    transform,
    width: "88%",
    textAlign: "center",
    zIndex: 10,
  };

  const bgBlurStyle = settings.bgBlur ? {
    background: "rgba(0,0,0,0.4)",
    backdropFilter: "blur(8px)",
    borderRadius: "8px",
    padding: "12px 20px",
  } : { padding: "4px 12px" };

  const renderGlitch = (text, style) => (
    <motion.div style={{ position: "relative" }}>
      <span style={style}>{text}</span>
      {settings.template === "fashion_glitch" && playing && (
        <>
          <motion.span
            animate={{ x: [0, -2, 2, 0], opacity: [0, 0.7, 0] }}
            transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 3 + Math.random() * 2 }}
            style={{ ...style, position: "absolute", top: 0, left: 0, color: settings.secondaryColor, clipPath: "inset(20% 0 60% 0)", width: "100%" }}
          >{text}</motion.span>
        </>
      )}
    </motion.div>
  );

  const fadeSlide = { initial: { opacity: 0, y: 16 }, animate: playing ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 } };
  const sideReveal = { initial: { opacity: 0, x: -20 }, animate: playing ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 } };
  const wordPop = { initial: { opacity: 0, scale: 0.85 }, animate: playing ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 } };

  const getVariant = () => {
    if (tpl.animationType === "side_reveal") return sideReveal;
    if (tpl.animationType === "word_pop") return wordPop;
    if (tpl.animationType === "glitch") return fadeSlide;
    if (tpl.animationType === "stagger") return fadeSlide;
    return fadeSlide;
  };

  const v = getVariant();

  const showLine2 = ["double", "subtitle", "triple", "stagger"].includes(tpl.layout) || ["editorial_noir", "triple_layer", "impact_subtitles"].includes(settings.template);
  const showLine3 = tpl.layout === "triple" || settings.template === "triple_layer";

  return (
    <div style={containerStyle}>
      <div style={bgBlurStyle}>
        {/* Reflection for fashion_glitch */}
        {settings.template === "fashion_glitch" && (
          <div style={{ position: "relative" }}>
            <motion.div {...v} transition={{ duration: speed }}>
              {renderGlitch(settings.textLine1, line1Style)}
            </motion.div>
            <div style={{ transform: "scaleY(-1)", opacity: 0.18, maskImage: "linear-gradient(to bottom, black 0%, transparent 60%)", WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 60%)" }}>
              <span style={line1Style}>{settings.textLine1}</span>
            </div>
          </div>
        )}
        {settings.template !== "fashion_glitch" && (
          <motion.div {...v} transition={{ duration: speed }}>
            <span style={line1Style}>{settings.textLine1}</span>
          </motion.div>
        )}

        {showLine2 && settings.textLine2 && (
          <motion.div
            initial={v.initial}
            animate={playing ? v.animate : v.initial}
            transition={{ duration: speed, delay: speed * 0.4 }}
          >
            {settings.template === "editorial_noir" && (
              <motion.div
                animate={playing ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ duration: speed * 0.5, delay: speed * 0.3 }}
                style={{ height: 1, background: settings.secondaryColor, transformOrigin: "left", marginBottom: 6, opacity: 0.6 }}
              />
            )}
            <span style={line2Style}>{settings.textLine2}</span>
          </motion.div>
        )}

        {showLine3 && settings.textLine3 && (
          <motion.div
            initial={v.initial}
            animate={playing ? v.animate : v.initial}
            transition={{ duration: speed, delay: speed * 0.8 }}
          >
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

  const videoSrc = settings.videoUrl || (activeStock !== null ? STOCK_VIDEOS[activeStock].url : null);

  const togglePlay = () => {
    if (videoRef.current) {
      playing ? videoRef.current.pause() : videoRef.current.play();
    }
    setPlaying(!playing);
  };

  const resetAnim = () => {
    setPlaying(false);
    setTimeout(() => setPlaying(true), 50);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between">
        <span className="text-sm font-semibold text-white">Preview en vivo</span>
        <button onClick={resetAnim} className="p-1.5 text-white/30 hover:text-white transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Preview area */}
      <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
        {/* Main preview */}
        <div
          className="relative rounded-xl overflow-hidden bg-[#0a0a0a] border border-white/[0.06]"
          style={{ aspectRatio: "9/16" }}
        >
          {videoSrc ? (
            <video
              ref={videoRef}
              src={videoSrc}
              className="w-full h-full object-cover"
              autoPlay loop muted playsInline
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] flex items-center justify-center">
              <p className="text-white/20 text-xs text-center px-4">Sube un vídeo o<br />elige un stock</p>
            </div>
          )}

          {/* Grain overlay */}
          {settings.grain && (
            <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
              backgroundRepeat: "repeat",
            }} />
          )}

          {/* Motion blur overlay */}
          {settings.motionBlur && (
            <div className="absolute inset-0 pointer-events-none" style={{ backdropFilter: "blur(0.5px)" }} />
          )}

          <AnimatedText settings={settings} playing={playing} />

          {/* Controls */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="p-2 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 text-white hover:bg-black/80 transition-all"
            >
              {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <div className="flex-1 h-0.5 bg-white/10 rounded-full" />
            <button className="p-2 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 text-white hover:bg-black/80 transition-all">
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Stock videos */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30 mb-2.5">Stock Demo</p>
          <div className="space-y-2">
            {STOCK_VIDEOS.map((v, i) => (
              <button
                key={i}
                onClick={() => { setActiveStock(i); updateSettings({ videoUrl: null, stockIndex: i }); }}
                className={`w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all text-left ${
                  activeStock === i && !settings.videoUrl
                    ? "border-[#FF6A00]/40 bg-[#FF6A00]/5"
                    : "border-white/[0.06] bg-[#181818] hover:border-white/10"
                }`}
              >
                <img src={v.poster} alt={v.label} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                <span className="text-[11px] text-white/60">{v.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Template grid */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30 mb-2.5">Plantillas</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(TEMPLATES).map((t) => (
              <button
                key={t.id}
                onClick={() => updateSettings({ template: t.id })}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  settings.template === t.id
                    ? "border-[#FF6A00]/40 bg-[#FF6A00]/5"
                    : "border-white/[0.06] bg-[#181818] hover:border-white/10"
                }`}
              >
                <p className="text-[9px] font-bold text-[#FF6A00]/60 uppercase tracking-wider mb-0.5">{t.number}</p>
                <p className="text-[10px] text-white/70 font-medium leading-tight">{t.name}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}