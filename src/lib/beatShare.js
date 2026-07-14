import { beatSlug } from "@/lib/beatSlug";

// Devuelve la URL pública limpia de un beat.
export function getBeatShareUrl(beat) {
  const slug = beatSlug(beat);
  return `${window.location.origin}/beats/${slug}`;
}

// Copia el enlace limpio del beat al portapapeles con feedback visual.
// Devuelve true si tuvo éxito.
export async function shareBeatLink(beat) {
  const url = getBeatShareUrl(beat);
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(url);
      return true;
    }
  } catch { /* fallback abajo */ }
  try {
    const ta = document.createElement("textarea");
    ta.value = url;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}