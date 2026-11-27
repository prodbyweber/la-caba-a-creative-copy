/**
 * Contrato compartido del formulario de admisión: opciones, validación y
 * calificación. El servidor valida siempre por su cuenta.
 * Ocho pasos: datos · país · etapa · géneros · enlace (opcional) · proyecto ·
 * inversión · inicio.
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

export const RELEASE_TYPES = [
  "Un single.",
  "Varios singles.",
  "Un EP.",
  "Un álbum.",
  "Todavía estoy definiendo mi próximo proyecto.",
];

export const AVAILABILITY = [
  "Lo antes posible.",
  "La próxima semana.",
  "Durante el próximo mes.",
  "En los próximos 2–3 meses.",
  "Todavía no tengo una fecha definida.",
];

export const BUDGETS = [
  "Puedo asumir una inversión desde 2.000 €.",
  "Me interesa, pero necesitaría valorar un pago fraccionado.",
  "Mi presupuesto actual está entre los 700 € a 1200€",
  "Ahora mismo no cuento con presupuesto para invertir.",
];

/** Respuesta de disponibilidad sin equivalente en HubSpot: se traduce al enviar. */
export const NO_DATE = "Todavía no tengo una fecha definida.";
export const EXPLORING = "Estoy explorando opciones por ahora.";
export const NO_BUDGET = "Ahora mismo no cuento con presupuesto para invertir.";
export const FRACTIONED = "Me interesa, pero necesitaría valorar un pago fraccionado.";
export const INVESTMENT_2K = "Puedo asumir una inversión desde 2.000 €.";
export const BUDGET_700_1200 = "Mi presupuesto actual está entre los 700 € a 1200€";

export const QUALIFICATION = {
  APTO: "APTO PARA AGENDAR",
  EXPLORANDO: "EN EXPLORACIÓN",
  REVISION: "REVISIÓN MANUAL",
  NO_APTO: "NO APTO",
  SIN_PRESUPUESTO: "SIN PRESUPUESTO DISPONIBLE",
};

export const norm = (value: unknown) =>
  String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2010-\u2015\u2212]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.;,]+$/, "");

/** Calificación interna: solo depende del presupuesto. */
export function qualify(budget: string) {
  if (norm(budget) === norm(NO_BUDGET)) return QUALIFICATION.SIN_PRESUPUESTO;
  if ([INVESTMENT_2K, FRACTIONED, BUDGET_700_1200].some((item) => norm(item) === norm(budget))) {
    return QUALIFICATION.APTO;
  }
  return QUALIFICATION.SIN_PRESUPUESTO;
}

