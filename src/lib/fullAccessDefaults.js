export const FA_DEFAULTS = {
  hero_image_url:
    "https://base44.app/api/apps/6966ddf48947f217e81ea27c/files/mp/public/6966ddf48947f217e81ea27c/de2d3f461_Still2026-05-24133616_241.jpg",
  hero_eyebrow: "Cabaña Full Access",
  hero_kicker: "Programa de desarrollo artístico",
  hero_title:
    "De canciones sueltas a un catálogo con identidad y estrategia en cada lanzamiento.",
  hero_subtitle: "Music producer · Founder · Director creativo",
  hero_loop_video_url: "",
  hero_cta_label: "Empecemos",
  vimeo_url: "https://player.vimeo.com/video/1250103284?h=1204b00d26",
  vimeo_poster_url:
    "https://base44.app/api/apps/6966ddf48947f217e81ea27c/files/mp/public/6966ddf48947f217e81ea27c/de2d3f461_Still2026-05-24133616_241.jpg",
  gate_seconds: 104,
  gate_title: "Antes de continuar, queremos conocerte.",
  gate_text:
    "Déjanos tu nombre y tu correo para guardar tu progreso y abrirte la sesión de admisión.",
  stats_title: "Santiago Weber",
  stats_intro:
    "Music Producer · Songwriter · Creative Director · Founder of Cabaña Creative.",
  collabs_title: "Marcas con las que he colaborado",
  demo_title: "Del demo al master",
  demo_subtitle: "Escucha cómo una idea se convierte en una producción terminada.",
  projects_title: "Selected projects",
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
  { value: 1, prefix: "+", suffix: "M", label: "Reproducciones", note: "" },
  { value: 30, prefix: "+", suffix: "", label: "Países", note: "" },
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
    title: "Explorar.",
    text: "Encontramos tu sonido mezclando géneros, ritmos y referencias hasta dar con una combinación que sea solo tuya.",
    items: [
      "Géneros y fusiones",
      "Ritmos e instrumentales",
      "Beat Store de Cabaña",
      "Referencias",
      "Sonidos y texturas",
      "Dirección sonora",
    ],
    result:
      "Una dirección sonora inicial y una selección de ideas con potencial para desarrollar.",
  },
  {
    num: "02",
    key: "descubrir",
    title: "Descubrimiento.",
    text: "Convertimos las ideas en canciones en sesiones presenciales en el estudio o en remoto, contigo en la cabina.",
    items: [
      "Sesiones presenciales",
      "Sesiones online",
      "Beatmaking",
      "Composición",
      "Trabajo vocal",
      "Grabación",
    ],
    result: "Canciones desarrolladas con una dirección artística y sonora coherente.",
  },
  {
    num: "03",
    key: "lanzar",
    title: "Estrategia y lanzamiento.",
    text: "Ordenamos tu catálogo y construimos el plan de cada lanzamiento para que la música no salga al azar.",
    items: [
      "Catálogo",
      "Selección de canciones",
      "Concepto",
      "Calendario",
      "Contenido",
      "Distribución",
    ],
    result: "Un catálogo organizado y una dirección clara para presentar tu música al mercado.",
  },
];

export const FA_LAUNCH_STEPS = ["Catálogo", "Concepto", "Calendario", "Lanzamiento"];

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
  "Hip Hop",
  "Drill",
  "Amapiano",
  "Dembow",
  "Baile Funk",
  "Afro House",
  "Electrónica",
  "Salsa",
  "Bachata",
  "Cumbia",
  "Regional Mexicano",
  "Indie",
  "Rock",
  "Soul",
  "Jazz",
  "Otro",
];

export const FA_MOODS = [
  "Oscuro",
  "Festivo",
  "Melancólico",
  "Íntimo",
  "Energético",
  "Nostálgico",
  "Sensual",
  "Épico",
  "Relajado",
  "Romántico",
  "Nocturno",
  "Veraniego",
  "Experimental",
  "Agresivo",
];

export const FA_STAGE_OPTIONS = [
  "Solo tengo ideas",
  "Tengo demos sin terminar",
  "Tengo canciones listas para lanzar",
  "Ya publico y quiero ordenar mi catálogo",
];

export const FA_NEEDS = ["Desarrollo de catálogo", "Producir una canción"];