import React from "react";
import { useQuery } from "@tanstack/react-query";
import "@/components/landing/v3/landing3.css";
import "@/components/landing/v3/landing3-extra.css";
import FusionCards from "@/components/landing/v3/FusionCards";
import { base44 } from "@/api/base44Client";
import { DEFAULT_GENRES } from "@/lib/homeDefaults";

/** Etapa 1: las mismas tarjetas Fusion de /landing, con su misma fuente de datos. */
export default function StageFusion() {
  const { data } = useQuery({
    queryKey: ["landing-genres"],
    queryFn: () => base44.entities.GenreCard.list("-created_date", 100),
    staleTime: 60000,
  });

  const items = data?.length ? data : DEFAULT_GENRES;

  return (
    <div className="fa-fusion ccl ccl-embed">
      <FusionCards items={items} />
    </div>
  );
}