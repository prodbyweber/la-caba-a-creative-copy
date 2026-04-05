import React, { useState } from "react";

const defaultLogos = [
  "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop",
  "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&h=100&fit=crop",
  "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&h=100&fit=crop",
  "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=100&fit=crop",
  "https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=200&h=100&fit=crop",
];

export default function BrandsCarousel({ logos }) {
  const displayLogos = logos && logos.length > 0 ? logos : defaultLogos;
  // Triple para que el loop sea invisible
  const loopLogos = [...displayLogos, ...displayLogos, ...displayLogos];
  const duration = displayLogos.length * 3.5;
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <section className="relative py-8 bg-transparent overflow-hidden">
      <style>{`
        @keyframes brands-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .brands-track {
          display: flex;
          gap: 4rem;
          align-items: center;
          width: max-content;
          animation: brands-scroll ${duration}s linear infinite;
          will-change: transform;
        }
        .brand-logo-glow {
          transition: filter 0.3s ease, opacity 0.3s ease;
          filter: none;
          opacity: 1;
        }
        .brand-logo-glow:hover {
          filter: brightness(1.3) drop-shadow(0 0 12px rgba(255,255,255,0.55)) drop-shadow(0 0 28px rgba(255,88,51,0.35));
          opacity: 1;
        }
      `}</style>

      <div className="text-center mb-5">
        <span className="text-[10px] uppercase tracking-[0.3em] text-white/25 font-medium">
          Marcas colaboradoras
        </span>
      </div>

      {/* Fade edges */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0a0a0b] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0a0a0b] to-transparent z-10 pointer-events-none" />

        <div className="brands-track">
          {loopLogos.map((logo, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-28 h-14 flex items-center justify-center"
            >
              <img
                src={logo}
                alt="Brand logo"
                className="brand-logo-glow max-w-full max-h-full object-contain cursor-pointer"
                loading="lazy"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}