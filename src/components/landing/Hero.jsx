import React, { useRef, useEffect, useState } from "react";
// HeroVideo usa autoPlay+muted+loop+playsInline — garantizado por política de autoplay del navegador
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const ISOTIPO_URL = "https://media.base44.com/images/public/6966ddf48947f217e81ea27c/6b7c4002a_Titulo.png";

// Detectar móvil/tablet una sola vez (evita re-renders)
const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

function useAutoPlayVideo(src) {
  const ref = useRef(null);
  useEffect(() => {
    const vid = ref.current;
    if (!vid || !src) return;
    vid.muted = true;

    // Intento inicial y ante cualquier pausa inesperada
    const tryPlay = () => { vid.muted = true; vid.play().catch(() => {}); };

    // Arrancar inmediatamente y en cuanto haya datos
    tryPlay();
    vid.addEventListener("canplay", tryPlay);
    vid.addEventListener("loadeddata", tryPlay);

    // Si se pausa (cambio de pestaña, etc.), volver a reproducir
    vid.addEventListener("pause", tryPlay);

    // Visibilidad: reanudar cuando la pestaña vuelva a ser visible
    const onVisible = () => { if (!document.hidden) tryPlay(); };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      vid.removeEventListener("canplay", tryPlay);
      vid.removeEventListener("loadeddata", tryPlay);
      vid.removeEventListener("pause", tryPlay);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [src]);
  return ref;
}

function HeroVideo({ src }) {
  const ref = useAutoPlayVideo(src);
  return (
    <video
      ref={ref}
      src={src}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      disablePictureInPicture
      className="absolute inset-0 w-full h-full object-cover"
      style={{ pointerEvents: "none" }}
    />
  );
}

export default function Hero({ config }) {
  const heroSubtitle = config?.hero_subtitle || "Más que lo que se escucha.";
  const heroVideoUrl = config?.hero_video_url || null;

  const sectionRef = useRef(null);

  // ── DESKTOP: animación scroll-driven ──────────────────────────────────────
  const scrollProgress = useMotionValue(0);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (isMobile) return; // móvil no usa scroll-driven

    const updateScroll = () => {
      const section = sectionRef.current;
      if (!section) return;
      const heroHeight = section.offsetHeight;
      const scrollY = window.scrollY || window.pageYOffset;
      const progress = Math.min(Math.max(scrollY / heroHeight, 0), 1);
      scrollProgress.set(progress);
      setActive(progress < 0.99);
    };

    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateScroll);
  }, [scrollProgress]);

  const rawOpacity = useTransform(scrollProgress, [0.35, 0.52], [1, 0]);
  const opacity    = useSpring(rawOpacity, { stiffness: 200, damping: 30, mass: 0.5 });

  const rawX    = useTransform(scrollProgress, [0, 0.45], ["0%", "-44%"]);
  const rawY    = useTransform(scrollProgress, [0, 0.45], ["0%", "-43%"]);
  const rawScale = useTransform(scrollProgress, [0, 0.45], [1, 0.095]);

  const x     = useSpring(rawX,     { stiffness: 260, damping: 35, mass: 0.4 });
  const y     = useSpring(rawY,     { stiffness: 260, damping: 35, mass: 0.4 });
  const scale = useSpring(rawScale, { stiffness: 260, damping: 35, mass: 0.4 });

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <section ref={sectionRef} className="relative w-full min-h-screen overflow-hidden bg-[#0a0a0b]">
      {/* Background video — cubre toda la sección como fondo en loop */}
      {heroVideoUrl && (
        <>
          <div className="absolute inset-0 z-0 overflow-hidden">
            <HeroVideo src={heroVideoUrl} />
          </div>
          <div className="absolute inset-0 bg-[#0a0a0b]/30 z-0" />
        </>
      )}

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0a0a0b] to-transparent z-10" />

      {/* ── MÓVIL: título estático centrado, sin fixed, sin scroll-driven ── */}
      {isMobile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-20 px-4"
        >
          <div className="text-center">
            <div
              className="leading-[0.85] font-black tracking-[-0.04em] whitespace-nowrap"
              style={{
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontSize: "clamp(4rem, 20vw, 8rem)",
                color: "#ff5833",
              }}
            >
              Cabaña
              <sup style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.25em", fontWeight: 400, marginLeft: "0.1em", verticalAlign: "super" }}>
                ®
              </sup>
            </div>
            <div
              className="leading-[0.85] font-black tracking-[-0.04em] whitespace-nowrap"
              style={{
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontSize: "clamp(4rem, 20vw, 8rem)",
                color: "#ffffff",
              }}
            >
              Creative
            </div>
          </div>
        </motion.div>
      )}

      {/* Isotipo móvil — encima del video, parte superior */}
      {isMobile && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="absolute top-[10vh] left-0 right-0 flex justify-center pointer-events-none select-none z-20"
        >
          <img
            src={ISOTIPO_URL}
            alt=""
            style={{ height: "clamp(2.5rem, 12vw, 5rem)", width: "auto" }}
          />
        </motion.div>
      )}

      {/* ── DESKTOP: título animado scroll-driven con fixed ── */}
      {!isMobile && active && (
        <>
          {/* Isotipo */}
          <motion.div
            className="fixed inset-0 flex items-start justify-center pointer-events-none select-none z-[60]"
            style={{
              opacity,
              paddingTop: "7vh",
              willChange: "opacity",
              WebkitBackfaceVisibility: "hidden",
              backfaceVisibility: "hidden",
            }}
          >
            <img
              src={ISOTIPO_URL}
              alt=""
              style={{ height: "clamp(3rem, 9vw, 10vw)", width: "auto", display: "block" }}
            />
          </motion.div>

          {/* Título */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center pointer-events-none select-none z-[60]"
            style={{
              x,
              y,
              scale,
              transformOrigin: "left top",
              opacity,
              willChange: "transform, opacity",
              WebkitBackfaceVisibility: "hidden",
              backfaceVisibility: "hidden",
            }}
          >
            <div>
              <div
                className="leading-[0.85] font-black tracking-[-0.04em] whitespace-nowrap"
                style={{
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                  fontSize: "clamp(5rem, 18vw, 20vw)",
                  color: "#ff5833",
                }}
              >
                Cabaña
                <sup style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.25em", fontWeight: 400, marginLeft: "0.1em", verticalAlign: "super" }}>
                  ®
                </sup>
              </div>
              <div
                className="leading-[0.85] font-black tracking-[-0.04em] whitespace-nowrap"
                style={{
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                  fontSize: "clamp(5rem, 18vw, 20vw)",
                  color: "#ffffff",
                }}
              >
                Creative
              </div>
            </div>
          </motion.div>
        </>
      )}

      {/* Bottom bar: tagline */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="absolute bottom-0 left-0 right-0 z-20 px-4 sm:px-8 lg:px-12 pb-10 sm:pb-14 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pointer-events-auto"
      >
        <div>
          <p className="text-[11px] sm:text-xs font-semibold text-white/50 uppercase tracking-widest mb-1">
            Estudio creativo · Madrid
          </p>
          <p className="text-base sm:text-lg lg:text-xl font-light text-white/90 max-w-sm leading-snug">
            {heroSubtitle}
          </p>
        </div>
      </motion.div>
    </section>
  );
}