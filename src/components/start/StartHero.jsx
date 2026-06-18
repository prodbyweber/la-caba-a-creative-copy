import React, { useState } from "react";
import { motion } from "framer-motion";
import StartBrandsCarousel from "@/components/start/StartBrandsCarousel";

const YOUTUBE_VIDEO_ID = "im6BfAvTsLA";

export default function StartHero() {
  const [showModal, setShowModal] = useState(false);

  const thumbnailUrl = `https://img.youtube.com/vi/${YOUTUBE_VIDEO_ID}/maxresdefault.jpg`;

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
        .hero-text-col-new {
          order: 1;
          text-align: center;
        }
        .hero-cta-row-new {
          order: 3;
          display: flex;
          justify-content: center;
        }
        .hero-brands-row-new {
          order: 4;
          padding: 24px 0 12px 0;
        }

        .hero-video-card {
          order: 2;
          width: 100%;
          aspect-ratio: 16 / 9;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          background: #141414;
          box-shadow: 0 4px 20px rgba(0,0,0,0.4), 0 0 60px rgba(0,0,0,0.7), 0 0 120px rgba(0,0,0,0.4);
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          margin-top: clamp(24px, 4vw, 40px);
          margin-bottom: clamp(28px, 5vw, 48px);
        }
        .hero-video-card:hover {
          transform: scale(1.02);
          box-shadow: 0 8px 40px rgba(255,88,51,0.25), 0 0 80px rgba(255,88,51,0.15), 0 0 160px rgba(0,0,0,0.5);
        }
        .hero-video-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Dark gradient overlay */
        .hero-card-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 60%;
          background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 50%, transparent 100%);
        }

        /* Play icon */
        .hero-play-icon {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: rgba(255,255,255,0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease, background 0.2s ease;
        }
        .hero-video-card:hover .hero-play-icon {
          transform: translate(-50%, -50%) scale(1.08);
          background: #ff5833;
        }
        .hero-play-icon svg {
          width: 28px;
          height: 28px;
        }
        .hero-video-card:hover .hero-play-icon svg path {
          fill: white;
        }

        /* Card label */
        .hero-card-label {
          position: absolute;
          bottom: 16px;
          left: 16px;
          right: 16px;
          font-family: 'Helvetica Neue', sans-serif;
          font-weight: 700;
          font-size: 16px;
          color: #ffffff;
          margin: 0;
        }

        @media (min-width: 768px) {
          .hero-wrap-new {
            justify-content: center;
          }
          .hero-text-col-new {
            text-align: center;
          }
        }
        @media (max-width: 767px) {
          .hero-wrap-new {
            padding-left: clamp(8px, 2vw, 16px);
            padding-right: clamp(8px, 2vw, 16px);
          }
        }

        /* Modal animations */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(40px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .modal-content {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>

      <div className="hero-wrap-new">
        {/* Text content */}
        <div className="hero-text-col-new">
          <div style={{ display: "flex", flexDirection: "column", gap: "clamp(14px, 2.2vw, 20px)", maxWidth: "800px", margin: "0 auto" }}>
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
              Lleva tu música del estudio al mercado actual.
            </motion.h1>

            {/* Subtitle */}
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
              El fin de las maquetas. Creamos el sonido y la identidad visual de tu próximo proyecto.
            </motion.p>

            {/* Video hint */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: "'Helvetica Neue', sans-serif",
                fontWeight: 600,
                fontSize: "clamp(0.78rem, 1.2vw, 0.88rem)",
                color: "#ff5833",
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              Mira este video de 5 minutos antes de agendar tu sesión
            </motion.p>
          </div>
        </div>

        {/* Video Card — Catálogo-style */}
        <motion.div
          className="hero-video-card"
          onClick={() => setShowModal(true)}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <img src={thumbnailUrl} alt="Cabaña Creative" />

          {/* Dark gradient */}
          <div className="hero-card-overlay" />

          {/* Play icon */}
          <div className="hero-play-icon">
            <svg viewBox="0 0 24 24" fill="black">
              <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
            </svg>
          </div>

          {/* Card label */}
          <div className="hero-card-label">
            Cabaña Creative
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="hero-cta-row-new"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <button
            onClick={() => { document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth", block: "center" }); }}
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
            Sesión de descubrimiento gratis →
          </button>
        </motion.div>

        {/* Brands carousel */}
        <motion.div
          className="hero-brands-row-new"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <StartBrandsCarousel />
        </motion.div>
      </div>

      {/* Premium Modal — same style as CatalogoCarousel */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.92)",
            backdropFilter: "blur(20px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="modal-content"
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "1100px",
              background: "#0f0f0f",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "rgba(0,0,0,0.7)",
                border: "1px solid rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 10,
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.9)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.7)"}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Video area */}
            <div style={{
              position: "relative",
              width: "100%",
              paddingTop: "56.25%",
              background: "#000",
            }}>
              <iframe
                src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&rel=0&modestbranding=1`}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
                title="Cabaña Creative"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Info section */}
            <div style={{
              padding: "32px 40px",
              background: "linear-gradient(to top, #0f0f0f 0%, #1a1a1a 100%)",
            }}>
              <h2 style={{
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontWeight: 900,
                fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                color: "#ffffff",
                marginBottom: "12px",
              }}>
                Cabaña Creative
              </h2>
              <p style={{
                fontFamily: "'Helvetica Neue', sans-serif",
                fontWeight: 500,
                fontSize: "clamp(1rem, 2vw, 1.2rem)",
                color: "#AAAAAA",
                marginBottom: "24px",
              }}>
                Lleva tu música del estudio al mercado actual
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}