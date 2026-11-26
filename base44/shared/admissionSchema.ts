/**
 * Contrato compartido del formulario de admisión: opciones, validación y
 * calificación. El servidor valida siempre por su cuenta.
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
  SIN_PRESUPUESTO: "SIN PRESUPUESTO DISPONIBLE",
};

export const norm = (value: unknown) =>
  String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.;]+$/, "");

export function qualify(availability: string, budget: string) {
  if (norm(availability) === norm(EXPLORING)) return QUALIFICATION.EXPLORANDO;
  if (norm(budget) === norm(NO_BUDGET)) return QUALIFICATION.SIN_PRESUPUESTO;
  if (INVESTMENT_OK.some((option) => norm(option) === norm(budget))) return QUALIFICATION.APTO;
  return QUALIFICATION.EXPLORANDO;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const text = (value: unknown, max = 4000) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const list = (value: unknown, allowed: string[], max = 20) =>
  Array.isArray(value)
    ? value
        .map((item) => text(item, 300))
        .filter((item) => item && allowed.includes(item))
        .slice(0, max)
    : [];

const pick = (value: unknown, allowed: string[]) => {
  const clean = text(value, 400);
  return allowed.includes(clean) ? clean : "";
};

export type AdmissionPayload = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  instagram: string;
  music_link: string;
  project_stage: string;
  genres: string[];
  genre_other: string;
  goals: string[];
  main_blocker: string;
  release_type: string;
  release_date: string;
  availability: string;
  budget: string;
};

export function validateAdmission(body: any): {
  data: AdmissionPayload;
  errors: Record<string, string>;
} {
  const data: AdmissionPayload = {
    first_name: text(body?.first_name, 120),
    last_name: text(body?.last_name, 120),
    email: text(body?.email, 200).toLowerCase(),
    phone: text(body?.phone, 40),
    country: text(body?.country, 120),
    city: text(body?.city, 120),
    instagram: text(body?.instagram, 120),
    music_link: text(body?.music_link, 500),
    project_stage: pick(body?.project_stage, PROJECT_STAGES),
    genres: list(body?.genres, GENRES),
    genre_other: text(body?.genre_other, 200),
    goals: list(body?.goals, GOALS),
    main_blocker: text(body?.main_blocker, 4000),
    release_type: pick(body?.release_type, RELEASE_TYPES),
    release_date: pick(body?.release_date, RELEASE_DATES),
    availability: pick(body?.availability, AVAILABILITY),
    budget: pick(body?.budget, BUDGETS),
  };

  const errors: Record<string, string> = {};
  if (!data.first_name) errors.first_name = "El nombre es obligatorio.";
  if (!data.last_name) errors.last_name = "El apellido es obligatorio.";
  if (!EMAIL_RE.test(data.email)) errors.email = "El correo no es válido.";
  if (!data.phone) errors.phone = "El teléfono es obligatorio.";
  if (!data.country) errors.country = "El país es obligatorio.";
  if (!data.city) errors.city = "La ciudad es obligatoria.";
  if (!data.project_stage) errors.project_stage = "Selecciona la etapa del proyecto.";
  if (!data.genres.length) errors.genres = "Selecciona al menos un género.";
  if (!data.goals.length) errors.goals = "Selecciona al menos un objetivo.";
  if (data.main_blocker.length < 10) errors.main_blocker = "El bloqueo principal es obligatorio.";
  if (!data.release_type) errors.release_type = "Selecciona el tipo de lanzamiento.";
  if (!data.release_date) errors.release_date = "Selecciona la fecha objetivo.";
  if (!data.availability) errors.availability = "Selecciona la disponibilidad.";
  if (!data.budget) errors.budget = "Selecciona el presupuesto.";

  return { data, errors };
}