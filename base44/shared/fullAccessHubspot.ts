/**
 * Sincronización de solicitudes de Cabaña Full Access con HubSpot.
 * HubSpot es el CRM principal: aquí solo se crea o actualiza el contacto.
 */

const HUBSPOT = "https://api.hubapi.com";

const FIELD_MAP = [
  ["artist_name", "fa_artist_name"],
  ["instagram", "fa_instagram"],
  ["spotify", "fa_spotify"],
  ["youtube", "fa_youtube"],
  ["genres", "fa_genres"],
  ["references", "fa_references"],
  ["identity", "fa_project_description"],
  ["stage", "fa_project_stage"],
  ["goals_90", "fa_goals_90"],
  ["links", "fa_demo_links"],
  ["context", "fa_context"],
];

export function buildBriefing(app) {
  const rows = [
    ["Nombre artístico", app.artist_name],
    ["Contacto", app.contact_name],
    ["Email", app.email],
    ["Instagram", app.instagram],
    ["Spotify", app.spotify],
    ["YouTube / SoundCloud", app.youtube],
    ["Géneros", app.genres],
    ["Referencias", app.references],
    ["Identidad musical", app.identity],
    ["Punto del proyecto", app.stage],
    ["Canciones publicadas", app.released],
    ["Demos", app.has_demos],
    ["Preparando lanzamiento", app.preparing_release],
    ["Qué le falta", app.missing],
    ["Qué quiere desarrollar", app.wants],
    ["Objetivos 90 días", app.goals_90],
    ["Catálogo que quiere construir", app.catalog_vision],
    ["Qué quiere que se reconozca", app.recognition],
    ["Qué espera de la colaboración", app.expectations],
    ["Enlaces musicales", app.links],
    ["Contexto adicional", app.context],
    ["Archivos adjuntos", (app.file_names || []).join(", ")],
    ["Origen", app.source],
    ["Fecha de solicitud", app.created_date],
    ["Estado de admisión", app.status],
    ["Reunión", app.meeting_start],
    ["Enlace de videollamada", app.meeting_link],
    ["VSL visto", app.vsl_progress != null ? `${Math.round(app.vsl_progress * 100)}%` : ""],
  ];
  return rows
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");
}

async function hs(path, token, options = {}) {
  const res = await fetch(`${HUBSPOT}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    signal: AbortSignal.timeout(12000),
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`HubSpot ${res.status}: ${data?.message || text.slice(0, 200)}`);
  }
  return data;
}

async function availableCustomProps(token) {
  try {
    const data = await hs("/crm/v3/properties/contacts", token);
    return new Set((data?.results || []).map((p) => p.name));
  } catch {
    return new Set();
  }
}

function splitName(fullName) {
  const clean = (fullName || "").trim();
  if (!clean) return { firstname: "", lastname: "" };
  const parts = clean.split(/\s+/);
  return { firstname: parts[0], lastname: parts.slice(1).join(" ") };
}

export async function syncApplicationToHubspot(base44, app) {
  if (!app?.email) throw new Error("La solicitud no tiene email.");

  const { accessToken } = await base44.asServiceRole.connectors.getConnection("hubspot");
  if (!accessToken) throw new Error("HubSpot no está conectado.");

  const existing = await hs("/crm/v3/objects/contacts/search", accessToken, {
    method: "POST",
    body: JSON.stringify({
      filterGroups: [{ filters: [{ propertyName: "email", operator: "EQ", value: app.email }] }],
      properties: ["email", "firstname", "lastname"],
      limit: 1,
    }),
  });

  const found = existing?.results?.[0];
  const { firstname, lastname } = splitName(app.contact_name);
  const props = {
    email: app.email,
    hs_content_membership_notes: buildBriefing(app),
  };
  if (firstname) props.firstname = firstname;
  if (lastname) props.lastname = lastname;
  if (app.spotify || app.instagram) props.website = app.spotify || app.instagram;

  const custom = await availableCustomProps(accessToken);
  FIELD_MAP.forEach(([source, target]) => {
    if (custom.has(target) && app[source]) props[target] = app[source];
  });
  if (custom.has("fa_application_date") && app.created_date) props.fa_application_date = app.created_date;
  if (custom.has("fa_admission_status") && app.status) props.fa_admission_status = app.status;
  if (custom.has("fa_meeting_datetime") && app.meeting_start) props.fa_meeting_datetime = app.meeting_start;
  if (custom.has("fa_meeting_link") && app.meeting_link) props.fa_meeting_link = app.meeting_link;

  const contact = found
    ? await hs(`/crm/v3/objects/contacts/${found.id}`, accessToken, {
        method: "PATCH",
        body: JSON.stringify({ properties: props }),
      })
    : await hs("/crm/v3/objects/contacts", accessToken, {
        method: "POST",
        body: JSON.stringify({ properties: props }),
      });

  return { contactId: contact?.id || found?.id || "" };
}