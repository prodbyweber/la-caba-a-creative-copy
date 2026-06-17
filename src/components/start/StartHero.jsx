import React, { useState } from "react";
import { motion } from "framer-motion";

const YOUTUBE_VIDEO_ID = "im6BfAvTsLA";

export default function StartHero() {
  const [videoLoaded, setVideoLoaded] = useState(false);

  const youtubeEmbedUrl = `https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${YOUTUBE_VIDEO_ID}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`;

  return (
    <section id="hero" style={{ background: "#080808", position: "relative", overflow: "hidden" }}>
      <style>{`
        .hero-wrap-new {
          display: flex;
          flex-direction: column;
          min-height: 100dvh;
          max-width: 1200px;
          margin: 0 auto;
          padding: clamp(80px, 10vw, 120px) clamp(20px, 6vw, 56px) clamp(40px, 6vw, 80px);
        }
        .hero-video-container {
          width: 100%;
          position: relative;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 0 60px rgba(0,0,0,0.7), 0 0 120px rgba(0,0,0,0.4), 0 20px 60px rgba(0,0,0,0.5);
          aspect-ratio: 16 / 9;
          background: #0d0d0d;
          margin-top: clamp(24px, 4vw, 40px);
          margin-bottom: clamp(28px, 5vw, 48px);
          order: 2;
        }
        .hero-video-container iframe {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border: none;
        }
        .hero-video-loader {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0d0d0d;
          z-index: 2;
          transition: opacity 0.5s ease;
        }
        .hero-video-loader.hidden {
          opacity: 0;
          pointer-events: none;
        }
        .hero-text-col-new {
          order: 1;
          text-align: center;
        }
        .hero-cta-row-new {
          order: 3;
          display: flex;
          justify-content: center;
        }
        @media (min-width: 768px) {
          .hero-wrap-new {
            justify-content: center;
          }
          .hero-text-col-new {
            text-align: center;
          }
        }
      `}</style>

      <div className="hero-wrap-new">
        {/* Text content */}
        <div className="hero-text-col-new">
          <div style={{ display: "flex", flexDirection: "column", gap: "clamp(14px, 2.2vw, 20px)", maxWidth: "800px", margin: "0 auto" }}>
            {/* Pre-label */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: "'Helvetica Neue', sans-serif",
                fontSize: "clamp(0.78rem, 1.3vw, 0.92rem)",
                fontWeight: 500,
                color: "rgba(240,237,232,0.45)",
                letterSpacing: "0.04em",
                margin: 0,
              }}
            >
              ¿Tienes el talento pero no el plan?
            </motion.p>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontWeight: 900,
                fontSize: "clamp(2.1rem, 5vw, 4rem)",
                letterSpacing: "-0.04em",
                lineHeight: 0.93,
                color: "#f0ede8",
                margin: 0,
                wordBreak: "break-word",
                overflowWrap: "break-word",
              }}
            >
              Lleva tu música del estudio al mercado real.
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: "'Helvetica Neue', sans-serif",
                fontWeight: 300,
                fontSize: "clamp(0.85rem, 1.5vw, 1rem)",
                color: "rgba(240,237,232,0.52)",
                lineHeight: 1.65,
                margin: 0,
              }}
            >
              Dejemos atrás las maquetas. Diseñamos, producimos y posicionamos tu proyecto musical con la estética visual y el sonido premium que exige la industria hoy.
            </motion.p>
          </div>
        </div>

        {/* YouTube Embed */}
        <motion.div
          className="hero-video-container"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          {!videoLoaded && (
            <div className={`hero-video-loader ${videoLoaded ? "hidden" : ""}`}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%",
                border: "2px solid rgba(255,88,51,0.3)", borderTopColor: "#ff5833",
                animation: "spin-hero 0.8s linear infinite",
              }} />
              <style>{`@keyframes spin-hero { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}
          <iframe
            src={youtubeEmbedUrl}
            title="Cabaña Creative — Lleva tu música del estudio al mercado real"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            onLoad={() => setVideoLoaded(true)}
            style={{
              border: "none",
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
            }}
          />
        </motion.div>

        {/* CTA — debajo del vídeo */}
        <motion.div
          className="hero-cta-row-new"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <button
            onClick={() => { window.dispatchEvent(new CustomEvent("open-application-modal")); }}
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
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#e04a28"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#ff5833"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            Solicitar información →
          </button>
        </motion.div>
      </div>
    </section>
  );
}