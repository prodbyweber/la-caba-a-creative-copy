import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

// Hero cinematográfico a pantalla completa (100dvh) para /access.
// Reutiliza los items hero de ExplorarItem (is_hero) con su video/imagen real.
// Video autoplay, muted, loop, object-fit cover. Overlays cinematográficos.
export default function AccessHero({ items = [], artists = [] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [ready, setReady] = useState(false);
  const videoRefs = useRef([]);

  const heroItems = items.length > 0 ? items : [];

  // Preload del primer item (imagen) — el video avisa via onCanPlay
  useEffect(() => {
    if (heroItems.length === 0) return;
    const first = heroItems[0];
    const isVideo = first?.hero_media_type === "video" && first?.hero_media_url;
    if (isVideo) return;
    const src = first?.hero_media_url || first?.image;
    if (!src) { setReady(true); return; }
    const img = new Image();
    img.onload = () => setReady(true);
    img.onerror = () => setReady(true);
    img.src = src;
  }, [heroItems.length > 0 ? heroItems[0]?.id : null]);

  // Rotación lenta cinematográfica (9s)
  useEffect(() => {
    if (heroItems.length <= 1) return;
    const t = setInterval(() => {
      setActiveIdx(i => (i + 1) % heroItems.length);
    }, 9000);
    return () => clearInterval(t);
  }, [heroItems.length]);

  // Play del video activo, pausa del resto
  useEffect(() => {
    videoRefs.current.forEach((vid, idx) => {
      if (!vid) return;
      if (idx === activeIdx) {
        vid.muted = true;
        vid.play().catch(() => {});
      } else {
        vid.pause();
      }
    });
  }, [activeIdx]);

  // Fallback sin contenido
  if (heroItems.length === 0) {
    return (
      <section className="relative w-full flex items-center justify-center" style={{ height: "100dvh", background: "#080808" }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="text-center px-6"
        >
          <h1
            className="text-3xl sm:text-5xl font-black text-white leading-[1.05]"
            style={{ fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "-0.03em" }}
          >
            Cabaña Creative
          </h1>
          <p className="text-white/45 text-sm sm:text-base mt-3">El universo audiovisual de los artistas.</p>
          <div className="flex items-center justify-center gap-3 mt-8">
            <Link to="/register" className="px-6 py-3 rounded-full text-xs font-bold text-black" style={{ background: "white" }}>REGÍSTRATE</Link>
            <Link to="/login" className="px-6 py-3 rounded-full text-xs font-semibold text-white" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>ACCESO</Link>
          </div>
        </motion.div>
      </section>
    );
  }

  const current = heroItems[activeIdx];
  const artist = artists.find(a => a.id === current?.artist_id);

  return (
    <section className="relative w-full overflow-hidden" style={{ height: "100dvh", minHeight: 560 }}>
      {/* Slides */}
      {heroItems.map((item, idx) => {
        const isVideo = item?.hero_media_type === "video" && item?.hero_media_url;
        return (
          <div
            key={item.id || idx}
            className="absolute inset-0"
            style={{
              opacity: idx === activeIdx ? 1 : 0,
              transition: "opacity 1.4s ease-in-out",
              pointerEvents: idx === activeIdx ? "auto" : "none",
            }}
          >
            {isVideo ? (
              <video
                ref={el => (videoRefs.current[idx] = el)}
                src={item.hero_media_url}
                className="absolute inset-0 w-full h-full object-cover"
                muted
                loop
                playsInline
                preload="auto"
                onCanPlay={idx === 0 ? () => setReady(true) : undefined}
                style={{ filter: "brightness(0.82) saturate(1.05)" }}
              />
            ) : (
              <img
                src={item?.hero_media_url || item?.image}
                alt={item?.title}
                className="w-full h-full object-cover"
                style={{ filter: "brightness(0.82) saturate(1.05)" }}
              />
            )}
          </div>
        );
      })}

      {/* Overlays cinematográficos */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, rgba(8,8,8,0.4) 0%, rgba(8,8,8,0.1) 35%, rgba(8,8,8,0.92) 100%)" }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to right, rgba(8,8,8,0.55) 0%, transparent 60%)" }}
      />

      {/* Contenido */}
      <motion.div
        initial={{ opacity: 0, y: 36 }}
        animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
        className="relative z-10 flex flex-col justify-end h-full px-6 sm:px-12 pb-24 sm:pb-28 max-w-3xl"
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#ff5833]">Cabaña Creative</span>
          {current?.subtitle && (
            <>
              <span className="text-white/20 text-xs">·</span>
              <span className="text-[10px] text-white/55 uppercase tracking-wider">{current.subtitle}</span>
            </>
          )}
        </div>

        <h1
          className="text-4xl sm:text-6xl font-black text-white leading-[1.02] mb-3"
          style={{ fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "-0.03em" }}
        >
          {current?.title}
        </h1>

        {artist && (
          <p className="text-white/55 text-sm sm:text-base mb-7 font-medium">
            por <span className="text-white">{artist.stageName}</span>
          </p>
        )}

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            to="/register"
            className="px-7 py-3.5 rounded-full text-sm font-bold text-black transition-all hover:scale-[1.04]"
            style={{ background: "white", letterSpacing: "0.02em" }}
          >
            REGÍSTRATE
          </Link>
          <Link
            to="/login"
            className="px-7 py-3.5 rounded-full text-sm font-semibold text-white transition-all hover:bg-white/15"
            style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.18)" }}
          >
            ACCESO
          </Link>
        </div>
      </motion.div>

      {/* Dots */}
      {heroItems.length > 1 && (
        <div className="absolute bottom-8 right-6 sm:right-12 z-20 flex items-center gap-1.5">
          {heroItems.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={`h-0.5 rounded-full transition-all duration-500 ${idx === activeIdx ? "w-7 bg-white" : "w-2.5 bg-white/25 hover:bg-white/50"}`}
            />
          ))}
        </div>
      )}

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: ready ? 1 : 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-7 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5"
      >
        <span className="text-[9px] uppercase tracking-[0.25em] text-white/40">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-4 h-4 text-white/40" />
        </motion.div>
      </motion.div>
    </section>
  );
}