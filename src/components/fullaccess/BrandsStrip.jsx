import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/** "Con quienes hemos colaborado": mismos logos que /landing, a color y sin pausas. */
export default function BrandsStrip() {
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
    <section className="fa-brands" aria-label="Marcas colaboradoras">
      <div className="fa-wrap">
        <span className="fa-brands__label">Con quienes hemos colaborado</span>
      </div>

      <div className="fa-brands__viewport">
        <div className="fa-brands__track">
          {[0, 1].map((group) => (
            <div className="fa-brands__cell-group" key={group} style={{ display: "contents" }}>
              {logos.map((logo, index) => (
                <div
                  className="fa-brands__cell"
                  key={`${group}-${logo}-${index}`}
                  aria-hidden={group === 1}
                >
                  <img src={logo} alt="Marca colaboradora" loading="lazy" draggable={false} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}