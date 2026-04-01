import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function Hero({ config }) {
  const heroSubtitle = config?.hero_subtitle || "Producción, imagen y narrativa para artistas que van en serio.";
  const heroCTA = config?.hero_cta_text || "Aplicar a La Cabaña Creative";
  const heroVideoUrl = config?.hero_video_url || null;

  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const titleX = useTransform(scrollYProgress, [0, 0.5], ["0%", "-44%"]);
  const titleY = useTransform(scrollYProgress, [0, 0.5], ["0%", "-43%"]);
  const titleScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.095]);
  const titleOpacity = useTransform(scrollYProgress, [0.4, 0.55], [1, 0]);

  const scrollToOffers = () => {
    const el = document.getElementById("offers");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* ── DESKTOP HERO ── */}
      <section ref={sectionRef} className="hidden sm:block relative w-full min-h-screen overflow-hidden bg-[#0a0a0b]">
        {/* Background video (desktop only) */}
        {heroVideoUrl && (
          <video
            src={heroVideoUrl}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        )}

        {/* Subtle overlay so text stays readable */}
        {heroVideoUrl && (
          <div className="absolute inset-0 bg-[#0a0a0b]/40 z-[1]" />
        )}

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0a0a0b] to-transparent z-10" />

        {/* Giant animated brand title */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-[2]"
          style={{ x: titleX, y: titleY, scale: titleScale, transformOrigin: "left top", opacity: titleOpacity }}
        >
          <BrandTitle />
        </motion.div>

        {/* Bottom bar */}
        <BottomBar heroSubtitle={heroSubtitle} heroCTA={heroCTA} onCTA={scrollToOffers} />
      </section>

      {/* ── MOBILE HERO ── */}
      <section className="sm:hidden relative w-full bg-[#0a0a0b] overflow-hidden">
        {/* Title block */}
        <div className="relative min-h-[70vw] flex items-center justify-center overflow-hidden">
          {/* Animated title — static on mobile (no scroll animation) */}
          <div className="pointer-events-none select-none">
            <BrandTitle mobile />
          </div>
          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0a0a0b] to-transparent z-10" />
        </div>

        {/* Video block — vertical, below text */}
        {heroVideoUrl && (
          <div className="relative mx-4 rounded-2xl overflow-hidden" style={{ aspectRatio: "9/16", maxHeight: "70vh" }}>
            <video
              src={heroVideoUrl}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
            {/* Minimal shadow overlay top + bottom */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0b]/40 via-transparent to-[#0a0a0b]/60 pointer-events-none" />
          </div>
        )}

        {/* Tagline + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="px-5 pt-6 pb-12 flex flex-col gap-4"
        >
          <div>
            <p className="text-[10px] font-semibold text-white/50 uppercase tracking-widest mb-1">
              Estudio creativo · Madrid
            </p>
            <p className="text-base font-light text-white/90 leading-snug max-w-xs">
              {heroSubtitle}
            </p>
          </div>
          <button
            onClick={scrollToOffers}
            className="self-start px-6 py-3 rounded-full bg-white text-black text-sm font-semibold hover:bg-[#ff5833] hover:text-white transition-all duration-300"
          >
            {heroCTA}
          </button>
        </motion.div>
      </section>
    </>
  );
}

/* ── Shared sub-components ── */

function BrandTitle({ mobile = false }) {
  const fontSize = mobile ? "clamp(4rem, 22vw, 22vw)" : "clamp(5rem, 18vw, 20vw)";
  return (
    <div>
      <div
        className="leading-[0.85] font-black tracking-[-0.04em] whitespace-nowrap"
        style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize, color: "#ff5833" }}
      >
        Cabaña
        <sup style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.25em", fontWeight: 400, marginLeft: "0.1em", verticalAlign: "super" }}>
          ®
        </sup>
      </div>
      <div
        className="leading-[0.85] font-black tracking-[-0.04em] whitespace-nowrap"
        style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize, color: "#ffffff" }}
      >
        Creative
      </div>
    </div>
  );
}

function BottomBar({ heroSubtitle, heroCTA, onCTA }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.4 }}
      className="absolute bottom-0 left-0 right-0 z-20 px-4 sm:px-8 lg:px-12 pb-12 sm:pb-16 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pointer-events-auto"
    >
      <div>
        <p className="text-[11px] sm:text-xs font-semibold text-white/50 uppercase tracking-widest mb-1">
          Estudio creativo · Madrid
        </p>
        <p className="text-base sm:text-lg lg:text-xl font-light text-white/90 max-w-sm leading-snug">
          {heroSubtitle}
        </p>
      </div>
      <button
        onClick={onCTA}
        className="flex-shrink-0 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-white text-black text-sm sm:text-base font-semibold hover:bg-[#ff5833] hover:text-white transition-all duration-300"
      >
        {heroCTA}
      </button>
    </motion.div>
  );
}