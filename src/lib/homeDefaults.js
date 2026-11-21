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
    eyebrow: "Para artistas, labels y managers",
    title: "Más que lo que se escucha.",
    subtitle:
      "Construye tu catálogo, dale identidad y lánzalo al mundo. Producción, imagen y estrategia en un solo lugar.",
    body: "Tu música, a un clic de distancia.",
    cta_label: "Explorar",
    cta_link: "#generos",
    cta2_label: "Empezar mi proyecto",
    cta2_link: "#comenzar",
  },
  {
    key: "audiencia",
    order: 2,
    is_visible: true,
    eyebrow: "Para quién es",
    title: "Hecho para quien construye.",
    subtitle: "Artistas, labels y managers que quieren llevar su proyecto en serio.",
    body: "",
    cta_label: "",
    cta_link: "",
    cta2_label: "",
    cta2_link: "",
  },
  {
    key: "generos",
    order: 3,
    is_visible: true,
    eyebrow: "Géneros",
    title: "Siete formas de sonar.",
    subtitle: "Cada tarjeta es un mundo sonoro.",
    body: "",
    cta_label: "",
    cta_link: "",
    cta2_label: "",
    cta2_link: "",
  },
  {
    key: "comunidad",
    order: 4,
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
    order: 5,
    is_visible: true,
    eyebrow: "Cómo funciona",
    title: "Cuatro pasos en la cabaña.",
    subtitle: "Del primer sonido al lanzamiento.",
    body: "",
    cta_label: "",
    cta_link: "",
    cta2_label: "",
    cta2_link: "",
  },
  {
    key: "comenzar",
    order: 6,
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
    order: 7,
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
    order: 8,
    is_visible: true,
    eyebrow: "Empezar",
    title: "Tu catálogo empieza en la cabaña.",
    subtitle: "",
    body: "",
    cta_label: "Agendar sesión de descubrimiento",
    cta_link: "/solicitud",
    cta2_label: "",
    cta2_link: "",
  },
  {
    key: "casa",
    order: 9,
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
    key: "cifras",
    order: 10,
    is_visible: false,
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
    key: "tendencia",
    order: 11,
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

export const DEFAULT_AUDIENCE = [
  {
    title: "Artistas",
    text: "Desarrolla tu sonido y tu catálogo.",
    image_url: M.zcruz,
    order: 1,
    is_visible: true,
  },
  {
    title: "Labels",
    text: "Producción y lanzamientos con identidad.",
    image_url: M.still,
    order: 2,
    is_visible: true,
  },
  {
    title: "Managers",
    text: "Un equipo creativo para tus artistas.",
    image_url: M.roy,
    order: 3,
    is_visible: true,
  },
];

export const DEFAULT_GENRES = [
  {
    key: "latin",
    name: "Latin",
    label: "Artistas · Catálogo",
    description: "Raíz latina con producción actual. Del dembow al bolero, sin perder el pulso.",
    image_url: M.zcruzCover,
    tint: "#ff5833",
    accent: "#ff5833",
    plays: 128400,
    songs: 42,
    likes: 8600,
    reach: 320000,
    order: 1,
    is_visible: true,
  },
  {
    key: "urban",
    name: "Urban",
    label: "Artistas · Catálogo",
    description: "Reggaetón, R&B y calle. El sonido que manda en la pista.",
    image_url: M.royCover,
    tint: "#6a3cff",
    accent: "#b39bff",
    plays: 96400,
    songs: 36,
    likes: 12400,
    reach: 410000,
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
    plays: 210000,
    songs: 51,
    likes: 15200,
    reach: 880000,
    order: 3,
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
    plays: 74200,
    songs: 24,
    likes: 5100,
    reach: 190000,
    order: 4,
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
    plays: 158900,
    songs: 33,
    likes: 9800,
    reach: 470000,
    order: 5,
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
    plays: 43100,
    songs: 18,
    likes: 3200,
    reach: 120000,
    order: 6,
    is_visible: true,
  },
  {
    key: "fusion",
    name: "Fusion",
    label: "Artistas · Catálogo",
    description: "Afro House, Electropop y mezclas sin etiqueta.",
    image_url: M.access,
    video_url: M.journeyVideo,
    tint: "#ff7a45",
    accent: "#ffa07a",
    plays: 68700,
    songs: 27,
    likes: 4400,
    reach: 210000,
    order: 7,
    is_visible: true,
  },
];

export const DEFAULT_PROCESS = [
  {
    num: "01",
    title: "Descubre tu sonido",
    text: "Referencias, visión y dirección sonora: de dónde viene tu música y hacia dónde va.",
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
    title: "Dale identidad",
    text: "Imagen, audiovisual y marca: el universo visual que acompaña a tu música.",
    image_url: M.zcruz,
    order: 3,
    is_visible: true,
  },
  {
    num: "04",
    title: "Lánzalo al mercado",
    text: "Planificación, contenido y estrategia para que el proyecto salga y se escuche.",
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
    options: ["Latin", "Urban", "Pop", "Afrobeats", "Trap", "House", "Fusion"],
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
      "Dirección visual",
      "Branding",
      "Marketing y lanzamiento",
      "Desarrollo de catálogo",
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
    color: "#1e1e1e",
    multi: false,
    options: [],
    order: 4,
    is_visible: true,
  },
  {
    key: "demo",
    title: "Tu demo",
    color: "#c9431f",
    multi: true,
    options: ["Libertad creativa", "Referencias", "Sonido específico", "Instrucciones personalizadas"],
    order: 5,
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
  { value: 7, prefix: "", suffix: "", label: "géneros", order: 3, is_visible: true },
];

export const DEFAULT_HOME = {
  settings: DEFAULT_SETTINGS,
  sections: DEFAULT_HOME_SECTIONS,
  audience: DEFAULT_AUDIENCE,
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
    audience: pickList(db.audience, DEFAULT_AUDIENCE),
    genres: pickList(db.genres, DEFAULT_GENRES),
    process: pickList(db.process, DEFAULT_PROCESS),
    builder: pickList(db.builder, DEFAULT_BUILDER),
    demos: pickList(db.demos, DEFAULT_DEMOS),
    stats: pickList(db.stats, DEFAULT_STATS),
    creators: pickList(db.creators, DEFAULT_CREATORS),
    videos: pickList(db.videos, DEFAULT_VIDEOS),
  };
}