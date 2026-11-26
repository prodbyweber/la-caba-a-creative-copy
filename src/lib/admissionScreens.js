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

export const INVESTMENT_NOTE = "Cabaña Full Access tiene una inversión a partir de 2.000 €.";

export const EMPTY_ADMISSION = {
  full_name: "",
  email: "",
  phone: "",
  project_stage: "",
  country: "España",
  city: "",
  modality: "",
  release_type: "",
  budget: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateScreen(screen, data) {
  const errors = {};
  if (screen === 0) {
    if (!data.full_name.trim()) errors.full_name = "Escribe tu nombre.";
    if (!EMAIL_RE.test(data.email.trim())) errors.email = "Revisa tu correo electrónico.";
    if (data.phone.replace(/\D/g, "").length < 6) errors.phone = "Necesitamos un teléfono de contacto.";
  }
  if (screen === 1 && !data.project_stage) errors.project_stage = "Elige la opción que mejor te represente.";
  if (screen === 2) {
    if (!data.country.trim()) errors.country = "Indica tu país.";
    if (!data.city.trim()) errors.city = "Indica tu ciudad.";
    if (!data.modality) errors.modality = "Elige cómo prefieres trabajar.";
  }
  if (screen === 3) {
    if (!data.release_type) errors.release_type = "Elige el formato de lanzamiento.";
    if (!data.budget) errors.budget = "Elige la opción que mejor refleje tu situación.";
  }
  return errors;
}

/** Campos que viajan en cada paso hacia Base44 y HubSpot. */
export function stepValues(step, data) {
  if (step === 1) return { full_name: data.full_name, email: data.email, phone: data.phone };
  if (step === 2) return { project_stage: data.project_stage };
  if (step === 3) return { country: data.country, city: data.city, modality: data.modality };
  if (step === 4) return { release_type: data.release_type, budget: data.budget };
  return {};
}