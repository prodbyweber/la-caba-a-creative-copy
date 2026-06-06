import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

function useAutoPlay(src) {
  const ref = useRef(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || !src) return;
    
    v.muted = true;
    v.playsInline = true;
    v.preload = "auto";
    
    const play = async () => {
      try {
        if (v.paused) {
          await v.play();
        }
      } catch (err) {
        console.warn("Video autoplay failed, will retry:", err);
      }
    };
    
    // Initial play attempt
    play();
    
    // Retry on events
    v.addEventListener("canplay", play);
    v.addEventListener("loadeddata", play);
    v.addEventListener("pause", play);
    
    // Retry when page becomes visible
    const handleVisibility = () => {
      if (!document.hidden && v.paused) {
        play();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    
    // Force play after short delay (Windows PC fix)
    const timeoutId = setTimeout(play, 500);
    
    return () => {
      v.removeEventListener("canplay", play);
      v.removeEventListener("loadeddata", play);
      v.removeEventListener("pause", play);
      document.removeEventListener("visibilitychange", handleVisibility);
      clearTimeout(timeoutId);
    };
  }, [src]);
  return ref;
}

function VideoBackground({ src, className = "" }) {
  const ref = useAutoPlay(src);
  
  // Extract base URL to check for MP4/WebM extensions
  const getVideoType = (url) => {
    if (!url) return null;
    const lower = url.toLowerCase();
    if (lower.includes('.mp4')) return 'video/mp4';
    if (lower.includes('.webm')) return 'video/webm';
    if (lower.includes('.mov')) return 'video/quicktime';
    return 'video/mp4'; // Default fallback
  };
  
  const videoType = getVideoType(src);
  
  return (
    <video
      ref={ref}
      autoPlay muted loop playsInline preload="auto"
      className={`absolute inset-0 w-full h-full object-cover ${className}`}
      style={{ pointerEvents: "none", background: "#080808" }}
      poster=""
      key={src}
    >
      <source src={src} type={videoType} />
      {/* Fallback source without type for maximum compatibility */}
      <source src={src} />
    </video>
  );
}

export default function LandingHero({ bottomOffset } = {}) {
  // Default bottom offset: desktop lower (closer to corner), mobile higher, 2cm lower
  const effectiveBottomOffset = bottomOffset || "calc(clamp(12vw, 18vw, 140px) - 20px)";
  const { data: cfg } = useQuery({
    queryKey: ["landingConfig"],
    queryFn: async () => { const c = await base44.entities.LandingConfig.list(); return c[0] || null; },
    staleTime: 30000,
  });

  const videoSrc = cfg?.hero_video_url || null;
  const mobileVideoSrc = cfg?.hero_video_mobile_url || null;
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
      {/* Desktop video: hidden on mobile when a mobile video exists */}
      {videoSrc && (
        <>
          <VideoBackground src={videoSrc} className={mobileVideoSrc ? "hidden md:block" : ""} />
          {/* Fallback image behind video in case of load failure */}
          {fallbackImage && (
            <img src={fallbackImage} alt="" className={`absolute inset-0 w-full h-full object-cover ${mobileVideoSrc ? "hidden md:block" : ""}`} style={{ zIndex: -1 }} loading="eager" />
          )}
        </>
      )}
      {/* Mobile-only video: only renders on mobile */}
      {mobileVideoSrc && (
        <>
          <VideoBackground src={mobileVideoSrc} className="md:hidden" />
          {/* Fallback image for mobile */}
          {fallbackImage && (
            <img src={fallbackImage} alt="" className="absolute inset-0 w-full h-full object-cover md:hidden" style={{ zIndex: -1 }} loading="eager" />
          )}
        </>
      )}
      {/* Fallback image if no video */}
      {!videoSrc && !mobileVideoSrc && fallbackImage && (
        <img src={fallbackImage} alt="" className="absolute inset-0 w-full h-full object-cover" loading="eager" />
      )}

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
           willChange: "transform",
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