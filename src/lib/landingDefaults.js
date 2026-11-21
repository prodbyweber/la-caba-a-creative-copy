// Valores por defecto de la landing de Cabaña Creative.
// Se usan cuando las entidades están vacías y como base del editor.

const M = {
  heroVideo:
    "https://base44.app/api/apps/6966ddf48947f217e81ea27c/files/mp/public/6966ddf48947f217e81ea27c/725535674_copy_E89E0D09-C530-46C0-BB56-7CF16D819596.MOV",
  heroVideoMobile:
    "https://base44.app/api/apps/6966ddf48947f217e81ea27c/files/mp/public/6966ddf48947f217e81ea27c/67a583b35_copy_AED4B2E7-5CB0-4AAD-940E-15BD431F89C4.mov",
  still:
    "https://base44.app/api/apps/6966ddf48947f217e81ea27c/files/mp/public/6966ddf48947f217e81ea27c/de2d3f461_Still2026-05-24133616_241.jpg",
  journeyVideo:
    "https://base44.app/api/apps/6966ddf48947f217e81ea27c/files/mp/public/6966ddf48947f217e81ea27c/8744e420f_weberxzcruz.mp4",
  accessCard:
    "https://base44.app/api/apps/6966ddf48947f217e81ea27c/files/mp/public/6966ddf48947f217e81ea27c/fb56bad92_IMG_1601.jpeg",
  weberBg:
    "https://media.base44.com/images/public/6966ddf48947f217e81ea27c/a32a65d3c_Still2026-05-22190754_1431.jpg",
};

export const DEFAULT_SETTINGS = {
  seo_title: "Cabaña Creative | Producción musical y catálogo para artistas",
  seo_description:
    "Construye tu catálogo musical con producción, mezcla y master, y beatmaking personalizado. Envía tu proyecto.",
  og_image_url: M.still,
  brand_strip_title: "Han confiado en nosotros",
  login_label: "Acceder",
  login_url: "/login",
  request_label: "Solicitar acceso",
  contact_email: "hola@cabanacreative.es",
  city: "",
  booking_label: "¿Quieres trabajar con Cabaña? Agenda una sesión de descubrimiento",
  booking_url: "/reservas",
  social_instagram: "",
  social_tiktok: "",
  social_youtube: "",
  hero_media_url: M.heroVideo,
  hero_media_mobile_url: M.heroVideoMobile,
  hero_poster_url: M.still,
  hero_shade: 38,
  journey_media_url: M.journeyVideo,
  access_card_image_url: M.accessCard,
  weber_name: "Santiago Weber",
  weber_role: "Santiago Weber · Founder, productor y artista",
  weber_bio:
    "Soy Santiago Weber, productor y artista, fundador de Cabaña Creative. He producido para Universal Music, Warner Music Spain y Magnus Media. Aquí desarrollo cada proyecto contigo, canción a canción.",
  weber_video_url: "",
  weber_poster_url: M.weberBg,
  weber_photo_url: "",
  weber_bg_url: M.weberBg,
  weber_line:
    "Soy Weber. Fui un artista productor como tú, y construí esto para que produzcas mejores canciones y las lances.",
  journey_step1_title: "Explora",
  journey_step1_text: "Descubre tu sonido y tus demos.",
  journey_step2_title: "Descubre",
  journey_step2_text: "Da identidad a tu catálogo.",
  journey_step3_title: "Lanza",
  journey_step3_text: "Sigue tu hoja de ruta y llévalo al mercado.",
};

export const SECTION_LABELS = {
  hero: "Hero",
  brands: "Carrusel de marcas",
  features: "Funciones",
  journey: "Recorrido por scroll",
  videos: "Hecho en la Cabaña",
  creators: "Creadores",
  beats: "Beats",
  about: "Quién está detrás",
  closing: "Cierre",
};

