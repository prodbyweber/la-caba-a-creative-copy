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

export default function StartHero() {
  const { data: cfg } = useQuery({
    queryKey: ["landingConfig"],
    queryFn: async () => { const c = await base44.entities.LandingConfig.list(); return c[0] || null; },
    staleTime: 30000,
  });

  const videoSrc = cfg?.hero_video_url || null;
  const fallbackImage = cfg?.hero_banner_1_image || "https://images.unsplash.com/photo-1598387993281-cecf8b71a8f8?w=1800&q=85";

  const navLinks = [
    { label: "Artistas", href: "#artists" },
    { label: "Marcas", href: "#brands" },
    { label: "Work With Us", href: "#cta" },
  ];

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

      {/* Dark overlays — cinematic */}
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.45)" }} />
      <div className="absolute inset-0" style={{
        background: "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 40%, rgba(0,0,0,0.75) 100%)"
      }} />

      {/* Center brand name */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          zIndex: 10,
          pointerEvents: "none",
          width: "100%",
        }}
      >
        <p
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontWeight: 900,
            fontSize: "clamp(0.6rem, 1.5vw, 0.75rem)",
            letterSpacing: "0.35em",
            color: "rgba(240,237,232,0.5)",
            textTransform: "uppercase",
            marginBottom: "clamp(6px, 1.5vw, 12px)",
          }}
        >
          Creative House for Artists &amp; Brands
        </p>
      </motion.div>

      {/* Bottom content — COLORS STUDIOS style */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          padding: "clamp(24px, 5vw, 48px) clamp(24px, 6vw, 56px)",
        }}
      >
        {/* Nav links — bottom left like COLORS */}
        <motion.nav
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: "flex", flexDirection: "column", gap: "2px", alignItems: "flex-start" }}
        >
          {navLinks.map((link, i) => (
            <motion.a
              key={link.label}
              href={link.href}
              onClick={e => { e.preventDefault(); scrollTo(link.href); }}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontWeight: 900,
                fontSize: "clamp(1.8rem, 5vw, 3rem)",
                letterSpacing: "-0.03em",
                color: i === 2 ? "#f0ede8" : "rgba(240,237,232,0.35)",
                textDecoration: "none",
                lineHeight: 1.05,
                transition: "color 0.25s ease",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
              onMouseEnter={e => e.currentTarget.style.color = "#f0ede8"}
              onMouseLeave={e => e.currentTarget.style.color = i === 2 ? "#f0ede8" : "rgba(240,237,232,0.35)"}
            >
              {i === 2 && (
                <span style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)", marginRight: "4px" }}>→</span>
              )}
              {link.label}
            </motion.a>
          ))}
        </motion.nav>
      </div>
    </section>
  );
}