import React from "react";
import { motion } from "framer-motion";

const banners = [
  {
    tag: "Artistas",
    title: "MUSE CLUB",
    subtitle: "She sets the tone",
    cta: "Explore",
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1800&h=900&fit=crop&q=85",
  },
  {
    tag: "Sonido nuevo",
    title: "LA NUEVA CORRIENTE",
    subtitle: "Donde nace el sonido nuevo",
    cta: "Descubrir",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1800&h=900&fit=crop&q=85",
  },
  {
    tag: "Comunidad",
    title: "FRIENDS & FAMILY",
    subtitle: "Inside the circle",
    cta: "View All",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1800&h=900&fit=crop&q=85",
  },
];

function BannerBlock({ banner, index }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full overflow-hidden group cursor-pointer"
      style={{ height: "clamp(320px, 55vw, 680px)" }}
    >
      {/* Background image with zoom on hover */}
      <img
        src={banner.image}
        alt={banner.title}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] ease-in-out group-hover:scale-[1.04]"
      />

      {/* Subtle dark overlay */}
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-700" />

      {/* Bottom gradient for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />

      {/* Content — bottom left, matching Hero typography */}
      <div className="absolute bottom-0 left-0 px-8 sm:px-12 lg:px-16 pb-10 sm:pb-12 lg:pb-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 + index * 0.08, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Tag */}
          <p
            className="text-[10px] sm:text-[11px] font-semibold text-white/50 uppercase tracking-[0.35em] mb-2"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
          >
            {banner.tag}
          </p>

          {/* Title — same weight/family as Hero */}
          <h2
            className="font-black text-white leading-[0.88] tracking-[-0.03em] mb-5"
            style={{
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontSize: "clamp(2.2rem, 5vw, 4.5rem)",
            }}
          >
            {banner.title}
          </h2>

          {/* CTA button — outline pill */}
          <button className="group/btn relative inline-flex items-center px-6 py-2.5 border border-white/60 rounded-full overflow-hidden transition-all duration-300 hover:border-white">
            <span className="absolute inset-0 bg-white scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-350 origin-left rounded-full" />
            <span
              className="relative z-10 text-[11px] font-semibold text-white group-hover/btn:text-black uppercase tracking-widest transition-colors duration-300"
              style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
            >
              {banner.cta}
            </span>
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function HeroBanners() {
  return (
    <div className="w-full bg-[#0a0a0b]">
      {banners.map((banner, i) => (
        <BannerBlock key={i} banner={banner} index={i} />
      ))}
    </div>
  );
}