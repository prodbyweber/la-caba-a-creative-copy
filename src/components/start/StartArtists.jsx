import React, { useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const SERVICES = [
  "Asesoramiento artístico",
  "Estrategia de marca",
  "Fotografía editorial",
  "Grabación / Edición / Mix & Master",
  "Beatmaking personalizado",
  "Producción audiovisual",
];

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

export default function StartArtists() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const { data: cfg } = useQuery({
    queryKey: ["landingConfig"],
    queryFn: async () => { const c = await base44.entities.LandingConfig.list(); return c[0] || null; },
    staleTime: 30000,
  });

  // Use banner 2 (Música) as artists background
  const mediaSrc = cfg?.hero_banner_2_image || "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1800&q=85";
  const vidRef = useAutoPlay(isVideo(mediaSrc) ? mediaSrc : null);

  return (
    <section
      id="artists"
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
      {isVideo(mediaSrc) ? (
        <video
          ref={vidRef}
          src={mediaSrc}
          autoPlay muted loop playsInline preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ pointerEvents: "none" }}
        />
      ) : (
        <img
          src={mediaSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(0.55) saturate(0.7)" }}
        />
      )}

      {/* Overlays */}
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.5)" }} />
      <div className="absolute inset-0" style={{
        background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)"
      }} />

      {/* Section tag — top */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{
          position: "absolute",
          top: "clamp(80px, 12vw, 120px)",
          left: "clamp(24px, 6vw, 56px)",
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontWeight: 700,
          fontSize: "10px",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "rgba(240,237,232,0.35)",
          zIndex: 10,
        }}
      >
        Artistas / Creadores
      </motion.p>

      {/* Content — bottom */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          padding: "0 clamp(24px, 6vw, 56px) clamp(40px, 8vw, 72px)",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "clamp(20px, 4vw, 36px)",
        }}
      >
        {/* Services list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {SERVICES.map((service, i) => (
            <motion.div
              key={service}
              initial={{ opacity: 0, x: -12 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontWeight: 900,
                fontSize: "clamp(1.4rem, 4vw, 2.8rem)",
                letterSpacing: "-0.025em",
                color: "rgba(240,237,232,0.4)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                paddingBottom: "clamp(6px, 1.5vw, 12px)",
                marginBottom: "clamp(6px, 1.5vw, 12px)",
                lineHeight: 1.1,
                cursor: "default",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={e => e.currentTarget.style.color = "#f0ede8"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(240,237,232,0.4)"}
            >
              {service}
            </motion.div>
          ))}
        </div>

        {/* Bottom tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.9 }}
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontWeight: 300,
            fontSize: "clamp(0.75rem, 1.5vw, 0.9rem)",
            color: "rgba(240,237,232,0.35)",
            maxWidth: "480px",
            lineHeight: 1.5,
          }}
        >
          Desarrollamos artistas con dirección creativa, identidad y visión.
        </motion.p>
      </div>
    </section>
  );
}