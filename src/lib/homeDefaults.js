// Contenido por defecto de la home. La página lee de las entidades;
// estos valores se usan cuando aún no hay registros guardados en la base de datos.

import { DEFAULT_CREATORS, DEFAULT_SETTINGS, DEFAULT_VIDEOS } from "./landingDefaults";

const M = {
  still:
    "https://base44.app/api/apps/6966ddf48947f217e81ea27c/files/mp/public/6966ddf48947f217e81ea27c/de2d3f461_Still2026-05-24133616_241.jpg",
  access:
    "https://base44.app/api/apps/6966ddf48947f217e81ea27c/files/mp/public/6966ddf48947f217e81ea27c/fb56bad92_IMG_1601.jpeg",
  weberBg:
    "https://media.base44.com/images/public/6966ddf48947f217e81ea27c/a32a65d3c_Still2026-05-22190754_1431.jpg",
  journeyVideo:
    "https://base44.app/api/apps/6966ddf48947f217e81ea27c/files/mp/public/6966ddf48947f217e81ea27c/8744e420f_weberxzcruz.mp4",
  zcruz:
    "https://base44.app/api/apps/6966ddf48947f217e81ea27c/files/mp/public/6966ddf48947f217e81ea27c/cc5bb0b04_DSC05215.jpeg",
  zcruzCover:
    "https://base44.app/api/apps/6966ddf48947f217e81ea27c/files/mp/public/6966ddf48947f217e81ea27c/b2c97cf54_IMG_1180.jpeg",
  kensho:
    "https://base44.app/api/apps/6966ddf48947f217e81ea27c/files/mp/public/6966ddf48947f217e81ea27c/27908b931_62215df6-dccd-4d3a-9dc9-4a978f4f2b182.png",
  kenshoCover:
    "https://base44.app/api/apps/6966ddf48947f217e81ea27c/files/mp/public/6966ddf48947f217e81ea27c/a83833595_aaf69b2d8a3e7695696da777a9a4eedd.jpg",
  carly:
    "https://base44.app/api/apps/6966ddf48947f217e81ea27c/files/mp/public/6966ddf48947f217e81ea27c/7af9b2a84_3ccd794d7235d69bb691d530d82ad04b.jpg",
  roy:
    "https://base44.app/api/apps/6966ddf48947f217e81ea27c/files/mp/public/6966ddf48947f217e81ea27c/0aca57c8d_IMG_2859.jpeg",
  royCover:
    "https://base44.app/api/apps/6966ddf48947f217e81ea27c/files/mp/public/6966ddf48947f217e81ea27c/34f6bfef2_1633bb7269cd459985dd24fba5084b09.jpg",
};

