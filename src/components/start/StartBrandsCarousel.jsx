import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";

export default function StartBrandsCarousel() {
  const { data: cfg } = useQuery({
    queryKey: ["landingConfig"],
    queryFn: async () => { const c = await base44.entities.LandingConfig.list(); return c[0] || null; },
    staleTime: 30000,
  });

  const logos = cfg?.brand_logos || [];

  if (!logos || logos.length === 0) return null;

  // Duplicate logos for seamless loop
  const loopLogos = [...logos, ...logos, ...logos];

  return (
    <div style={{ width: "100%", overflow: "hidden" }}>
      <style>{`
        @keyframes infinite-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-${logos.length * 200}px); }
        }
        .scroll-track {
          display: flex;
          gap: 0;
          animation: infinite-scroll 30s linear infinite;
          width: max-content;
        }
        .brand-cell {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100px;
          width: 200px;
          flex-shrink: 0;
          padding: 18px 24px;
          box-sizing: border-box;
        }
        .brand-cell img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          filter: brightness(1);
          opacity: 1;
          transition: filter 0.35s ease, opacity 0.35s ease, transform 0.35s ease;
        }
        .brand-cell img:hover {
          filter: brightness(1.3) drop-shadow(0 0 14px rgba(255,255,255,0.35));
          transform: scale(1.05);
        }
        @media (max-width: 640px) {
          .brand-cell {
            height: 80px;
            padding: 14px 18px;
          }
        }
      `}</style>

      {/* Title */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontWeight: 600,
          fontSize: "9px",
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "rgba(240,237,232,0.35)",
          margin: "0 0 16px 0",
          textAlign: "center",
        }}
      >
        Con quienes hemos colaborado
      </motion.p>

      {/* Infinite scroll track */}
      <div style={{ overflow: "hidden", maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)", WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)" }}>
        <div className="scroll-track">
          {loopLogos.map((logo, idx) => (
            <div key={idx} className="brand-cell">
              <img
                src={logo}
                alt="Brand logo"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}