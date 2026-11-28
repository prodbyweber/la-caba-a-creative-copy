/** Secciones de la landing de Full Access que se pueden reordenar. */
export const SECTION_DEFS = [
  { key: "stats", label: "Cifras", desc: "Trayectoria en tres cifras." },
  { key: "brands", label: "Marcas colaboradoras", desc: "Franja de logos en movimiento." },
  { key: "artists", label: "Artistas", desc: "Carrusel de artistas que confiaron." },
  { key: "projects", label: "Selected Projects", desc: "Proyectos seleccionados." },
  { key: "methodology", label: "Metodología", desc: "Etapas, Demo & Master y nota de inversión." },
  { key: "closing", label: "Cierre", desc: "Botón final y pie de página." },
];

export const DEFAULT_SECTION_ORDER = SECTION_DEFS.map((section) => section.key);

/** Mantiene solo claves conocidas, respeta el orden guardado y añade las que falten. */
export function normalizeSectionOrder(order) {
  const known = new Set(DEFAULT_SECTION_ORDER);
  const saved = Array.isArray(order) ? order.filter((key) => known.has(key)) : [];
  const unique = [...new Set(saved)];
  return [...unique, ...DEFAULT_SECTION_ORDER.filter((key) => !unique.includes(key))];
}