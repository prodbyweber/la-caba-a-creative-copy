/**
 * Sincronización de solicitudes de admisión con HubSpot.
 * HubSpot es el CRM principal: aquí solo se crea o actualiza el contacto con
 * las propiedades que existen en el grupo "Cabaña Creative Admisión".
 * Nunca se crean ni se renombran propiedades desde el código.
 *
 * Reglas:
 * - Se envía el contacto con las propiedades estándar y las personalizadas.
 * - Los valores de las enumeraciones se resuelven contra la definición real de
 *   la propiedad: siempre viaja el `value` interno, nunca el texto visible.
 * - Una propiedad inválida nunca bloquea el contacto: se omite y se avisa.
 * - Los campos vacíos no se envían: nunca se sobrescribe con vacío.
 */

const HUBSPOT = "https://api.hubapi.com";
const GROUP = "cabana_creative_admision";
const MAX_ATTEMPTS = 3;

/** Campo del formulario → propiedad interna de HubSpot. */
const PROPERTY_MAP: Array<[string, string]> = [
  ["first_name", "nombre"],
  ["last_name", "apellido"],
  ["email", "correo"],
  ["phone", "telefono"],
  ["city", "ciudad"],
  ["country", "pais"],
  ["instagram", "instagram"],
  ["music_link", "enlace_a_tu_musicaperfil_spotify_youtube_o_drive"],
  ["main_blocker", "principal_bloqueo"],
  ["project_stage", "etapa_del_proyecto"],
  ["genres", "generos_musicales"],
  ["goals", "objetivos_del_proyecto"],
  ["release_type", "tipo_de_lanzamiento"],
  ["release_date", "fecha_objetivo_de_lanzamiento"],
  ["availability", "disponibilidad_para_comenzar"],
  ["budget", "presupuesto"],
  ["modality", "modalidad_preferida_grabacion"],
];

/** Propiedades cuyo valor es una URL: HubSpot rechaza el contacto si no lleva protocolo. */
const URL_FIELDS = new Set(["enlace_a_tu_musicaperfil_spotify_youtube_o_drive"]);

/**
 * Campos sin destino en HubSpot (la propiedad no existe en la cuenta).
 * Se guardan en Base44 y se avisa en el informe, sin marcar la sync como parcial.
 */
const NO_TARGET: Record<string, string> = {
  last_name: "apellido: la propiedad no existe en HubSpot, el apellido va en lastname",
  main_blocker: "principal_bloqueo: la propiedad no existe en HubSpot, el dato queda en Base44",
  release_date:
    "fecha_objetivo_de_lanzamiento: la propiedad no existe en HubSpot, el dato queda en Base44",
};

/** Normaliza para comparar: minúsculas, sin acentos, guiones unificados, sin punto final. */
const norm = (value: unknown) =>
  String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2010-\u2015\u2212]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.;,]+$/, "");

