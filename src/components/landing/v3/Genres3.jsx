import React from "react";
import { ArrowRight } from "lucide-react";
import { GENRES } from "./constants";
import { scrollToSection } from "./scrollToSection";

export default function Genres3({ settings, creators = [] }) {
  const posters = [
    creators[0]?.cover_url || creators[0]?.photo_url,
    creators[1]?.cover_url || creators[1]?.photo_url,
    creators[2]?.cover_url || creators[2]?.photo_url,
    creators[3]?.cover_url || creators[3]?.photo_url,
    settings?.hero_poster_url,
    settings?.access_card_image_url,
    settings?.weber_bg_url,
  ];

  return (
    <section className="ccl-snap ccl-snap--dark" id="generos">
      <div className="ccl-wrap ccl-snap__inner">
        <span className="ccl-eyebrow">Géneros</span>
        <h2 className="ccl-display ccl-h2" style={{ marginTop: 12 }}>
          Donde te lleve el sonido.
        </h2>
        <p className="ccl-small">Desliza para descubrir.</p>

        <div className="ccl-rail">
          {GENRES.map((genre, i) => (
            <button
              key={genre.name}
              type="button"
              className="ccl-genre"
              onClick={() => scrollToSection("tendencia")}
              aria-label={`Explorar ${genre.name}`}
            >
              {posters[i] && <img src={posters[i]} alt="" loading="lazy" />}
              <span className="ccl-genre__veil" />
              <span className="ccl-genre__body">
                <span className="ccl-genre__name">{genre.name}</span>
                <span className="ccl-genre__sub">{genre.sub}</span>
                <span className="ccl-genre__hint">
                  Descubrir <ArrowRight size={10} />
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}