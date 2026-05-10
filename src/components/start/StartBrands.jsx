import React, { useRef, useEffect, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const BUSINESS_TYPES = [
  "Audio",
  "Cultura",
  "Eventos",
  "Visuales",
  "Lifestyle",
];

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
  const [businessIdx, setBusinessIdx] = useState(0);

  const { data: cfg } = useQuery({
    queryKey: ["landingConfig"],
    queryFn: async () => { const c = await base44.entities.LandingConfig.list(); return c[0] || null; },
    staleTime: 30000,
  });

  // Use banner 3 (Films) as brands background
  const mediaSrc = cfg?.hero_banner_3_image || "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1800&q=85";
  const vidRef = useAutoPlay(isVideo(mediaSrc) ? mediaSrc : null);

  // Rotate business types
  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => {
      setBusinessIdx(i => (i + 1) % BUSINESS_TYPES.length);
    }, 2800);
    return () => clearInterval(id);
  }, [inView]);

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



      {/* Content — bottom */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          padding: "0 clamp(24px, 6vw, 56px) clamp(140px, 16vw, 200px)",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "clamp(20px, 4vw, 36px)",
        }}
      >
        {/* Rotating business type */}
        <div style={{ minHeight: "clamp(2rem, 4vw, 3rem)", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={businessIdx}
              initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontWeight: 900,
                fontSize: "clamp(1.6rem, 4.5vw, 3rem)",
                letterSpacing: "-0.04em",
                color: "#f0ede8",
                lineHeight: 1,
                textAlign: "right",
              }}
            >
              {BUSINESS_TYPES[businessIdx]}
            </motion.div>
          </AnimatePresence>
        </div>

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
                width: "fit-content",
                marginLeft: "auto",
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
            display: window.innerWidth < 768 ? "none" : "block",
          }}
        >
          Construimos campañas visuales que conectan cultura, estética y comunidad.
        </motion.p>
      </div>
    </section>
  );
}