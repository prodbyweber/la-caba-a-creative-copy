// Precarga (warm-up) del audio de un beat para que la reproducción al clic sea inmediata.
// Calienta la caché HTTP del navegador creando un Audio oculto con preload auto.
const cache = new Set();

export function preloadBeatAudio(url) {
  if (!url || cache.has(url)) return;
  cache.add(url);
  try {
    const a = new Audio();
    a.preload = "auto";
    a.muted = true;
    a.src = url;
    // Liberar tras un rato para no acumular elementos
    setTimeout(() => { try { a.src = ""; a.load(); } catch {} }, 60000);
  } catch {}
}