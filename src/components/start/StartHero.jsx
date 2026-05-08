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

const scrollTo = (id) => {
  const el = document.querySelector(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

// COLORS STUDIOS style nav items — bottom right, stacked
const NAV_ITEMS = [
  { label: "Artistas", href: "#artists", active: false },
  { label: "Marcas", href: "#brands", active: false },
  { label: "Work With Us", href: "#cta", active: true },
];

export default function StartHero() {
  const { data: cfg } = useQuery({
    queryKey: ["landingConfig"],
    queryFn: async () => { const c = await base44.entities.LandingConfig.list(); return c[0] || null; },
    staleTime: 30000,
  });

  const videoSrc = cfg?.hero_video_url || null;
  const fallbackImage = cfg?.hero_banner_1_image || "https://images.unsplash.com/photo-1598387993281-cecf8b71a8f8?w=1800&q=85";

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
      ) : (
        <img
          src={fallbackImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Cinematic overlays */}
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.42)" }} />
      <div className="absolute inset-0" style={{
        background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, transparent 35%, rgba(0,0,0,0.8) 100%)"
      }} />

      {/* CENTER — small editorial caption like COLORS */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.6 }}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 10,
          textAlign: "center",
          width: "100%",
          padding: "0 24px",
          pointerEvents: "none",
        }}
      >
        <p
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontWeight: 600,
            fontSize: "clamp(9px, 2.2vw, 11px)",
            letterSpacing: "0.28em",
            color: "rgba(240,237,232,0.55)",
            textTransform: "uppercase",
            lineHeight: 1.6,
          }}
        >
          Música · Films · Contenido · Marcas
        </p>
      </motion.div>

      {/* BOTTOM LEFT — section title (big, like COLORS active label) */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "absolute",
          bottom: "clamp(28px, 8vw, 56px)",
          left: "clamp(20px, 5vw, 48px)",
          zIndex: 10,
        }}
      >
        <p
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontWeight: 900,
            fontSize: "clamp(3rem, 12vw, 7rem)",
            letterSpacing: "-0.04em",
            lineHeight: 0.88,
            color: "#f0ede8",
            margin: 0,
          }}
        >
          Cabaña
          <sup style={{
            fontSize: "0.22em",
            fontWeight: 400,
            color: "rgba(240,237,232,0.45)",
            verticalAlign: "super",
            marginLeft: "0.08em",
          }}>®</sup>
        </p>
        <p
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontWeight: 900,
            fontSize: "clamp(3rem, 12vw, 7rem)",
            letterSpacing: "-0.04em",
            lineHeight: 0.88,
            color: "rgba(240,237,232,0.35)",
            margin: 0,
          }}
        >
          Creative
        </p>
      </motion.div>

      {/* BOTTOM RIGHT — nav links stacked, COLORS STUDIOS style */}
      <motion.nav
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "absolute",
          bottom: "clamp(28px, 8vw, 56px)",
          right: "clamp(20px, 5vw, 48px)",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "2px",
        }}
      >
        {NAV_ITEMS.map((item, i) => (
          <a
            key={item.label}
            href={item.href}
            onClick={e => { e.preventDefault(); scrollTo(item.href); }}
            style={{
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontWeight: item.active ? 900 : 600,
              fontSize: item.active
                ? "clamp(1.4rem, 5.5vw, 2.4rem)"
                : "clamp(0.85rem, 3vw, 1.1rem)",
              letterSpacing: item.active ? "-0.03em" : "0.01em",
              color: item.active ? "#f0ede8" : "rgba(240,237,232,0.38)",
              textDecoration: "none",
              lineHeight: 1.1,
              display: "flex",
              alignItems: "center",
              gap: item.active ? "10px" : "0",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={e => e.currentTarget.style.color = "#f0ede8"}
            onMouseLeave={e => e.currentTarget.style.color = item.active ? "#f0ede8" : "rgba(240,237,232,0.38)"}
          >
            {item.label}
            {item.active && (
              <span style={{ fontSize: "0.75em", opacity: 0.7 }}>→</span>
            )}
          </a>
        ))}
      </motion.nav>
    </section>
  );
}