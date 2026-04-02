import React, { useRef, useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const ISOTIPO_URL = "https://media.base44.com/images/public/6966ddf48947f217e81ea27c/6b7c4002a_Titulo.png";

// Detectar móvil/tablet una sola vez (evita re-renders)
const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

// Umbral de scroll (px) para que el título empiece a desaparecer en móvil
const MOBILE_FADE_START = 60;
const MOBILE_FADE_END = 180;

export default function Hero({ config }) {
  const heroSubtitle = config?.hero_subtitle || "Producción, imagen y narrativa para artistas que van en serio.";
  const heroVideoUrl = config?.hero_video_url || null;

  const sectionRef = useRef(null);

  // ── MÓVIL: fade out simple al hacer scroll ────────────────────────────────
  const [mobileScrollY, setMobileScrollY] = useState(0);

  useEffect(() => {
    if (!isMobile) return;
    const onScroll = () => setMobileScrollY(window.scrollY || window.pageYOffset);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Calcular opacidad y translateY para móvil
  const mobileProgress = Math.min(Math.max((mobileScrollY - MOBILE_FADE_START) / (MOBILE_FADE_END - MOBILE_FADE_START), 0), 1);
  const mobileOpacity = 1 - mobileProgress;
  const mobileTranslateY = mobileProgress * -40; // sube 40px mientras desaparece

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
      {/* Background video */}
      {heroVideoUrl && (
        <>
          <div className="absolute inset-0 flex items-center justify-center z-0">
            <video
              src={heroVideoUrl}
              autoPlay
              muted
              loop
              playsInline
              className="w-[85%] h-[85%] object-cover opacity-60 rounded-2xl"
            />
          </div>
          <div className="absolute inset-0 bg-[#0a0a0b]/15 z-0" />
        </>
      )}

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0a0a0b] to-transparent z-10" />

      {/* ── MÓVIL: título con fade-out al scrollear ── */}
      {isMobile && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-20 px-4"
          style={{
            opacity: mobileScrollY < 30
              ? mobileScrollY / 30           // fade-in de entrada
              : mobileOpacity,               // fade-out al scroll
            transform: `translateY(${mobileTranslateY}px)`,
            transition: "opacity 0.12s linear, transform 0.12s linear",
            willChange: "opacity, transform",
          }}
        >
          <img
            src={ISOTIPO_URL}
            alt=""
            style={{ height: "clamp(2.5rem, 12vw, 5rem)", width: "auto", marginBottom: "1.5rem" }}
          />
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
        </div>
      )}

      {/* ── DESKTOP: título animado scroll-driven con fixed ── */}
      {!isMobile && active && (
        <>
          {/* Isotipo */}
          <motion.div
            className="fixed inset-0 flex items-start justify-center pointer-events-none select-none z-[60]"
            style={{
              opacity,
              paddingTop: "12vh",
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