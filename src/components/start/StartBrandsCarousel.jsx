import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/**
 * Carrusel de marcas compartido por /start y /Landing.
 * La fuente de datos es LandingConfig.brand_logos, así que un cambio
 * en el panel se refleja en ambas páginas.
 */
export default function StartBrandsCarousel({ title = "Con quienes hemos colaborado" }) {
  const { data: cfg } = useQuery({
    queryKey: ["landingConfig"],
    queryFn: async () => {
      const c = await base44.entities.LandingConfig.list();
      return c[0] || null;
    },
    staleTime: 30000,
  });

  const logos = cfg?.brand_logos || [];
  if (!logos || logos.length === 0) return null;

  // Dos copias del mismo grupo para que el bucle sea continuo y sin saltos.
  const track = [...logos, ...logos];

  return (
    <div className="brand-strip">
      <style>{`
        .brand-strip { width: 100%; }
        .brand-strip__title {
          font-family: "Arial Nova", Helvetica, Arial, sans-serif;
          font-weight: 600;
          font-size: 9px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: rgba(240, 237, 232, 0.35);
          margin: 0 0 16px 0;
          text-align: center;
        }
        .brand-strip__viewport {
          overflow: hidden;
          -webkit-mask-image: linear-gradient(to right, transparent 0%, #000 8%, #000 92%, transparent 100%);
          mask-image: linear-gradient(to right, transparent 0%, #000 8%, #000 92%, transparent 100%);
        }
        .brand-strip__track {
          display: flex;
          width: max-content;
          animation: brand-marquee 38s linear infinite;
          will-change: transform;
        }
        .brand-strip__viewport:hover .brand-strip__track { animation-play-state: paused; }
        .brand-strip__cell {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 84px;
          width: 180px;
          flex-shrink: 0;
          padding: 16px 22px;
          box-sizing: border-box;
        }
        .brand-strip__cell img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          filter: grayscale(1);
          opacity: 0.45;
          transition: filter 0.35s ease, opacity 0.35s ease, transform 0.35s ease;
        }
        .brand-strip__cell:hover img {
          filter: grayscale(0);
          opacity: 1;
          transform: scale(1.05);
        }
        @keyframes brand-marquee {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(-50%, 0, 0); }
        }
        @media (max-width: 640px) {
          .brand-strip__cell { height: 70px; width: 148px; padding: 12px 16px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .brand-strip__track { animation: none; }
        }
      `}</style>

      {title ? <p className="brand-strip__title">{title}</p> : null}

      <div className="brand-strip__viewport">
        <div className="brand-strip__track">
          {track.map((logo, idx) => (
            <div className="brand-strip__cell" key={`${logo}-${idx}`}>
              <img src={logo} alt="Marca colaboradora" loading="lazy" draggable={false} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}