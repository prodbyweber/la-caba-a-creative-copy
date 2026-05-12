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



export default function StartHero({ bottomOffset = `${typeof window !== "undefined" && window.innerWidth >= 768 ? "clamp(70px, 8vw, 100px)" : "clamp(50px, 8vw, 80px)"}` }) {
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
      {/* Background media — solo cuando el config ya cargó */}
      {videoSrc ? (
        <VideoBackground src={videoSrc} />
      ) : fallbackImage ? (
        <img src={fallbackImage} alt="" className="absolute inset-0 w-full h-full object-cover" loading="eager" />
      ) : null}

      {/* Overlay */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 50%, rgba(0,0,0,0.75) 100%)"
      }} />

      {/* Center hero text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 clamp(24px, 8vw, 80px)",
          pointerEvents: "none",
        }}
      >
        <h1 style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontSize: "clamp(1.6rem, 4vw, 2.8rem)",
          fontWeight: 300,
          color: "rgba(240,237,232,0.95)",
          letterSpacing: "-0.02em",
          lineHeight: 1.25,
          marginBottom: "clamp(16px, 2.5vw, 24px)",
          maxWidth: "720px",
        }}>
          Un espacio para creadores y marcas con visión
        </h1>
        <p style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontSize: "clamp(0.85rem, 1.5vw, 1.05rem)",
          fontWeight: 300,
          color: "rgba(240,237,232,0.55)",
          letterSpacing: "0.01em",
          lineHeight: 1.6,
          marginBottom: "clamp(20px, 3vw, 32px)",
          maxWidth: "520px",
        }}>
          Producción, contenido y experiencias creativas desarrolladas para destacar.
        </p>
        <p style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontSize: "clamp(0.7rem, 1.1vw, 0.85rem)",
          fontWeight: 400,
          color: "rgba(240,237,232,0.3)",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          maxWidth: "480px",
          lineHeight: 1.7,
        }}>
          Descubre quiénes somos y lo que ofrecemos a creadores y marcas antes de Comenzar.
        </p>
      </motion.div>
    </section>
  );
}