export const DEFAULT_SECTIONS = [
  {
    key: "hero",
    order: 1,
    is_visible: true,
    eyebrow: "Producción musical · Madrid",
    title: "TU SONIDO.\nTU IDENTIDAD.\nTU PRÓXIMO MOVIMIENTO.",
    subtitle:
      "Desarrollamos artistas a través de producción musical, dirección creativa y estrategias para construir proyectos con identidad.",
    cta_label: "Enviar mi proyecto",
    cta_link: "/ExploracionForm",
    cta2_label: "Explorar catálogo",
    cta2_link: "/Explorar",
  },
  {
    key: "brands",
    order: 2,
    is_visible: true,
    eyebrow: "",
    title: "Han confiado en nosotros",
    subtitle: "",
    cta_label: "",
    cta_link: "",
    cta2_label: "",
    cta2_link: "",
  },
  {
    key: "features",
    order: 3,
    is_visible: true,
    eyebrow: "Qué es Cabaña Creative",
    title: "No hacemos canciones. Construimos proyectos.",
    subtitle: "Compañía de producción musical y desarrollo creativo. Base en Madrid.",
    cta_label: "",
    cta_link: "",
    cta2_label: "",
    cta2_link: "",
  },
  {
    key: "journey",
    order: 4,
    is_visible: true,
    eyebrow: "Cómo funciona",
    title: "Cinco etapas, un solo proyecto.",
    subtitle: "Un método que ordena identidad, sonido y estrategia antes de lanzar.",
    cta_label: "",
    cta_link: "",
    cta2_label: "",
    cta2_link: "",
  },
  {
    key: "videos",
    order: 5,
    is_visible: true,
    eyebrow: "Proyectos y experiencia",
    title: "Lo que sale del estudio.",
    subtitle: "Música, campañas y piezas audiovisuales producidas en la Cabaña.",
    cta_label: "",
    cta_link: "",
    cta2_label: "",
    cta2_link: "",
  },
  {
    key: "creators",
    order: 6,
    is_visible: true,
    eyebrow: "Catálogo",
    title: "Escucha lo que se produce aquí.",
    subtitle:
      "Proyectos, canciones y beats que nacen en la Cabaña. Escucha una muestra y entra al catálogo completo.",
    cta_label: "",
    cta_link: "",
    cta2_label: "",
    cta2_link: "",
  },
  {
    key: "beats",
    order: 7,
    is_visible: true,
    eyebrow: "Beats",
    title: "Beats exclusivos para miembros.",
    subtitle: "Escucha una muestra. El catálogo completo está dentro.",
    cta_label: "",
    cta_link: "",
    cta2_label: "",
    cta2_link: "",
  },
  {
    key: "about",
    order: 8,
    is_visible: true,
    eyebrow: "Quién está detrás",
    title: "Hecho por alguien que ya pasó por ahí.",
    subtitle: "",
    cta_label: "",
    cta_link: "",
    cta2_label: "",
    cta2_link: "",
  },
  {
    key: "closing",
    order: 9,
    is_visible: true,
    eyebrow: "Siguiente paso",
    title: "Tu próximo proyecto empieza aquí.",
    subtitle:
      "Cuéntanos qué estás desarrollando. Queremos conocer tu visión y explorar cómo podemos ayudarte.",
    body: "Agenda una sesión de descubrimiento",
    cta_label: "Enviar mi proyecto",
    cta_link: "/ExploracionForm",
    cta2_label: "Agendar una sesión",
    cta2_link: "/reservas",
  },
];

