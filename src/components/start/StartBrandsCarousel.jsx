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

  return (
    <div style={{ width: "100%" }}>
      <style>{`
        .brands-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        .brand-cell {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 120px;
          min-height: 120px;
          background: rgba(255,255,255,0.015);
          border-radius: 16px;
          padding: 20px;
          border: 1px solid rgba(255,255,255,0.04);
          box-sizing: border-box;
        }
        @media (max-width: 640px) {
          .brands-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
          .brand-cell {
            height: 140px;
            min-height: 140px;
            padding: 22px;
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

      {/* Grid */}
      <div className="brands-grid">
        {logos.map((logo, idx) => (
          <motion.div
            key={idx}
            className="brand-cell"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.4 + idx * 0.07, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.img
              src={logo}
              alt="Brand"
              draggable={false}
              whileHover={{ scale: 1.04, filter: "brightness(1.35) drop-shadow(0 0 10px rgba(255,255,255,0.18))" }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                opacity: 1,
                filter: "brightness(1)",
              }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}