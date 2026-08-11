import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const LOGO = "https://media.base44.com/images/public/6966ddf48947f217e81ea27c/6b7c4002a_Titulo.png";

// Landing de acceso a Cabaña Creative.
// Una sola pantalla full-screen. Objetivo único: REGÍSTRATE.
// Reutiliza únicamente los medios audiovisuales existentes (ExplorarItem hero)
// como ambientación de fondo. Sin secciones, sin catálogo, sin cards.
export default function Access() {
  const [ready, setReady] = useState(false);
  const videoRef = useRef(null);

  // Medios existentes de Cabaña Creative (solo para fondo ambiental)
  const { data: explorarItems = [] } = useQuery({
    queryKey: ["explorar-items"],
    queryFn: () => base44.entities.ExplorarItem.filter({ is_active: true }),
  });

  // Elegir el mejor medio de fondo: video hero → imagen hero → thumbnail
  const heroItems = explorarItems.filter(i => i.is_hero);
  const bgVideo = heroItems.find(i => i.hero_media_type === "video" && i.hero_media_url)
    || explorarItems.find(i => i.hero_media_type === "video" && i.hero_media_url);
  const bgImage = heroItems.find(i => i.hero_media_url)?.hero_media_url
    || explorarItems.find(i => i.hero_media_url)?.hero_media_url
    || heroItems[0]?.thumbnail_url
    || explorarItems[0]?.thumbnail_url;

  const isVideo = !!bgVideo;

  // Revelar cuando el medio está listo (imagen preload o video onCanPlay)
  useEffect(() => {
    if (isVideo) return; // el video avisa via onCanPlay
    if (!bgImage) { setReady(true); return; }
    const img = new Image();
    img.onload = () => setReady(true);
    img.onerror = () => setReady(true);
    img.src = bgImage;
  }, [isVideo, bgImage]);

  // Play del video de fondo
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = true;
    vid.play().catch(() => {});
  }, [bgVideo]);

  return (
    <div className="relative w-full overflow-hidden bg-[#080808]" style={{ height: "100dvh" }}>
      {/* ── Fondo audiovisual (ambientación) ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: ready ? 1 : 0 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
        className="absolute inset-0"
      >
        {isVideo ? (
          <video
            ref={videoRef}
            src={bgVideo}
            className="absolute inset-0 w-full h-full object-cover"
            muted
            loop
            playsInline
            preload="auto"
            onCanPlay={() => setReady(true)}
            style={{ filter: "brightness(0.62) saturate(1.05)", transform: "scale(1.04)" }}
          />
        ) : bgImage ? (
          <img
            src={bgImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "brightness(0.62) saturate(1.05)" }}
          />
        ) : null}
      </motion.div>

      {/* ── Overlay cinematográfico ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.1 }}
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 90% 70% at center, rgba(8,8,8,0.35) 0%, rgba(8,8,8,0.78) 100%)" }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, rgba(8,8,8,0.5) 0%, transparent 30%, transparent 70%, rgba(8,8,8,0.6) 100%)" }}
      />

      {/* ── Marca (sup. izq.) ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        className="absolute top-5 left-5 sm:top-8 sm:left-10 z-20"
      >
        <img src={LOGO} alt="Cabaña Creative" className="h-8 sm:h-9 w-auto opacity-90" />
      </motion.div>

      {/* ── ACCESO discreto (sup. der.) ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
        className="absolute top-5 right-5 sm:top-8 sm:right-10 z-20"
      >
        <Link
          to="/login"
          className="group flex items-center gap-1.5 text-[11px] sm:text-xs text-white/55 hover:text-white transition-colors"
          style={{ fontFamily: "'Helvetica Neue', sans-serif" }}
        >
          <span className="hidden sm:inline">¿Ya tienes una cuenta?</span>
          <span className="font-semibold underline underline-offset-4 decoration-white/25 group-hover:decoration-white/60 transition-all">ACCESO</span>
        </Link>
      </motion.div>

      {/* ── Contenido central ── */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center h-full px-6">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
          className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.34em] text-white/70 mb-5 sm:mb-7"
          style={{ fontFamily: "'Helvetica Neue', sans-serif" }}
        >
          Cabaña Creative
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.62 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.02] mb-5 sm:mb-6 max-w-3xl"
          style={{ fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "-0.035em" }}
        >
          Tu música empieza aquí.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.74 }}
          className="text-white/55 text-sm sm:text-base lg:text-lg max-w-md sm:max-w-lg mb-9 sm:mb-11 leading-relaxed"
        >
          Un espacio creativo para desarrollar, producir y llevar tu proyecto musical más lejos.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.88 }}
        >
          <Link
            to="/register"
            className="group inline-flex items-center justify-center px-12 sm:px-14 py-4 sm:py-5 rounded-full text-sm sm:text-base font-bold text-black transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_8px_40px_rgba(255,255,255,0.25)]"
            style={{ background: "white", letterSpacing: "0.02em", fontFamily: "'Helvetica Neue', sans-serif" }}
          >
            REGÍSTRATE
          </Link>
        </motion.div>
      </div>
    </div>
  );
}