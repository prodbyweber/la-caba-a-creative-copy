import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const STATS = [
  { label: "Método de trabajo", value: "Presencial · Online" },
  { label: "Duración", value: "90 días" },
  { label: "Plazas disponibles", value: "27" },
  { label: "Horario", value: "Lunes a Viernes 15:00 – 22:00" },
];

function useAutoPlay(src) {
  const ref = useRef(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || !src) return;
    const play = () => { v.muted = true; v.play().catch(() => {}); };
    play();
    v.addEventListener("canplay", play);
    v.addEventListener("pause", play);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) play(); });
    return () => { v.removeEventListener("canplay", play); v.removeEventListener("pause", play); };
  }, [src]);
  return ref;
}

export default function StartHero() {
  const { data: cfg } = useQuery({
    queryKey: ["landingConfig"],
    queryFn: async () => { const c = await base44.entities.LandingConfig.list(); return c[0] || null; },
    staleTime: 30000,
  });

  const videoSrc = cfg?.hero_video_url || null;
  const imageSrc = cfg?.hero_banner_1_image || null;
  const videoRef = useAutoPlay(videoSrc);

  const scrollToContact = () => {
    const el = document.getElementById("contacto");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="hero" style={{ background: "#080808", position: "relative", overflow: "hidden" }}>
      <style>{`
        .hero-wrap {
          display: flex;
          flex-direction: column;
          min-height: 100dvh;
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
        .hero-stats-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-top: 16px;
          order: 3;
          padding: 0 20px 40px;
          width: 100%;
          box-sizing: border-box;
        }
        .hero-stats-inline {
          display: none;
        }
        @media (min-width: 768px) {
          .hero-wrap {
            flex-direction: row;
            height: 100dvh;
          }
          .hero-text-col {
            width: 54%;
            flex: none;
            padding: 80px 56px 60px;
            order: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .hero-media-col {
            width: 46%;
            max-height: none;
            height: 100%;
            flex: 1;
            order: 2;
            margin-top: 0;
          }
          .hero-stats-grid {
            display: none;
          }
          .hero-stats-inline {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
            margin-top: clamp(20px, 3vw, 32px);
            width: 100%;
          }
        }
        @media (min-width: 1200px) {
          .hero-text-col { padding: 120px 80px 80px; }
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
              color: "rgba(240,237,232,0.45)",
              letterSpacing: "0.04em",
              margin: 0,
            }}>
              ¿Tienes el talento pero no el plan?
            </p>

            {/* Headline */}
            <h1 style={{
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontWeight: 900,
              fontSize: "clamp(2.1rem, 5.2vw, 4rem)",
              letterSpacing: "-0.04em",
              lineHeight: 0.93,
              color: "#f0ede8",
              margin: 0,
            }}>
              Plan de desarrollo artístico para creadores independientes
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
              Identidad, producción musical, audiovisual y marketing, somos tu equipo creativo. Para artistas que quieren crecer con criterio, no con suerte.
            </p>

            {/* CTA row */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
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
                  flexShrink: 0,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#e04a28"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#ff5833"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                Solicitar información →
              </button>
            </div>

            {/* Stats inline — desktop only */}
            <div className="hero-stats-inline">
              {STATS.map(stat => (
                <div key={stat.label} style={{
                  background: "#111",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}>
                  <p style={{ fontFamily: "'Helvetica Neue', sans-serif", fontSize: "8px", fontWeight: 700, color: "rgba(240,237,232,0.28)", textTransform: "uppercase", letterSpacing: "0.2em", margin: "0 0 3px" }}>{stat.label}</p>
                  <p style={{ fontFamily: "'Helvetica Neue', sans-serif", fontSize: "clamp(0.78rem, 1.2vw, 0.88rem)", fontWeight: 700, color: "#f0ede8", margin: 0, letterSpacing: "-0.02em" }}>{stat.value}</p>
                </div>
              ))}
            </div>

          </motion.div>
        </div>

        {/* Right: Media */}
        <motion.div
          className="hero-media-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.15 }}
        >
          {videoSrc ? (
            <video
              ref={videoRef}
              src={videoSrc}
              autoPlay muted loop playsInline preload="auto"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          ) : imageSrc ? (
            <img
              src={imageSrc}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", background: "linear-gradient(160deg, #1a1a1a 0%, #0c0c0c 100%)" }} />
          )}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(8,8,8,0.45) 0%, transparent 35%)" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "25%", background: "linear-gradient(to top, rgba(8,8,8,0.7) 0%, transparent 100%)" }} />
        </motion.div>

        {/* Stats — below video on mobile only */}
        <div className="hero-stats-grid">
          {STATS.map(stat => (
            <div key={stat.label} style={{
              background: "rgba(255,255,255,0.04)",
              borderRadius: "16px",
              padding: "28px 24px",
              border: "1px solid rgba(255,255,255,0.08)",
              width: "100%",
              boxSizing: "border-box",
            }}>
              <p style={{ fontFamily: "'Helvetica Neue', sans-serif", fontSize: "1.15rem", fontWeight: 700, color: "#f0ede8", margin: "0 0 8px", letterSpacing: "-0.01em" }}>{stat.label}</p>
              <p style={{ fontFamily: "'Helvetica Neue', sans-serif", fontSize: "0.95rem", fontWeight: 400, color: "rgba(240,237,232,0.5)", margin: 0, lineHeight: 1.4 }}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}