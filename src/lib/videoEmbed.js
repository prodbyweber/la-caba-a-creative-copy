const VIMEO_RE = /(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/;
const YOUTUBE_RE =
  /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([\w-]{11})/;

/** Si el valor es un código embed, devuelve solo el src del iframe. */
export function extractEmbedSrc(input) {
  const match = String(input || "").match(/<iframe[^>]+src=["']([^"']+)["']/i);
  return match ? match[1].replace(/&amp;/g, "&") : "";
}

/** Interpreta un enlace de Vimeo/YouTube o un código embed. */
export function parseVideoSource(input, { autoplay = false, chromeless = false } = {}) {
  const raw = String(input || "").trim();
  if (!raw) return null;
  const source = extractEmbedSrc(raw) || raw;

  const vimeo = source.match(VIMEO_RE);
  if (vimeo) {
    const params = new URLSearchParams({
      autopause: "0",
      dnt: "1",
      title: "0",
      byline: "0",
      portrait: "0",
      app_id: "58479",
    });
    if (autoplay) params.set("autoplay", "1");
    // Sin interfaz de Vimeo: solo el vídeo, con sonido y sin pantalla final.
    if (chromeless) {
      params.set("controls", "0");
      params.set("muted", "0");
      params.set("playsinline", "1");
      params.set("pip", "0");
      params.set("keyboard", "0");
      params.set("speed", "0");
      params.set("logo", "0");
      params.set("outro", "0");
      params.set("cards", "0");
      params.set("like", "0");
      params.set("share", "0");
      params.set("watch_later", "0");
      params.set("badge", "0");
      params.set("cc", "0");
      params.set("chapters", "0");
      params.set("transcript", "0");
    }
    const hash = source.match(/[?&]h=([a-zA-Z0-9]+)/);
    if (hash) params.set("h", hash[1]);
    return {
      kind: "vimeo",
      id: vimeo[1],
      embedUrl: `https://player.vimeo.com/video/${vimeo[1]}?${params.toString()}`,
      thumb: "",
    };
  }

  const youtube = source.match(YOUTUBE_RE);
  if (youtube) {
    const params = new URLSearchParams({ rel: "0", modestbranding: "1", playsinline: "1" });
    if (autoplay) params.set("autoplay", "1");
    return {
      kind: "youtube",
      id: youtube[1],
      embedUrl: `https://www.youtube.com/embed/${youtube[1]}?${params.toString()}`,
      thumb: `https://img.youtube.com/vi/${youtube[1]}/hqdefault.jpg`,
    };
  }

  return null;
}