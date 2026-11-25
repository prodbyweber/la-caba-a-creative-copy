export function vimeoEmbedUrl(url) {
  if (!url) return "";
  const idMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (!idMatch) return url;
  const hMatch = url.match(/[?&]h=([a-zA-Z0-9]+)/);
  const params = new URLSearchParams({
    autopause: "0",
    autoplay: "0",
    dnt: "1",
    title: "0",
    byline: "0",
    portrait: "0",
    playsinline: "1",
    controls: "1",
    pip: "1",
    app_id: "58479",
  });
  if (hMatch) params.set("h", hMatch[1]);
  return `https://player.vimeo.com/video/${idMatch[1]}?${params.toString()}`;
}

export function formatClock(seconds) {
  const s = Math.max(0, Math.floor(seconds || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export function localTimeLabel(timeZone) {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || timeZone;
  } catch {
    return timeZone;
  }
}

export function formatSlot(iso, opts = {}) {
  return new Date(iso).toLocaleString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    ...opts,
  });
}

export const LEAD_KEY = "fa_lead";
export const UNLOCK_KEY = "fa_unlocked";
export const PROGRESS_KEY = "fa_vsl_progress";

export function readStoredLead() {
  try {
    return JSON.parse(localStorage.getItem(LEAD_KEY) || "null");
  } catch {
    return null;
  }
}

export function storeLead(lead) {
  try {
    localStorage.setItem(LEAD_KEY, JSON.stringify(lead));
  } catch {
    /* storage unavailable */
  }
}