const withProtocol = (value: string) => {
  const text = value.trim();
  if (/^https?:\/\//i.test(text)) return text;
  if (/^[\w-]+(\.[\w-]+)+/.test(text)) return `https://${text.replace(/^\/+/, "")}`;
  return text;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Llamada a HubSpot con reintentos para 429 y 5xx. */
async function hs(path: string, token: string, options: RequestInit = {}, attempt = 0) {
  const res = await fetch(`${HUBSPOT}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    signal: AbortSignal.timeout(15000),
  });

  if ((res.status === 429 || res.status >= 500) && attempt < MAX_ATTEMPTS) {
    await sleep(400 * 2 ** attempt);
    return hs(path, token, options, attempt + 1);
  }

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
    error.body = data;
    error.raw = raw;
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
  const notes: string[] = [];
  const props: Record<string, string> = {};

  const email = String(submission?.email || "").trim().toLowerCase();
  if (!email) throw new Error("La solicitud no tiene correo electrónico.");
  props.email = email;

  // Propiedades estándar (solo si traen valor).
  const standard: Array<[string, unknown]> = [
    ["firstname", submission.first_name],
    ["lastname", submission.last_name],
    ["phone", submission.phone],
    ["city", submission.city],
    ["country", submission.country],
  ];
  standard.forEach(([name, value]) => {
    const text = String(value ?? "").trim();
    if (text) props[name] = text.slice(0, 250);
  });

  PROPERTY_MAP.forEach(([field, name]) => {
    const raw = submission[field];
    const multi = Array.isArray(raw);
    const values: string[] = (multi ? raw : raw ? [raw] : [])
      .map((value: unknown) => String(value ?? "").trim())
      .filter(Boolean);
    if (!values.length) return;

    const prop = byName.get(name);
    if (!prop) {
      notes.push(NO_TARGET[field] || `${name}: la propiedad no existe en HubSpot`);
      return;
    }
    if (prop.groupName && norm(prop.groupName) !== GROUP) {
      notes.push(`${name}: está en el grupo "${prop.groupName}"`);
    }

    if (prop.type === "enumeration" || prop.type === "checkbox") {
      // HubSpot expone la multiselección como enumeration + fieldType "checkbox".
      const isMulti = prop.type === "checkbox" || prop.fieldType === "checkbox";
      const resolved: string[] = [];
      const unmatched: string[] = [];
      values.forEach((value) => {
        const match = optionValue(prop, value);
        if (match) resolved.push(match);
        else unmatched.push(value);
      });

      if (unmatched.length) {
        warnings.push(`${name}: sin opción equivalente para "${unmatched.join(", ")}"`);
      }
      if (!resolved.length) return;

      if (isMulti) {
        props[name] = [...new Set(resolved)].join(";");
        return;
      }
      if (resolved.length > 1) {
        warnings.push(
          `${name}: es de selección única y se han elegido ${resolved.length} valores; ` +
            `cámbiala a "Casillas de verificación múltiples" en HubSpot`
        );
        return;
      }
      props[name] = resolved[0];
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

    const joiner = prop.fieldType === "textarea" ? "\n" : ", ";
    const text = values.join(joiner).slice(0, 65000);
    props[name] = URL_FIELDS.has(name) ? withProtocol(text) : text;
  });

  return { props, warnings, notes };
}

async function findContact(token: string, email: string) {
  const found = await hs("/crm/v3/objects/contacts/search", token, {
    method: "POST",
    body: JSON.stringify({
      filterGroups: [
        { filters: [{ propertyName: "email", operator: "EQ", value: email.toLowerCase() }] },
      ],
      properties: ["email", "firstname", "lastname"],
      limit: 1,
    }),
  });
  return found?.results?.[0] || null;
}

/** Nombres de propiedad que HubSpot ha rechazado en un 400. */
function rejectedProperties(error: any) {
  const raw = String(error?.raw || error?.message || "");
  const names = new Set<string>();
  for (const match of raw.matchAll(/"propertyName"\s*:\s*"([^"]+)"/g)) names.add(match[1]);
  for (const match of raw.matchAll(/property ['"]([a-zA-Z0-9_]+)['"]/gi)) names.add(match[1]);
  for (const match of raw.matchAll(/"name"\s*:\s*"([a-zA-Z0-9_]+)"/g)) names.add(match[1]);
  names.delete("email");
  return [...names];
}

/**
 * Escribe el contacto. Si HubSpot rechaza alguna propiedad concreta (400),
 * se reintenta una vez sin esas propiedades para no perder el resto.
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
    const invalid = rejectedProperties(error);
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

  const meta = await hs("/crm/v3/properties/contacts", accessToken);
  const byName = new Map<string, any>(
    (meta?.results || []).map((property: any) => [property.name, property])
  );

  const { props, warnings, notes } = buildProperties(submission, byName);
  const existing = await findContact(accessToken, props.email);

  let contact: any;
  try {
    contact = await writeContact(accessToken, existing?.id || null, props, warnings);
  } catch (error: any) {
    if (error?.status !== 409) throw error;
    const retry = await findContact(accessToken, props.email);
    if (!retry) throw error;
    contact = await writeContact(accessToken, retry.id, props, warnings);
  }

  return {
    contactId: contact?.id || existing?.id || "",
    warnings,
    notes,
    status: warnings.length ? "parcial" : "sincronizado",
  };
}