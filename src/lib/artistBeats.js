// ─── Detección de géneros predominantes del artista ───────────────────────────
// Combina géneros del perfil del artista, tags, géneros de sus soundtracks y
// géneros de sus proyectos para generar una referencia de recomendación.
export function collectArtistGenres(artist, tracks = [], projects = []) {
  const set = new Set();
  if (artist?.genre) set.add(artist.genre);
  (artist?.tags || []).forEach((t) => set.add(t));
  tracks.forEach((t) => {
    if (t?.genre) set.add(t.genre);
    if (t?.genre_secondary) set.add(t.genre_secondary);
  });
  projects.forEach((p) => {
    if (p?.genre) set.add(p.genre);
  });
  return set;
}

// ─── Ranking de beats públicos por coincidencia de géneros ────────────────────
// Devuelve un array de { beat, score } ordenado de mayor a menor coincidencia
// con los géneros del artista.
export function rankBeatsByGenre(beats, artistGenres) {
  const genres =
    artistGenres instanceof Set ? artistGenres : new Set(artistGenres || []);
  return [...(beats || [])]
    .map((beat) => {
      const beatGenres = new Set(beat?.genres || []);
      let score = 0;
      genres.forEach((g) => {
        if (beatGenres.has(g)) score += 1;
      });
      return { beat, score };
    })
    .sort((a, b) => b.score - a.score);
}