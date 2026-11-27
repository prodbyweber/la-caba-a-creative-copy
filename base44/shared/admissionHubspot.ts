/**
 * Sincronización de solicitudes de admisión con HubSpot.
 *
 * Reglas:
 * - Las definiciones de propiedades se leen EN VIVO del grupo
 *   "Cabaña Creative Admisión": nunca hay nombres ni opciones hardcodeadas.
 * - De cada enumeración viaja su `value` interno, localizado por comparación
 *   normalizada (minúsculas, sin acentos, sin punto final, guiones unificados).
 * - El contacto se localiza por el email estándar y se actualiza por PATCH.
 * - Si el PATCH combinado falla (400), se reintenta propiedad por propiedad
 *   para no perder las válidas.
 * - Los campos vacíos no se envían nunca: no se sobrescribe con vacío.
 * - La nota se crea una sola vez por solicitud (flag `note_created`).
 */

const HUBSPOT = "https://api.hubapi.com";
const GROUP_LABEL = "Cabaña Creative Admisión";
const MAX_ATTEMPTS = 3;

type Mapping = { field: string; property: string; label: string };

/** Propiedades estándar de HubSpot. */
const STANDARD: Mapping[] = [
  { field: "first_name", property: "firstname", label: "Nombre (estándar)" },
  { field: "last_name", property: "lastname", label: "Apellido (estándar)" },
  { field: "phone", property: "phone", label: "Teléfono (estándar)" },
  { field: "country", property: "country", label: "País (estándar)" },
];

/** Propiedades personalizadas del grupo de admisión. */
const CUSTOM: Mapping[] = [
  { field: "first_name", property: "nombre", label: "Nombre" },
  { field: "last_name", property: "apellido", label: "Apellido" },
  { field: "email", property: "correo", label: "Correo" },
  { field: "phone", property: "telefono", label: "Teléfono" },
  { field: "country", property: "pais", label: "País" },
  { field: "project_stage", property: "etapa_del_proyecto", label: "Etapa del proyecto" },
  { field: "genres", property: "generos_musicales", label: "Géneros musicales" },
  {
    field: "music_link",
    property: "enlace_a_tu_musicaperfil_spotify_youtube_o_drive",
    label: "Enlace a tu música",
  },
  { field: "release_type", property: "tipo_de_lanzamiento", label: "Tipo de lanzamiento" },
  { field: "budget", property: "presupuesto", label: "Presupuesto" },
  {
    field: "availability",
    property: "disponibilidad_para_comenzar",
    label: "Disponibilidad para comenzar",
  },
];

/** Propiedades que deben ser multiselección (checkbox). */
const MULTI = new Set(["generos_musicales"]);

/** Propiedades que contienen una URL. */
const URL_PROPS = new Set(["enlace_a_tu_musicaperfil_spotify_youtube_o_drive"]);

/**
 * Respuestas sin opción equivalente en HubSpot: se envía el equivalente y la
 * respuesta original se conserva en Base44 y en la nota.
 */
