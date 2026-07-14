// ─── Cinematic stock covers (fallback for beats without cover_url) ───────────
// Minimalist, dark, cinematic aesthetic — Unsplash
export const CINEMATIC_COVERS = [
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
  "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&q=80",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
  "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800&q=80",
  "https://images.unsplash.com/photo-1571263729135-c89c0797d34d?w=800&q=80",
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
  "https://images.unsplash.com/photo-1454922915609-78549ad709bb?w=800&q=80",
  "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=800&q=80",
  "https://images.unsplash.com/photo-1496293455970-f8581aae0e72?w=800&q=80",
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
  "https://images.unsplash.com/photo-1485579149621-3123dd979885?w=800&q=80",
  "https://images.unsplash.com/photo-1461782065103-536a8f67c8e1?w=800&q=80",
];

// Deterministic cinematic cover for a beat (based on id hash)
export function getCoverForBeat(beat) {
  if (beat?.cover_url) return beat.cover_url;
  const id = beat?.id || "x";
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return CINEMATIC_COVERS[hash % CINEMATIC_COVERS.length];
}

// ─── Original filename extraction (preserve uploaded name + extension) ────────
// Devuelve el nombre original del archivo tal como se subió (sin renombrar),
// decodificando de forma segura y conservando la extensión/formato.
export function getOriginalFilename(url) {
  if (!url) return "";
  try {
    const path = new URL(url).pathname;
    const last = decodeURIComponentSafe(path.split("/").pop() || "");
    return last;
  } catch {
    return "";
  }
}

function decodeURIComponentSafe(s) {
  try { return decodeURIComponent(s); } catch { return s; }
}

// ─── Time ago formatter (compact, uppercase) ─────────────────────────────────
export function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "AHORA";
  if (hours < 24) return `${hours}H`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}D`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}S`;
  const months = Math.floor(days / 30);
  return `${months}M`;
}