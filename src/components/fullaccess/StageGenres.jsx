import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import "@/components/landing/v3/landing3.css";
import "@/components/landing/v3/landing3-extra.css";
import { base44 } from "@/api/base44Client";
import { DEFAULT_GENRES } from "@/lib/homeDefaults";

const SWAP_MS = 5200;

/** Dos combinaciones por pareja: ningún género se repite entre las dos tarjetas. */
const PAIRS = [
  [
    {
      name: "Reggaetón + R&B",
      mood: "Sensual, nocturno, con pulso de pista",
      tint: "#ff5833",
      accent: "#ffb4a2",
    },
    {
      name: "Trap + House",
      mood: "Graves secos sobre groove de club",
      tint: "#ff3d6e",
      accent: "#ff8aa5",
    },
  ],
  [
    {
      name: "House + Afrobeats",
      mood: "Pulso orgánico, solar y bailable",
      tint: "#22c1d6",
      accent: "#7ae6f3",
    },
    {
      name: "Pop + Latin Urban",
      mood: "Melodía directa, festiva y radial",
      tint: "#e0b354",
      accent: "#ffdca8",
    },
  ],
];

/** Etapa 1: dos tarjetas de género con el diseño cinemático actual. */
export default function StageGenres() {
  const { data } = useQuery({
    queryKey: ["landing-genres"],
    queryFn: () => base44.entities.GenreCard.list("-created_date", 100),
    staleTime: 60000,
  });

  const images = (data?.length ? data : DEFAULT_GENRES)
    .filter((item) => item.image_url)
    .map((item) => item.image_url);

  const [round, setRound] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const timer = setInterval(() => setRound((prev) => prev + 1), SWAP_MS);
    return () => clearInterval(timer);
  }, []);

  const pair = PAIRS[round % PAIRS.length];

  return (
    <div className="fa-genrepair ccl ccl-embed">
      <div className="ccl-fusion__grid">
        {pair.map((combo, i) => (
          <article
            className="ccl-fcard"
            key={combo.name}
            style={{ "--tint": combo.tint, "--accent": combo.accent }}
          >
            {images.length ? (
              <img
                className="ccl-fcard__img"
                src={images[(round + i) % images.length]}
                alt=""
                loading="lazy"
              />
            ) : null}
            <span className="ccl-fcard__tint" aria-hidden="true" />
            <span className="ccl-fcard__veil" aria-hidden="true" />
            <div className="ccl-fcard__body">
              <h4 className="ccl-fcard__name">{combo.name}</h4>
              <div className="ccl-fcard__fig">
                <span className="ccl-fcard__value">{combo.mood}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}