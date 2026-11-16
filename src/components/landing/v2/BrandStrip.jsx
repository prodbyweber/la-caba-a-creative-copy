import React from "react";
import StartBrandsCarousel from "@/components/start/StartBrandsCarousel";

export default function BrandStrip({ title }) {
  return (
    <section className="cc-strip" id="marcas" aria-label="Marcas y artistas que han confiado en Cabaña Creative">
      <div className="cc-wrap">
        <p className="cc-strip__label">{title || "Han confiado en nosotros"}</p>
      </div>
      <StartBrandsCarousel title="" />
    </section>
  );
}