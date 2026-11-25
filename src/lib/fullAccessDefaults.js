export const FA_DEFAULTS = {
  hero_image_url:
    "https://base44.app/api/apps/6966ddf48947f217e81ea27c/files/mp/public/6966ddf48947f217e81ea27c/de2d3f461_Still2026-05-24133616_241.jpg",
  hero_eyebrow: "Cabaña Full Access",
  hero_title: "Desarrolla tu catálogo y prepáralo para lanzarlo al mundo.",
  hero_subtitle:
    "Un programa de desarrollo artístico en el que exploramos tu sonido, desarrollamos tus canciones y construimos una dirección para tus próximos lanzamientos.",
  vimeo_url: "https://player.vimeo.com/video/1250103284?h=1204b00d26",
  gate_seconds: 65,
  gate_title: "Antes de seguir, ¿cómo te llamas?",
  gate_text: "Guarda tu progreso y recibe el acceso a la sesión de admisión.",
  stats_title: "Santiago Weber",
  stats_intro:
    "Music Producer · Songwriter · Creative Director · Founder of Cabaña Creative.",
  collabs_title: "Selected collaborations",
  demo_title: "From demo to master",
  demo_subtitle: "Del primer concepto a una producción con identidad.",
  projects_title: "Selected projects",
  projects_subtitle:
    "Una selección de proyectos en los que he participado como productor y compositor.",
  method_title: "Three stages. One artistic direction.",
  method_subtitle:
    "Un proceso para encontrar tu sonido, desarrollar tu catálogo y preparar tu música para el mercado.",
  form_intro:
    "Tu proyecto merece una dirección propia. El siguiente paso es conocer tu música.",
  booking_duration: 30,
  booking_days_ahead: 21,
  booking_start_hour: 10,
  booking_end_hour: 19,
  booking_timezone: "Europe/Madrid",
  confirm_title: "Your session is confirmed.",
  confirm_text:
    "Nos vemos pronto. Ya tenemos tu proyecto y estamos preparados para conocerlo mejor.",
};

export const FA_STATS_FALLBACK = [
  { value: 1, prefix: "+", suffix: "M", label: "Streams", note: "" },
  { value: 30, prefix: "+", suffix: "", label: "Países alcanzados", note: "Pendiente de verificar" },
  { value: null, prefix: "", suffix: "", label: "Artistas desarrollados", note: "Pendiente de verificar" },
  { value: null, prefix: "", suffix: "", label: "Años de experiencia", note: "Pendiente de verificar" },
];

export const FA_PROJECTS_FALLBACK = [
  {
    artist: "Zcruz",
    song: "Feelingmancia",
    credit: "Productor",
    youtube_url: "https://www.youtube.com/watch?v=Uikq-IQmAkk",
  },
  {
    artist: "MAYO",
    song: "Nada Bby",
    credit: "Compositor",
    youtube_url: "https://www.youtube.com/watch?v=VWWYkeZqIgU",
  },
  {
    artist: "YADAM",
    song: "Pórtate Bien",
    credit: "Productor y compositor",
    youtube_url: "https://www.youtube.com/watch?v=XNgI1XU7JCY",
  },
  {
    artist: "DL CASTiLLO",
    song: "U",
    credit: "Crédito pendiente de confirmar",
    youtube_url: "https://www.youtube.com/watch?v=gTYQtDvMbR8",
  },
];

export const FA_STAGES = [
  {
    num: "01",
    key: "explorar",
    title: "Encuentra el sonido que puede hacer reconocible tu proyecto.",
    items: [
      "Exploración de géneros",
      "Ritmos e instrumentales",
      "Beat Store de Cabaña",
      "Referencias",
      "Sonidos y texturas",
      "Influencias",
      "Dirección sonora inicial",
    ],
    result:
      "Una dirección sonora inicial y una selección de ideas con potencial para desarrollar.",
  },
  {
    num: "02",
    key: "descubrir",
    title: "Dale forma a tu sonido y conviértelo en canciones.",
    items: [
      "Flow Camp",
      "Beatmaking",
      "Producción musical",
      "Melodías y armonías",
      "Composición",
      "Estructuras",
      "Producción vocal",
      "Grabación",
      "Selección de tomas",
      "Arreglos",
      "Diseño sonoro",
      "Dirección creativa",
    ],
    result: "Canciones desarrolladas con una dirección artística y sonora coherente.",
  },
  {
    num: "03",
    key: "lanzar",
    title: "Prepara tu catálogo para llegar al mundo.",
    items: [
      "Organización del catálogo",
      "Selección de canciones",
      "Coherencia del proyecto",
      "Planificación de lanzamientos",
      "Conceptos creativos",
      "Referencias visuales",
      "Estrategia de contenido",
      "Calendario",
      "Materiales para distribución",
      "Hoja de ruta",
    ],
    result: "Un catálogo organizado y una dirección clara para presentar tu música al mercado.",
  },
];

export const FA_GENRES = [
  "Reggaetón",
  "Latin Urban",
  "Afrobeats",
  "Trap",
  "R&B",
  "Pop",
  "House",
  "Dancehall",
  "Flamenco",
  "Otro",
];