/** Carga el SDK de Vimeo una sola vez para toda la página. */
export function loadVimeoPlayer() {
  if (typeof window === "undefined") return Promise.reject(new Error("Sin ventana"));
  if (window.Vimeo?.Player) return Promise.resolve(window.Vimeo);
  if (window.__faVimeoPromise) return window.__faVimeoPromise;
  window.__faVimeoPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://player.vimeo.com/api/player.js";
    script.async = true;
    script.onload = () => resolve(window.Vimeo);
    script.onerror = () => reject(new Error("Vimeo no disponible"));
    document.head.appendChild(script);
  });
  return window.__faVimeoPromise;
}