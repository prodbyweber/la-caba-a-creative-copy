import React from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

function isVideoUrl(url) {
  if (!url) return false;
  // Match extension before any query string, or check content-type hints in URL
  return /\.(mp4|webm|mov|quicktime)(\?|#|$)/i.test(url) || /video\//i.test(url);
}

const defaultBanners = [
  {
    tag: "the girls",
    title: "Muse Club",
    subtitle: "She sets the tone",
    cta: "Explore",
    defaultImage: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1800&h=900&fit=crop&q=85",
    configKey: "hero_banner_1_image",
  },
  {
    tag: "Sonido nuevo",
    title: "La Nueva Corriente",
    subtitle: "Donde nace el sonido nuevo",
    cta: "Descubrir",
    defaultImage: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1800&h=900&fit=crop&q=85",
    configKey: "hero_banner_2_image",
  },
  {
    tag: "Comunidad",
    title: "Friends & Family",
    subtitle: "Inside the circle",
    cta: "Ver todo",
    defaultImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1800&h=900&fit=crop&q=85",
    configKey: "hero_banner_3_image",
  },
];

function BannerBlock({ banner, image, index }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="banner-block relative overflow-hidden group cursor-pointer"
      style={{
        height: "100svh",
        width: "100vw",
        marginLeft: "calc(-50vw + 50%)",
      }}
    >
      {/* Background: video or image */}
      {isVideoUrl(image) ? (
        <video
          key={image}
          src={image}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "center center" }}
        />
      ) : (
        <img
          src={image}
          alt={banner.title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] ease-in-out group-hover:scale-[1.04]"
          style={{ objectPosition: "center center" }}
        />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/25 group-hover:bg-black/15 transition-colors duration-700" />

      {/* Bottom gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

      {/* Content — bottom */}
      <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-12 lg:px-16 pb-12 sm:pb-14 lg:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 + index * 0.06, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Tag */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + index * 0.06, duration: 0.55 }}
            className="text-[9px] sm:text-[10px] font-semibold text-white/50 uppercase tracking-[0.4em] mb-2"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
          >
            {banner.tag}
          </motion.p>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.28 + index * 0.06, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="font-black text-white leading-[0.88] tracking-[-0.03em] mb-6"
            style={{
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontSize: "clamp(2.4rem, 8vw, 4.5rem)",
            }}
          >
            {banner.title}
          </motion.h2>

          {/* CTA button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.38 + index * 0.06, duration: 0.5 }}
          >
            <button className="group/btn relative inline-flex items-center px-5 py-2 border border-white/50 rounded-full overflow-hidden transition-all duration-300 hover:border-white">
              <span className="absolute inset-0 bg-white scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
              <span
                className="relative z-10 text-[10px] font-semibold text-white group-hover/btn:text-black uppercase tracking-widest transition-colors duration-300"
                style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
              >
                {banner.cta}
              </span>
            </button>
          </motion.div>
        </motion.div>
      </div>

    </motion.div>
  );
}

export default function HeroBanners() {
  const { data: config } = useQuery({
    queryKey: ['landingConfig'],
    queryFn: async () => {
      const configs = await base44.entities.LandingConfig.list();
      return configs.length > 0 ? configs[0] : null;
    },
    staleTime: 0,
  });

  return (
    <div className="w-full bg-[#0a0a0b] overflow-x-hidden">
      <style>{`
        @media (min-width: 768px) {
          .banner-block {
            height: clamp(380px, 60vw, 800px) !important;
          }
        }
      `}</style>
      {defaultBanners.map((banner, i) => (
        <BannerBlock
          key={i}
          banner={banner}
          image={config?.[banner.configKey] || banner.defaultImage}
          index={i}
        />
      ))}
    </div>
  );
}