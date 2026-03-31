import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function Hero({ config }) {
  const heroSubtitle = config?.hero_subtitle || "Producción, imagen y narrativa para artistas que van en serio.";
  const heroCTA = config?.hero_cta_text || "Aplicar a La Cabaña Creative";
  const heroImage = config?.hero_image_url || "https://media.base44.com/images/public/6966ddf48947f217e81ea27c/c6a0619f6_generated_image.png";

  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Title moves from center-ish to top-left as user scrolls
  const titleX = useTransform(scrollYProgress, [0, 0.5], ["0%", "-12%"]);
  const titleY = useTransform(scrollYProgress, [0, 0.5], ["0%", "-38%"]);
  const titleScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.38]);
  const titleOriginX = useTransform(scrollYProgress, [0, 0.5], ["50%", "0%"]);

  const scrollToOffers = () => {
    const el = document.getElementById("offers");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section ref={sectionRef} className="relative w-full min-h-screen overflow-hidden bg-black">
      {/* Full-bleed background image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Hero"
          className="w-full h-full object-cover object-center"
        />
        {/* Subtle dark overlay */}
        <div className="absolute inset-0 bg-black/25" />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0a0a0b] to-transparent" />
      </div>

      {/* Giant animated brand title */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        style={{ x: titleX, y: titleY, scale: titleScale, transformOrigin: titleOriginX }}
      >
        <div className="px-4 sm:px-8 lg:px-12 w-full">
          {/* "Cabaña®" — orange */}
          <h1
            className="leading-[0.85] font-black tracking-[-0.04em] whitespace-nowrap"
            style={{
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontSize: "clamp(4rem, 16vw, 18vw)",
              color: "#ff5833",
            }}
          >
            Cabaña
            <sup
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "0.28em",
                fontWeight: 400,
                marginLeft: "0.12em",
                verticalAlign: "super",
              }}
            >
              ®
            </sup>
          </h1>
          {/* "Creative" — white */}
          <h1
            className="leading-[0.85] font-black tracking-[-0.04em] whitespace-nowrap"
            style={{
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontSize: "clamp(4rem, 16vw, 18vw)",
              color: "#ffffff",
            }}
          >
            Creative
          </h1>
        </div>
      </motion.div>

      {/* Bottom bar: tagline + CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 lg:px-12 pb-12 sm:pb-16 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pointer-events-auto"
      >
        {/* Left: tagline */}
        <div>
          <p className="text-[11px] sm:text-xs font-semibold text-white/50 uppercase tracking-widest mb-1">
            Estudio creativo · Madrid
          </p>
          <p className="text-base sm:text-lg lg:text-xl font-light text-white/90 max-w-sm leading-snug">
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
    </section>
  );
}