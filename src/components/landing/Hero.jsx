import React, { useRef, useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const ISOTIPO_URL = "https://media.base44.com/images/public/6966ddf48947f217e81ea27c/6b7c4002a_Titulo.png";

export default function Hero({ config }) {
  const heroSubtitle = config?.hero_subtitle || "Producción, imagen y narrativa para artistas que van en serio.";
  const heroVideoUrl = config?.hero_video_url || null;

  const sectionRef = useRef(null);

  // Usamos scroll nativo del window para máxima compatibilidad con Safari móvil
  const scrollProgress = useMotionValue(0);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const updateScroll = () => {
      const section = sectionRef.current;
      if (!section) return;

      const heroHeight = section.offsetHeight;
      const scrollY = window.scrollY || window.pageYOffset;
      const progress = Math.min(Math.max(scrollY / heroHeight, 0), 1);

      scrollProgress.set(progress);
      setActive(progress < 0.99);
    };

    // Llamar inmediatamente para el estado inicial
    updateScroll();

    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateScroll);
  }, [scrollProgress]);

  // Opacidad: fade out entre 35% y 52%
  const rawOpacity = useTransform(scrollProgress, [0.35, 0.52], [1, 0]);
  const opacity = useSpring(rawOpacity, { stiffness: 200, damping: 30, mass: 0.5 });

  // Movimiento hacia la esquina del nav
  const rawX = useTransform(scrollProgress, [0, 0.45], ["0%", "-44%"]);
  const rawY = useTransform(scrollProgress, [0, 0.45], ["0%", "-43%"]);
  const rawScale = useTransform(scrollProgress, [0, 0.45], [1, 0.095]);

  const x = useSpring(rawX, { stiffness: 260, damping: 35, mass: 0.4 });
  const y = useSpring(rawY, { stiffness: 260, damping: 35, mass: 0.4 });
  const scale = useSpring(rawScale, { stiffness: 260, damping: 35, mass: 0.4 });

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

      {active && (
        <>
          {/* Isotipo centrado arriba */}
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

          {/* Título animado */}
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
              WebkitTransform: "translateZ(0)",
              transform: "translateZ(0)",
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