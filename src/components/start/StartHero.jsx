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

      {/* Overlay — cinematic, subtle */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(to bottom, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.18) 40%, rgba(0,0,0,0.55) 100%)"
      }} />

      {/* Center: headline + paragraph */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 clamp(24px, 8vw, 120px)",
          pointerEvents: "none",
        }}
      >
        <h1 style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontSize: "clamp(1.6rem, 4.5vw, 3.2rem)",
          fontWeight: 300,
          color: "rgba(240,237,232,0.92)",
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
          marginBottom: "clamp(14px, 2vw, 22px)",
          maxWidth: "700px",
        }}>
          Un espacio para creadores y marcas con visión
        </h1>
        <p style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontSize: "clamp(0.75rem, 1.4vw, 0.95rem)",
          fontWeight: 400,
          color: "rgba(240,237,232,0.45)",
          letterSpacing: "0.01em",
          lineHeight: 1.7,
          maxWidth: "480px",
        }}>
          Descubre quiénes somos y cómo ayudamos a creadores y marcas a desarrollar proyectos con identidad antes de{" "}
          <span style={{ color: "rgba(240,237,232,0.75)", fontWeight: 500 }}>Comenzar</span>.
        </p>
      </motion.div>

      {/* Bottom-right: slogan */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "absolute",
          bottom: bottomOffset,
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