export const DEFAULT_HOME_SECTIONS = [
  {
    key: "hero",
    order: 1,
    is_visible: true,
    eyebrow: "",
    title: "Todo empieza con un catálogo.",
    subtitle:
      "Descubre nuevos sonidos, conecta con creadores y desarrolla tu próximo proyecto musical.",
    body: "",
    cta_label: "",
    cta_link: "",
    cta2_label: "",
    cta2_link: "",
  },
  {
    key: "propuesta",
    order: 2,
    is_visible: true,
    eyebrow: "",
    title: "La propuesta",
    subtitle: "",
    body: "",
    cta_label: "",
    cta_link: "",
    cta2_label: "",
    cta2_link: "",
  },
  {
    key: "paises",
    order: 4,
    is_visible: true,
    eyebrow: "",
    title: "+30",
    subtitle: "países",
    body: "Únete a artistas de todo el mundo en Cabaña.",
    cta_label: "Explorar más",
    cta_link: "#generos",
    cta2_label: "",
    cta2_link: "",
  },
  {
    key: "generos",
    order: 5,
    is_visible: true,
    eyebrow: "Géneros",
    title: "Cuatro sonidos, una casa.",
    subtitle: "El pulso de cada género, con datos reales de la industria.",
    body: "",
    cta_label: "",
    cta_link: "",
    cta2_label: "",
    cta2_link: "",
  },
  {
    key: "comunidad",
    order: 7,
    is_visible: true,
    eyebrow: "Comunidad",
    title: "Aquí no creas solo.",
    subtitle: "Artistas, productores y creativos que crecen juntos.",
    body: "Colaboraciones, sesiones y conexiones reales: la cabaña es el punto de encuentro de la escena.",
    cta_label: "",
    cta_link: "",
    cta2_label: "",
    cta2_link: "",
  },
  {
    key: "proceso",
    order: 3,
    is_visible: true,
    eyebrow: "",
    title: "Cómo funciona",
    subtitle: "",
    body: "",
    cta_label: "",
    cta_link: "",
    cta2_label: "",
    cta2_link: "",
  },
  {
    key: "comenzar",
    order: 10,
    is_visible: true,
    eyebrow: "",
    title: "Tu brief",
    subtitle: "Cuéntanos tu proyecto en minutos",
    body: "",
    cta_label: "",
    cta_link: "",
    cta2_label: "",
    cta2_link: "",
  },
  {
    key: "antes_despues",
    order: 12,
    is_visible: false,
    eyebrow: "Antes y después",
    title: "De la demo al master final.",
    subtitle: "Toca para escuchar cada versión.",
    body: "",
    cta_label: "",
    cta_link: "",
    cta2_label: "",
    cta2_link: "",
  },
  {
    key: "final",
    order: 11,
    is_visible: true,
    eyebrow: "Empezar",
    title: "Lanza tu catálogo.",
    subtitle: "",
    body: "",
    cta_label: "Enviar mi proyecto",
    cta_link: "#comenzar",
    cta2_label: "",
    cta2_link: "",
  },
  {
    key: "casa",
    order: 6,
    is_visible: true,
    eyebrow: "Qué es Cabaña",
    title: "Tu música, con estructura.",
    subtitle: "",
    body: "",
    cta_label: "",
    cta_link: "",
    cta2_label: "",
    cta2_link: "",
  },
  {
    key: "cifras",
    order: 8,
    is_visible: true,
    eyebrow: "Cabaña en cifras",
    title: "Números de la casa.",
    subtitle: "",
    body: "",
    cta_label: "",
    cta_link: "",
    cta2_label: "",
    cta2_link: "",
  },
  {
    key: "marcas",
    order: 9,
    is_visible: true,
    eyebrow: "Marcas",
    title: "Con quienes hemos colaborado.",
    subtitle: "",
    body: "",
    cta_label: "",
    cta_link: "",
    cta2_label: "",
    cta2_link: "",
  },
  {
    key: "tendencia",
    order: 13,
    is_visible: false,
    eyebrow: "En tendencia",
    title: "Atrévete a explorar.",
    subtitle: "",
    body: "",
    cta_label: "",
    cta_link: "",
    cta2_label: "",
    cta2_link: "",
  },
];

export const DEFAULT_PROPOSAL = [
  {
    label: "Qué es",
    text: "Cabaña es la plataforma donde artistas y creadores construyen su catálogo musical.",
    order: 1,
    is_visible: true,
  },
  {
    label: "Qué haces tú",
    text: "Nos cuentas tu proyecto en un brief: género, mood, demo y país.",
    order: 2,
    is_visible: true,
  },
  {
    label: "Qué hacemos nosotros",
    text: "Desarrollamos tu producción, mezcla y master, y te damos los recursos para lanzar tu catálogo.",
    order: 3,
    is_visible: true,
  },
];

export const DEFAULT_FLAGS = [
  { code: "ES", name: "España", order: 1, is_visible: true },
  { code: "MX", name: "México", order: 2, is_visible: true },
  { code: "CO", name: "Colombia", order: 3, is_visible: true },
  { code: "AR", name: "Argentina", order: 4, is_visible: true },
  { code: "CL", name: "Chile", order: 5, is_visible: true },
  { code: "PE", name: "Perú", order: 6, is_visible: true },
  { code: "BR", name: "Brasil", order: 7, is_visible: true },
  { code: "US", name: "Estados Unidos", order: 8, is_visible: true },
  { code: "PT", name: "Portugal", order: 9, is_visible: true },
  { code: "FR", name: "Francia", order: 10, is_visible: true },
  { code: "IT", name: "Italia", order: 11, is_visible: true },
  { code: "MA", name: "Marruecos", order: 12, is_visible: true },
  { code: "NG", name: "Nigeria", order: 13, is_visible: true },
  { code: "JP", name: "Japón", order: 14, is_visible: true },
];

