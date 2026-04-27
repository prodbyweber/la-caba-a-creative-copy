import React, { useState } from "react";
import { X } from "lucide-react";

// Géneros musicales
const MUSIC_GENRES = [
  "Afrobeats", "Afropop", "Afro-Caribbean", "Reggaeton", "Trap", "Trap Cristiano",
  "Hip-Hop", "R&B", "Neo Soul", "Funk", "Dancehall", "Dembow",
  "Salsa", "Cumbia", "Merengue", "Bachata", "Vallenato", "Champeta",
  "Electronic", "House", "Techno", "Amapiano", "Afrohouse",
  "Latin Pop", "Pop", "Urban Pop", "Indie Pop",
  "Rock", "Indie Rock", "Alternative",
  "Jazz", "Bossa Nova", "Blues",
  "Gospel", "Worship",
  "Reggae", "Ska",
  "Drill", "Grime", "UK Rap",
  "Corridos", "Regional Mexicano",
  "Experimental", "Ambient", "World Music",
];

// Géneros cinematográficos / audiovisual
const FILM_GENRES = [
  "Drama", "Comedia", "Thriller", "Terror", "Suspenso",
  "Acción", "Aventura", "Ciencia Ficción", "Fantasía",
  "Romance", "Documental", "Biográfico", "Histórico",
  "Musical", "Animación", "Cortometraje",
  "Horror", "Slasher", "Noir",
  "Road Movie", "Coming of Age",
  "Crime", "Policial", "Misterio",
  "Arte y Ensayo", "Experimental",
  "Urban", "Street Film",
];

// Tags adicionales comunes
const COMMON_TAGS = [
  "Debut", "Colaboración", "Live Session", "Acústico", "Remix",
  "En vivo", "Tour", "Clip vertical", "Mini-documental",
  "Coproducción", "Independiente", "Cabaña Creative",
];

const isFilm = (type) => ["minifilm", "film", "series"].includes(type);
const isMusic = (type) => ["song", "album", "ep"].includes(type);

export default function GenreSelector({ contentType, genres = [], tags = [], onGenresChange, onTagsChange }) {
  const MAX_GENRES = 3;

  // Para films: ofrecer géneros cinematográficos + también musicales
  // Para música: solo géneros musicales
  const primaryList = isFilm(contentType) ? FILM_GENRES : MUSIC_GENRES;
  const secondaryList = isFilm(contentType) ? MUSIC_GENRES : null;

  const toggleGenre = (g) => {
    if (genres.includes(g)) {
      onGenresChange(genres.filter(x => x !== g));
    } else if (genres.length < MAX_GENRES) {
      onGenresChange([...genres, g]);
    }
  };

  const toggleTag = (t) => {
    if (tags.includes(t)) {
      onTagsChange(tags.filter(x => x !== t));
    } else {
      onTagsChange([...tags, t]);
    }
  };

  const pill = (label, selected, onClick, disabled) => (
    <button
      key={label}
      type="button"
      onClick={onClick}
      disabled={disabled && !selected}
      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all border ${
        selected
          ? "bg-white text-black border-white"
          : disabled
          ? "bg-white/[0.02] text-white/15 border-white/[0.05] cursor-not-allowed"
          : "bg-white/[0.04] text-white/50 border-white/[0.08] hover:border-white/20 hover:text-white/80"
      }`}
    >
      {label}
    </button>
  );

  const atMax = genres.length >= MAX_GENRES;

  return (
    <div className="space-y-4">
      {/* Selected genres display */}
      {genres.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {genres.map(g => (
            <span
              key={g}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white text-black text-[11px] font-semibold"
            >
              {g}
              <button onClick={() => toggleGenre(g)} className="ml-0.5 hover:opacity-60">
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
          <span className="text-[10px] text-white/20 self-center ml-1">{genres.length}/{MAX_GENRES}</span>
        </div>
      )}

      {/* Primary genre list */}
      <div>
        <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-2">
          {isFilm(contentType) ? "Géneros cinematográficos" : "Géneros musicales"}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {primaryList.map(g => pill(g, genres.includes(g), () => toggleGenre(g), atMax))}
        </div>
      </div>

      {/* Secondary (music genres for films) */}
      {secondaryList && (
        <div>
          <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-2">
            Géneros musicales (si aplica)
          </p>
          <div className="flex flex-wrap gap-1.5">
            {secondaryList.map(g => pill(g, genres.includes(g), () => toggleGenre(g), atMax))}
          </div>
        </div>
      )}

      {/* Tags */}
      <div>
        <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-2">Tags adicionales</p>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_TAGS.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => toggleTag(t)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all border ${
                tags.includes(t)
                  ? "bg-white/15 text-white border-white/30"
                  : "bg-white/[0.03] text-white/40 border-white/[0.07] hover:border-white/15 hover:text-white/70"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Custom tag input */}
        <div className="mt-2 flex gap-2">
          <CustomTagInput
            onAdd={(t) => {
              if (t && !tags.includes(t)) onTagsChange([...tags, t]);
            }}
          />
        </div>

        {/* Selected tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tags.map(t => (
              <span key={t} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 text-white/60 text-[11px] border border-white/10">
                {t}
                <button onClick={() => toggleTag(t)} className="hover:opacity-60">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CustomTagInput({ onAdd }) {
  const [val, setVal] = useState("");
  const submit = () => {
    const trimmed = val.trim();
    if (trimmed) { onAdd(trimmed); setVal(""); }
  };
  return (
    <div className="flex gap-1.5 mt-1">
      <input
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => e.key === "Enter" && (e.preventDefault(), submit())}
        placeholder="Tag personalizado..."
        className="flex-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-white/25 placeholder-white/20"
      />
      <button
        type="button"
        onClick={submit}
        disabled={!val.trim()}
        className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white/50 hover:text-white text-xs font-medium transition-colors disabled:opacity-30"
      >
        + Añadir
      </button>
    </div>
  );
}