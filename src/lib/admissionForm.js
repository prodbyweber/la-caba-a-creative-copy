/**
 * Definición del formulario de admisión de Cabaña Full Access.
 * Las opciones son las acordadas con el equipo y deben coincidir con las
 * opciones internas de las propiedades de HubSpot.
 */

export const PROJECT_STAGES = [
  "Estoy comenzando y quiero encontrar mi identidad artística.",
  "Tengo ideas y demos, pero necesito convertirlas en canciones.",
  "Ya he publicado música y quiero evolucionar mi sonido.",
  "Estoy desarrollando un proyecto profesional y quiero dar el siguiente paso.",
  "Tengo un catálogo y experiencia, pero necesito una dirección más clara.",
];

export const GENRES = [
  "Pop",
  "R&B / Soul",
  "Afrobeats",
  "Reggaetón",
  "Hip-Hop / Trap",
  "Jersey Club",
  "House / Electronic",
  "Indie / Alternativo",
  "Otro",
];

export const OTHER_GENRE = "Otro";

export const GOALS = [
  "Encontrar una identidad sonora propia y reconocible.",
  "Desarrollar canciones con un sonido profesional.",
  "Construir un catálogo coherente y con personalidad.",
  "Definir una dirección artística y diferenciar mi propuesta.",
  "Preparar mis lanzamientos y conectar con una audiencia.",
];

export const RELEASE_TYPES = [
  "Un single.",
  "Varios singles.",
  "Un EP.",
  "Un álbum.",
  "Todavía estoy definiendo mi próximo proyecto.",
];

export const RELEASE_DATES = [
  "Durante el próximo mes.",
  "En los próximos 2–3 meses.",
  "En los próximos 3–6 meses.",
  "Todavía no tengo fecha definida.",
];

export const AVAILABILITY = [
  "Lo antes posible.",
  "La próxima semana.",
  "Durante el próximo mes.",
  "En los próximos 2–3 meses.",
  "Todavía no tengo una fecha definida.",
  "Estoy explorando opciones por ahora.",
];

export const BUDGETS = [
  "Puedo asumir una inversión desde 2.000 €.",
  "Me interesa, pero necesitaría valorar un pago fraccionado.",
  "Mi presupuesto actual está entre los 700 € a 1200€",
  "Ahora mismo no cuento con presupuesto para invertir.",
];

export const EXPLORING = "Estoy explorando opciones por ahora.";
export const NO_BUDGET = "Ahora mismo no cuento con presupuesto para invertir.";

export const INVESTMENT_OK = [
  "Puedo asumir una inversión desde 2.000 €.",
  "Me interesa, pero necesitaría valorar un pago fraccionado.",
  "Mi presupuesto actual está entre los 700 € a 1200€",
];

export const QUALIFICATION = {
  APTO: "APTO PARA AGENDAR",
  EXPLORANDO: "EN EXPLORACIÓN",
  REVISION: "REVISIÓN MANUAL",
  NO_APTO: "NO APTO",
  SIN_PRESUPUESTO: "SIN PRESUPUESTO DISPONIBLE",
};

export const norm = (value) =>
  String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.;]+$/, "");

/** Calificación interna: la disponibilidad manda sobre el presupuesto. */
export function qualify({ availability, budget }) {
  if (norm(availability) === norm(EXPLORING)) return QUALIFICATION.EXPLORANDO;
  if (norm(budget) === norm("Me interesa, pero necesitaría valorar un pago fraccionado.")) {
    return QUALIFICATION.REVISION;
  }
  if (norm(budget) === norm("Puedo asumir una inversión desde 2.000 €.")) return QUALIFICATION.APTO;
  if (norm(budget) === norm("Mi presupuesto actual está entre los 700 € a 1200€")) {
    return QUALIFICATION.NO_APTO;
  }
  if (norm(budget) === norm(NO_BUDGET)) return QUALIFICATION.NO_APTO;
  return QUALIFICATION.EXPLORANDO;
}

