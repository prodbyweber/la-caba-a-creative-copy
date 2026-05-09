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

const NAV_LINKS = [
  { label: "Quiénes Somos", href: "#about" },
  { label: "Artistas / Creadores", href: "#artists" },
  { label: "Marcas", href: "#brands" },
  { label: "Elige tu Camino", href: "#choose" },
  { label: "Work With Us →", href: "#cta", highlight: true },
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
        <img src={fallbackImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
      )}

      {/* Minimal overlay — just enough for bottom nav readability */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 50%, rgba(0,0,0,0.7) 100%)"
      }} />

      {/* Bottom nav links — all 5 sections */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          padding: "0 clamp(20px, 5vw, 48px) clamp(28px, 5vw, 48px)",
        }}
      >
        <motion.nav
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: "flex", flexDirection: "column", gap: "0", alignItems: "flex-start" }}
        >
          {NAV_LINKS.map((link, i) => (
            <motion.a
              key={link.label}
              href={link.href}
              onClick={e => { e.preventDefault(); scrollTo(link.href); }}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.75 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontWeight: 900,
                fontSize: "clamp(1.1rem, 3.5vw, 2rem)",
                letterSpacing: "-0.025em",
                color: link.highlight ? "#f0ede8" : "rgba(240,237,232,0.28)",
                textDecoration: "none",
                lineHeight: 1.2,
                paddingBottom: "clamp(2px, 0.6vw, 5px)",
                marginBottom: "clamp(2px, 0.6vw, 5px)",
                transition: "color 0.2s ease, transform 0.2s ease",
                display: "block",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = "#f0ede8"; e.currentTarget.style.transform = "translateX(5px)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = link.highlight ? "#f0ede8" : "rgba(240,237,232,0.28)"; e.currentTarget.style.transform = "translateX(0)"; }}
            >
              {link.label}
            </motion.a>
          ))}
        </motion.nav>
      </div>
    </section>
  );
}