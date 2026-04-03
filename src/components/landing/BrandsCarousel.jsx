import React from "react";

const defaultLogos = [
  "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop",
  "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&h=100&fit=crop",
  "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&h=100&fit=crop",
  "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=100&fit=crop",
  "https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=200&h=100&fit=crop",
];

export default function BrandsCarousel({ logos }) {
  const displayLogos = logos && logos.length > 0 ? logos : defaultLogos;
  // Duplicate twice so the seam is invisible during the CSS loop
  const loopLogos = [...displayLogos, ...displayLogos];

  // Duration scales with number of logos so speed stays consistent
  const duration = displayLogos.length * 3;

  return (
    <section className="relative py-6 bg-transparent overflow-hidden">
      <style>{`
        @keyframes brands-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .brands-track {
          display: flex;
          gap: 4rem;
          align-items: center;
          width: max-content;
          animation: brands-scroll ${duration}s linear infinite;
          will-change: transform;
        }
        .brands-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="text-center mb-3">
        <span className="text-xs uppercase tracking-wider text-gray-500">Hemos colaborado con</span>
      </div>

      <div className="brands-track">
        {loopLogos.map((logo, i) => (
          <div key={i} className="flex-shrink-0 w-24 h-12 flex items-center justify-center">
            <img
              src={logo}
              alt="Brand logo"
              className="max-w-full max-h-full object-contain"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </section>
  );
}