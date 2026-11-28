import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AmbientVideo from "./AmbientVideo";

const FALLBACK_POSTER =
  "https://base44.app/api/apps/6966ddf48947f217e81ea27c/files/mp/public/6966ddf48947f217e81ea27c/de2d3f461_Still2026-05-24133616_241.jpg";

/** Founder: nombre, mini bio y el vídeo de previsualización del VSL en loop. */
export default function WhatIs3() {
  const { data } = useQuery({
    queryKey: ["founder-preview-video"],
    queryFn: async () => {
      const list = await base44.entities.FullAccessSettings.list("-created_date", 1);
      return list[0] || null;
    },
    staleTime: 60000,
  });

  const src = data?.preview_video_url || "";
  const poster = data?.hero_image_url || FALLBACK_POSTER;

  return (
    <section className="ccl-snap ccl-snap--dark" id="casa">
      <div className="ccl-wrap ccl-snap__inner">
        <span className="ccl-eyebrow">Founder</span>

        <h2 className="ccl-display ccl-h2" style={{ marginTop: 12 }}>
          Santiago Weber
        </h2>

        <p className="ccl-lead">
          Soy Santiago Weber, productor musical y fundador de Cabaña Creative. Llevo años convirtiendo
          canciones sueltas en catálogos con identidad: composición, producción, mezcla y master. Yo
          pongo el sonido. Tú pones la voz.
        </p>

        {src ? (
          <div className="ccl-casa__video">
            <div className="ccl-casa__frame">
              <AmbientVideo src={src} poster={poster} />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}