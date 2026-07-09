// ─── Centralized Genre System (Module 8 & 9) ──────────────────────────────────
export const GENRES = [
  "Reggaetón", "Trap Latino", "Trap", "Drill", "UK Drill", "Jersey Club",
  "Afrobeats", "Afro House", "Amapiano", "Dancehall", "Reggae", "Hip-Hop",
  "Boom Bap", "Rap", "R&B", "Soul", "Neo Soul", "Jazz", "Lo-Fi", "House",
  "Deep House", "Tech House", "Electrónica", "Pop", "Pop Latino", "Rock",
  "Alternativo", "Indie", "Acústico", "Flamenco", "Flamenco Urbano", "Dembow",
  "Merengue", "Bachata", "Salsa", "Regional Mexicano", "Corridos",
  "Corridos Tumbados", "Funk Brasileño", "Phonk", "Drum & Bass", "Future Bass",
  "Synthwave", "Ambient", "Experimental", "Cinemático", "Gospel", "Funk", "Disco",
];

// ─── Centralized Mood System (Module 10) ──────────────────────────────────────
export const MOODS = [
  "Alegre", "Triste", "Oscuro", "Agresivo", "Romántico", "Melancólico",
  "Soñador", "Enérgico", "Sensual", "Relajado", "Emotivo", "Épico",
  "Cinemático", "Motivador", "Elegante", "Nocturno", "Veraniego", "Fiesta",
  "Espiritual", "Inspirador", "Esperanzador", "Nostálgico", "Seguro",
  "Minimalista", "Vintage", "Moderno",
];

// ─── Musical Keys (Tonalidades) ──────────────────────────────────────────────
export const KEYS = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
];

// ─── Scale format (A Major, F# Minor, etc.) ───────────────────────────────────
export const SCALES = [
  "C Major", "C Minor", "C# Major", "C# Minor",
  "D Major", "D Minor", "D# Major", "D# Minor",
  "E Major", "E Minor",
  "F Major", "F Minor", "F# Major", "F# Minor",
  "G Major", "G Minor", "G# Major", "G# Minor",
  "A Major", "A Minor", "A# Major", "A# Minor",
  "B Major", "B Minor",
];

// ─── Beat Status ─────────────────────────────────────────────────────────────
export const BEAT_STATUS = ["Publicado", "Borrador"];

// ─── License Types (Module 12) ────────────────────────────────────────────────
export const LICENSE_TYPES = [
  { id: "mp3_free", label: "MP3 Gratuito" },
  { id: "wav", label: "Licencia WAV" },
  { id: "wav_premium", label: "Licencia WAV Premium" },
  { id: "exclusive", label: "Licencia Exclusiva" },
];

// ─── Helper: format BPM for display ──────────────────────────────────────────
export function formatBpm(bpm) {
  if (!bpm) return "—";
  return `${bpm} BPM`;
}

// ─── Helper: format duration ─────────────────────────────────────────────────
export function formatDuration(sec) {
  if (!sec || !Number.isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}