/**
 * Sincronización de solicitudes de admisión con HubSpot.
 * HubSpot es el CRM principal: aquí solo se crea o actualiza el contacto con
 * las propiedades que existen en el grupo "Cabaña Creative Admisión".
 * Nunca se crean propiedades nuevas desde el código.
 */

const HUBSPOT = "https://api.hubapi.com";
const GROUP = "cabana_creative_admision";

/** Campo del formulario → propiedad interna de HubSpot. */
const PROPERTY_MAP: Array<[string, string]> = [
  ["last_name", "apellido"],
  ["city", "ciudad"],
  ["email", "correo"],
  ["availability", "disponibilidad_para_comenzar"],
  ["music_link", "enlace_a_tu_musicaperfil_spotify_youtube_o_drive"],
  ["project_stage", "etapa_del_proyecto"],
  ["release_date", "fecha_objetivo_de_lanzamiento"],
  ["genres", "generos_musicales"],
  ["instagram", "instagram"],
  ["first_name", "nombre"],
  ["goals", "objetivos_del_proyecto"],
  ["country", "pais"],
  ["budget", "presupuesto"],
  ["main_blocker", "principal_bloqueo"],
  ["phone", "telefono"],
  ["release_type", "tipo_de_lanzamiento"],
  ["modality", "modalidad_preferida_grabacion"],
];

/** Propiedades cuyo valor es una URL: HubSpot rechaza el contacto si no lleva protocolo. */
const URL_FIELDS = new Set(["enlace_a_tu_musicaperfil_spotify_youtube_o_drive"]);

const norm = (value: unknown) =>
  String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.;]+$/, "");