export const DEFAULT_GENRES = [
  {
    key: "latin_urban",
    name: "Latin Urban",
    subgenres: "Reggaetón · Bachata · Latin Pop · Dembow · Trap Latino · Perreo",
    image_url: M.zcruzCover,
    tint: "#ff5833",
    accent: "#ffb4a2",
    figure_value: 363.2,
    figure_prefix: "",
    figure_suffix: "B",
    figure_text: "",
    figure_label: "streams globales de música latina",
    figure_note: "1.er semestre 2026 · vs 335.3B en 2025",
    facts: [
      "+17.1% ingresos en Latinoamérica en 2025, la región que más crece",
      "9.4% de los streams en EE. UU. son en español (1S 2026)",
    ],
    source: "Luminate Midyear Report · IFPI Global Music Report",
    source_year: "2026",
    is_fusion: false,
    order: 1,
    is_visible: true,
  },
  {
    key: "afrobeats",
    name: "Afrobeats",
    subgenres: "Afropop · Afro Fusion · Amapiano · Latin Afro",
    image_url: M.kenshoCover,
    tint: "#2fbf71",
    accent: "#6fe3a5",
    figure_value: 5022,
    figure_prefix: "+",
    figure_suffix: "%",
    figure_text: "",
    figure_label: "crecimiento de streams de Afrobeats en Nigeria",
    figure_note: "Entre 2021 y 2025 · Spotify",
    facts: [
      "+15.2% ingresos de música grabada en África subsahariana en 2025",
      "US$120M de ingresos en la región",
    ],
    source: "Spotify · IFPI Global Music Report",
    source_year: "2026",
    is_fusion: false,
    order: 2,
    is_visible: true,
  },
  {
    key: "hip_hop",
    name: "Hip Hop",
    subgenres: "Trap · Drill · Boom Bap · Latin Hip Hop",
    image_url: M.royCover,
    tint: "#ff3d6e",
    accent: "#ff8aa5",
    figure_value: 0,
    figure_prefix: "",
    figure_suffix: "",
    figure_text: "1 de cada 4",
    figure_label: "streams on-demand en EE. UU. son de R&B/Hip-Hop",
    figure_note: "1.er semestre 2026",
    facts: [
      "30% del consumo de álbumes en EE. UU. (1S 2026)",
      "2.8T streams on-demand globales en el 1S 2026",
    ],
    source: "Luminate Midyear Report",
    source_year: "2026",
    is_fusion: false,
    order: 3,
    is_visible: true,
  },
  {
    key: "house",
    name: "House",
    subgenres: "Afro House · Tech House · Melodic House · Latin House",
    image_url: M.roy,
    tint: "#22c1d6",
    accent: "#7ae6f3",
    figure_value: 15.1,
    figure_prefix: "US$",
    figure_suffix: "B",
    figure_text: "",
    figure_label: "valor de la industria de música electrónica en 2025 (+7%)",
    figure_note: "IMS Business Report 2026",
    facts: [
      "Afro House: 2.º género más buscado en Splice en 2025, desde el 10.º en 2023",
      "+82% búsquedas",
    ],
    source: "IMS Business Report (MIDiA Research)",
    source_year: "2026",
    is_fusion: false,
    order: 4,
    is_visible: true,
  },
  {
    key: "jersey_club",
    name: "Jersey Club",
    is_fusion: true,
    order: 5,
    is_visible: true,
  },
  {
    key: "electropop",
    name: "Electropop",
    is_fusion: true,
    order: 6,
    is_visible: true,
  },
  {
    key: "funk_brasil",
    name: "Funk Brasil",
    is_fusion: true,
    order: 7,
    is_visible: true,
  },
  {
    key: "acustico",
    name: "Acústico",
    is_fusion: true,
    order: 8,
    is_visible: true,
  },
];

export const DEFAULT_PROCESS = [
  {
    num: "01",
    title: "Descubre tu sonido",
    text: "Referencias y dirección sonora: de dónde viene tu música y hacia dónde va.",
    image_url: M.still,
    order: 1,
    is_visible: true,
  },
  {
    num: "02",
    title: "Produce y construye tu catálogo",
    text: "Composición, instrumentales y producción. Las canciones sueltas se vuelven un catálogo coherente.",
    image_url: M.kenshoCover,
    order: 2,
    is_visible: true,
  },
  {
    num: "03",
    title: "Prepara tu lanzamiento",
    text: "Recibes los recursos para planificarlo.",
    image_url: M.zcruz,
    order: 3,
    is_visible: true,
  },
  {
    num: "04",
    title: "Lánzalo al mercado",
    text: "Tu proyecto sale al mundo con todo listo para escucharse.",
    image_url: M.royCover,
    order: 4,
    is_visible: true,
  },
];

