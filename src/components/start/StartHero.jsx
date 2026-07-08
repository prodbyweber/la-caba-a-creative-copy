import React, { useState } from "react";
import { motion } from "framer-motion";
import StartBrandsCarousel from "@/components/start/StartBrandsCarousel";

const YOUTUBE_VIDEO_ID = "5x2e8RIdILU";

export default function StartHero() {
  const [showModal, setShowModal] = useState(false);
  const [showCalendly, setShowCalendly] = useState(false);
  const [calendlyLoaded, setCalendlyLoaded] = useState(false);

  const thumbnailUrl = `https://img.youtube.com/vi/${YOUTUBE_VIDEO_ID}/maxresdefault.jpg`;

  const calendlyUrl = "https://calendly.com/hola-cabanacreative/creadores?primary_color=ff5833&hide_gdpr_banner=0&background_color=080808&text_color=f0ede8&hide_event_type_details=1";

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
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(8px);
          border: 1.5px solid rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease, background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 0 30px rgba(0,0,0,0.5);
        }
        .hero-video-card:hover .hero-play-icon {
          transform: translate(-50%, -50%) scale(1.08);
          background: rgba(0,0,0,0.65);
          border-color: rgba(255,255,255,0.35);
          box-shadow: 0 0 40px rgba(0,0,0,0.7);
        }
        .hero-play-icon svg {
          width: 30px;
          height: 30px;
        }
        .hero-play-icon svg path {
          fill: white;
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
              Construimos tu catálogo musical y la identidad que lidera el mercado joven.
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
              Obten acceso a La Cabaña y cuenta con una infraestructura completa para tu proyecto musical.
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
            <svg viewBox="0 0 24 24" fill="white">
              <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
            </svg>
          </div>


        </motion.div>

        {/* Video card CTA */}
        <motion.div
          className="hero-cta-row-new"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: "clamp(24px, 4vw, 40px)" }}
        >
          <button
            onClick={() => setShowCalendly(true)}
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
            Agendar sesión de descubrimiento gratis →
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

      {/* Hidden Calendly preloader */}
      <div style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", opacity: 0, pointerEvents: "none" }}>
        <iframe
          src={calendlyUrl}
          width="1"
          height="1"
          frameBorder="0"
          title="Calendly preload"
          onLoad={() => setCalendlyLoaded(true)}
        />
      </div>

      {/* Calendly Popup Modal */}
      {showCalendly && (
        <div
          onClick={() => setShowCalendly(false)}
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
              maxWidth: "700px",
              maxHeight: "90dvh",
              background: "#0f0f0f",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setShowCalendly(false)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "rgba(0,0,0,0.7)",
                border: "1px solid rgba(255,255,255,0.15)",
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Header */}
            <div style={{
              padding: "clamp(20px, 3vw, 28px) clamp(20px, 3vw, 32px)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
              <p style={{
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontWeight: 700,
                fontSize: "10px",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "rgba(240,237,232,0.3)",
                margin: "0 0 6px 0",
              }}>
                Sesión de descubrimiento
              </p>
              <h3 style={{
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontWeight: 900,
                fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)",
                letterSpacing: "-0.03em",
                color: "#f0ede8",
                margin: 0,
                lineHeight: 1.15,
              }}>
                Agenda tu reunión con nosotros
              </h3>
            </div>

            {/* Calendly iframe */}
            <div style={{ width: "100%", position: "relative" }}>
              {!calendlyLoaded && (
                <div style={{
                  position: "absolute", inset: 0, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  background: "#0f0f0f", zIndex: 1, minHeight: "500px",
                }}>
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "50%",
                    border: "2px solid #ff5833", borderTopColor: "transparent",
                    animation: "spin 0.7s linear infinite",
                  }} />
                </div>
              )}
              <iframe
                src={calendlyUrl}
                width="100%"
                frameBorder="0"
                scrolling="no"
                title="Agendar sesión"
                onLoad={() => setCalendlyLoaded(true)}
                style={{
                  display: "block",
                  border: "none",
                  width: "100%",
                  height: "580px",
                  minHeight: "580px",
                }}
              />
            </div>
          </div>
        </div>
      )}

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