function text_of(value: unknown, max = 4000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/**
 * Añade https:// si falta y devuelve el enlace normalizado.
 * El enlace es opcional: vacío devuelve "" y no es un error.
 */
export function musicUrl(value: string) {
  const text = text_of(value, 500);
  if (!text) return "";
  const withProto = /^https?:\/\//i.test(text) ? text : `https://${text.replace(/^\/+/, "")}`;
  try {
    const url = new URL(withProto);
    if (!url.hostname.includes(".")) return "";
    return url.toString();
  } catch {
    return "";
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const list = (value: unknown, allowed: string[], max = 20) =>
  Array.isArray(value)
    ? value
        .map((item) => text_of(item, 300))
        .filter((item) => item && allowed.includes(item))
        .slice(0, max)
    : [];

const pick = (value: unknown, allowed: string[]) => {
  const clean = text_of(value, 400);
  return allowed.includes(clean) ? clean : "";
};

export type AdmissionPayload = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country: string;
  project_stage: string;
  genres: string[];
  music_link: string;
  release_type: string;
  budget: string;
  availability: string;
};

export function validateAdmission(body: any): {
  data: AdmissionPayload;
  errors: Record<string, string>;
} {
  const data: AdmissionPayload = {
    first_name: text_of(body?.first_name, 120),
    last_name: text_of(body?.last_name, 120),
    email: text_of(body?.email, 200).toLowerCase(),
    phone: text_of(body?.phone, 40),
    country: text_of(body?.country, 120),
    project_stage: pick(body?.project_stage, PROJECT_STAGES),
    genres: list(body?.genres, GENRES),
    music_link: musicUrl(body?.music_link),
    release_type: pick(body?.release_type, RELEASE_TYPES),
    budget: pick(body?.budget, BUDGETS),
    availability: pick(body?.availability, AVAILABILITY),
  };

  const errors: Record<string, string> = {};
  if (!data.first_name) errors.first_name = "El nombre es obligatorio.";
  if (!data.last_name) errors.last_name = "El apellido es obligatorio.";
  if (!EMAIL_RE.test(data.email)) errors.email = "El correo no es válido.";
  if (!data.phone) errors.phone = "El teléfono es obligatorio.";
  if (!data.country) errors.country = "El país es obligatorio.";
  if (!data.project_stage) errors.project_stage = "Selecciona la etapa del proyecto.";
  if (!data.genres.length) errors.genres = "Selecciona al menos un género.";
  if (!data.release_type) errors.release_type = "Selecciona el tipo de proyecto.";
  if (!data.budget) errors.budget = "Selecciona el presupuesto.";
  if (!data.availability) errors.availability = "Selecciona la disponibilidad.";

  return { data, errors };
}

/** Respuestas saneadas de un borrador: solo se acepta lo que existe en el contrato. */
export function parseAnswers(body: any): AdmissionPayload {
  return {
    first_name: text_of(body?.first_name, 120),
    last_name: text_of(body?.last_name, 120),
    email: text_of(body?.email, 200).toLowerCase(),
    phone: text_of(body?.phone, 40),
    country: text_of(body?.country, 120),
    project_stage: pick(body?.project_stage, PROJECT_STAGES),
    genres: list(body?.genres, GENRES),
    music_link: musicUrl(body?.music_link),
    release_type: pick(body?.release_type, RELEASE_TYPES),
    budget: pick(body?.budget, BUDGETS),
    availability: pick(body?.availability, AVAILABILITY),
  };
}

const STEP_MESSAGES: Record<string, string> = {
  first_name: "Escribe tu nombre.",
  last_name: "Escribe tu apellido.",
  email: "Revisa tu correo electrónico.",
  phone: "Necesitamos un teléfono de contacto.",
  country: "Indica dónde te ubicas.",
  project_stage: "Elige la opción que mejor te represente.",
  genres: "Elige al menos un género.",
  music_link: "Escribe un enlace válido (por ejemplo, https://open.spotify.com/...).",
  release_type: "Elige qué te gustaría crear.",
  budget: "Elige la opción que mejor refleje tu situación.",
  availability: "Elige cuándo te gustaría comenzar.",
};

/** Ocho pantallas. El enlace de música (5) es opcional. */
const STEP_FIELDS: Record<number, string[]> = {
  1: ["first_name", "last_name", "email", "phone"],
  2: ["country"],
  3: ["project_stage"],
  4: ["genres"],
  5: [],
  6: ["release_type"],
  7: ["budget"],
  8: ["availability"],
};

/** Validación de la pantalla que se está guardando. */
export function validateStep(step: number, data: any) {
  const errors: Record<string, string> = {};

  (STEP_FIELDS[step] || []).forEach((key) => {
    const value = data?.[key];
    const empty = Array.isArray(value) ? !value.length : !String(value ?? "").trim();
    if (empty) errors[key] = STEP_MESSAGES[key] || "Campo obligatorio.";
  });

  if (data?.email && !EMAIL_RE.test(data.email)) errors.email = "Revisa tu correo electrónico.";
  if (data?.phone && !/^\+\d{6,15}$/.test(data.phone)) errors.phone = "Revisa el número de teléfono.";
  if (String(data?.music_link ?? "").trim() && !musicUrl(data.music_link)) {
    errors.music_link = STEP_MESSAGES.music_link;
  }

  return errors;
}