export const DEFAULT_FEATURES = [
  {
    title: "Producción musical",
    support_line:
      "Desarrollo de sonidos, instrumentales, composición, grabación y producción de canciones.",
    badge: "available",
    visual: "catalog",
    size: "md",
    order: 1,
    is_visible: true,
  },
  {
    title: "Desarrollo artístico",
    support_line:
      "Construcción de identidad, dirección sonora, selección de repertorio y desarrollo de catálogo.",
    badge: "available",
    visual: "player",
    size: "md",
    order: 2,
    is_visible: true,
  },
  {
    title: "Dirección creativa",
    support_line: "Desarrollo de conceptos, universos visuales, contenido y dirección de proyectos.",
    badge: "available",
    visual: "artwork",
    size: "md",
    order: 3,
    is_visible: true,
  },
  {
    title: "Estrategia",
    support_line: "Planificación de lanzamientos, posicionamiento, contenido y crecimiento de proyectos.",
    badge: "available",
    visual: "roadmap",
    size: "md",
    order: 4,
    is_visible: true,
  },
];

export const DEFAULT_VIDEOS = [
  {
    title: "La Señal",
    youtube_url: "https://www.youtube.com/watch?v=EvATTfm9pTw",
    tags: ["Afrobeats", "Afrohouse"],
    is_featured: true,
    order: 1,
    is_visible: true,
  },
  {
    title: "U N I",
    youtube_url: "https://www.youtube.com/watch?v=gTYQtDvMbR8",
    tags: ["Trap", "R&B"],
    order: 2,
    is_visible: true,
  },
  {
    title: "Feelingmancia",
    youtube_url: "https://www.youtube.com/watch?v=Uikq-IQmAkk",
    tags: [],
    order: 3,
    is_visible: true,
  },
  {
    title: "48 horas con la Gen Z",
    youtube_url: "https://youtu.be/cFL3yiJYW3I",
    tags: [],
    order: 4,
    is_visible: true,
  },
  {
    title: "Lanzar una campaña pero con La Gen Z",
    youtube_url: "https://www.youtube.com/watch?v=Al3FJaFPn8g",
    tags: [],
    order: 5,
    is_visible: true,
  },
  {
    title: "La Última Vez",
    youtube_url: "https://www.youtube.com/watch?v=D_5aK1YoEXE",
    tags: [],
    order: 6,
    is_visible: true,
  },
  {
    title: "Lipstick — Mini film",
    youtube_url: "https://www.youtube.com/watch?v=U0YT5AnYLUU",
    tags: [],
    order: 7,
    is_visible: true,
  },
];

