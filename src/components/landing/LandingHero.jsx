import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/**
 * Robust hero video with Windows cross-browser compatibility:
 * - Explicit crossOrigin for CDN-hosted videos
 * - Poster image prevents black screen during load
 * - Error recovery: falls back to static image on failure
 * - Fade-in transition when video starts rendering
 * - Visibility-based play/pause for performance
 */
function HeroVideo({ src, poster, className = "", onError, onReady }) {
  const videoRef = useRef(null);
  const [status, setStatus] = useState("loading"); // loading | playing | error
  const [videoReady, setVideoReady] = useState(false);
  const failedRef = useRef(false);

  const handleError = useCallback(() => {
    if (failedRef.current) return;
    failedRef.current = true;
    console.warn("Hero video failed to load:", src?.substring(0, 80));
    setStatus("error");
    onError?.();
  }, [src, onError]);

  const handleLoaded = useCallback(() => {
    const v = videoRef.current;
    if (!v || failedRef.current) return;
    try {
      v.play().then(() => {
        setStatus("playing");
        setVideoReady(true);
        onReady?.();
      }).catch(() => {
        // Autoplay blocked — video still loaded, show poster + retry on interaction
        if (!failedRef.current) setStatus("loading");
      });
    } catch (e) {
      // play() threw synchronously — rare
    }
  }, [onReady]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !src) return;

    // Reset on src change
    failedRef.current = false;
    setStatus("loading");
    setVideoReady(false);

    v.muted = true;
    v.playsInline = true;
    v.preload = "auto";
    v.crossOrigin = "anonymous";

    // Retry play on user interaction (Windows autoplay policy workaround)
    const onInteraction = () => {
      if (v.paused && !failedRef.current) {
        v.play().catch(() => {});
      }
    };

    // Visibility: pause when hidden, resume when visible
    const onVisibility = () => {
      if (document.hidden) {
        if (!v.paused) v.pause();
      } else {
        if (v.paused && !failedRef.current) v.play().catch(() => {});
      }
    };

    document.addEventListener("click", onInteraction, { once: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("click", onInteraction);
      document.removeEventListener("visibilitychange", onVisibility);
      // Don't pause on unmount — let CSS handle cleanup
    };
  }, [src]);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Fallback gradient always present behind video */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #0a0a0b 0%, #1a1a1e 50%, #0d0d11 100%)",
        }}
      />

      {/* Poster image loads first for LCP — always visible behind video */}
      {poster && (
        <img
          src={poster}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
          decoding="async"
          fetchPriority="high"
          style={{ zIndex: 0 }}
        />
      )}

      {/* Video with fade-in transition */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        crossOrigin="anonymous"
        poster={poster || undefined}
        onLoadedData={handleLoaded}
        onCanPlay={handleLoaded}
        onError={handleError}
        onStalled={() => {
          // Stalled can happen on slow connections — don't treat as error yet
        }}
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          pointerEvents: "none",
          opacity: videoReady ? 1 : 0,
          transition: "opacity 0.6s ease-out",
          zIndex: 1,
          background: "transparent",
        }}
        key={src}
      >
        {/* Single source with explicit MIME type for H.264 baseline */}
        <source src={src} type='video/mp4; codecs="avc1.42E01E, mp4a.40.2"' />
        <p>Tu navegador no soporta video HTML5.</p>
      </video>

      {/* Dark overlay on top of video for readability */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: 2,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 50%, rgba(0,0,0,0.75) 100%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

export default function LandingHero({ bottomOffset } = {}) {
  const effectiveBottomOffset = bottomOffset || "calc(clamp(12vw, 18vw, 140px) - 20px)";
  const { data: cfg } = useQuery({
    queryKey: ["landingConfig"],
    queryFn: async () => { const c = await base44.entities.LandingConfig.list(); return c[0] || null; },
    staleTime: 30000,
  });

  const videoSrc = cfg?.hero_video_url || null;
  const mobileVideoSrc = cfg?.hero_video_mobile_url || null;
  const fallbackImage = cfg?.hero_banner_1_image || null;

  // Track video errors to show fallback gracefully
  const [desktopVideoError, setDesktopVideoError] = useState(false);
  const [mobileVideoError, setMobileVideoError] = useState(false);

  const hasDesktopVideo = videoSrc && !desktopVideoError;
  const hasMobileVideo = mobileVideoSrc && !mobileVideoError;

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
      {/* Desktop video: hidden on mobile when a mobile video exists */}
      {hasDesktopVideo && (
        <HeroVideo
          src={videoSrc}
          poster={fallbackImage}
          className={mobileVideoSrc ? "hidden md:block" : ""}
          onError={() => setDesktopVideoError(true)}
        />
      )}
      {/* Mobile-only video */}
      {hasMobileVideo && (
        <HeroVideo
          src={mobileVideoSrc}
          poster={fallbackImage}
          className="md:hidden"
          onError={() => setMobileVideoError(true)}
        />
      )}
      {/* Fallback image only if no video source at all or both errored */}
      {(!videoSrc || desktopVideoError) && (!mobileVideoSrc || mobileVideoError) && fallbackImage && (
        <img
          src={fallbackImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
      )}

      {/* Gradient overlay for readability */}
      {((hasDesktopVideo || hasMobileVideo) ? false : true) && (
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 50%, rgba(0,0,0,0.75) 100%)"
        }} />
      )}

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