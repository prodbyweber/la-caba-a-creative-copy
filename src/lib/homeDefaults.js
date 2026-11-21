// Contenido por defecto de la home. La página lee de las entidades;
// estos valores se usan cuando aún no hay registros guardados en la base de datos.

import { DEFAULT_CREATORS, DEFAULT_SETTINGS, DEFAULT_VIDEOS } from "./landingDefaults";

const M = {
  heroVideo:
    "https://base44.app/api/apps/6966ddf48947f217e81ea27c/files/mp/public/6966ddf48947f217e81ea27c/725535674_copy_E89E0D09-C530-46C0-BB56-7CF16D819596.MOV",
  journeyVideo:
    "https://base44.app/api/apps/6966ddf48947f217e81ea27c/files/mp/public/6966ddf48947f217e81ea27c/8744e420f_weberxzcruz.mp4",
  still:
    "https://base44.app/api/apps/6966ddf48947f217e81ea27c/files/mp/public/6966ddf48947f217e81ea27c/de2d3f461_Still2026-05-24133616_241.jpg",
  weberBg:
    "https://media.base44.com/images/public/6966ddf48947f217e81ea27c/a32a65d3c_Still2026-05-22190754_1431.jpg",
  zcruz:
    "https://base44.app/api/apps/6966ddf48947f217e81ea27c/files/mp/public/6966ddf48947f217e81ea27c/cc5bb0b04_DSC05215.jpeg",
  zcruzCover:
    "https://base44.app/api/apps/6966ddf48947f217e81ea27c/files/mp/public/6966ddf48947f217e81ea27c/b2c97cf54_IMG_1180.jpeg",
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
    eyebrow: "Para artistas, creadores y labels",
    title: "Construye tu catálogo.\nTu música, a un clic de distancia.",
    subtitle: "Producción y estrategia para lanzar tu catálogo al mundo.",
    body: "",
    cta_label: "",
    cta_link: "",
    cta2_label: "",
    cta2_link: "",
  },
  {
    key: "manifiesto",
    order: 2,
    is_visible: true,
    eyebrow: "Cabaña Creative",
    title: "Estás a un clic de construir tu catálogo.",
    subtitle: "Define tu sonido. Define tu catálogo.",
    body: "Explorar, Descubrir, Cabaña",
    cta_label: "Enviar mi proyecto",
    cta_link: "#comenzar",
    cta2_label: "",
    cta2_link: "",
  },
  {
    key: "estudio",
    order: 3,
    is_visible: true,
    eyebrow: "Estudio",
    title: "El estudio.",
    subtitle: "Así se produce en Cabaña.",
    body: "",
    cta_label: "",
    cta_link: "",
    cta2_label: "",
    cta2_link: "",
  },
  {
    key: "generos",
    order: 4,
    is_visible: true,
    eyebrow: "Géneros",
    title: "Cinco sonidos, un catálogo.",
    subtitle: "",
    body: "Fusion",
    cta_label: "",
    cta_link: "",
    cta2_label: "",
    cta2_link: "",
  },
  {
    key: "comunidad",
    order: 5,
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
    key: "cifras",
    order: 6,
    is_visible: true,
    eyebrow: "Cabaña en cifras",
    title: "Lo que hemos construido.",
    subtitle: "",
    body: "",
    cta_label: "",
    cta_link: "",
    cta2_label: "",
    cta2_link: "",
  },
  {
    key: "marcas",
    order: 7,
    is_visible: true,
    eyebrow: "Marcas",
    title: "Han confiado en nosotros.",
    subtitle: "Marcas con las que hemos colaborado.",
    body: "",
    cta_label: "",
    cta_link: "",
    cta2_label: "",
    cta2_link: "",
  },
  {
    key: "proceso",
    order: 8,
    is_visible: true,
    eyebrow: "Cómo funciona",
    title: "Cuatro pasos en la cabaña.",
    subtitle: "",
    body: "",
    cta_label: "",
    cta_link: "",
    cta2_label: "",
    cta2_link: "",
  },
  {
    key: "comenzar",
    order: 9,
    is_visible: true,
    eyebrow: "Cómo comenzar",
    title: "Arma tu proyecto.",
    subtitle: "Elige, pega tu demo y nosotros le damos color.",
    body: "",
    cta_label: "",
    cta_link: "",
    cta2_label: "",
    cta2_link: "",
  },
  {
    key: "antes_despues",
    order: 10,
    is_visible: true,
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
    title: "Tu catálogo empieza en la cabaña.",
    subtitle: "",
    body: "Cuéntanos dónde estás y te decimos cómo llegar.",
    cta_label: "Agendar sesión de descubrimiento",
    cta_link: "/solicitud",
    cta2_label: "O envía tu proyecto",
    cta2_link: "#comenzar",
  },
  {
    key: "casa",
    order: 12,
    is_visible: false,
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

export const DEFAULT_HERO_VIDEOS = [
  { title: "Estudio 01", video_url: M.heroVideo, poster_url: M.still, order: 1, is_visible: true },
  { title: "Sesión 02", video_url: M.journeyVideo, poster_url: M.weberBg, order: 2, is_visible: true },
];

export const DEFAULT_STUDIO = [
  { title: "Sesión de grabación", image_url: M.zcruz, order: 1, is_visible: true },
  { title: "Producción", image_url: M.kenshoCover, order: 2, is_visible: true },
  { title: "Mezcla y master", image_url: M.royCover, order: 3, is_visible: true },
];

export const DEFAULT_GENRES = [
  {
    key: "latin_urban",
    name: "Latin Urban",
    label: "Artistas · Catálogo",
    description: "Raíz latina y calle. Del dembow al reggaetón, con producción actual.",
    image_url: M.zcruzCover,
    tint: "#ff5833",
    accent: "#ff5833",
    global_data: "",
    global_source: "",
    order: 1,
    is_visible: true,
  },
  {
    key: "afrobeats",
    name: "Afrobeats",
    label: "Artistas · Catálogo",
    description: "Ritmo y movimiento. Groove que cruza fronteras.",
    image_url: M.kenshoCover,
    tint: "#2fbf71",
    accent: "#6fe3a5",
    global_data: "",
    global_source: "",
    order: 2,
    is_visible: true,
  },
  {
    key: "pop",
    name: "Pop",
    label: "Artistas · Catálogo",
    description: "Melodía, gancho y alcance global.",
    image_url: M.carly,
    tint: "#ffb03a",
    accent: "#ffcf7a",
    global_data: "",
    global_source: "",
    order: 3,
    is_visible: true,
  },
  {
    key: "trap",
    name: "Trap",
    label: "Artistas · Catálogo",
    description: "808, atmósfera y flow.",
    image_url: M.still,
    tint: "#ff3d6e",
    accent: "#ff8aa5",
    global_data: "",
    global_source: "",
    order: 4,
    is_visible: true,
  },
  {
    key: "house",
    name: "House",
    label: "Artistas · Catálogo",
    description: "Pista y energía. Del club al after.",
    image_url: M.roy,
    tint: "#22c1d6",
    accent: "#7ae6f3",
    global_data: "",
    global_source: "",
    order: 5,
    is_visible: true,
  },
];

export const DEFAULT_FUSION = [
  { name: "Afro House", description: "Groove orgánico y percusión profunda.", accent: "#ff5833", order: 1, is_visible: true },
  { name: "Electropop", description: "Sintetizadores y melodía pop.", accent: "#6a3cff", order: 2, is_visible: true },
  { name: "Reggaetón", description: "Dembow y gancho de pista.", accent: "#2fbf71", order: 3, is_visible: true },
  { name: "Jersey Club", description: "Cortes rápidos y bajo saltón.", accent: "#ffb03a", order: 4, is_visible: true },
  { name: "Funk Brasil", description: "Ritmo brasileño y swing de baile.", accent: "#ff3d6e", order: 5, is_visible: true },
  { name: "Hip Hop", description: "Boom bap y flow de autor.", accent: "#22c1d6", order: 6, is_visible: true },
  { name: "Acústico", description: "Voz y guitarra, sin artificios.", accent: "#b06bff", order: 7, is_visible: true },
];

export const DEFAULT_PROCESS = [
  {
    num: "01",
    icon: "sparkles",
    title: "Descubre tu sonido",
    text: "Definimos tu género, tu referencia y hacia dónde va tu música.",
    image_url: M.still,
    order: 1,
    is_visible: true,
  },
  {
    num: "02",
    icon: "disc",
    title: "Produce y construye tu catálogo",
    text: "Producción, mezcla y master de tus canciones.",
    image_url: M.kenshoCover,
    order: 2,
    is_visible: true,
  },
  {
    num: "03",
    icon: "target",
    title: "Define tu estrategia",
    text: "Plan claro para cada lanzamiento.",
    image_url: M.zcruz,
    order: 3,
    is_visible: true,
  },
  {
    num: "04",
    icon: "rocket",
    title: "Lánzalo al mercado",
    text: "Te mostramos cómo llevarlo a las plataformas y al público.",
    image_url: M.royCover,
    order: 4,
    is_visible: true,
  },
];

export const DEFAULT_BUILDER = [
  {
    key: "genero",
    title: "Tu género",
    color: "#ff5833",
    multi: true,
    options: [
      "Latin Urban",
      "Reggaetón",
      "Afrobeats",
      "Pop",
      "Trap",
      "House",
      "Jersey Club",
      "Funk Brasil",
      "Hip Hop",
      "Acústico",
      "Afro House",
      "Electropop",
    ],
    order: 1,
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
      "Estrategia de catálogo",
    ],
    order: 2,
    is_visible: true,
  },
  {
    key: "etapa",
    title: "Tu etapa",
    color: "#f1efe8",
    multi: false,
    options: ["Empezando", "Tengo canciones", "Quiero lanzar", "Quiero escalar"],
    order: 3,
    is_visible: true,
  },
  {
    key: "ubicacion",
    title: "¿Dónde te ubicas?",
    color: "#141414",
    multi: false,
    options: [],
    order: 4,
    is_visible: true,
  },
  {
    key: "demo",
    title: "Tu demo",
    color: "#c9431f",
    multi: false,
    options: [],
    order: 5,
    is_visible: true,
  },
  {
    key: "mood",
    title: "Define el mood de tu canción",
    color: "#1e1e1e",
    multi: true,
    options: [
      "Alegre",
      "Melancólico",
      "Romántico",
      "Oscuro",
      "Energético",
      "Chill",
      "Fiesta",
      "Nostálgico",
      "Íntimo",
      "Épico",
    ],
    order: 6,
    is_visible: true,
  },
];

