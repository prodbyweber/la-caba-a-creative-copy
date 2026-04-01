import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

// Isotipo URL (same as in nav)
const ISOTIPO_URL = "https://media.base44.com/images/public/6966ddf48947f217e81ea27c/6b7c4002a_Titulo.png";

export default function Hero({ config }) {
  const heroSubtitle = config?.hero_subtitle || "Producción, imagen y narrativa para artistas que van en serio.";
  const heroVideoUrl = config?.hero_video_url || null;

  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // The giant title + isotipo animate from center to top-left, shrinking into the nav logo
  const titleX = useTransform(scrollYProgress, [0, 0.5], ["0%", "-44%"]);
  const titleY = useTransform(scrollYProgress, [0, 0.5], ["0%", "-43%"]);
  const titleScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.095]);
  const titleOpacity = useTransform(scrollYProgress, [0.4, 0.55], [1, 0]);

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

      {/* Giant animated brand title — includes isotipo + text, morphs into nav logo on scroll */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-[2]"
        style={{
          x: titleX,
          y: titleY,
          scale: titleScale,
          transformOrigin: "left top",
          opacity: titleOpacity,
        }}
      >
        <div className="flex items-center gap-[0.18em]">
          {/* Isotipo — scales with the title */}
          <img
            src={ISOTIPO_URL}
            alt=""
            style={{
              height: "clamp(5rem, 18vw, 20vw)",
              width: "auto",
              display: "block",
              flexShrink: 0,
            }}
          />
          {/* Text block */}
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
              <sup
                style={{
                  color: "rgba(255,255,255,0.65)",
                  fontSize: "0.25em",
                  fontWeight: 400,
                  marginLeft: "0.1em",
                  verticalAlign: "super",
                }}
              >
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
        </div>
      </motion.div>

      {/* Bottom bar: tagline */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="absolute bottom-0 left-0 right-0 z-20 px-4 sm:px-8 lg:px-12 pb-28 sm:pb-32 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pointer-events-auto"
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