const FALLBACKS: Record<string, Record<string, string>> = {
  disponibilidad_para_comenzar: {
    "Todavía no tengo una fecha definida.": "Estoy explorando opciones por ahora",
  },
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

/** Lee el grupo y todas las definiciones de propiedades de contacto, en vivo. */
async function loadSchema(token: string) {
  const groups = await hs("/crm/v3/properties/contacts/groups", token);
  const list = Array.isArray(groups?.results) ? groups.results : [];
  const group =
    list.find((item: any) => norm(item.label) === norm(GROUP_LABEL)) ||
    list.find((item: any) => norm(item.label).includes("admision")) ||
    null;

  const all = await hs("/crm/v3/properties/contacts", token);
  const properties = new Map<string, any>(
    (Array.isArray(all?.results) ? all.results : []).map((property: any) => [
      property.name,
      property,
    ])
  );

  return { groupName: group?.name || "", groupLabel: group?.label || "", properties };
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

type Entry = {
  property: string;
  label: string;
  value: string;
  result: { property: string; label: string; status: string; value: string; error: string };
};

/** Construye el payload propiedad a propiedad, con su resultado individual. */
function buildEntries(submission: any, schema: { groupName: string; properties: Map<string, any> }) {
  const entries: Entry[] = [];
  const results: Entry["result"][] = [];
  const warnings: string[] = [];
  const notes: string[] = [];

  const email = String(submission?.email || "").trim().toLowerCase();
  if (!email) throw new Error("La solicitud no tiene correo electrónico.");

  const add = (property: string, label: string, value: string) => {
    const result = { property, label, status: "pending", value: value.slice(0, 300), error: "" };
    entries.push({ property, label, value, result });
    results.push(result);
    return result;
  };

  const skip = (property: string, label: string, status: string, error: string) => {
    const result = { property, label, status, value: "", error };
    results.push(result);
    return result;
  };

  // Email estándar: identificador del contacto, siempre presente.
  add("email", "Correo (estándar)", email);

  STANDARD.forEach(({ field, property, label }) => {
    const text = String(submission?.[field] ?? "").trim();
    if (!text) return;
    add(property, label, text.slice(0, 250));
  });

  CUSTOM.forEach(({ field, property, label }) => {
    const raw = submission?.[field];
    const values: string[] = (Array.isArray(raw) ? raw : raw ? [raw] : [])
      .map((value: unknown) => String(value ?? "").trim())
      .filter(Boolean);
    if (!values.length) {
      skip(property, label, "skipped", "sin respuesta");
      return;
    }

    const prop = schema.properties.get(property);
    if (!prop) {
      skip(property, label, "missing", "la propiedad no existe en HubSpot");
      notes.push(`${property}: la propiedad no existe en HubSpot, el dato queda en Base44`);
      return;
    }
    if (prop.groupName && schema.groupName && prop.groupName !== schema.groupName) {
      notes.push(`${property}: está en el grupo "${prop.groupName}"`);
    }

    if (prop.type === "enumeration" || prop.type === "checkbox") {
      const isMulti = prop.type === "checkbox" || prop.fieldType === "checkbox";
      if (MULTI.has(property) && !isMulti) {
        skip(property, label, "rejected", 'debe ser "Multiple checkboxes" en HubSpot');
        warnings.push(`${property}: es de selección única y debe ser "Multiple checkboxes"; no se ha enviado`);
        return;
      }

      const fallback = FALLBACKS[property] || {};
      const resolved: string[] = [];
      const unmatched: string[] = [];
      values.forEach((value) => {
        const target = fallback[value] || value;
        const match = optionValue(prop, target);
        if (match) resolved.push(match);
        else unmatched.push(value);
      });

      if (unmatched.length) {
        skip(property, label, "unmatched", `sin opción equivalente para "${unmatched.join(", ")}"`);
        warnings.push(`${property}: sin opción equivalente para "${unmatched.join(", ")}"`);
        return;
      }
      if (!resolved.length) {
        skip(property, label, "unmatched", "sin opción equivalente");
        return;
      }

      if (isMulti) {
        add(property, label, [...new Set(resolved)].join(";"));
        return;
      }
      if (resolved.length > 1) {
        skip(property, label, "rejected", "es de selección única y llegaron varios valores");
        warnings.push(`${property}: es de selección única y se han enviado varios valores`);
        return;
      }
      add(property, label, resolved[0]);
      return;
    }

    if (prop.type === "number") {
      const numeric = Number(values[0].replace(/[^\d.,-]/g, "").replace(",", "."));
      if (!Number.isFinite(numeric)) {
        skip(property, label, "rejected", "es numérica y el valor no lo es");
        warnings.push(`${property}: es numérica y el valor no lo es`);
        return;
      }
      add(property, label, String(numeric));
      return;
    }

    const joiner = prop.fieldType === "textarea" ? "\n" : ", ";
    const text = values.join(joiner).slice(0, 65000);
    add(property, label, URL_PROPS.has(property) ? withProtocol(text) : text);
  });

  return { email, entries, results, warnings, notes };
}

async function findContact(token: string, email: string) {
  const found = await hs("/crm/v3/objects/contacts/search", token, {
    method: "POST",
    body: JSON.stringify({
      filterGroups: [
        { filters: [{ propertyName: "email", operator: "EQ", value: email.toLowerCase() }] },
      ],
      properties: ["email"],
      limit: 1,
    }),
  });
  return found?.results?.[0] || null;
}

/** Localiza el contacto por email o lo crea con el email como único dato. */
async function ensureContact(token: string, email: string) {
  const existing = await findContact(token, email);
  if (existing?.id) return existing.id;

  try {
    const created = await hs("/crm/v3/objects/contacts", token, {
      method: "POST",
      body: JSON.stringify({ properties: { email } }),
    });
    if (created?.id) return created.id;
  } catch (error: any) {
    if (error?.status !== 409) throw error;
  }

  const retry = await findContact(token, email);
  if (retry?.id) return retry.id;
  throw new Error("HubSpot no devolvió el contacto.");
}

const errorText = (error: any) => {
  const body = error?.body;
  const message = body?.message || error?.message || "error desconocido";
  return String(message).slice(0, 300);
};

/**
 * Escribe las propiedades. Primero en un solo PATCH; si HubSpot lo rechaza,
 * se reintenta propiedad por propiedad para conservar las válidas.
 */
async function patchProperties(token: string, contactId: string, entries: Entry[]) {
  if (!entries.length) return;

  const payload = Object.fromEntries(entries.map((entry) => [entry.property, entry.value]));
  try {
    await hs(`/crm/v3/objects/contacts/${contactId}`, token, {
      method: "PATCH",
      body: JSON.stringify({ properties: payload }),
    });
    entries.forEach((entry) => {
      entry.result.status = "ok";
    });
    return;
  } catch (error: any) {
    if (error?.status !== 400) throw error;
  }

  for (const entry of entries) {
    try {
      await hs(`/crm/v3/objects/contacts/${contactId}`, token, {
        method: "PATCH",
        body: JSON.stringify({ properties: { [entry.property]: entry.value } }),
      });
      entry.result.status = "ok";
    } catch (error: any) {
      entry.result.status = "rejected";
      entry.result.error = errorText(error);
    }
  }
}

const sameValue = (entry: Entry, got: unknown) => {
  if (entry.value.includes(";")) {
    const sent = entry.value.split(";").map(norm).sort().join("|");
    const read = String(got ?? "").split(";").map(norm).sort().join("|");
    return sent === read;
  }
  return norm(got) === norm(entry.value);
};

/** Relee el contacto y compara propiedad a propiedad con lo enviado. */
async function verify(token: string, contactId: string, entries: Entry[]) {
  const written = entries.filter((entry) => entry.result.status === "ok");
  if (!written.length) return [];
  const names = written.map((entry) => entry.property);
  const contact = await hs(
    `/crm/v3/objects/contacts/${contactId}?properties=${encodeURIComponent(names.join(","))}`,
    token
  );
  const got = contact?.properties || {};
  const mismatched = written.filter((entry) => !sameValue(entry, got[entry.property]));
  mismatched.forEach((entry) => {
    entry.result.status = "mismatch";
    entry.result.error = `HubSpot devuelve "${String(got[entry.property] ?? "").slice(0, 200)}"`;
  });
  return mismatched.map((entry) => entry.property);
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
          types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 202 }],
        },
      ],
    }),
  });
}