export const DEFAULT_DEMOS = [
  {
    artist: "Zcruz",
    genre: "Latin Urban",
    cover_url: M.zcruzCover,
    demo_audio_url:
      "https://base44.app/api/apps/6966ddf48947f217e81ea27c/files/mp/public/6966ddf48947f217e81ea27c/2497ec775_nombreyapellidodemofinal.mp3",
    master_audio_url: "",
    order: 1,
    is_visible: true,
  },
  {
    artist: "Kensho",
    genre: "Afrobeats",
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
  { value: 30, prefix: "+", suffix: "", label: "países donde nos escuchan", order: 3, is_visible: true },
];

export const DEFAULT_HOME = {
  settings: DEFAULT_SETTINGS,
  sections: DEFAULT_HOME_SECTIONS,
  heroVideos: DEFAULT_HERO_VIDEOS,
  studio: DEFAULT_STUDIO,
  genres: DEFAULT_GENRES,
  fusion: DEFAULT_FUSION,
  process: DEFAULT_PROCESS,
  builder: DEFAULT_BUILDER,
  demos: DEFAULT_DEMOS,
  stats: DEFAULT_STATS,
  creators: DEFAULT_CREATORS,
  videos: DEFAULT_VIDEOS,
  brands: [],
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
    heroVideos: pickList(db.heroVideos, DEFAULT_HERO_VIDEOS),
    studio: pickList(db.studio, DEFAULT_STUDIO),
    genres: pickList(db.genres, DEFAULT_GENRES),
    fusion: pickList(db.fusion, DEFAULT_FUSION),
    process: pickList(db.process, DEFAULT_PROCESS),
    builder: pickList(db.builder, DEFAULT_BUILDER),
    demos: pickList(db.demos, DEFAULT_DEMOS),
    stats: pickList(db.stats, DEFAULT_STATS),
    creators: pickList(db.creators, DEFAULT_CREATORS),
    videos: pickList(db.videos, DEFAULT_VIDEOS),
    brands: Array.isArray(db.brands) ? db.brands.filter(Boolean) : [],
  };
}