/** Contenido y validación de las pantallas de admisión de Cabaña Full Access. */

export const STAGE_OPTIONS = [
  "Estoy comenzando y quiero encontrar mi identidad artística.",
  "Tengo ideas y demos, pero necesito convertirlas en canciones.",
  "Ya he publicado música y quiero evolucionar mi sonido.",
  "Estoy desarrollando un proyecto profesional y quiero dar el siguiente paso.",
  "Tengo un catálogo y experiencia, pero necesito una dirección más clara.",
];

export const MODALITY_OPTIONS = [
  "Presencial: prefiero realizar las sesiones de grabación en persona.",
  "Online / Remoto: prefiero trabajar a distancia.",
  "Híbrido: desarrollar el proyecto online y realizar las grabaciones de voces presencialmente.",
  "Estoy abierto/a a valorarlo: quiero conocer las posibilidades según mi ubicación y el proyecto.",
];

export const GENRE_OPTIONS = [
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

export const GOAL_OPTIONS = [
  "Encontrar una identidad sonora propia y reconocible.",
  "Desarrollar canciones con un sonido profesional.",
  "Construir un catálogo coherente y con personalidad.",
  "Definir una dirección artística y diferenciar mi propuesta.",
  "Preparar mis lanzamientos y conectar con una audiencia.",
];

export const RELEASE_OPTIONS = [
  "Un single.",
  "Varios singles.",
  "Un EP.",
  "Un álbum.",
  "Todavía estoy definiendo mi próximo proyecto.",
];

export const RELEASE_DATE_OPTIONS = [
  "Durante el próximo mes.",
  "En los próximos 2–3 meses.",
  "En los próximos 3–6 meses.",
  "Todavía no tengo fecha definida.",
];

export const AVAILABILITY_OPTIONS = [
  "Lo antes posible.",
  "La próxima semana.",
  "Durante el próximo mes.",
  "En los próximos 2–3 meses.",
  "Estoy explorando opciones por ahora.",
];

export const BUDGET_OPTIONS = [
  "Puedo asumir una inversión desde 2.000 €.",
  "Me interesa, pero necesitaría valorar un pago fraccionado.",
  "Mi presupuesto actual está entre los 700 € a 1200€",
  "Ahora mismo no cuento con presupuesto para invertir.",
];

export const INVESTMENT_NOTE = "Cabaña Full Access tiene una inversión a partir de 2.000 €.";

export const QUALIFIED_STATUS = "APTO PARA AGENDAR";

/** Estado inicial: todas las respuestas viven aquí durante todo el flujo. */
export function createEmptyAdmission(phoneCountry = "ES") {
  return {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    phone_country: phoneCountry,
    project_stage: "",
    country: "España",
    city: "",
    modality: "",
    genres: [],
    goals: [],
    main_blocker: "",
    instagram: "",
    music_link: "",
    release_type: "",
    release_date: "",
    availability: "",
    budget: "",
  };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+\d{6,15}$/;

export function validateScreen(screen, data) {
  const errors = {};

  if (screen === 0) {
    if (!data.first_name.trim()) errors.first_name = "Escribe tu nombre.";
    if (!data.last_name.trim()) errors.last_name = "Escribe tus apellidos.";
    if (!EMAIL_RE.test(data.email.trim())) errors.email = "Revisa tu correo electrónico.";
    if (!PHONE_RE.test((data.phone || "").trim())) errors.phone = "Revisa el número de teléfono.";
  }
  if (screen === 1 && !data.project_stage) {
    errors.project_stage = "Elige la opción que mejor te represente.";
  }
  if (screen === 2) {
    if (!data.country.trim()) errors.country = "Indica tu país.";
    if (!data.city.trim()) errors.city = "Indica tu ciudad.";
    if (!data.modality) errors.modality = "Elige cómo prefieres trabajar.";
  }
  if (screen === 3 && !(data.genres || []).length) {
    errors.genres = "Elige al menos un género.";
  }
  if (screen === 4 && !(data.goals || []).length) {
    errors.goals = "Elige al menos un objetivo.";
  }
  if (screen === 5) {
    if (!data.main_blocker.trim()) errors.main_blocker = "Cuéntanos qué te está frenando.";
    if (data.music_link.trim() && !/^(https?:\/\/)?[\w-]+(\.[\w-]+)+/.test(data.music_link.trim())) {
      errors.music_link = "Revisa el enlace.";
    }
  }
  if (screen === 6) {
    if (!data.release_type) errors.release_type = "Elige el formato de lanzamiento.";
    if (!data.release_date) errors.release_date = "Elige una fecha objetivo.";
  }
  if (screen === 7) {
    if (!data.availability) errors.availability = "Elige tu disponibilidad.";
    if (!data.budget) errors.budget = "Elige la opción que mejor refleje tu situación.";
  }

  return errors;
}