import React from "react";
import { motion } from "framer-motion";

export default function Hero({ config }) {
  const heroTitle = config?.hero_title || "Cabaña";
  const heroSubtitle = config?.hero_subtitle || "Creative";
  const heroCTA = config?.hero_cta_text || "Aplicar a La Cabaña Creative";
  const heroImage = config?.hero_image_url || "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1800&h=900&fit=crop&q=80";

  const scrollToOffers = () => {
    const el = document.getElementById("offers");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-black">
      {/* Full-bleed background image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Hero"
          className="w-full h-full object-cover object-center"
        />
        {/* Dark overlay — subtle, cinematic */}
        <div className="absolute inset-0 bg-black/30" />
        {/* Bottom fade to next section */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0a0a0b] to-transparent" />
      </div>

      {/* Giant brand title — overlaid on image, full width */}
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none select-none">
        {/* Top spacer for nav */}
        <div className="h-16" />

        {/* Main giant title */}
        <div className="px-4 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Line 1: "Cabaña®" */}
            <h1
              className="text-[18vw] sm:text-[16vw] leading-[0.85] font-black tracking-[-0.04em] text-white mix-blend-overlay"
              style={{
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                WebkitTextStroke: "1px rgba(255,255,255,0.15)",
              }}
            >
              Cabaña
              <sup
                className="text-[4vw] font-normal align-top"
                style={{ color: "rgba(255,255,255,0.7)", marginLeft: "0.15em", top: "0.2em" }}
              >
                ®
              </sup>
            </h1>
            {/* Line 2: "Creative" */}
            <h1
              className="text-[18vw] sm:text-[16vw] leading-[0.85] font-black tracking-[-0.04em] text-white mix-blend-overlay"
              style={{
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                WebkitTextStroke: "1px rgba(255,255,255,0.15)",
              }}
            >
              Creative
            </h1>
          </motion.div>
        </div>

        {/* Bottom bar: subtitle + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="pointer-events-auto px-4 sm:px-8 lg:px-12 pb-12 sm:pb-16 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4"
        >
          {/* Left: tagline */}
          <div>
            <p className="text-[11px] sm:text-xs font-semibold text-white/50 uppercase tracking-widest mb-1">
              Estudio creativo
            </p>
            <p className="text-base sm:text-lg lg:text-xl font-light text-white/90 max-w-sm leading-snug">
              {heroCTA === config?.hero_cta_text
                ? config?.hero_subtitle || "Producción, imagen y narrativa para artistas que van en serio."
                : "Producción, imagen y narrativa para artistas que van en serio."}
            </p>
          </div>

          {/* Right: CTA button */}
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