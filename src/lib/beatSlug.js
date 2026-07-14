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

// Genera un slug único para un beat a partir de su título.
export async function ensureUniqueBeatSlug(baseTitle, excludeId) {
  const base = slugify(baseTitle) || "beat";
  const batch = await base44.entities.Beat.list("-updated_date", 500);
  const existing = new Set(
    (batch || [])
      .filter((b) => b.id !== excludeId && b.slug)
      .map((b) => b.slug)
  );
  if (!existing.has(base)) return base;
  let i = 2;
  while (existing.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

// Resuelve un parámetro de URL (slug o id legacy) a un beat.
export async function resolveBeatBySlugOrId(slugOrId) {
  if (!slugOrId) return null;
  try {
    const bySlug = await base44.entities.Beat.filter({ slug: slugOrId });
    if (bySlug && bySlug[0]) return bySlug[0];
  } catch { /* ignore */ }
  try {
    return await base44.entities.Beat.get(slugOrId);
  } catch {
    return null;
  }
}

// Devuelve el slug de un beat, generándolo del título si no existe.
export function beatSlug(beat) {
  return beat?.slug || slugify(beat?.title) || beat?.id || "";
}