import React from "react";
import BrandLogos3 from "./BrandLogos3";
import CreditsStrip from "./CreditsStrip";

export default function BrandsSection({ creators = [] }) {
  return (
    <section className="ccl-snap ccl-snap--dark ccl-marcas" id="marcas">
      <div className="ccl-wrap ccl-snap__inner">
        <BrandLogos3 />
        <CreditsStrip creators={creators} />
      </div>
    </section>
  );
}