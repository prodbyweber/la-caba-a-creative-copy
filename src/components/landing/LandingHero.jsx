import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

function useAutoPlay(src) {
  const ref = useRef(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || !src) return;
    const play = () => { v.muted = true; v.play().catch(() => {}); };
    play();
    v.addEventListener("canplay", play);
    v.addEventListener("pause", play);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) play(); });
    return () => { v.removeEventListener("canplay", play); v.removeEventListener("pause", play); };
  }, [src]);
  return ref;
}

function VideoBackground({ src }) {
  const ref = useAutoPlay(src);
  return (
    <video
      ref={ref}
      src={src}
      autoPlay muted loop playsInline preload="auto"
      className="absolute inset-0 w-full h-full object-cover"
      style={{ pointerEvents: "none" }}
    />
  );
}

export default function LandingHero({ bottomOffset } = {}) {
  // Default bottom offset: desktop lower (closer to corner), mobile higher
  const effectiveBottomOffset = bottomOffset || "clamp(12vw, 18vw, 140px)";
  const { data: cfg } = useQuery({
    queryKey: ["landingConfig"],
    queryFn: async () => { const c = await base44.entities.LandingConfig.list(); return c[0] || null; },
    staleTime: 30000,
  });

  const videoSrc = cfg?.hero_video_url || null;
  const fallbackImage = cfg?.hero_banner_1_image || null;

  return (
    <section
      id="hero"
      style={{
        position: "relative",
        width: "100%",
        height: "100dvh",
        minHeight: "600px",
        overflow: "hidden",
        background: "#080808",
      }}
    >
      {/* Background media */}
      {videoSrc ? (
        <VideoBackground src={videoSrc} />
      ) : fallbackImage ? (
        <img src={fallbackImage} alt="" className="absolute inset-0 w-full h-full object-cover" loading="eager" />
      ) : null}

      {/* Overlay */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 50%, rgba(0,0,0,0.75) 100%)"
      }} />

      {/* Bottom-right: slogan */}
       <motion.div
         initial={{ opacity: 0, y: 16 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
         style={{
           position: "absolute",
           bottom: effectiveBottomOffset,
           right: "clamp(24px, 6vw, 56px)",
           zIndex: 20,
           textAlign: "right",
           pointerEvents: "none",
         }}
       >
        <p style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontSize: "9px",
          fontWeight: 700,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "rgba(240,237,232,0.4)",
          marginBottom: "6px",
        }}>
          Música · Films · Creadores
        </p>
        <p style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontSize: "clamp(1rem, 2.5vw, 1.4rem)",
          fontWeight: 300,
          color: "rgba(240,237,232,0.85)",
          letterSpacing: "-0.01em",
          lineHeight: 1.3,
          maxWidth: "320px",
        }}>
          más que lo que se escucha.
        </p>
      </motion.div>
    </section>
  );
}