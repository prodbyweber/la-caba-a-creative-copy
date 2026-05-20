import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";

export default function StartBrandsCarousel() {
  const { data: cfg } = useQuery({
    queryKey: ["landingConfig"],
    queryFn: async () => { const c = await base44.entities.LandingConfig.list(); return c[0] || null; },
    staleTime: 30000,
  });

  const logos = cfg?.brand_logos || [];

  if (!logos || logos.length === 0) return null;

  // Determine columns: up to 4 per row
  const cols = Math.min(logos.length, 4);

  return (
    <div style={{ width: "100%" }}>
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
          marginBottom: "16px",
          margin: "0 0 16px 0",
        }}
      >
        Marcas con las que hemos colaborado
      </motion.p>

      {/* All logos grid — no pagination */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: "12px",
      }}>
        {logos.map((logo, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.4 + idx * 0.07, ease: [0.22, 1, 0.36, 1] }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "120px",
                background: "rgba(255,255,255,0.015)",
                borderRadius: "16px",
                padding: "20px",
              border: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <motion.img
              src={logo}
              alt="Brand"
              draggable={false}
              whileHover={{ opacity: 1, scale: 1.04, filter: "brightness(1.2)" }}
              transition={{ duration: 0.3 }}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                opacity: 0.8,
              }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}