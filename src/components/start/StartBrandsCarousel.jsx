import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function StartBrandsCarousel() {
  const { data: cfg } = useQuery({
    queryKey: ["landingConfig"],
    queryFn: async () => { const c = await base44.entities.LandingConfig.list(); return c[0] || null; },
    staleTime: 30000,
  });

  const logos = cfg?.brand_logos;
  if (!logos || logos.length === 0) return null;

  const loopLogos = [...logos, ...logos, ...logos];
  const duration = logos.length * 4;

  return (
    <section
      style={{
        position: "relative",
        background: "#0c0c0c",
        padding: "clamp(16px, 3vw, 28px) 0",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes start-brands-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .start-brands-track {
          display: flex;
          gap: clamp(2.5rem, 5vw, 5rem);
          align-items: center;
          width: max-content;
          animation: start-brands-scroll ${duration}s linear infinite;
          will-change: transform;
        }
      `}</style>

      {/* Label */}
      <div style={{ textAlign: "center", marginBottom: "clamp(12px, 2.5vw, 20px)" }}>
        <span
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontWeight: 700,
            fontSize: "9px",
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "rgba(240,237,232,0.2)",
          }}
        >
          Marcas colaboradoras
        </span>
      </div>

      {/* Fade edges */}
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "96px", background: "linear-gradient(to right, #0c0c0c, transparent)", zIndex: 10, pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "96px", background: "linear-gradient(to left, #0c0c0c, transparent)", zIndex: 10, pointerEvents: "none" }} />

        <div className="start-brands-track">
          {loopLogos.map((logo, i) => (
            <div
              key={i}
              style={{ flexShrink: 0, width: "clamp(80px, 12vw, 120px)", height: "clamp(32px, 5vw, 48px)", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <img
                src={logo}
                alt="Brand"
                loading="lazy"
                draggable={false}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  opacity: 0.55,
                  filter: "grayscale(0) brightness(1)",
                  transition: "opacity 0.3s ease, filter 0.3s ease",
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.filter = "brightness(1.3) drop-shadow(0 0 10px rgba(255,255,255,0.5)) drop-shadow(0 0 24px rgba(255,88,51,0.35))"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "0.55"; e.currentTarget.style.filter = "grayscale(0) brightness(1)"; }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}