export const STAGES = [
  {
    key: "identity",
    label: "Identidad y contacto",
    title: "Primero, queremos conocerte.",
    description:
      "Cuéntanos quién está detrás del proyecto y dónde podemos conocer un poco más de tu propuesta.",
    question: "¿Quién está detrás del proyecto?",
  },
  {
    key: "moment",
    label: "Momento actual",
    title: "¿En qué momento se encuentra tu proyecto?",
    description: "Nos ayuda a saber desde dónde partimos.",
    question: "¿Cuál de estas situaciones representa mejor tu momento actual?",
  },
  {
    key: "sound",
    label: "Sonido e identidad",
    title: "Hablemos de tu sonido.",
    description: "Los géneros que hoy definen tu propuesta.",
    question: "¿Qué géneros o estilos representan actualmente tu propuesta?",
  },
  {
    key: "goals",
    label: "Objetivos y dirección",
    title: "¿Qué quieres construir?",
    description: "La dirección que buscas para esta etapa.",
    question: "¿Qué te gustaría conseguir durante esta etapa de desarrollo?",
  },
  {
    key: "blocker",
    label: "Principal bloqueo",
    title: "Queremos entender qué te está frenando.",
    description: "Con honestidad, sin filtros.",
    question:
      "¿Qué es lo que más está frenando actualmente el desarrollo de tu proyecto? Cuéntanos qué has intentado, qué te gustaría conseguir y qué sientes que te falta para avanzar.",
  },
  {
    key: "release",
    label: "Plan de lanzamiento",
    title: "¿Qué tienes en mente para los próximos meses?",
    description: "El formato y el momento que imaginas.",
    question: "¿Qué tipo de lanzamiento tienes en mente y para cuándo?",
  },
  {
    key: "availability",
    label: "Disponibilidad",
    title: "¿Cuándo te gustaría comenzar?",
    description: "El momento en el que podrías empezar a trabajar.",
    question: "¿Cuándo te gustaría comenzar?",
  },
  {
    key: "investment",
    label: "Inversión",
    title: "Hablemos de la inversión.",
    description:
      "Cabaña Full Access es un proceso de desarrollo artístico personalizado. Queremos conocer tu situación actual para valorar si existe una forma adecuada de avanzar.",
    question: "¿Qué opción refleja mejor tu situación actual?",
  },
];

export const REVIEW_INDEX = STAGES.length;

export const EMPTY_FORM = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  country: "",
  city: "",
  instagram: "",
  music_link: "",
  project_stage: "",
  genres: [],
  genre_other: "",
  goals: [],
  main_blocker: "",
  release_type: "",
  release_date: "",
  availability: "",
  budget: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateStage(index, data) {
  const errors = {};
  if (index === 0) {
    if (!data.first_name.trim()) errors.first_name = "Escribe tu nombre.";
    if (!data.last_name.trim()) errors.last_name = "Escribe tu apellido.";
    if (!EMAIL_RE.test(data.email.trim())) errors.email = "Revisa tu correo electrónico.";
    if (!data.phone.trim()) errors.phone = "Necesitamos un teléfono de contacto.";
    if (!data.country.trim()) errors.country = "Indica tu país.";
    if (!data.city.trim()) errors.city = "Indica tu ciudad.";
  }
  if (index === 1 && !data.project_stage) errors.project_stage = "Elige la opción que mejor te represente.";
  if (index === 2 && !data.genres.length) errors.genres = "Selecciona al menos un género.";
  if (index === 3 && !data.goals.length) errors.goals = "Selecciona al menos un objetivo.";
  if (index === 4 && data.main_blocker.trim().length < 10)
    errors.main_blocker = "Cuéntanos un poco más para entender tu situación.";
  if (index === 5) {
    if (!data.release_type) errors.release_type = "Elige el tipo de lanzamiento.";
    if (!data.release_date) errors.release_date = "Elige una fecha objetivo.";
  }
  if (index === 6 && !data.availability) errors.availability = "Elige tu disponibilidad.";
  if (index === 7 && !data.budget) errors.budget = "Elige la opción que mejor refleje tu situación.";
  return errors;
}

export function validateAll(data) {
  const errors = {};
  for (let i = 0; i < STAGES.length; i += 1) Object.assign(errors, validateStage(i, data));
  return errors;
}

export const RESULT_COPY = {
  [QUALIFICATION.APTO]: {
    title: "Hemos recibido tu proyecto.",
    text:
      "Gracias por compartir tu propuesta con nosotros. El siguiente paso es reservar una conversación para conocer mejor tu proyecto, entender tus objetivos y valorar cómo podemos ayudarte a desarrollarlo.",
  },
  [QUALIFICATION.EXPLORANDO]: {
    title: "Gracias por compartir tu proyecto.",
    text:
      "Tu proyecto merece el momento adecuado. Gracias por compartir tu información. Cabaña Full Access está diseñado para artistas que tienen claridad sobre sus objetivos y están preparados para comenzar a desarrollar su proyecto. Trabajamos con plazas limitadas para poder dedicar a cada artista el tiempo y la dirección que necesita. Si todavía estás explorando opciones, te invitamos a seguir desarrollando tu propuesta y volver cuando sientas que es el momento de dar este paso.",
  },
  [QUALIFICATION.REVISION]: {
    title: "Hemos recibido tu proyecto.",
    text:
      "Gracias por compartir tu propuesta con nosotros. Hemos recibido tu solicitud correctamente. Antes de reservar una conversación vamos a revisar tu caso para valorar la opción del pago fraccionado, y te escribiremos a tu correo con la respuesta.",
  },
  [QUALIFICATION.SIN_PRESUPUESTO]: {
    title: "Gracias por contarnos tu situación.",
    text:
      "Gracias por compartir tu situación y contarnos más sobre tu proyecto. Hemos recibido tu solicitud correctamente. En Cabaña Creative valoramos el momento y las posibilidades de cada artista. Te invitamos a seguir desarrollando tu propuesta y volver a contactarnos cuando tengas disponibilidad para invertir en esta etapa.",
  },
};

RESULT_COPY[QUALIFICATION.NO_APTO] = RESULT_COPY[QUALIFICATION.SIN_PRESUPUESTO];