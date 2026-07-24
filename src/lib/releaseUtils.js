import { base44 } from "@/api/base44Client";

// Catálogo de plataformas soportadas (3 plataformas oficiales del release).
export const PLATFORMS = [
  { key: "spotify", label: "Spotify", color: "#1DB954", verb: "Escuchar en" },
  { key: "apple_music", label: "Apple Music", color: "#FA243C", verb: "Escuchar en" },
  { key: "youtube_music", label: "YouTube Music", color: "#FF0000", verb: "Escuchar en" },
];

export const DEFAULT_PLATFORM_ORDER = PLATFORMS.map((p) => p.key);

export function platformMeta(key) {
  return PLATFORMS.find((p) => p.key === key) || { key, label: key, color: "#ffffff", verb: "Abrir" };
}
export function platformLabel(key) { return platformMeta(key).label; }
export function platformColor(key) { return platformMeta(key).color; }

// Orden efectivo de las 3 plataformas: respeta el orden del usuario (solo las 3 válidas).
export function effectivePlatformOrder(order) {
  const valid = DEFAULT_PLATFORM_ORDER;
  const o = (Array.isArray(order) ? order : []).filter((k) => valid.includes(k));
  const rest = valid.filter((k) => !o.includes(k));
  return [...o, ...rest];
}

// Plataformas con enlace configurado, en el orden efectivo.
export function activePlatforms(streamingLinks, order) {
  const links = streamingLinks || {};
  return effectivePlatformOrder(order)
    .map((k) => ({ key: k, meta: platformMeta(k), url: links[k] }))
    .filter((p) => !!p.url);
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