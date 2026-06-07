import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const SECTORES = [
  { label: "Moda y Streetwear", width: "large" },
  { label: "Calzado", width: "small" },
  { label: "Bebidas", width: "small" },
  { label: "Belleza y Cosmética", width: "large" },
  { label: "Audio y Tecnología", width: "large" },
  { label: "Marca Personal", width: "small" },
  { label: "Eventos y Conciertos", width: "large" },
  { label: "Hostelería", width: "small" },
];

function useAutoPlay(src) {
  const ref = useRef(null);
  const [retryCount, setRetryCount] = useState(0);
  
  useEffect(() => {
    const v = ref.current;
    if (!v || !src) return;
    
    const attemptPlay = async () => {
      v.muted = true;
      v.playsInline = true;
      try {
        await v.play();
      } catch (e) {
        if (retryCount < 3) {
          setTimeout(() => setRetryCount(c => c + 1), 500 * (retryCount + 1));
        }
      }
    };
    
    const onCanPlay = () => { attemptPlay(); };
    const onLoadedData = () => { attemptPlay(); };
    const onPause = () => { 
      if (!document.hidden) attemptPlay(); 
    };
    
    v.addEventListener("canplay", onCanPlay);
    v.addEventListener("loadeddata", onLoadedData);
    v.addEventListener("pause", onPause);
    
    attemptPlay();
    
    const handleVisibility = () => {
      if (!document.hidden && v.paused) {
        attemptPlay();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    
    return () => {
      v.removeEventListener("canplay", onCanPlay);
      v.removeEventListener("loadeddata", onLoadedData);
      v.removeEventListener("pause", onPause);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [src, retryCount]);
  
  return ref;
}

export default function MarcasHero() {
  const { data: cfg } = useQuery({
    queryKey: ["landingConfig"],
    queryFn: async () => { const c = await base44.entities.LandingConfig.list(); return c[0] || null; },
    staleTime: 30000,
  });

  const videoSrc = cfg?.hero_video_url || null;
  const imageSrc = cfg?.hero_banner_1_image || null;
  const videoRef = useAutoPlay(videoSrc);

  const handleClick = () => {
    window.dispatchEvent(new CustomEvent("open-application-modal"));
  };

  return (
    <section id="hero" style={{ background: "#080808", position: "relative", overflow: "hidden" }}>
      <style>{`
        .hero-wrap {
          display: flex;
          flex-direction: column;
          min-height: 100dvh;
          max-width: 1920px;
          margin: 0 auto;
          width: 100%;
        }
        .hero-text-col {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: clamp(80px, 10vw, 120px) clamp(24px, 6vw, 64px) 0;
          position: relative;
          z-index: 10;
          order: 1;
        }
        .hero-media-col {
          width: 100%;
          height: 52vw;
          max-height: 52vh;
          min-height: 220px;
          overflow: hidden;
          position: relative;
          flex-shrink: 0;
          order: 2;
          margin-top: 24px;
        }
        .hero-sectores-section {
          order: 3;
          background: #0a0a0b;
          padding: clamp(40px, 6vw, 60px) clamp(24px, 6vw, 64px);
          width: 100%;
          box-sizing: border-box;
          display: none;
        }
        .sectores-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
          max-width: 100%;
        }
        .sectores-header {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .sectores-title {
          font-family: 'Helvetica Neue', sans-serif;
          font-size: clamp(0.78rem, 1.3vw, 0.92rem);
          font-weight: 700;
          color: #ff5833;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin: 0;
        }
        .sectores-subtitle {
          font-family: 'Helvetica Neue', sans-serif;
          font-size: clamp(1.3rem, 2.5vw, 2rem);
          font-weight: 900;
          color: #f0ede8;
          line-height: 1.15;
          margin: 0;
          max-width: 100%;
          word-break: break-word;
          overflow-wrap: break-word;
        }
        .sectores-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: flex-start;
        }
        .sector-card {
          border: 2px solid #ff5833;
          border-radius: 30px;
          padding: 12px 24px;
          font-family: 'Helvetica Neue', sans-serif;
          font-size: clamp(0.85rem, 1.2vw, 0.95rem);
          font-weight: 600;
          color: #ff5833;
          background: transparent;
          cursor: default;
          white-space: nowrap;
        }
        .sector-card.large {
          min-width: 200px;
        }
        .sectores-button {
          align-self: flex-start;
          width: 100%;
          max-width: 500px;
          padding: clamp(16px, 2vw, 20px) clamp(24px, 4vw, 32px);
          background: #ff5833;
          border: none;
          border-radius: 12px;
          font-family: 'Helvetica Neue', sans-serif;
          font-size: clamp(0.95rem, 1.3vw, 1.1rem);
          font-weight: 900;
          color: #fff;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.2s ease;
          margin-top: 8px;
        }
        .sectores-button:hover {
          background: #e04a28;
          transform: translateY(-1px);
        }
        .sectores-subtitle-small {
          font-family: 'Helvetica Neue', sans-serif;
          font-size: clamp(0.75rem, 1vw, 0.85rem);
          font-weight: 400;
          color: rgba(240,237,232,0.35);
          margin: 0;
          padding-top: 4px;
        }
        @media (min-width: 768px) {
          .hero-wrap {
            flex-direction: row;
            height: auto;
          }
          .hero-text-col {
            width: 100%;
            flex: none;
            padding: 80px clamp(40px, 6vw, 56px) 60px;
            order: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            min-height: 100dvh;
          }
          .hero-media-col {
            width: 100%;
            max-height: none;
            height: auto;
            aspect-ratio: 16/9;
            flex: 1;
            order: 2;
            margin-top: 0;
          }
          .hero-sectores-section {
            order: 3;
            width: 100%;
            padding: 60px clamp(40px, 6vw, 56px);
          }
          .sectores-button {
            max-width: 100%;
          }
        }
        @media (min-width: 1200px) {
          .hero-text-col { padding: 120px clamp(56px, 8vw, 80px) 80px; }
          .hero-sectores-section { padding: 80px clamp(56px, 8vw, 80px); }
        }
        @media (min-width: 1280px) {
          .hero-wrap {
            flex-direction: row;
            height: 100dvh;
          }
          .hero-text-col {
            width: 50%;
            flex: none;
            padding: 120px clamp(56px, 8vw, 80px) 80px;
            order: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            min-height: 100dvh;
          }
          .hero-media-col {
            width: 50%;
            max-height: none;
            height: 100%;
            aspect-ratio: auto;
            flex: 1;
            order: 2;
            margin-top: 0;
          }
          .hero-text-col h1 {
            font-size: clamp(2.1rem, 3.5vw, 4rem) !important;
          }
          .sectores-subtitle {
            font-size: clamp(1.3rem, 2vw, 2rem) !important;
          }
          .hero-sectores-section {
            display: block;
          }
        }
      `}</style>

      <div className="hero-wrap">
        {/* Left: content */}
        <div className="hero-text-col">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: "flex", flexDirection: "column", gap: "clamp(14px, 2.2vw, 20px)", maxWidth: "600px" }}
          >
            {/* Pre-label */}
            <p style={{
              fontFamily: "'Helvetica Neue', sans-serif",
              fontSize: "clamp(0.78rem, 1.3vw, 0.92rem)",
              fontWeight: 500,
              color: "#ff5833",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              margin: 0,
            }}>
              LA AGENCIA
            </p>

            {/* Headline */}
            <h1 style={{
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontWeight: 900,
              fontSize: "clamp(2.1rem, 4vw, 4rem)",
              letterSpacing: "-0.04em",
              lineHeight: 0.93,
              color: "#f0ede8",
              margin: 0,
              maxWidth: "100%",
              wordBreak: "break-word",
              overflowWrap: "break-word",
            }}>
              Las marcas que dominan el mercado joven no interrumpen.
              <br />
              Inspiran.
            </h1>

            {/* Description */}
            <p style={{
              fontFamily: "'Helvetica Neue', sans-serif",
              fontWeight: 300,
              fontSize: "clamp(0.85rem, 1.5vw, 1rem)",
              color: "rgba(240,237,232,0.52)",
              lineHeight: 1.65,
              margin: 0,
              maxWidth: "480px",
            }}>
              Gestionamos tu proyecto creativo de principio a fin — estrategia, contenido, campañas y posicionamiento. Publicidad que no parece publicidad. Resultados que hablan solos.
            </p>

            {/* CTA row */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
              <button
                onClick={handleClick}
                style={{
                  fontFamily: "'Helvetica Neue', sans-serif",
                  fontWeight: 900,
                  fontSize: "clamp(0.85rem, 1.4vw, 0.95rem)",
                  letterSpacing: "0.01em",
                  background: "#ff5833",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "clamp(13px, 1.8vw, 17px) clamp(22px, 3vw, 36px)",
                  cursor: "pointer",
                  transition: "background 0.2s ease, transform 0.2s ease",
                  flexShrink: 0,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#e04a28"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#ff5833"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                Quiero trabajar con Cabaña →
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right: Video - same as /start hero */}
        <motion.div
          className="hero-media-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.15 }}
        >
          {videoSrc ? (
            <video
              ref={videoRef}
              autoPlay muted loop playsInline preload="auto"
              poster={imageSrc || undefined}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            >
              <source src={videoSrc} type="video/mp4" />
              {videoSrc.includes('.webm') && <source src={videoSrc.replace('.webm', '.mp4')} type="video/mp4" />}
              {videoSrc.includes('.mp4') && <source src={videoSrc.replace('.mp4', '.webm')} type="video/webm" />}
              <track kind="captions" />
            </video>
          ) : imageSrc ? (
            <img
              src={imageSrc}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", background: "linear-gradient(160deg, #1a1a1a 0%, #0c0c0c 100%)" }} />
          )}
        </motion.div>

        {/* Sectores section - below hero */}
        <motion.div
          className="hero-sectores-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="sectores-container">
            <div className="sectores-header">
              <p className="sectores-title">CON QUIÉN TRABAJAMOS</p>
              <h2 className="sectores-subtitle">
                Marcas que quieren conectar con la generación más influyente del mercado.
              </h2>
            </div>

            <div className="sectores-grid">
              {SECTORES.map((sector) => (
                <div
                  key={sector.label}
                  className={`sector-card ${sector.width === "large" ? "large" : ""}`}
                >
                  {sector.label}
                </div>
              ))}
            </div>

            <div>
              <button
                className="sectores-button"
                onClick={handleClick}
              >
                Solicitar plaza →
              </button>
              <p className="sectores-subtitle-small">
                Reúnete con nuestro equipo · Plazas limitadas
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}