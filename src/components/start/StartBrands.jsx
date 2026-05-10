import React, { useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const SERVICES = [
  "Estrategia de marca",
  "Producción de contenido",
  "Campañas con narrativa",
  "Creadores UGC",
  "Posicionamiento",
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

export default function StartBrands() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const { data: cfg } = useQuery({
    queryKey: ["landingConfig"],
    queryFn: async () => { const c = await base44.entities.LandingConfig.list(); return c[0] || null; },
    staleTime: 30000,
  });

  // Use banner 3 (Films) as brands background
  const mediaSrc = cfg?.hero_banner_3_image || "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1800&q=85";
  const vidRef = useAutoPlay(isVideo(mediaSrc) ? mediaSrc : null);

  return (
    <section
      id="brands"
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
        />
      )}

      {/* Minimal overlay */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)"
      }} />

      {/* Section tag — top */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{
          position: "absolute",
          top: "clamp(80px, 12vw, 120px)",
          right: "clamp(24px, 6vw, 56px)",
          left: "auto",
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontWeight: 700,
          fontSize: "10px",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "rgba(240,237,232,0.35)",
          zIndex: 10,
          textAlign: "right",
        }}
      >
        Marcas
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
          alignItems: "flex-end",
          gap: "clamp(20px, 4vw, 36px)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "0", width: "100%", alignItems: "flex-end" }}>
          {SERVICES.map((service, i) => (
            <motion.div
              key={service}
              initial={{ opacity: 0, x: 12 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontWeight: 900,
                fontSize: "clamp(1rem, 2.5vw, 1.8rem)",
                letterSpacing: "-0.025em",
                color: "rgba(240,237,232,0.4)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                paddingBottom: "clamp(6px, 1.5vw, 12px)",
                marginBottom: "clamp(6px, 1.5vw, 12px)",
                lineHeight: 1.1,
                cursor: "default",
                transition: "color 0.2s ease",
                textAlign: "right",
                width: "100%",
              }}
              onMouseEnter={e => e.currentTarget.style.color = "#f0ede8"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(240,237,232,0.4)"}
            >
              {service}
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontWeight: 300,
            fontSize: "clamp(0.75rem, 1.5vw, 0.9rem)",
            color: "rgba(240,237,232,0.35)",
            maxWidth: "480px",
            lineHeight: 1.5,
            textAlign: "right",
          }}
        >
          Construimos campañas visuales que conectan cultura, estética y comunidad.
        </motion.p>
      </div>
    </section>
  );
}