const withProtocol = (value: string) => {
  const text = value.trim();
  if (/^https?:\/\//i.test(text)) return text;
  if (/^[\w-]+(\.[\w-]+)+/.test(text)) return `https://${text.replace(/^\/+/, "")}`;
  return text;
};

async function hs(path: string, token: string, options: RequestInit = {}) {
  const res = await fetch(`${HUBSPOT}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    signal: AbortSignal.timeout(15000),
  });
  const raw = await res.text();
  let data: any = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = { raw };
  }
  if (!res.ok) {
    const error: any = new Error(`HubSpot ${res.status}: ${data?.message || raw.slice(0, 300)}`);
    error.status = res.status;
    throw error;
  }
  return data;
}

/** Valor interno de una opción a partir del texto visible del formulario. */
function optionValue(prop: any, label: string) {
  const options = Array.isArray(prop?.options) ? prop.options : [];
  const target = norm(label);
  const found = options.find(
    (option: any) => norm(option.value) === target || norm(option.label) === target
  );
  return found?.value || "";
}

function buildProperties(submission: any, byName: Map<string, any>) {
  const warnings: string[] = [];
  const props: Record<string, string> = {};

  if (submission.email) props.email = String(submission.email).trim();
  // El nombre llega completo en un solo campo: se conserva tal cual en firstname.
  if (submission.first_name) props.firstname = String(submission.first_name).trim().slice(0, 250);
  if (submission.last_name) props.lastname = String(submission.last_name).trim().slice(0, 250);
  if (submission.phone) props.phone = String(submission.phone).trim().slice(0, 60);

  // Propiedades estándar de ubicación (son de texto libre en esta cuenta).
  if (submission.country) props.country = String(submission.country).trim().slice(0, 120);
  if (submission.city) props.city = String(submission.city).trim().slice(0, 120);

  PROPERTY_MAP.forEach(([field, name]) => {
    const raw = submission[field];
    const multi = Array.isArray(raw);
    const values: string[] = multi ? raw.filter(Boolean) : raw ? [String(raw)] : [];
    if (!values.length) return;

    const prop = byName.get(name);
    if (!prop) {
      warnings.push(`${name}: la propiedad no existe en HubSpot`);
      return;
    }
    if (prop.groupName && norm(prop.groupName) !== GROUP) {
      warnings.push(`${name}: está en el grupo "${prop.groupName}"`);
    }

    if (prop.type === "enumeration" || prop.type === "checkbox") {
      // HubSpot expone los multiselección como enumeration + fieldType "checkbox".
      const multiProp = prop.type === "checkbox" || prop.fieldType === "checkbox";
      const resolved = values.map((value) => optionValue(prop, value)).filter(Boolean);
      const unmatched = values.filter((value) => !optionValue(prop, value));
      if (unmatched.length) warnings.push(`${name}: sin opción equivalente para "${unmatched.join(", ")}"`);
      if (!resolved.length) return;
      if (multiProp) {
        props[name] = resolved.join(";");
      } else {
        if (resolved.length > 1) {
          warnings.push(`${name}: es de selección única, se envía solo "${resolved[0]}"`);
        }
        props[name] = resolved[0];
      }
      return;
    }

    if (prop.type === "date" || prop.type === "datetime") {
      const candidate = values[0];
      if (!/^\d{4}-\d{2}-\d{2}/.test(candidate)) {
        warnings.push(`${name}: es una propiedad de fecha y el valor no lo es`);
        return;
      }
      props[name] = candidate;
      return;
    }

    if (prop.type === "number") {
      const numeric = Number(String(values[0]).replace(/[^\d.,-]/g, "").replace(",", "."));
      if (!Number.isFinite(numeric)) {
        warnings.push(`${name}: es numérica y el valor no lo es`);
        return;
      }
      props[name] = String(numeric);
      return;
    }

    const text = values.join(", ").slice(0, 65000);
    props[name] = URL_FIELDS.has(name) ? withProtocol(text) : text;
  });

  return { props, warnings };
}

async function findContact(token: string, email: string) {
  const found = await hs("/crm/v3/objects/contacts/search", token, {
    method: "POST",
    body: JSON.stringify({
      filterGroups: [{ filters: [{ propertyName: "email", operator: "EQ", value: email }] }],
      properties: ["email", "firstname", "lastname"],
      limit: 1,
    }),
  });
  return found?.results?.[0] || null;
}

/**
 * Escribe el contacto. Si HubSpot rechaza alguna propiedad concreta (400),
 * se reintenta una vez sin las propiedades inválidas para no perder el resto
 * de la información, y se deja constancia en los avisos.
 */
async function writeContact(
  token: string,
  contactId: string | null,
  props: Record<string, string>,
  warnings: string[]
) {
  const attempt = (payload: Record<string, string>) =>
    contactId
      ? hs(`/crm/v3/objects/contacts/${contactId}`, token, {
          method: "PATCH",
          body: JSON.stringify({ properties: payload }),
        })
      : hs("/crm/v3/objects/contacts", token, {
          method: "POST",
          body: JSON.stringify({ properties: payload }),
        });

  try {
    return await attempt(props);
  } catch (error: any) {
    if (error?.status !== 400) throw error;
    const invalid = [...String(error.message || "").matchAll(/"name"\s*:\s*"([^"]+)"/g)].map(
      (match) => match[1]
    );
    const cleaned: Record<string, string> = { ...props };
    invalid.forEach((name) => delete cleaned[name]);
    if (!invalid.length || !Object.keys(cleaned).length) throw error;
    warnings.push(`HubSpot rechazó: ${[...new Set(invalid)].join(", ")}`);
    return await attempt(cleaned);
  }
}

/**
 * Crea o actualiza el contacto usando el email estándar como identificador.
 * Solo escribe los campos que llegan con valor: nunca sobrescribe con vacíos.
 */
export async function syncAdmissionToHubspot(base44: any, submission: any) {
  const { accessToken } = await base44.asServiceRole.connectors.getConnection("hubspot");
  if (!accessToken) throw new Error("HubSpot no está conectado.");
  if (!submission?.email) throw new Error("La solicitud no tiene correo electrónico.");

  const meta = await hs("/crm/v3/properties/contacts", accessToken);
  const byName = new Map<string, any>(
    (meta?.results || []).map((property: any) => [property.name, property])
  );

  const { props, warnings } = buildProperties(submission, byName);
  const existing = await findContact(accessToken, submission.email);

  let contact: any;
  try {
    contact = await writeContact(accessToken, existing?.id || null, props, warnings);
  } catch (error: any) {
    if (error?.status !== 409) throw error;
    const retry = await findContact(accessToken, submission.email);
    if (!retry) throw error;
    contact = await writeContact(accessToken, retry.id, props, warnings);
  }

  return {
    contactId: contact?.id || existing?.id || "",
    warnings,
  };
}