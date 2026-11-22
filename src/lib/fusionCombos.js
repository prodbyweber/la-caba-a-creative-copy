// Combinaciones de género para la sección Fusion.
// Los géneros prioritarios pesan más a la hora de armar las parejas.

const GENRES = [
  { name: "Reggaetón", tint: "#ff5833", accent: "#ffb4a2", weight: 4 },
  { name: "Afrobeats", tint: "#2fbf71", accent: "#6fe3a5", weight: 4 },
  { name: "Trap", tint: "#ff3d6e", accent: "#ff8aa5", weight: 4 },
  { name: "R&B", tint: "#8a6cf0", accent: "#c9b8ff", weight: 4 },
  { name: "Pop", tint: "#e0b354", accent: "#ffdca8", weight: 4 },
  { name: "House", tint: "#22c1d6", accent: "#7ae6f3", weight: 1 },
  { name: "Afro House", tint: "#2fbf71", accent: "#8ff0bb", weight: 1 },
  { name: "Hip Hop", tint: "#ff3d6e", accent: "#ffa8bb", weight: 1 },
  { name: "Latin Urban", tint: "#ff5833", accent: "#ffcfc2", weight: 1 },
  { name: "Jersey Club", tint: "#ff8a3d", accent: "#ffc79b", weight: 1 },
  { name: "Drill", tint: "#9aa0a6", accent: "#d8dcdf", weight: 1 },
  { name: "Amapiano", tint: "#c9a227", accent: "#f2dc8a", weight: 1 },
  { name: "Funk Brasil", tint: "#c9431f", accent: "#ff9d7d", weight: 1 },
  { name: "Electropop", tint: "#4f8cff", accent: "#a9c4ff", weight: 1 },
  { name: "Acústico", tint: "#b08d57", accent: "#e5cfae", weight: 1 },
];

const MOODS = [
  "Nocturno",
  "Solar",
  "Festivo",
  "Sensual",
  "Épico",
  "Íntimo",
  "Oscuro",
  "Vibrante",
  "Melancólico",
  "Onírico",
  "Nostálgico",
  "Magnético",
  "Cinematográfico",
];

const TOTAL_WEIGHT = GENRES.reduce((sum, g) => sum + g.weight, 0);

function pickGenre() {
  let roll = Math.random() * TOTAL_WEIGHT;
  for (const genre of GENRES) {
    roll -= genre.weight;
    if (roll <= 0) return genre;
  }
  return GENRES[GENRES.length - 1];
}

function pickMood(exclude = "") {
  const pool = MOODS.filter((m) => m !== exclude);
  return pool[Math.floor(Math.random() * pool.length)] || MOODS[0];
}

function imageFor(genre, images) {
  if (!images.length) return "";
  const index = GENRES.findIndex((g) => g.name === genre.name);
  return images[index % images.length];
}

/**
 * Devuelve una pareja de géneros con su mood y sus colores.
 * `exclude` evita repetir combinaciones que ya están en pantalla.
 */
export function makeCombo({ exclude = new Set(), images = [] } = {}) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const first = pickGenre();
    let second = pickGenre();
    if (second.name === first.name) continue;

    const key = `${first.name}|${second.name}`;
    if (exclude.has(key)) continue;

    return {
      key,
      name: `${first.name} + ${second.name}`,
      mood: pickMood(),
      tint: first.tint,
      accent: first.accent,
      image_url: imageFor(first, images),
    };
  }
  return null;
}