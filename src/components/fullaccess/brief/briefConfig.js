// Briefing de admisión de Cabaña Full Access: opciones, validación y resumen.

export const DRAFT_KEY = "fa-brief-draft-v1";

export const newRequestKey = () => {
  try {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  } catch {
    /* ignore */
  }
  return `req-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const MODULES = [
  "Conocerte",
  "Tu momento actual",
  "Lo que quieres conseguir",
  "Tu música",
  "Tus próximos lanzamientos",
  "Disponibilidad e inversión",
  "Revisión y envío",
];

export const MOMENT_OPTIONS = [
  {
    value: "Estoy empezando",
    label: "Estoy empezando. Quiero encontrar mi sonido y construir una identidad artística.",
    followUp: "¿Qué sonidos o artistas te inspiran ahora mismo?",
    placeholder: "Géneros, referencias, canciones que te mueven...",
  },
  {
    value: "Tengo ideas y demos",
    label: "Tengo ideas y demos. Quiero convertir mis ideas en canciones terminadas.",
    followUp: "¿Cuántas canciones tienes empezadas?",
    placeholder: "Demos, ideas sueltas, maquetas...",
  },
  {
    value: "Ya he lanzado música",
    label: "Ya he lanzado música. Quiero crecer, diferenciarme y llegar a más personas.",
    followUp: "¿Qué has publicado hasta ahora?",
    placeholder: "Canciones, EPs, años, resultados...",
  },
  {
    value: "Quiero dar el siguiente paso",
    label:
      "Quiero dar el siguiente paso. Tengo experiencia y busco desarrollar mi catálogo y próximos lanzamientos.",
    followUp: "¿Qué quieres desarrollar en tu catálogo?",
    placeholder: "Sonido, identidad, lanzamientos, equipo...",
  },
];

export const GOALS = [
  "Encontrar una identidad sonora propia",
  "Desarrollar canciones con producción profesional",
  "Crear un catálogo coherente",
  "Diferenciar mi propuesta artística",
  "Preparar mis próximos lanzamientos",
  "Conseguir visibilidad y conectar con una audiencia",
  "Tener un equipo creativo que me acompañe",
];

export const BRIEF_GENRES = [
  "Reguetón",
  "Trap",
  "Latin Urban",
  "House",
  "Afrobeat",
  "Funk Brasileiro",
  "Jersey Club",
  "Rock",
  "Pop",
  "Hip Hop",
  "R&B",
  "Otros",
];

export const RELEASE_FORMATS = ["Single", "Varios singles", "EP", "Álbum", "Todavía no definido"];

export const RELEASE_WINDOWS = [
  "Próximo mes",
  "Próximos 2–3 meses",
  "Próximos 3–6 meses",
  "Más adelante",
  "Sin fecha definida",
];

export const START_WINDOWS = [
  "La próxima semana",
  "Durante el próximo mes",
  "En los próximos 2–3 meses",
  "Estoy explorando opciones",
];

export const MODALITIES = [
  { value: "Cabaña Full Access", label: "Me interesa Full Access" },
  { value: "Single + acompañamiento", label: "Me interesa desarrollar un single" },
  { value: "Necesito orientación", label: "Necesito orientación para elegir" },
];

export const PAYMENT_PREFS = [
  "Inversión completa",
  "Me interesa fraccionar el pago",
  "Quiero conocer las opciones",
];

export const PHONE_PREFIXES = [
  { code: "+34", label: "España +34" },
  { code: "+52", label: "México +52" },
  { code: "+57", label: "Colombia +57" },
  { code: "+54", label: "Argentina +54" },
  { code: "+56", label: "Chile +56" },
  { code: "+51", label: "Perú +51" },
  { code: "+1", label: "EE. UU. +1" },
  { code: "+351", label: "Portugal +351" },
  { code: "+55", label: "Brasil +55" },
  { code: "+39", label: "Italia +39" },
  { code: "+33", label: "Francia +33" },
  { code: "+44", label: "Reino Unido +44" },
];

export const EMPTY_BRIEF = {
  first_name: "",
  last_name: "",
  artist_name: "",
  instagram: "",
  email: "",
  phone_prefix: "+34",
  phone: "",
  moment: "",
  moment_detail: "",
  goals: [],
  priority_goal: "",
  genres: [],
  music_link: "",
  references: "",
  release_format: "",
  release_window: "",
  start_window: "",
  modality: "",
  payment_preference: "",
};

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());

/** Devuelve { step, message } del primer módulo incompleto, o null. */
export function validateBrief(data) {
  if (!String(data.first_name || "").trim()) {
    return { step: 0, message: "Escribe tu nombre." };
  }
  if (!isEmail(data.email)) {
    return { step: 0, message: "Revisa tu correo electrónico." };
  }
  if (String(data.phone || "").replace(/\D/g, "").length < 6) {
    return { step: 0, message: "Añade un teléfono con prefijo internacional." };
  }
  if (!data.moment) {
    return { step: 1, message: "Elige en qué punto se encuentra tu proyecto." };
  }
  if (!data.goals?.length) {
    return { step: 2, message: "Selecciona al menos un objetivo." };
  }
  if (!data.priority_goal) {
    return { step: 2, message: "Marca cuál es tu objetivo prioritario." };
  }
  if (!data.genres?.length) {
    return { step: 3, message: "Elige al menos un género." };
  }
  if (!data.release_format) {
    return { step: 4, message: "Indica el formato de tu próximo lanzamiento." };
  }
  if (!data.start_window) {
    return { step: 5, message: "Cuéntanos cuándo te gustaría empezar." };
  }
  if (!data.modality) {
    return { step: 5, message: "Elige la modalidad que te interesa." };
  }
  return null;
}

export const fullPhone = (data) => `${data.phone_prefix || ""} ${String(data.phone || "").trim()}`.trim();

export function summaryModules(data) {
  const moment = MOMENT_OPTIONS.find((option) => option.value === data.moment);
  return [
    {
      step: 0,
      title: MODULES[0],
      rows: [
        { label: "Nombre", value: `${data.first_name} ${data.last_name}`.trim() },
        { label: "Nombre artístico", value: data.artist_name },
        { label: "Instagram", value: data.instagram },
        { label: "Correo", value: data.email },
        { label: "Teléfono", value: fullPhone(data) },
      ],
    },
    {
      step: 1,
      title: MODULES[1],
      rows: [
        { label: "Momento actual", value: data.moment },
        { label: moment?.followUp || "Detalle", value: data.moment_detail },
      ],
    },
    {
      step: 2,
      title: MODULES[2],
      rows: [
        { label: "Objetivos", value: (data.goals || []).join(" · ") },
        { label: "Objetivo prioritario", value: data.priority_goal },
      ],
    },
    {
      step: 3,
      title: MODULES[3],
      rows: [
        { label: "Géneros", value: (data.genres || []).join(" · ") },
        { label: "Música o demos", value: data.music_link },
        { label: "Referencias", value: data.references },
      ],
    },
    {
      step: 4,
      title: MODULES[4],
      rows: [
        { label: "Formato", value: data.release_format },
        { label: "Fecha estimada", value: data.release_window },
      ],
    },
    {
      step: 5,
      title: MODULES[5],
      rows: [
        { label: "Cuándo empezar", value: data.start_window },
        { label: "Modalidad", value: data.modality },
        { label: "Preferencia de pago", value: data.payment_preference },
      ],
    },
  ];
}