function noteBody(submission: any) {
  const lines = [
    "Solicitud de admisión · Cabaña Full Access",
    `Fecha: ${submission.submitted_at || new Date().toISOString()}`,
    `ID de admisión: ${submission.submission_id || submission.id || ""}`,
    `Nombre: ${submission.first_name || "—"} ${submission.last_name || ""}`.trim(),
    `Correo: ${submission.email || "—"}`,
    `Teléfono: ${submission.phone || "—"}`,
    `País: ${submission.country || "—"}`,
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
 * Sincroniza la solicitud: propiedades del contacto y (una sola vez) la nota.
 * `options.note === false` actualiza solo las propiedades, sin tocar la nota.
 */
export async function syncAdmissionToHubspot(
  base44: any,
  submission: any,
  options: { note?: boolean } = {}
) {
  const { accessToken } = await base44.asServiceRole.connectors.getConnection("hubspot");
  if (!accessToken) throw new Error("HubSpot no está conectado.");

  const schema = await loadSchema(accessToken);
  const { email, entries, results, warnings, notes } = buildEntries(submission, schema);

  const contactId = await ensureContact(accessToken, email);
  await patchProperties(accessToken, contactId, entries);

  try {
    const mismatched = await verify(accessToken, contactId, entries);
    if (mismatched.length) notes.push(`Lectura distinta en HubSpot: ${mismatched.join(", ")}`);
  } catch {
    notes.push("No se pudo releer el contacto en HubSpot");
  }

  let noteCreated = Boolean(submission?.note_created);
  if (options.note !== false && !noteCreated) {
    try {
      await createNote(accessToken, contactId, noteBody(submission));
      noteCreated = true;
    } catch (error: any) {
      notes.push(
        error?.status === 403
          ? "Nota de HubSpot omitida: falta el permiso de notas en el token"
          : "Nota de HubSpot omitida"
      );
    }
  }

  const written = results.filter((result) => result.status === "ok");
  const rejected = results.filter(
    (result) => result.status === "rejected" || result.status === "mismatch"
  );

  const status = !written.length ? "error" : rejected.length ? "parcial" : "sincronizado";

  return {
    contactId,
    status,
    results,
    warnings: rejected.map((result) =>
      `${result.property}: ${result.error || "rechazada por HubSpot"}`.slice(0, 200)
    ).concat(warnings).slice(0, 20),
    notes,
    noteCreated,
  };
}