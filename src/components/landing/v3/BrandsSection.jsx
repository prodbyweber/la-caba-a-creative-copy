import React from "react";
import BrandLogos3 from "./BrandLogos3";

export default function BrandsSection() {
  return (
    <section className="ccl-snap ccl-snap--dark ccl-marcas" id="marcas">
      <div className="ccl-wrap ccl-snap__inner">
        <div className="ccl-marcas__head">
          <span className="ccl-eyebrow">Marcas</span>
          <h2 className="ccl-display ccl-h2">
            Marcas con las que ha colaborado Santiago Weber
          </h2>
        </div>

        <BrandLogos3 />
      </div>
    </section>
  );
}