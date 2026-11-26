import React, { useState } from "react";
import SortablePanel from "@/components/fullaccess/admin/SortablePanel";
import ArtistCard from "@/components/fullaccess/ArtistCard";
import "@/components/fullaccess/fa.css";
import "@/components/fullaccess/fa-landing.css";
import "@/components/fullaccess/fa-v4.css";

const DEVICES = [
  { key: "desktop", label: "Escritorio" },
  { key: "mobile", label: "Móvil" },
];

function ArtistsPreview({ items }) {
  const [device, setDevice] = useState("desktop");
  const visible = items.filter((item) => item.is_visible !== false);
  const cellWidth = device === "mobile" ? "w-[80%]" : "w-[260px]";

  return (
    <div className="mt-5 rounded-lg border border-white/10 bg-[#111112] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Vista previa del carrusel
          </span>
          <span className="mt-1 block text-xs text-zinc-500">
            {visible.length} tarjeta{visible.length === 1 ? "" : "s"} publicada
            {visible.length === 1 ? "" : "s"} · orden final de la página
          </span>
        </div>
        <div className="flex gap-1 rounded-md border border-white/10 p-1">
          {DEVICES.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setDevice(option.key)}
              className={`rounded px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                device === option.key ? "bg-white text-black" : "text-zinc-400 hover:text-white"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className={`fa mx-auto mt-4 overflow-hidden rounded-xl bg-[#0a0a0b] ${
          device === "mobile" ? "w-[340px] max-w-full" : "w-full"
        }`}
      >
        <div className="p-3">
          <span className="fa-eyebrow">Artistas y proyectos</span>
          {visible.length ? (
            <div className="fa-acarousel__rail mt-3">
              {visible.map((artist, index) => (
                <div className={`fa-acarousel__cell shrink-0 ${cellWidth}`} key={artist.id}>
                  <ArtistCard artist={artist} active={index === 0} />
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-xs text-zinc-500">
              Añade una tarjeta y márcala como visible para verla aquí.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ArtistsPanel() {
  return (
    <SortablePanel
      title="Artistas y proyectos"
      description="Nombre, imagen horizontal, Spotify y crédito de cada tarjeta del carrusel de Lanzar. Arrastra para reordenar."
      entity="StartArtist"
      defaults={{
        name: "",
        image_url: "",
        spotify_url: "",
        credit: "",
        order: 0,
        is_visible: true,
      }}
      fields={[
        { key: "name", label: "Nombre artístico" },
        { key: "credit", label: "Crédito o participación" },
        {
          key: "spotify_url",
          label: "Enlace de Spotify",
          wide: true,
        },
        {
          key: "image_url",
          label: "Imagen horizontal",
          type: "media",
          accept: "image/*",
          wide: true,
        },
        { key: "is_visible", label: "Visible", type: "bool" },
      ]}
      preview={(items) => <ArtistsPreview items={items} />}
    />
  );
}