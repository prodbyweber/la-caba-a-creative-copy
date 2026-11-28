import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function BrandLogos3() {
  const { data: logos = [] } = useQuery({
    queryKey: ["landing-brand-logos"],
    queryFn: async () => {
      const configs = await base44.entities.LandingConfig.list();
      return configs[0]?.brand_logos || [];
    },
    staleTime: 60000,
  });

  if (!logos.length) return null;

  return (
    <div className="ccl-brands">
      <div className="ccl-brands__viewport">
        <div className="ccl-brands__track">
          {[...logos, ...logos].map((logo, idx) => (
            <div className="ccl-brands__cell" key={`${logo}-${idx}`}>
              <img src={logo} alt="Marca colaboradora" loading="lazy" draggable={false} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}