// Resuelve qué beats mostrar en una sección (manual o automática).
// allBeats: array de beats publicados y no archivados.
export function resolveSectionBeats(section, allBeats) {
  if (!section) return [];
  const limit = section.limit || 10;

  // Manual: respetar el orden de manual_beat_ids, sin duplicados
  if (section.source_mode === "manual" && section.manual_beat_ids?.length) {
    const byId = new Map(allBeats.map((b) => [b.id, b]));
    const out = [];
    const seen = new Set();
    for (const id of section.manual_beat_ids) {
      if (seen.has(id)) continue;
      const b = byId.get(id);
      if (b) { out.push(b); seen.add(id); }
    }
    return out.slice(0, limit);
  }

  // Auto: aplicar filtro
  let result = [...allBeats];
  const ft = section.filter_type || "recent";
  if (ft === "featured") result = result.filter((b) => b.featured);
  else if (ft === "genre") result = result.filter((b) => (b.genres || []).includes(section.filter_value));
  else if (ft === "mood") result = result.filter((b) => (b.moods || []).includes(section.filter_value));
  else if (ft === "producer") result = result.filter((b) => (b.producer || "").toLowerCase() === (section.filter_value || "").toLowerCase());
  else if (ft === "popular") result.sort((a, b) => (b.plays_count || 0) - (a.plays_count || 0));
  else if (ft === "downloads") result.sort((a, b) => (b.downloads_count || 0) - (a.downloads_count || 0));
  else if (ft === "sold") result.sort((a, b) => (b.downloads_count || 0) - (a.downloads_count || 0));
  else if (ft === "oldest") result.sort((a, b) => new Date(a.created_date || 0) - new Date(b.created_date || 0));
  else if (ft === "az") result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  else if (ft === "za") result.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
  else result.sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0)); // recent

  return result.slice(0, limit);
}