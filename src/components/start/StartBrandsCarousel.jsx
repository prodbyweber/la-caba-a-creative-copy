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
    <section
      style={{
        position: "relative",
        background: "#0c0c0c",
        padding: "clamp(40px, 6vw, 80px) 0",
        overflow: "hidden",
      }}
    >
      {/* Label */}
      <div style={{ textAlign: "center", marginBottom: "clamp(24px, 4vw, 40px)" }}>
        <span
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontWeight: 700,
            fontSize: "11px",
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "rgba(240,237,232,0.25)",
          }}
        >
          Marcas colaboradoras
        </span>
      </div>

      {/* Grid layout - 2 columns, 2 rows */}
      <div style={{ 
        maxWidth: "900px", 
        margin: "0 auto", 
        display: "grid", 
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "clamp(24px, 4vw, 40px)",
        padding: "0 clamp(24px, 6vw, 48px)"
      }}>
        {pages[currentPage]?.map((logo, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "clamp(120px, 18vw, 200px)",
              background: "rgba(255,255,255,0.02)",
              borderRadius: "16px",
              padding: "clamp(20px, 4vw, 32px)",
              border: "1px solid rgba(255,255,255,0.04)",
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
                opacity: 0.7,
                filter: "brightness(1) saturate(1)",
                transition: "all 0.4s ease",
              }}
              onMouseEnter={e => { 
                e.currentTarget.style.opacity = "1"; 
                e.currentTarget.style.filter = "brightness(1.2) drop-shadow(0 0 20px rgba(255,255,255,0.3))"; 
                e.currentTarget.parentElement.style.borderColor = "rgba(255,255,255,0.12)";
                e.currentTarget.parentElement.style.background = "rgba(255,255,255,0.04)";
              }}
              onMouseLeave={e => { 
                e.currentTarget.style.opacity = "0.7"; 
                e.currentTarget.style.filter = "grayscale(0) brightness(1)"; 
                e.currentTarget.parentElement.style.borderColor = "rgba(255,255,255,0.04)";
                e.currentTarget.parentElement.style.background = "rgba(255,255,255,0.02)";
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Pagination dots */}
      {pages.length > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "clamp(24px, 4vw, 40px)" }}>
          {pages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx)}
              style={{
                width: idx === currentPage ? "32px" : "10px",
                height: "10px",
                borderRadius: "5px",
                background: idx === currentPage ? "rgba(240,237,232,0.8)" : "rgba(240,237,232,0.2)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s ease",
                padding: 0,
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}