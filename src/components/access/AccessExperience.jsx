import React from "react";
import { motion } from "framer-motion";

// Sección de experiencia cinematográfica para /access.
// Reutiliza ExplorarItems reales con media hero (video preferido) y los presenta
// como paneles full-bleed con texto superpuesto y animaciones al hacer scroll.
// No inventa contenido: usa exclusivamente items de ExplorarItem.
export default function AccessExperience({ rawItems = [], artists = [] }) {
  // Priorizar items con video hero, luego con imagen hero, luego con thumbnail
  const withMedia = rawItems.filter(
    i => (i.hero_media_type === "video" && i.hero_media_url) || i.hero_media_url || i.thumbnail_url
  );
  // Videos primero para máximo impacto cinematográfico
  const videos = withMedia.filter(i => i.hero_media_type === "video" && i.hero_media_url);
  const images = withMedia.filter(i => !(i.hero_media_type === "video" && i.hero_media_url));
  const cinematic = [...videos, ...images].slice(0, 3);

  if (cinematic.length === 0) return null;

  return (
    <section className="relative bg-[#080808] py-20 sm:py-28">
      {/* Encabezado de sección */}
      <div className="px-6 sm:px-12 mb-12 sm:mb-16">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-[10px] font-black uppercase tracking-[0.28em] text-[#ff5833] mb-4"
        >
          El universo Cabaña
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
          className="text-3xl sm:text-5xl font-black text-white leading-[1.05] max-w-2xl"
          style={{ fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "-0.03em" }}
        >
          Una experiencia audiovisual en cada lanzamiento.
        </motion.h2>
      </div>

      {/* Paneles cinematográficos */}
      <div className="space-y-4 sm:space-y-6 px-4 sm:px-6">
        {cinematic.map((item, idx) => {
          const isVideo = item.hero_media_type === "video" && item.hero_media_url;
          const artist = artists.find(a => a.id === item.artist_id);
          const alignLeft = idx % 2 === 0;
          return (
            <motion.div
              key={item.id || idx}
              initial={{ opacity: 0, scale: 1.04 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl"
              style={{ aspectRatio: "16/9", maxHeight: "78vh" }}
            >
              {isVideo ? (
                <video
                  src={item.hero_media_url}
                  className="absolute inset-0 w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  style={{ filter: "brightness(0.78)" }}
                />
              ) : (
                <motion.img
                  src={item.hero_media_url || item.thumbnail_url}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  initial={{ scale: 1.08 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
                  style={{ filter: "brightness(0.78)" }}
                />
              )}

              {/* Overlays */}
              <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(8,8,8,0.9) 0%, rgba(8,8,8,0.2) 45%, transparent 100%)" }} />
              {!alignLeft && (
                <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to left, rgba(8,8,8,0.7) 0%, transparent 55%)" }} />
              )}
              {alignLeft && (
                <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to right, rgba(8,8,8,0.7) 0%, transparent 55%)" }} />
              )}

              {/* Texto superpuesto */}
              <div className={`absolute inset-0 flex flex-col justify-end p-6 sm:p-12 ${alignLeft ? "items-start text-left" : "items-end text-right"}`}>
                <motion.div
                  initial={{ opacity: 0, y: 26 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                  className={`max-w-md ${alignLeft ? "" : "ml-auto"}`}
                >
                  <span className="text-[10px] font-black uppercase tracking-[0.24em] text-[#ff8866] mb-3 block">
                    {item.content_type || "Producción"}
                  </span>
                  <h3
                    className="text-2xl sm:text-4xl font-black text-white leading-[1.05] mb-2"
                    style={{ fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "-0.03em" }}
                  >
                    {item.title}
                  </h3>
                  {(artist?.stageName || item.subtitle) && (
                    <p className="text-white/55 text-sm sm:text-base">
                      {artist?.stageName || item.subtitle}
                    </p>
                  )}
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}