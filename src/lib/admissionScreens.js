/** Contenido y validación de las seis pantallas de admisión de Cabaña Full Access. */

export const STAGE_OPTIONS = [
  "Estoy comenzando y quiero encontrar mi identidad artística.",
  "Tengo ideas y demos, pero necesito convertirlas en canciones.",
  "Ya he publicado música y quiero evolucionar mi sonido.",
  "Estoy desarrollando un proyecto profesional y quiero dar el siguiente paso.",
  "Tengo un catálogo y experiencia, pero necesito una dirección más clara.",
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

export const RELEASE_OPTIONS = [
  "Un single.",
  "Varios singles.",
  "Un EP.",
  "Un álbum.",
  "Todavía estoy definiendo mi próximo proyecto.",
];

export const BUDGET_OPTIONS = [
  "Puedo asumir una inversión desde 2.000 €.",
  "Me interesa, pero necesitaría valorar un pago fraccionado.",
  "Mi presupuesto actual está entre los 700 € a 1200€",
  "Ahora mismo no cuento con presupuesto para invertir.",
];

export const AVAILABILITY_OPTIONS = [
  "Lo antes posible.",
  "La próxima semana.",
  "Durante el próximo mes.",
  "En los próximos 2–3 meses.",
  "Todavía no tengo una fecha definida.",
];

export const INVESTMENT_TITLE = "Hablemos de la inversión.";
export const INVESTMENT_TEXT =
  "Los procesos de desarrollo artístico de Cabaña Full Access parten de una inversión de 2.000 €.";
export const INVESTMENT_SUBTEXT =
  "Queremos conocer el presupuesto que tienes previsto destinar al desarrollo de tu proyecto para valorar cómo podemos avanzar y si existe una modalidad adecuada para tu situación.";
export const START_TEXT =
  "Queremos conocer tus tiempos y saber cuándo te gustaría dar el siguiente paso con tu proyecto.";
export const MUSIC_HELP =
  "Puede ser tu perfil de Spotify, YouTube, SoundCloud o una carpeta de Google Drive con tus demos y canciones.";

export const QUALIFIED_STATUS = "APTO PARA AGENDAR";

/** Dominios aceptados para el enlace de música. */
export const MUSIC_HOSTS = [
  "open.spotify.com",
  "spotify.link",
  "youtube.com",
  "youtu.be",
  "music.youtube.com",
  "soundcloud.com",
  "on.soundcloud.com",
  "drive.google.com",
];

/** Estado inicial: todas las respuestas viven aquí durante todo el flujo. */
export function createEmptyAdmission(phoneCountry = "ES") {
  return {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    phone_country: phoneCountry,
    country: "España",
    project_stage: "",
    genres: [],
    music_link: "",
    release_type: "",
    budget: "",
    availability: "",
  };
}

/** Añade https:// si falta y devuelve el enlace si el dominio está permitido. */
export function normalizeMusicLink(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  const withProto = /^https?:\/\//i.test(text) ? text : `https://${text.replace(/^\/+/, "")}`;
  try {
    const url = new URL(withProto);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    return MUSIC_HOSTS.includes(host) ? url.toString() : "";
  } catch {
    return "";
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+\d{6,15}$/;

export function validateScreen(screen, data) {
  const errors = {};

  if (screen === 0) {
    if (!data.first_name.trim()) errors.first_name = "Escribe tu nombre.";
    if (!data.last_name.trim()) errors.last_name = "Escribe tu apellido.";
    if (!EMAIL_RE.test(data.email.trim())) errors.email = "Revisa tu correo electrónico.";
    if (!PHONE_RE.test((data.phone || "").trim())) errors.phone = "Revisa el número de teléfono.";
    if (!String(data.country || "").trim()) errors.country = "Indica tu país de residencia.";
  }
  if (screen === 1 && !data.project_stage) {
    errors.project_stage = "Elige la opción que mejor te represente.";
  }
  if (screen === 2) {
    if (!(data.genres || []).length) errors.genres = "Elige al menos un género.";
    if (!normalizeMusicLink(data.music_link)) {
      errors.music_link = "Usa un enlace de Spotify, YouTube, SoundCloud o Google Drive.";
    }
  }
  if (screen === 3 && !data.release_type) {
    errors.release_type = "Elige qué te gustaría crear.";
  }
  if (screen === 4 && !data.budget) {
    errors.budget = "Elige la opción que mejor refleje tu situación.";
  }
  if (screen === 5 && !data.availability) {
    errors.availability = "Elige cuándo te gustaría comenzar.";
  }

  return errors;
}