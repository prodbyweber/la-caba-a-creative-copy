import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";

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
    }, 4000);
    return () => clearInterval(timer);
  }, [pages.length, logos.length]);

  if (!logos || logos.length === 0) return null;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      {/* Grid layout - 2 columns, 2 rows */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "20px",
      }}>
        {pages[currentPage]?.map((logo, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100px",
              background: "rgba(255,255,255,0.02)",
              borderRadius: "12px",
              padding: "16px",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <img
              src={logo}
              alt="Brand"
              draggable={false}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                opacity: 0.75,
                filter: "brightness(1) saturate(1)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={e => { 
                e.currentTarget.style.opacity = "1"; 
                e.currentTarget.style.filter = "brightness(1.15)"; 
                e.currentTarget.parentElement.style.borderColor = "rgba(255,255,255,0.15)";
                e.currentTarget.parentElement.style.background = "rgba(255,255,255,0.05)";
              }}
              onMouseLeave={e => { 
                e.currentTarget.style.opacity = "0.75"; 
                e.currentTarget.style.filter = "grayscale(0) brightness(1)"; 
                e.currentTarget.parentElement.style.borderColor = "rgba(255,255,255,0.05)";
                e.currentTarget.parentElement.style.background = "rgba(255,255,255,0.02)";
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Pagination dots */}
      {pages.length > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "20px" }}>
          {pages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx)}
              style={{
                width: idx === currentPage ? "28px" : "8px",
                height: "8px",
                borderRadius: "4px",
                background: idx === currentPage ? "rgba(240,237,232,0.7)" : "rgba(240,237,232,0.25)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s ease",
                padding: 0,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}