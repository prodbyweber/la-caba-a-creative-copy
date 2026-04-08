import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const banners = [
  {
    title: "MUSE CLUB",
    subtitle: "She sets the tone",
    cta: "Explore",
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&h=1100&fit=crop&q=80",
  },
  {
    title: "LA NUEVA CORRIENTE",
    subtitle: "Donde nace el sonido nuevo",
    cta: "Descubrir",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=1100&fit=crop&q=80",
  },
  {
    title: "FRIENDS & FAMILY",
    subtitle: "Inside the circle",
    cta: "View All",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=1100&fit=crop&q=80",
  },
];

function BannerCard({ banner, index }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: index * 0.1 }}
      className="relative overflow-hidden group cursor-pointer"
      style={{ aspectRatio: "3/4" }}
    >
      {/* Parallax image */}
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={{ y: imgY, scale: 1.08 }}
      >
        <img
          src={banner.image}
          alt={banner.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
        />
      </motion.div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-500" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

      {/* Content — bottom left */}
      <div className="absolute bottom-0 left-0 p-7 sm:p-8 lg:p-9">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 + index * 0.1, duration: 0.55 }}
        >
          <p className="text-[10px] font-semibold text-white/50 uppercase tracking-[0.3em] mb-2">
            {banner.subtitle}
          </p>
          <h3
            className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight mb-5"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
          >
            {banner.title}
          </h3>

          {/* Outline button */}
          <button className="group/btn relative px-5 py-2.5 border border-white/70 rounded-full text-[11px] font-semibold text-white uppercase tracking-widest overflow-hidden transition-all duration-300 hover:border-white">
            <span className="absolute inset-0 bg-white scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
            <span className="relative z-10 group-hover/btn:text-black transition-colors duration-300">
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
    <section className="bg-[#0a0a0b] px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
      <div className="max-w-[1400px] mx-auto">
        {/* 3-col desktop / 1-col mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {banners.map((banner, i) => (
            <BannerCard key={i} banner={banner} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}