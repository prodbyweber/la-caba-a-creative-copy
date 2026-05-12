import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";

const ISOTIPO_URL = "https://media.base44.com/images/public/6966ddf48947f217e81ea27c/6b7c4002a_Titulo.png";

// Detectar móvil/tablet una sola vez (evita re-renders)
const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

function useAutoPlayVideo(src) {
  const ref = useRef(null);
  useEffect(() => {
    const vid = ref.current;
    if (!vid || !src) return;
    vid.muted = true;

    // Intento inicial y ante cualquier pausa inesperada
    const tryPlay = () => { vid.muted = true; vid.play().catch(() => {}); };

    // Arrancar inmediatamente y en cuanto haya datos
    tryPlay();
    vid.addEventListener("canplay", tryPlay);
    vid.addEventListener("loadeddata", tryPlay);

    // Si se pausa (cambio de pestaña, etc.), volver a reproducir
    vid.addEventListener("pause", tryPlay);

    // Visibilidad: reanudar cuando la pestaña vuelva a ser visible
    const onVisible = () => { if (!document.hidden) tryPlay(); };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      vid.removeEventListener("canplay", tryPlay);
      vid.removeEventListener("loadeddata", tryPlay);
      vid.removeEventListener("pause", tryPlay);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [src]);
  return ref;
}

function HeroVideo({ src }) {
  const ref = useAutoPlayVideo(src);
  return (
    <video
      ref={ref}
      src={src}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      disablePictureInPicture
      className="absolute inset-0 w-full h-full object-cover"
      style={{ pointerEvents: "none" }}
    />
  );
}

export default function Hero({ config }) {
  const heroSubtitle = config?.hero_subtitle || "Más que lo que se escucha.";
  const heroVideoUrl = config?.hero_video_url || null;

  const sectionRef = useRef(null);



  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <section ref={sectionRef} className="relative w-full min-h-screen overflow-hidden bg-[#0a0a0b]">
      {/* Background video — cubre toda la sección como fondo en loop */}
      {heroVideoUrl && (
        <>
          <div className="absolute inset-0 z-0 overflow-hidden">
            <HeroVideo src={heroVideoUrl} />
          </div>
          <div className="absolute inset-0 bg-[#0a0a0b]/30 z-0" />
        </>
      )}

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0a0a0b] to-transparent z-10" />

      {/* Bottom-right: slogan + subtítulo */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="absolute bottom-0 right-0 z-20 px-4 sm:px-8 lg:px-12 pb-10 sm:pb-14 flex flex-col items-end text-right pointer-events-auto"
      >
        <p className="text-[10px] sm:text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-1.5">
          Música · Films · Creadores
        </p>
        <p className="text-base sm:text-lg lg:text-xl font-light text-white/80 max-w-xs leading-snug">
          {heroSubtitle || "Un universo de música, cine y contenido en movimiento."}
        </p>
      </motion.div>
    </section>
  );
}