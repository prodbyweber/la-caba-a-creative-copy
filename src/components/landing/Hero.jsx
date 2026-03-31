import React, { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";

export default function Hero({ config }) {
  const heroSubtitle = config?.hero_subtitle || "Producción, imagen y narrativa para artistas que van en serio.";
  const heroCTA = config?.hero_cta_text || "Aplicar a La Cabaña Creative";

  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Animate the big title: starts centered, shrinks and moves to top-left (matching nav logo position)
  // Target: left ~24px, top ~14px (nav logo area), scale ~0.08 of original
  const titleX = useTransform(scrollYProgress, [0, 0.45], ["0%", "-44%"]);
  const titleY = useTransform(scrollYProgress, [0, 0.45], ["0%", "-43%"]);
  const titleScale = useTransform(scrollYProgress, [0, 0.45], [1, 0.095]);
  const titleOpacity = useTransform(scrollYProgress, [0.38, 0.5], [1, 0]);

  const scrollToOffers = () => {
    const el = document.getElementById("offers");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section ref={sectionRef} className="relative w-full" style={{ height: "200vh" }}>
      {/* Sticky viewport */}
      <div className="sticky top-0 w-full h-screen overflow-hidden bg-[#0a0a0b]">
        {/* Bottom fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0a0a0b] to-transparent z-10" />

        {/* Big animated brand title — single instance, centered then moves to top-left */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          style={{
            x: titleX,
            y: titleY,
            scale: titleScale,
            transformOrigin: "left top",
            opacity: titleOpacity,
          }}
        >
          <div style={{ transformOrigin: "left top" }}>
            {/* "Cabaña®" — orange */}
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
            {/* "Creative" — white */}
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

        {/* Bottom bar: tagline + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="absolute bottom-0 left-0 right-0 z-20 px-6 sm:px-10 lg:px-14 pb-14 sm:pb-20 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pointer-events-auto"
        >
          {/* Left: tagline */}
          <div>
            <p className="text-[11px] sm:text-xs font-semibold text-white/40 uppercase tracking-widest mb-1">
              Estudio creativo · Madrid
            </p>
            <p className="text-base sm:text-lg lg:text-xl font-light text-white/80 max-w-sm leading-snug">
              {heroSubtitle}
            </p>
          </div>

          {/* Right: CTA */}
          <button
            onClick={scrollToOffers}
            className="flex-shrink-0 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-white text-black text-sm sm:text-base font-semibold hover:bg-[#ff5833] hover:text-white transition-all duration-300"
          >
            {heroCTA}
          </button>
        </motion.div>
      </div>
    </section>
  );
}