import React from "react";

/** Créditos: artistas con los que he colaborado, en fila y en tamaño reducido. */
export default function CreditsStrip({ creators = [] }) {
  const list = creators.filter((c) => c.is_public !== false && c.name).slice(0, 4);
  if (list.length === 0) return null;

  return (
    <div className="ccl-credits">
      <span className="ccl-credits__label">Créditos</span>
      <div className="ccl-credits__row">
        {list.map((artist) => {
          const photo = artist.photo_url || artist.cover_url;
          return (
            <div className="ccl-credits__item" key={artist.id || artist.name}>
              <span className="ccl-credits__avatar">
                {photo && <img src={photo} alt={artist.name} loading="lazy" />}
              </span>
              <span className="ccl-credits__name">{artist.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}