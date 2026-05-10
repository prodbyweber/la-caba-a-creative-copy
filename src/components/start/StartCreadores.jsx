import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const ROTATING_WORDS = ["artistas", "modelos", "creadoras", "creadores"];

function isVideo(url) {
  return url && /\.(mp4|webm|mov)(\?|$)/i.test(url);
}

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

function SlideMedia({ url, active }) {
  const vidRef = useAutoPlay(isVideo(url) ? url : null);
  if (!url) return null;
  if (isVideo(url)) {
    return (
      <video
        ref={vidRef}
        key={url}
        src={url}
        autoPlay muted loop playsInline preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ pointerEvents: "none" }}
      />
    );
  }
  return (
    <img
      key={url}
      src={url}
      alt=""
      className="absolute inset-0 w-full h-full object-cover"
    />
  );
}

export default function StartCreadores() {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: false, margin: "-30%" });
  const [slideIdx, setSlideIdx] = useState(0);
  const [wordIdx, setWordIdx] = useState(0);
  const [wordVisible, setWordVisible] = useState(true);
  const [transitioning, setTransitioning] = useState(false);

  const { data: cfg } = useQuery({
    queryKey: ["landingConfig"],
    queryFn: async () => { const c = await base44.entities.LandingConfig.list(); return c[0] || null; },
    staleTime: 30000,
  });

  // Build slides from config: creadores_slides (admin-managed) or fallback to banners
  const slides = cfg?.creadores_slides?.length
    ? cfg.creadores_slides
    : [
        { url: cfg?.hero_banner_1_image || "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1800&q=85" },
        { url: cfg?.hero_banner_2_image || "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1800&q=85" },
        { url: cfg?.hero_banner_3_image || "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1800&q=85" },
      ];

  const SERVICES = cfg?.creadores_services || [
    "Producción musical",
    "Producción audiovisual",
    "Estrategia de marca",
    "Fotografía editorial",
  ];

  const SLIDE_DURATION = 4500;
  const WORD_DURATION = 2200;

  // Slide carousel — only runs when section is in view
  useEffect(() => {
    if (!inView || slides.length < 2) return;
    const id = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setSlideIdx(i => (i + 1) % slides.length);
        setTransitioning(false);
      }, 500);
    }, SLIDE_DURATION);
    return () => clearInterval(id);
  }, [inView, slides.length]);

  // Word rotation — synced to slide changes, only in view
  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => {
      setWordVisible(false);
      setTimeout(() => {
        setWordIdx(i => (i + 1) % ROTATING_WORDS.length);
        setWordVisible(true);
      }, 350);
    }, WORD_DURATION);
    return () => clearInterval(id);
  }, [inView]);

  const currentSlide = slides[slideIdx];
  const currentUrl = typeof currentSlide === "string" ? currentSlide : currentSlide?.url;

  return (
    <section
      id="artists"
      ref={sectionRef}
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
      {/* Background slides */}
      <AnimatePresence mode="crossfade">
        <motion.div
          key={slideIdx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <SlideMedia url={currentUrl} active />
        </motion.div>
      </AnimatePresence>

      {/* Overlay */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)"
      }} />

      {/* Slide dots — top right */}
      {slides.length > 1 && (
        <div style={{
          position: "absolute",
          top: "clamp(80px, 12vw, 120px)",
          right: "clamp(24px, 6vw, 56px)",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          alignItems: "flex-end",
        }}>
          <p style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontWeight: 700,
            fontSize: "10px",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "rgba(240,237,232,0.35)",
            marginBottom: "8px",
          }}>Creadores</p>
          <div style={{ display: "flex", gap: "5px" }}>
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlideIdx(i)}
                style={{
                  width: i === slideIdx ? 16 : 5,
                  height: 2,
                  borderRadius: 2,
                  background: i === slideIdx ? "#ff5833" : "rgba(240,237,232,0.25)",
                  border: "none",
                  cursor: "pointer",
                  transition: "width 0.4s ease, background 0.3s ease",
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Content — bottom */}
      <div style={{
        position: "relative",
        zIndex: 10,
        padding: "0 clamp(24px, 6vw, 56px) clamp(40px, 8vw, 72px)",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "clamp(16px, 3vw, 28px)",
      }}>
        {/* Rotating word headline */}
        <div style={{
          textAlign: "right",
          minHeight: "clamp(2.8rem, 7vw, 5rem)",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
        }}>
          <AnimatePresence mode="wait">
            <motion.span
              key={wordIdx}
              initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -14, filter: "blur(8px)" }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontWeight: 900,
                fontSize: "clamp(2rem, 6vw, 4.5rem)",
                letterSpacing: "-0.04em",
                color: "#f0ede8",
                lineHeight: 1,
                display: "block",
              }}
            >
              {ROTATING_WORDS[wordIdx]}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Services list */}
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

        {/* Tagline */}
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
            textAlign: "right",
          }}
        >
          Desarrollamos creadores con dirección artística, identidad y visión.
        </motion.p>
      </div>
    </section>
  );
}