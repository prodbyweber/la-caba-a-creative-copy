import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";
import { syncApplicationToHubspot } from "../../shared/fullAccessHubspot.ts";

const ALLOWED = [
  "artist_name",
  "contact_name",
  "email",
  "instagram",
  "spotify",
  "youtube",
  "genres",
  "references",
  "identity",
  "stage",
  "released",
  "has_demos",
  "preparing_release",
  "missing",
  "wants",
  "goals_90",
  "catalog_vision",
  "recognition",
  "expectations",
  "links",
  "context",
  "file_uris",
  "file_names",
  "vsl_progress",
  "source",
];

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    const email = String(body?.email || "").trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Necesitamos un correo válido." }, { status: 400 });
    }

    const payload = { status: "nueva", email, hubspot_sync_status: "pendiente" };
    ALLOWED.forEach((key) => {
      const value = body?.[key];
      if (value === undefined || value === null || value === "") return;
      payload[key] = typeof value === "string" ? value.slice(0, 8000) : value;
    });

    const created = await base44.asServiceRole.entities.FullAccessApplication.create(payload);

    let application = created;
    try {
      const { contactId } = await syncApplicationToHubspot(base44, created);
      application = await base44.asServiceRole.entities.FullAccessApplication.update(created.id, {
        hubspot_contact_id: contactId,
        hubspot_sync_status: "sincronizado",
        hubspot_sync_error: "",
      });
    } catch (syncError) {
      application = await base44.asServiceRole.entities.FullAccessApplication.update(created.id, {
        hubspot_sync_status: "error",
        hubspot_sync_error: String(syncError?.message || syncError).slice(0, 900),
      });
    }

    return Response.json({ application });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}