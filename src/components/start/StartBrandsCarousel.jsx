import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";

export default function StartBrandsCarousel() {
  const { data: cfg } = useQuery({
    queryKey: ["landingConfig"],
    queryFn: async () => { const c = await base44.entities.LandingConfig.list(); return c[0] || null; },
    staleTime: 30000,
  });

  const [currentPage, setCurrentPage] = useState(0);
  const logos = cfg?.brand_logos || [];

  // Organize logos in pairs (2 columns)
  const logosPerPage = 4; // 2 rows x 2 columns
  const pages = [];
  for (let i = 0; i < logos.length; i += logosPerPage) {
    pages.push(logos.slice(i, i + logosPerPage));
  }

  // Auto-rotate pages
  useEffect(() => {
    if (logos.length === 0) return;
    const timer = setInterval(() => {
      setCurrentPage(prev => (prev + 1) % pages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [pages.length, logos.length]);

  if (!logos || logos.length === 0) return null;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "700px",
        margin: "0 auto",
        padding: "32px 0 24px",
      }}
    >
      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontWeight: 600,
            fontSize: "10px",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "rgba(240,237,232,0.4)",
          }}
        >
          Marcas con las que hemos colaborado
        </motion.span>
      </div>

      {/* Grid layout - 2 columns, 2 rows */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "24px",
      }}>
        <AnimatePresence mode="wait">
          {pages[currentPage]?.map((logo, idx) => (
            <motion.div
              key={currentPage + "-" + idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
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
                initial={{ opacity: 0.6, scale: 0.98 }}
                animate={{ opacity: 0.85, scale: 1 }}
                whileHover={{ opacity: 1, scale: 1.02, filter: "brightness(1.2)" }}
                transition={{ duration: 0.4 }}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Pagination dots */}
      {pages.length > 1 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "28px" }}
        >
          {pages.map((_, idx) => (
            <motion.button
              key={idx}
              onClick={() => setCurrentPage(idx)}
              animate={{
                width: idx === currentPage ? 32 : 8,
                background: idx === currentPage ? "rgba(240,237,232,0.6)" : "rgba(240,237,232,0.2)",
              }}
              transition={{ duration: 0.3 }}
              style={{
                height: "8px",
                borderRadius: "4px",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}