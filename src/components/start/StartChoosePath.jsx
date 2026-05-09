import React, { useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
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
    return () => { v.removeEventListener("canplay", play); v.removeEventListener("pause", play); };
  }, [src]);
  return ref;
}

function isVideo(url) {
  return url && /\.(mp4|webm|mov)(\?|$)/i.test(url);
}

const PATHS = [
  {
    label: "Artista / Creador",
    sub: "→",
    href: "#cta",
    image: "https://images.unsplash.com/photo-1598387993281-cecf8b71a8f8?w=900&q=85",
  },
  {
    label: "Marca",
    sub: "→",
    href: "#cta",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&q=85",
  },
];

export default function StartChoosePath() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const { data: cfg } = useQuery({
    queryKey: ["landingConfig"],
    queryFn: async () => { const c = await base44.entities.LandingConfig.list(); return c[0] || null; },
    staleTime: 30000,
  });

  // Use banner 1 (Creadoras) as background
  const bgSrc = cfg?.hero_banner_1_image || "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1800&q=85";
  const vidRef = useAutoPlay(isVideo(bgSrc) ? bgSrc : null);

  const scrollTo = (href) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="choose"
      ref={ref}
      style={{
        position: "relative",
        width: "100%",
        height: "100dvh",
        minHeight: "600px",
        overflow: "hidden",
        background: "#080808",
        display: "flex",
        alignItems: "flex-end",
      }}
    >
      {/* Background */}
      {isVideo(bgSrc) ? (
        <video
          ref={vidRef}
          src={bgSrc}
          autoPlay muted loop playsInline preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ pointerEvents: "none", filter: "brightness(0.5) saturate(0.7)" }}
        />
      ) : (
        <img
          src={bgSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Minimal overlay */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)"
      }} />

      {/* Main content — bottom */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          padding: "0 clamp(24px, 6vw, 56px) clamp(40px, 8vw, 72px)",
          width: "100%",
        }}
      >
        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontWeight: 900,
            fontSize: "clamp(2.4rem, 8vw, 6rem)",
            letterSpacing: "-0.04em",
            color: "#f0ede8",
            lineHeight: 0.9,
            marginBottom: "clamp(8px, 2vw, 16px)",
          }}
        >
          Work With Us
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontWeight: 300,
            fontSize: "clamp(0.8rem, 1.8vw, 1rem)",
            color: "rgba(240,237,232,0.45)",
            marginBottom: "clamp(24px, 5vw, 48px)",
            maxWidth: "400px",
            lineHeight: 1.5,
          }}
        >
          Selecciona tu camino y construyamos algo extraordinario.
        </motion.p>

        {/* Two paths */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {PATHS.map((path, i) => (
            <motion.a
              key={path.label}
              href={path.href}
              onClick={e => { e.preventDefault(); scrollTo(path.href); }}
              initial={{ opacity: 0, x: -16 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.65, delay: 0.4 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ x: 8 }}
              style={{
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontWeight: 900,
                fontSize: "clamp(1.8rem, 6vw, 4rem)",
                letterSpacing: "-0.03em",
                color: "rgba(240,237,232,0.6)",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                paddingBottom: "clamp(10px, 2vw, 16px)",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                marginBottom: "clamp(10px, 2vw, 16px)",
                transition: "color 0.25s ease",
                cursor: "pointer",
              }}
              onMouseEnter={e => e.currentTarget.style.color = "#f0ede8"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(240,237,232,0.6)"}
            >
              {path.label}
              <span style={{ fontSize: "clamp(1.2rem, 3vw, 2rem)", opacity: 0.5 }}>→</span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}