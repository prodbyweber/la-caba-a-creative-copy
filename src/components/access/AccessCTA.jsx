import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

// CTA final cinematográfico para /access.
// Usa un video/imagen real de los hero items de ExplorarItem como fondo.
export default function AccessCTA({ heroItems = [] }) {
  const videoRef = useRef(null);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef(null);

  // Elige el primer item con video hero, si no con imagen hero
  const bgItem =
    heroItems.find(i => i?.hero_media_type === "video" && i?.hero_media_url) ||
    heroItems.find(i => i?.hero_media_url) ||
    heroItems[0] ||
    null;

  const isVideo = bgItem?.hero_media_type === "video" && bgItem?.hero_media_url;

  // Play del video solo cuando la sección está visible (performance)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting && entry.intersectionRatio >= 0.4);
      },
      { threshold: [0, 0.4] }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (inView) {
      vid.muted = true;
      vid.play().catch(() => {});
    } else {
      vid.pause();
    }
  }, [inView]);

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden" style={{ minHeight: "88vh" }}>
      {/* Fondo */}
      {isVideo ? (
        <video
          ref={videoRef}
          src={bgItem.hero_media_url}
          className="absolute inset-0 w-full h-full object-cover"
          muted
          loop
          playsInline
          preload="metadata"
          style={{ filter: "brightness(0.5)" }}
        />
      ) : bgItem?.hero_media_url || bgItem?.image ? (
        <img
          src={bgItem.hero_media_url || bgItem.image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(0.5)" }}
        />
      ) : (
        <div className="absolute inset-0" style={{ background: "#080808" }} />
      )}

      {/* Overlay cinematográfico */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at center, rgba(8,8,8,0.4) 0%, rgba(8,8,8,0.85) 100%)" }} />

      {/* Contenido */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center h-full px-6 py-28 sm:py-32" style={{ minHeight: "88vh" }}>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ff5833] mb-5"
        >
          Entra al universo
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
          className="text-4xl sm:text-6xl font-black text-white leading-[1.02] max-w-3xl"
          style={{ fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "-0.03em" }}
        >
          Cabaña Creative
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.16 }}
          className="text-white/55 text-sm sm:text-lg mt-5 max-w-xl"
        >
          La plataforma de los artistas. Crea, lanza y vive tu música.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.24 }}
          className="flex items-center gap-3 flex-wrap justify-center mt-9"
        >
          <Link
            to="/register"
            className="px-8 py-3.5 rounded-full text-sm font-bold text-black transition-all hover:scale-[1.04]"
            style={{ background: "white", letterSpacing: "0.02em" }}
          >
            REGÍSTRATE
          </Link>
          <Link
            to="/login"
            className="px-8 py-3.5 rounded-full text-sm font-semibold text-white transition-all hover:bg-white/15"
            style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.18)" }}
          >
            ACCESO
          </Link>
        </motion.div>
      </div>
    </section>
  );
}