import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import "@/components/landing/v3/landing3.css";
import "@/components/landing/v3/landing3-extra.css";
import { base44 } from "@/api/base44Client";
import { DEFAULT_GENRES } from "@/lib/homeDefaults";

const SWAP_MS = 5200;

/** Tarjetas de género de /start: una sola palabra de mood por tarjeta. */
const START_GENRES = [
  {
    key: "latin_urban",
    name: "Reggaetón + R&B",
    mood: "Sensual",
    tint: "#ff5833",
    accent: "#ffb4a2",
  },
  { key: "hip_hop", name: "Trap + House", mood: "Oscuro", tint: "#ff3d6e", accent: "#ff8aa5" },
  {
    key: "afrobeats",
    name: "House + Afrobeats",
    mood: "Festivo",
    tint: "#22c1d6",
    accent: "#7ae6f3",
  },
  {
    key: "pop",
    name: "Pop + Latin Urban",
    mood: "Magnético",
    tint: "#e0b354",
    accent: "#ffdca8",
  },
];

const byOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0);

/** Etapa 1: tarjetas de género con el diseño cinemático actual y su mood en una palabra. */
export default function StageGenres() {
  const { data } = useQuery({
    queryKey: ["landing-genres"],
    queryFn: () => base44.entities.GenreCard.list("-created_date", 100),
    staleTime: 60000,
  });

  const records = (data || []).filter((item) => item.is_visible !== false).sort(byOrder);
  const cards = records.length ? records : START_GENRES;

  const images = (data?.length ? data : DEFAULT_GENRES)
    .filter((item) => item.image_url)
    .map((item) => item.image_url);

  const [round, setRound] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const timer = setInterval(() => setRound((prev) => prev + 1), SWAP_MS);
    return () => clearInterval(timer);
  }, []);

  const steps = Math.max(1, Math.ceil(cards.length / 2));
  const start = (round % steps) * 2;
  const pair = cards.slice(start, start + 2);
  if (pair.length < 2 && cards.length > 1) pair.push(cards[0]);

  return (
    <div className="fa-genrepair ccl ccl-embed">
      <div className="ccl-fusion__grid">
        {pair.map((combo, i) => (
          <article
            className="ccl-fcard"
            key={`${combo.key || combo.name}-${i}`}
            style={{ "--tint": combo.tint || "#ff5833", "--accent": combo.accent || "#ffb4a2" }}
          >
            {combo.image_url || images.length ? (
              <img
                className="ccl-fcard__img"
                src={combo.image_url || images[(round + i) % images.length]}
                alt=""
                loading="lazy"
              />
            ) : null}
            <span className="ccl-fcard__tint" aria-hidden="true" />
            <span className="ccl-fcard__veil" aria-hidden="true" />
            <div className="ccl-fcard__body">
              <h4 className="ccl-fcard__name">{combo.name}</h4>
              {combo.mood ? (
                <div className="ccl-fcard__fig">
                  <span className="ccl-fcard__value">{combo.mood}</span>
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}