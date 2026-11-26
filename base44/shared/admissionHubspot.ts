/**
 * Sincronización de solicitudes de admisión con HubSpot.
 * HubSpot es el CRM principal: aquí solo se crea o actualiza el contacto con
 * las propiedades que ya existen en el grupo "Cabaña Creative admisión".
 * Nunca se crean propiedades nuevas.
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
];

const norm = (value: unknown) =>
  String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.;]+$/, "");

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
    const error: any = new Error(`HubSpot ${res.status}: ${data?.message || raw.slice(0, 200)}`);
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
  const props: Record<string, string> = { email: submission.email };

  if (submission.first_name) props.firstname = submission.first_name;
  if (submission.last_name) props.lastname = submission.last_name;
  if (submission.phone) props.phone = submission.phone;

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
      const resolved = values.map((value) => optionValue(prop, value)).filter(Boolean);
      const unmatched = values.filter((value) => !optionValue(prop, value));
      if (unmatched.length) warnings.push(`${name}: sin opción equivalente para "${unmatched.join(", ")}"`);
      if (!resolved.length) return;
      if (prop.type === "enumeration") {
        if (resolved.length > 1) {
          warnings.push(`${name}: es de selección única, se envía solo "${resolved[0]}"`);
        }
        props[name] = resolved[0];
      } else {
        props[name] = resolved.join(";");
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

    props[name] = values.join(", ").slice(0, 65000);
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

  const { props, warnings } = buildProperties(submission, byName);
  const existing = await findContact(accessToken, submission.email);

  let contact: any;
  if (existing) {
    contact = await hs(`/crm/v3/objects/contacts/${existing.id}`, accessToken, {
      method: "PATCH",
      body: JSON.stringify({ properties: props }),
    });
  } else {
    try {
      contact = await hs("/crm/v3/objects/contacts", accessToken, {
        method: "POST",
        body: JSON.stringify({ properties: props }),
      });
    } catch (error: any) {
      if (error?.status !== 409) throw error;
      const retry = await findContact(accessToken, submission.email);
      if (!retry) throw error;
      contact = await hs(`/crm/v3/objects/contacts/${retry.id}`, accessToken, {
        method: "PATCH",
        body: JSON.stringify({ properties: props }),
      });
    }
  }

  return {
    contactId: contact?.id || existing?.id || "",
    warnings,
  };
}