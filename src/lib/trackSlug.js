import { base44 } from "@/api/base44Client";

// Convierte un título en un slug limpio, lower-case, sin acentos ni símbolos.
export function slugify(text) {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita acentos
    .replace(/[^a-z0-9\s-]/g, "") // solo alfanuméricos, espacios y guiones
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Genera un slug único para un track a partir de su título.
// Comprueba duplicados contra todos los tracks existentes (excluyendo el propio).
export async function ensureUniqueSlug(baseTitle, excludeId) {
  const base = slugify(baseTitle) || "track";
  const batch = await base44.entities.Track.list("-updated_date", 500);
  const existing = new Set(
    (batch || [])
      .filter((t) => t.id !== excludeId && t.slug)
      .map((t) => t.slug)
  );
  if (!existing.has(base)) return base;
  let i = 2;
  while (existing.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

// Resuelve un parámetro de URL (slug o id legacy) a un track.
export async function resolveTrackBySlugOrId(slugOrId) {
  if (!slugOrId) return null;
  // Intentar por slug primero
  try {
    const bySlug = await base44.entities.Track.filter({ slug: slugOrId });
    if (bySlug && bySlug[0]) return bySlug[0];
  } catch { /* ignore */ }
  // Fallback: por id (enlaces legacy)
  try {
    return await base44.entities.Track.get(slugOrId);
  } catch {
    return null;
  }
}