export const DEFAULT_BUILDER = [
  {
    key: "etapa",
    title: "Tu punto de partida",
    color: "#f1efe8",
    multi: false,
    options: ["Una canción", "Un catálogo (3+ canciones)"],
    order: 1,
    is_visible: true,
  },
  {
    key: "genero",
    title: "Tu género",
    color: "#ff5833",
    multi: true,
    options: [
      "Latin Urban",
      "Reggaetón",
      "Bachata",
      "Latin Pop",
      "Afrobeats",
      "Latin Afro",
      "Hip Hop",
      "Trap",
      "House",
      "Afro House",
      "Jersey Club",
      "Funk Brasil",
      "Electropop",
      "Acústico",
    ],
    order: 2,
    is_visible: true,
  },
  {
    key: "mood",
    title: "El mood",
    color: "#2a2a2a",
    multi: false,
    options: ["Oscuro", "Íntimo", "Fiestero", "Melancólico", "Épico", "Relajado"],
    order: 3,
    is_visible: true,
  },
  {
    key: "necesitas",
    title: "Qué necesitas",
    color: "#141414",
    multi: true,
    options: [
      "Producción musical",
      "Mezcla y master",
      "Desarrollo de catálogo",
      "Recursos de lanzamiento",
    ],
    order: 4,
    is_visible: true,
  },
  {
    key: "ubicacion",
    title: "¿Dónde te ubicas?",
    color: "#1e1e1e",
    multi: false,
    options: [],
    order: 5,
    is_visible: true,
  },
  {
    key: "demo",
    title: "Tu demo",
    color: "#c9431f",
    multi: true,
    options: ["Libertad creativa", "Referencias", "Sonido específico", "Instrucciones personalizadas"],
    order: 6,
    is_visible: true,
  },
];

export const DEFAULT_DEMOS = [
  {
    artist: "Zcruz",
    genre: "Latin",
    cover_url: M.zcruzCover,
    demo_audio_url:
      "https://base44.app/api/apps/6966ddf48947f217e81ea27c/files/mp/public/6966ddf48947f217e81ea27c/2497ec775_nombreyapellidodemofinal.mp3",
    master_audio_url: "",
    order: 1,
    is_visible: true,
  },
  {
    artist: "Kensho",
    genre: "Urban",
    cover_url: M.kenshoCover,
    demo_audio_url:
      "https://base44.app/api/apps/6966ddf48947f217e81ea27c/files/mp/public/6966ddf48947f217e81ea27c/2f7ea3a3e_JOYASVACIASKenshoprodbyweber.mp3",
    master_audio_url: "",
    order: 2,
    is_visible: true,
  },
];

export const DEFAULT_STATS = [
  { value: 100, prefix: "+", suffix: "", label: "artistas", order: 1, is_visible: true },
  { value: 1000000, prefix: "+", suffix: "", label: "reproducciones", order: 2, is_visible: true },
  { value: 30, prefix: "+", suffix: "", label: "países", order: 3, is_visible: true },
];

export const DEFAULT_HOME = {
  settings: DEFAULT_SETTINGS,
  sections: DEFAULT_HOME_SECTIONS,
  proposal: DEFAULT_PROPOSAL,
  flags: DEFAULT_FLAGS,
  genres: DEFAULT_GENRES,
  process: DEFAULT_PROCESS,
  builder: DEFAULT_BUILDER,
  demos: DEFAULT_DEMOS,
  stats: DEFAULT_STATS,
  creators: DEFAULT_CREATORS,
  videos: DEFAULT_VIDEOS,
};

const byOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0);

function pickList(dbList, fallback) {
  return Array.isArray(dbList) && dbList.length ? dbList.slice().sort(byOrder) : fallback.map((x) => ({ ...x }));
}

export function mergeHome(db = {}) {
  const savedSections = Array.isArray(db.sections) ? db.sections : [];
  const byKey = new Map(savedSections.filter((s) => s.key).map((s) => [s.key, s]));

  const sections = DEFAULT_HOME_SECTIONS.map((base) => {
    const saved = byKey.get(base.key);
    return saved ? { ...base, ...saved } : { ...base };
  });
  savedSections
    .filter((s) => s.key && !DEFAULT_HOME_SECTIONS.some((b) => b.key === s.key))
    .forEach((s) => sections.push({ ...s }));

  return {
    settings: { ...DEFAULT_SETTINGS, ...(db.settings || {}) },
    sections: sections.sort(byOrder),
    proposal: pickList(db.proposal, DEFAULT_PROPOSAL),
    flags: pickList(db.flags, DEFAULT_FLAGS),
    genres: pickList(db.genres, DEFAULT_GENRES),
    process: pickList(db.process, DEFAULT_PROCESS),
    builder: pickList(db.builder, DEFAULT_BUILDER),
    demos: pickList(db.demos, DEFAULT_DEMOS),
    stats: pickList(db.stats, DEFAULT_STATS),
    creators: pickList(db.creators, DEFAULT_CREATORS),
    videos: pickList(db.videos, DEFAULT_VIDEOS),
  };
}