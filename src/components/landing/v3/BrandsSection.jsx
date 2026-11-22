import React from "react";
import BrandLogos3 from "./BrandLogos3";
import NetflixCard from "./NetflixCard";

export default function BrandsSection() {
  return (
    <section className="ccl-marcas" id="marcas">
      <div className="ccl-wrap">
        <NetflixCard />
        <BrandLogos3 />
      </div>
    </section>
  );
}