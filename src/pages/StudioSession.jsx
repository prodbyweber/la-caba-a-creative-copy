import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function useAutoPlay(src) {
  const ref = useRef(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || !src) return;
    const play = () => { v.muted = true; v.play().catch(() => {}); };
    play();
    v.addEventListener("canplay", play);
    v.addEventListener("pause", play);
    const onVis = () => { if (!document.hidden) play(); };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      v.removeEventListener("canplay", play);
      v.removeEventListener("pause", play);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [src]);
  return ref;
}

function isVideo(url) {
  return url && /\.(mp4|webm|mov)(\?|$)/i.test(url);
}

export default function StudioSession() {
  const { data: cfg } = useQuery({
    queryKey: ["landingConfig"],
    queryFn: async () => {
      const c = await base44.entities.LandingConfig.list();
      return c[0] || null;
    },
    staleTime: 60000,
  });

  // Use hero video + banner 2 mp4 as cinematic backgrounds (layer them)
  const bg1 = cfg?.hero_video_url || null;
  const bg2 = cfg?.hero_banner_2_image || null;

  // Pick the best video source available
  const videoSrc = isVideo(bg1) ? bg1 : isVideo(bg2) ? bg2 : null;
  const fallbackSrc = isVideo(bg2) ? bg2 : isVideo(bg1) ? bg1 : null;
  const vidRef1 = useAutoPlay(videoSrc);
  const vidRef2 = useAutoPlay(fallbackSrc && fallbackSrc !== videoSrc ? fallbackSrc : null);

  // Inject Calendly script once
  useEffect(() => {
    if (document.getElementById("calendly-script")) return;
    const s = document.createElement("script");
    s.id = "calendly-script";
    s.src = "https://assets.calendly.com/assets/external/widget.js";
    s.async = true;
    s.onload = () => {
      if (window.Calendly) {
        window.Calendly.initInlineWidgets();
      }
    };
    document.head.appendChild(s);
  }, []);

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100dvh",
        background: "#080808",
        overflow: "hidden",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      {/* ── Cinematic background ── */}
      <div className="absolute inset-0 z-0">
        {videoSrc ? (
          <video
            ref={vidRef1}
            src={videoSrc}
            autoPlay muted loop playsInline preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ pointerEvents: "none", filter: "brightness(0.35) saturate(0.7) blur(2px)" }}
          />
        ) : (
          <img
            src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1800&q=80"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "brightness(0.3) saturate(0.6) blur(2px)" }}
          />
        )}

        {/* Second video layer (subtle, offset crop) */}
        {fallbackSrc && fallbackSrc !== videoSrc && (
          <video
            ref={vidRef2}
            src={fallbackSrc}
            autoPlay muted loop playsInline preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ pointerEvents: "none", filter: "brightness(0.2) saturate(0.5) blur(4px)", opacity: 0.4 }}
          />
        )}

        {/* Cinematic overlays */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(8,8,8,0.7) 0%, rgba(8,8,8,0.3) 35%, rgba(8,8,8,0.5) 70%, rgba(8,8,8,0.85) 100%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 90% 60% at 50% 50%, transparent 0%, rgba(8,8,8,0.55) 100%)" }} />
        {/* Letterbox bars */}
        <div className="absolute top-0 left-0 right-0 h-[3px] sm:h-[5px]" style={{ background: "rgba(8,8,8,0.95)" }} />
        <div className="absolute bottom-0 left-0 right-0 h-[3px] sm:h-[5px]" style={{ background: "rgba(8,8,8,0.95)" }} />
      </div>

      {/* ── Back button ── */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="absolute top-6 left-6 z-30"
      >
        <Link
          to="/AdminDashboard"
          className="flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors"
          style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Dashboard
        </Link>
      </motion.div>

      {/* ── Logo ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="absolute top-5 left-1/2 z-30"
        style={{ transform: "translateX(-50%)" }}
      >
        <img
          src="https://media.base44.com/images/public/6966ddf48947f217e81ea27c/6b7c4002a_Titulo.png"
          alt="Cabaña Creative"
          className="h-8 w-auto opacity-70"
        />
      </motion.div>

      {/* ── Main content ── */}
      <div
        className="relative z-20 flex flex-col items-center justify-start"
        style={{
          minHeight: "100dvh",
          paddingTop: "clamp(80px, 10vw, 100px)",
          paddingBottom: "clamp(40px, 6vw, 60px)",
          paddingLeft: "clamp(16px, 4vw, 40px)",
          paddingRight: "clamp(16px, 4vw, 40px)",
        }}
      >
        {/* Label */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: "#ff5833",
            marginBottom: "clamp(6px, 1.5vw, 12px)",
          }}
        >
          Cabaña Creative Studio
        </motion.p>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontSize: "clamp(1.8rem, 5vw, 3.2rem)",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            color: "#f0ede8",
            lineHeight: 0.95,
            textAlign: "center",
            marginBottom: "clamp(8px, 1.5vw, 14px)",
          }}
        >
          La Cabaña
        </motion.h1>

        {/* Subline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          style={{
            fontSize: "clamp(0.75rem, 1.5vw, 0.9rem)",
            fontWeight: 300,
            color: "rgba(240,237,232,0.4)",
            textAlign: "center",
            maxWidth: "360px",
            lineHeight: 1.55,
            marginBottom: "clamp(28px, 4vw, 44px)",
          }}
        >
          Reserva tu sesión en el estudio.
        </motion.p>

        {/* Calendly widget */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
          style={{
            width: "100%",
            maxWidth: "720px",
            borderRadius: "16px",
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03)",
            background: "rgba(8,8,8,0.6)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <div
            className="calendly-inline-widget"
            data-url="https://calendly.com/hola-cabanacreative/sessions?primary_color=ff4300&hide_gdpr_banner=1&background_color=080808&text_color=f0ede8"
            style={{ minWidth: "320px", height: "700px" }}
          />
        </motion.div>

        {/* Divider + tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          style={{ marginTop: "clamp(24px, 4vw, 40px)", textAlign: "center" }}
        >
          <div style={{ height: "1px", width: "40px", background: "rgba(255,255,255,0.12)", margin: "0 auto 16px" }} />
          <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(240,237,232,0.18)" }}>
            Música · Films · Creadores
          </p>
        </motion.div>
      </div>
    </div>
  );
}