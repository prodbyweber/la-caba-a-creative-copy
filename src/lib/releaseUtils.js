import { base44 } from "@/api/base44Client";
import { slugify } from "@/lib/trackSlug";

// Catálogo de plataformas soportadas, en orden por defecto.
export const PLATFORMS = [
  { key: "spotify", label: "Spotify", color: "#1DB954" },
  { key: "apple_music", label: "Apple Music", color: "#FA243C" },
  { key: "youtube_music", label: "YouTube Music", color: "#FF0000" },
  { key: "youtube_video", label: "YouTube", color: "#FF0000" },
  { key: "amazon_music", label: "Amazon Music", color: "#25D1DA" },
  { key: "deezer", label: "Deezer", color: "#A238FF" },
  { key: "soundcloud", label: "SoundCloud", color: "#FF5500" },
];

export const DEFAULT_PLATFORM_ORDER = PLATFORMS.map((p) => p.key);

export function platformMeta(key) {
  return PLATFORMS.find((p) => p.key === key) || { key, label: key, color: "#ffffff" };
}
export function platformLabel(key) { return platformMeta(key).label; }
export function platformColor(key) { return platformMeta(key).color; }

// Devuelve el orden efectivo: plataformas definidas primero (en su orden), luego el resto del default.
export function effectivePlatformOrder(order) {
  const o = Array.isArray(order) ? order : [];
  const rest = DEFAULT_PLATFORM_ORDER.filter((k) => !o.includes(k));
  return [...o, ...rest];
}

// Detección de origen de tráfico a partir del referer.
export function detectRefererSource(referrer) {
  if (!referrer) return "direct";
  const r = referrer.toLowerCase();
  if (r.includes("instagram")) return "instagram";
  if (r.includes("tiktok")) return "tiktok";
  if (r.includes("whatsapp") || r.includes("wa.me")) return "whatsapp";
  if (r.includes("facebook") || r.includes("fb.com") || r.includes("fbcdn")) return "facebook";
  if (r.includes("threads")) return "threads";
  if (r.includes("twitter") || r.includes("t.co") || r.includes("x.com")) return "x";
  if (r.includes("youtube") || r.includes("youtu.be")) return "youtube";
  if (r.includes("google")) return "google";
  if (r.includes("discord")) return "discord";
  if (r.includes("telegram") || r.includes("t.me")) return "telegram";
  if (r.includes("mail") || r.includes("outlook") || r.includes("gmail") || r.includes("yahoo") || r.includes("hotmail")) return "email";
  return "other";
}

export const REFERER_LABELS = {
  instagram: "Instagram", tiktok: "TikTok", whatsapp: "WhatsApp", facebook: "Facebook",
  threads: "Threads", x: "X", youtube: "YouTube", google: "Google",
  discord: "Discord", telegram: "Telegram", email: "Email", direct: "Directo", other: "Otros",
};
export function refererLabel(src) { return REFERER_LABELS[src] || src; }

export function parseUTM() {
  const p = new URLSearchParams(window.location.search);
  return {
    utm_source: p.get("utm_source") || null,
    utm_medium: p.get("utm_medium") || null,
    utm_campaign: p.get("utm_campaign") || null,
    utm_term: p.get("utm_term") || null,
    utm_content: p.get("utm_content") || null,
  };
}

// Identificador anónimo persistente en el navegador del visitante.
export function getOrCreateVisitorId() {
  try {
    let v = localStorage.getItem("cabana_visitor_id");
    if (!v) {
      v = (crypto && crypto.randomUUID && crypto.randomUUID())
        || "v-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem("cabana_visitor_id", v);
    }
    return v;
  } catch {
    return "v-" + Math.random().toString(36).slice(2);
  }
}

// Registra un evento (view/click) en el backend. Nunca rompe la UX: falla en silencio.
export async function trackEvent(payload) {
  try {
    await base44.functions.invoke("trackReleaseEvent", payload);
  } catch (_) { /* silent */ }
}

// Slug único para una landing a partir del título del track.
export async function ensureUniqueLandingSlug(baseTitle, excludeId) {
  const base = slugify(baseTitle) || "release";
  const batch = await base44.entities.ReleaseLanding.list("-updated_date", 500);
  const existing = new Set((batch || []).filter((l) => l.id !== excludeId && l.slug).map((l) => l.slug));
  if (!existing.has(base)) return base;
  let i = 2;
  while (existing.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}