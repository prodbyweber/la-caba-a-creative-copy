import React from "react";
import { ExternalLink } from "lucide-react";

/** Tarjeta horizontal de artista: imagen completa, nombre, crédito y Spotify. */
export default function ArtistCard({ artist, active = false }) {
  return (
    <article className={`fa-acard${active ? " is-active" : ""}`}>
      <div className="fa-acard__media">
        {artist.image_url ? (
          <img src={artist.image_url} alt={artist.name} loading="lazy" />
        ) : (
          <span className="fa-acard__empty">{artist.name?.slice(0, 1)}</span>
        )}
        <span className="fa-acard__veil" aria-hidden="true" />
      </div>

      <div className="fa-acard__body">
        <h4 className="fa-acard__name">{artist.name}</h4>
        {artist.credit ? <p className="fa-acard__credit">{artist.credit}</p> : null}
        {artist.spotify_url ? (
          <a
            className="fa-acard__spotify"
            href={artist.spotify_url}
            target="_blank"
            rel="noreferrer noopener"
          >
            Spotify <ExternalLink size={12} />
          </a>
        ) : null}
      </div>
    </article>
  );
}