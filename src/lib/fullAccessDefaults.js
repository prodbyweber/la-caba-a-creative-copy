export const FA_DEFAULTS = {
  hero_image_url:
    "https://base44.app/api/apps/6966ddf48947f217e81ea27c/files/mp/public/6966ddf48947f217e81ea27c/de2d3f461_Still2026-05-24133616_241.jpg",
  hero_eyebrow: "Cabaña Full Access",
  hero_kicker: "Programa de desarrollo artístico",
  hero_title:
    "De canciones sueltas a un catálogo con identidad y estrategia en cada lanzamiento.",
  hero_subtitle: "Programa de desarrollo artístico",
  vimeo_url: "https://player.vimeo.com/video/1250103284?h=1204b00d26",
  vimeo_poster_url:
    "https://base44.app/api/apps/6966ddf48947f217e81ea27c/files/mp/public/6966ddf48947f217e81ea27c/de2d3f461_Still2026-05-24133616_241.jpg",
  preview_video_url: "",
  studio_video_url: "",
  artists_autoplay: true,
  unlock_seconds: 249,
  gate_seconds: 65,
  gate_title: "Antes de continuar, queremos conocerte.",
  gate_text:
    "Déjanos tu nombre y tu correo para guardar tu progreso y abrirte la sesión de admisión.",
  stats_title: "Santiago Weber",
  stats_intro:
    "Music Producer · Songwriter · Creative Director · Founder of Cabaña Creative.",
  artists_eyebrow: "Respaldo",
  artists_title: "Artistas que confiaron en nosotros.",
  demo_eyebrow: "Demo & Master",
  collabs_title: "Marcas con las que he colaborado",
  demo_title: "Del demo al master",
  demo_subtitle: "Escucha cómo una idea se convierte en una producción terminada.",
  projects_title: "Trabajos seleccionados",
  projects_subtitle:
    "Una selección de proyectos en los que he participado desde la producción musical y la composición.",
  method_title: "Las tres etapas de Cabaña Full Access",
  method_subtitle:
    "Una experiencia de desarrollo artístico para explorar tu sonido, descubrir tu identidad y lanzar tu catálogo.",
  form_intro:
    "Tu proyecto merece una dirección propia. El siguiente paso es conocer tu música.",
  booking_duration: 30,
  booking_days_ahead: 21,
  booking_start_hour: 10,
  booking_end_hour: 19,
  booking_timezone: "Europe/Madrid",
  confirm_title: "Sesión confirmada.",
  confirm_text:
    "Nos vemos pronto. Ya tenemos tu proyecto y estamos preparados para conocerlo mejor.",
};

export const FA_STATS_FALLBACK = [
  { value: 100, prefix: "+", suffix: "", label: "Artistas desarrollados", note: "" },
  { value: 7, prefix: "+", suffix: "", label: "Años de experiencia", note: "" },
  { value: 1, prefix: "+", suffix: "M", label: "Reproducciones acumuladas", note: "" },
  { value: 30, prefix: "+", suffix: "", label: "Países alcanzados", note: "" },
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
    title: "Encuentra tu sonido.",
    text: "Exploramos ritmos, géneros y referencias para encontrar combinaciones que puedan darle personalidad a tu proyecto.",
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
    text: "Desarrollamos tus ideas mediante sesiones presenciales uno a uno, producción musical, composición y trabajo vocal.",
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
    title: "Prepara tu música para llegar al mundo.",
    text: "Organizamos tu catálogo y construimos una dirección para tus próximos lanzamientos.",
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