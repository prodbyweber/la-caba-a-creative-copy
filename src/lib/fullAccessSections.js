/** Secciones de la landing de Full Access que se pueden reordenar. */
export const SECTION_DEFS = [
  { key: "stats", label: "Cifras", desc: "Trayectoria en tres cifras." },
  { key: "brands", label: "Marcas colaboradoras", desc: "Franja de logos en movimiento." },
  { key: "podcast", label: "Podcast", desc: "Poco se habla! con Xuso Jones y Briten." },
  { key: "artists", label: "Artistas", desc: "Carrusel de artistas que confiaron." },
  { key: "projects", label: "Selected Projects", desc: "Proyectos seleccionados." },
  { key: "methodology", label: "Metodología", desc: "Etapas y nota de inversión." },
  { key: "demos", label: "Demo & Master", desc: "Comparativa demo / master final." },
  { key: "testimonials", label: "Testimonios", desc: "Tarjetas verticales de vídeo." },
  { key: "closing", label: "Cierre", desc: "Botón final y pie de página." },
];

export const DEFAULT_SECTION_ORDER = SECTION_DEFS.map((section) => section.key);

/**
 * Mantiene solo claves conocidas, respeta el orden guardado y coloca las
 * secciones nuevas junto a su vecina del orden por defecto.
 */
export function normalizeSectionOrder(order) {
  const known = new Set(DEFAULT_SECTION_ORDER);
  const saved = Array.isArray(order) ? order.filter((key) => known.has(key)) : [];
  const result = [...new Set(saved)];
  if (!result.length) return [...DEFAULT_SECTION_ORDER];

  DEFAULT_SECTION_ORDER.forEach((key, index) => {
    if (result.includes(key)) return;
    let insertAt = 0;
    for (let i = index - 1; i >= 0; i -= 1) {
      const position = result.indexOf(DEFAULT_SECTION_ORDER[i]);
      if (position >= 0) {
        insertAt = position + 1;
        break;
      }
    }
    result.splice(insertAt, 0, key);
  });

  return result;
}