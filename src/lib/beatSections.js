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
      if (b) { out.push(b); seen.add(b.id); }
    }
    return out.slice(0, limit);
  }

  // Auto: filtrar por tags (géneros + moods) y luego ordenar
  let result = [...allBeats];

  // Tags (nuevo sistema): beats que coincidan con cualquier tag seleccionado
  const tags = section.filter_tags || [];
  if (tags.length) {
    result = result.filter((b) => {
      const bt = [...(b.genres || []), ...(b.moods || [])];
      return tags.some((t) => bt.includes(t));
    });
  }

  // Filtros legacy (compatibilidad hacia atrás)
  const ft = section.filter_type || "recent";
  if (ft === "genre" && section.filter_value) {
    result = result.filter((b) => (b.genres || []).includes(section.filter_value));
  } else if (ft === "mood" && section.filter_value) {
    result = result.filter((b) => (b.moods || []).includes(section.filter_value));
  } else if (ft === "producer" && section.filter_value) {
    result = result.filter((b) => (b.producer || "").toLowerCase() === (section.filter_value || "").toLowerCase());
  } else if (ft === "featured") {
    result = result.filter((b) => b.featured);
  }

  // Orden
  if (ft === "popular") result.sort((a, b) => (b.plays_count || 0) - (a.plays_count || 0));
  else if (ft === "downloads" || ft === "sold") result.sort((a, b) => (b.downloads_count || 0) - (a.downloads_count || 0));
  else if (ft === "oldest") result.sort((a, b) => new Date(a.created_date || 0) - new Date(b.created_date || 0));
  else if (ft === "az") result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  else if (ft === "za") result.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
  else result.sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0)); // recent / featured / genre / mood / producer / tag

  return result.slice(0, limit);
}