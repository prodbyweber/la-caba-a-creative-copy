/**
 * Sincronización de solicitudes de admisión con HubSpot.
 * HubSpot es el CRM principal: aquí solo se crea o actualiza el contacto con
 * las propiedades que existen en la cuenta. Nunca se crean ni se renombran
 * propiedades desde el código.
 *
 * Reglas:
 * - Propiedades estándar y personalizadas: se envían ambas cuando existen.
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
  ["country", "pais"],
  ["project_stage", "etapa_del_proyecto"],
  ["genres", "generos_musicales"],
  ["music_link", "enlace_a_tu_musicaperfil_spotify_youtube_o_drive"],
  ["release_type", "tipo_de_lanzamiento"],
  ["budget", "presupuesto"],
  ["availability", "disponibilidad_para_comenzar"],
];

/** Propiedades cuyo valor es una URL: HubSpot rechaza el contacto si no lleva protocolo. */
const URL_FIELDS = new Set(["enlace_a_tu_musicaperfil_spotify_youtube_o_drive"]);

/**
 * Respuestas sin opción equivalente en HubSpot. Se envía el equivalente y la
 * respuesta original se conserva en Base44 y en la nota del contacto.
 */
const VALUE_FALLBACK: Record<string, Record<string, string>> = {
  disponibilidad_para_comenzar: {
    "Todavía no tengo una fecha definida.": "Estoy explorando opciones por ahora",
  },
};

/** Propiedades obligatoriamente multiselección. */
const MULTI_FIELDS = new Set(["generos_musicales"]);

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
    ["country", submission.country],
  ];
  standard.forEach(([name, value]) => {
    const text = String(value ?? "").trim();
    if (text) props[name] = text.slice(0, 250);
  });

  PROPERTY_MAP.forEach(([field, name]) => {
    const raw = submission[field];
    const multi = Array.isArray(raw);
    let values: string[] = (multi ? raw : raw ? [raw] : [])
      .map((value: unknown) => String(value ?? "").trim())
      .filter(Boolean);
    if (!values.length) return;

    const prop = byName.get(name);
    if (!prop) {
      notes.push(`${name}: la propiedad no existe en HubSpot, el dato queda en Base44`);
      return;
    }
    if (prop.groupName && norm(prop.groupName) !== GROUP) {
      notes.push(`${name}: está en el grupo "${prop.groupName}"`);
    }

    if (prop.type === "enumeration" || prop.type === "checkbox") {
      const isMulti = prop.type === "checkbox" || prop.fieldType === "checkbox";
      if (MULTI_FIELDS.has(name) && !isMulti) {
        warnings.push(
          `${name}: es de selección única y debe ser "Multiple checkboxes"; no se ha enviado`
        );
        return;
      }

      const fallback = VALUE_FALLBACK[name] || {};
      const resolved: string[] = [];
      const unmatched: string[] = [];
      values.forEach((value) => {
        const target = fallback[value] || value;
        const match = optionValue(prop, target);
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
        warnings.push(`${name}: es de selección única y se han enviado varios valores`);
        return;
      }
      props[name] = resolved[0];
      return;
    }

    if (prop.type === "number") {
      const numeric = Number(values[0].replace(/[^\d.,-]/g, "").replace(",", "."));
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

/** Relee el contacto y compara con lo enviado (solo valores simples). */
async function readBack(token: string, contactId: string, props: Record<string, string>) {
  const names = Object.keys(props).filter((name) => name !== "email" && !props[name].includes(";"));
  if (!names.length) return [];
  const contact = await hs(
    `/crm/v3/objects/contacts/${contactId}?properties=${encodeURIComponent(names.join(","))}`,
    token
  );
  const got = contact?.properties || {};
  return names.filter((name) => norm(got[name]) !== norm(props[name]));
}

/** Nota asociada al contacto con el detalle de la admisión. */
async function createNote(token: string, contactId: string, body: string) {
  await hs("/crm/v3/objects/notes", token, {
    method: "POST",
    body: JSON.stringify({
      properties: { hs_timestamp: new Date().toISOString(), hs_note_body: body.slice(0, 65000) },
      associations: [
        {
          to: { id: contactId },
          types: [
            { associationCategory: "HUBSPOT_DEFINED", associationTypeId: 202 },
          ],
        },
      ],
    }),
  });
}

function noteBody(submission: any) {
  const lines = [
    `Solicitud de admisión · Cabaña Full Access`,
    `Fecha: ${submission.submitted_at || new Date().toISOString()}`,
    `ID de admisión: ${submission.submission_id || submission.id || ""}`,
    `Etapa: ${submission.project_stage || "—"}`,
    `Géneros: ${(submission.genres || []).join(", ") || "—"}`,
    `Enlace de música: ${submission.music_link || "—"}`,
    `Tipo de proyecto: ${submission.release_type || "—"}`,
    `Presupuesto: ${submission.budget || "—"}`,
    `Disponibilidad (respuesta original): ${submission.availability || "—"}`,
    `Calificación: ${submission.qualification_status || "—"}`,
  ];
  return lines.join("\n");
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

  const contactId = contact?.id || existing?.id || "";
  if (!contactId) throw new Error("HubSpot no devolvió el contacto.");

  try {
    const mismatched = await readBack(accessToken, contactId, props);
    if (mismatched.length) {
      warnings.push(`Lectura distinta en HubSpot: ${mismatched.join(", ")}`);
    }
  } catch {
    notes.push("No se pudo releer el contacto en HubSpot");
  }

  try {
    await createNote(accessToken, contactId, noteBody(submission));
  } catch (error: any) {
    notes.push(
      error?.status === 403
        ? "Nota de HubSpot omitida: falta el permiso de notas en el token"
        : "Nota de HubSpot omitida"
    );
  }

  return {
    contactId,
    warnings,
    notes,
    status: warnings.length ? "parcial" : "sincronizado",
  };
}