export const DEFAULT_CREATORS = [
  {
    name: "Zcruz",
    genre: "",
    photo_url:
      "https://base44.app/api/apps/6966ddf48947f217e81ea27c/files/mp/public/6966ddf48947f217e81ea27c/cc5bb0b04_DSC05215.jpeg",
    cover_url:
      "https://base44.app/api/apps/6966ddf48947f217e81ea27c/files/mp/public/6966ddf48947f217e81ea27c/b2c97cf54_IMG_1180.jpeg",
    track_title: "Nombre Y Apellido",
    audio_url:
      "https://base44.app/api/apps/6966ddf48947f217e81ea27c/files/mp/public/6966ddf48947f217e81ea27c/2497ec775_nombreyapellidodemofinal.mp3",
    year: "2026",
    credits: "Compuesto por Zcruz · Producido por Santiago Weber",
    is_public: true,
    order: 1,
  },
  {
    name: "Kensho",
    genre: "",
    photo_url:
      "https://base44.app/api/apps/6966ddf48947f217e81ea27c/files/mp/public/6966ddf48947f217e81ea27c/27908b931_62215df6-dccd-4d3a-9dc9-4a978f4f2b182.png",
    cover_url:
      "https://base44.app/api/apps/6966ddf48947f217e81ea27c/files/mp/public/6966ddf48947f217e81ea27c/a83833595_aaf69b2d8a3e7695696da777a9a4eedd.jpg",
    track_title: "Joyas Vacías",
    audio_url:
      "https://base44.app/api/apps/6966ddf48947f217e81ea27c/files/mp/public/6966ddf48947f217e81ea27c/2f7ea3a3e_JOYASVACIASKenshoprodbyweber.mp3",
    year: "2026",
    credits: "Producido por Weber",
    is_public: true,
    order: 2,
  },
  {
    name: "Carly",
    genre: "",
    photo_url:
      "https://base44.app/api/apps/6966ddf48947f217e81ea27c/files/mp/public/6966ddf48947f217e81ea27c/7af9b2a84_3ccd794d7235d69bb691d530d82ad04b.jpg",
    cover_url:
      "https://base44.app/api/apps/6966ddf48947f217e81ea27c/files/mp/public/6966ddf48947f217e81ea27c/7af9b2a84_3ccd794d7235d69bb691d530d82ad04b.jpg",
    track_title: "Nuestra Rola",
    audio_url:
      "https://base44.app/api/apps/6966ddf48947f217e81ea27c/files/mp/public/6966ddf48947f217e81ea27c/b97149a4d_Nuestrarolamp3demov1.mp3",
    year: "2026",
    credits: "",
    is_public: true,
    order: 3,
  },
  {
    name: "YOUNG ROY",
    genre: "House",
    photo_url:
      "https://base44.app/api/apps/6966ddf48947f217e81ea27c/files/mp/public/6966ddf48947f217e81ea27c/0aca57c8d_IMG_2859.jpeg",
    cover_url:
      "https://base44.app/api/apps/6966ddf48947f217e81ea27c/files/mp/public/6966ddf48947f217e81ea27c/34f6bfef2_1633bb7269cd459985dd24fba5084b09.jpg",
    track_title: "Booty Dance",
    audio_url:
      "https://base44.app/api/apps/6966ddf48947f217e81ea27c/files/mp/public/6966ddf48947f217e81ea27c/373bd4c13_DelcyYoungRoydemov2-prodbyweber.mp3",
    year: "2026",
    credits: "Producido por Weber",
    is_public: true,
    order: 4,
  },
];

export const DEFAULT_BEATS = [
  { beat_id: "6a63e520497f21799cb6bc23", order: 1, is_visible: true },
  { beat_id: "6a63e47973db899195899db3", order: 2, is_visible: true },
  { beat_id: "6a56bfdbfff3eec09c914f2a", order: 3, is_visible: true },
];

export const DEFAULT_MODEL = {
  settings: DEFAULT_SETTINGS,
  sections: DEFAULT_SECTIONS,
  features: DEFAULT_FEATURES,
  videos: DEFAULT_VIDEOS,
  creators: DEFAULT_CREATORS,
  beats: DEFAULT_BEATS,
};

const byOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0);

export function normalizeSection(section) {
  const fallback = DEFAULT_SECTIONS.find((s) => s.key === section.key) || {};
  return { ...fallback, ...section, key: section.key };
}

/** Completa el contenido guardado con los textos por defecto que falten. */
export function mergeModel(db = {}) {
  const sections = Array.isArray(db.sections) && db.sections.length
    ? db.sections.map(normalizeSection).sort(byOrder)
    : DEFAULT_SECTIONS.map((s) => ({ ...s }));

  const features = Array.isArray(db.features) && db.features.length
    ? db.features.slice().sort(byOrder)
    : DEFAULT_FEATURES.map((f) => ({ ...f }));

  const videos = Array.isArray(db.videos) && db.videos.length
    ? db.videos.slice().sort(byOrder)
    : DEFAULT_VIDEOS.map((v) => ({ ...v }));

  const creators = Array.isArray(db.creators) && db.creators.length
    ? db.creators.slice().sort(byOrder)
    : DEFAULT_CREATORS.map((c) => ({ ...c }));

  const beats = Array.isArray(db.beats) && db.beats.length
    ? db.beats.slice().sort(byOrder)
    : DEFAULT_BEATS.map((b) => ({ ...b }));

  return {
    settings: { ...DEFAULT_SETTINGS, ...(db.settings || {}) },
    sections,
    features,
    videos,
    creators,
    beats,
  };
}