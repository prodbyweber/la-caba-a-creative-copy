import React, { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const ISOTIPO_URL = "https://media.base44.com/images/public/6966ddf48947f217e81ea27c/6b7c4002a_Titulo.png";

export default function Hero({ config }) {
  const heroSubtitle = config?.hero_subtitle || "Producción, imagen y narrativa para artistas que van en serio.";
  const heroVideoUrl = config?.hero_video_url || null;

  const sectionRef = useRef(null);
  const [active, setActive] = useState(true);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Sin springs — transforms directos, máximo rendimiento en producción
  const opacity = useTransform(scrollYProgress, [0.35, 0.52], [1, 0]);
  const x = useTransform(scrollYProgress, [0, 0.45], ["0%", "-44%"]);
  const y = useTransform(scrollYProgress, [0, 0.45], ["0%", "-43%"]);
  const scale = useTransform(scrollYProgress, [0, 0.45], [1, 0.095]);

  // Desmontar elementos fixed cuando el hero ya no está en pantalla
  useEffect(() => {
    const unsub = scrollYProgress.on("change", (v) => {
      setActive(v < 0.98);
    });
    return unsub;
  }, [scrollYProgress]);

  return (
    <section ref={sectionRef} className="relative w-full min-h-screen overflow-hidden bg-[#0a0a0b]">
      {heroVideoUrl && (
        <>
          <div className="absolute inset-0 flex items-center justify-center z-0">
            <video
              src={heroVideoUrl}
              autoPlay
              muted
              loop
              playsInline
              className="w-[85%] h-[85%] object-cover opacity-60 rounded-2xl"
            />
          </div>
          <div className="absolute inset-0 bg-[#0a0a0b]/15 z-0" />
        </>
      )}

      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0a0a0b] to-transparent z-10" />

      {active && (
        <>
          {/* Isotipo centrado */}
          <motion.div
            className="fixed inset-0 flex items-start justify-center pointer-events-none select-none z-[60]"
            style={{ opacity, paddingTop: "12vh", willChange: "opacity" }}
          >
            <img
              src={ISOTIPO_URL}
              alt=""
              style={{ height: "clamp(3rem, 9vw, 10vw)", width: "auto", display: "block" }}
            />
          </motion.div>

          {/* Título animado — viaja al logo del nav */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center pointer-events-none select-none z-[60]"
            style={{
              x,
              y,
              scale,
              transformOrigin: "left top",
              opacity,
              willChange: "transform, opacity",
            }}
          >
            <div>
              <div
                className="leading-[0.85] font-black tracking-[-0.04em] whitespace-nowrap"
                style={{
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                  fontSize: "clamp(5rem, 18vw, 20vw)",
                  color: "#ff5833",
                }}
              >
                Cabaña
                <sup style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.25em", fontWeight: 400, marginLeft: "0.1em", verticalAlign: "super" }}>
                  ®
                </sup>
              </div>
              <div
                className="leading-[0.85] font-black tracking-[-0.04em] whitespace-nowrap"
                style={{
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                  fontSize: "clamp(5rem, 18vw, 20vw)",
                  color: "#ffffff",
                }}
              >
                Creative
              </div>
            </div>
          </motion.div>
        </>
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="absolute bottom-0 left-0 right-0 z-20 px-4 sm:px-8 lg:px-12 pb-28 sm:pb-32 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pointer-events-auto"
      >
        <div>
          <p className="text-[11px] sm:text-xs font-semibold text-white/50 uppercase tracking-widest mb-1">
            Estudio creativo · Madrid
          </p>
          <p className="text-base sm:text-lg lg:text-xl font-light text-white/90 max-w-sm leading-snug">
            {heroSubtitle}
          </p>
        </div>
      </motion.div>
    </section>
  );
}