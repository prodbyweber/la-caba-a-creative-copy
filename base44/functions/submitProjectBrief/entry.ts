import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";
import { syncApplicationToHubspot } from "../../shared/fullAccessHubspot.ts";

const ALLOWED = [
  "first_name",
  "last_name",
  "phone",
  "moment",
  "moment_detail",
  "goals",
  "priority_goal",
  "music_link",
  "release_format",
  "release_window",
  "start_window",
  "modality",
  "payment_preference",
  "artist_name",
  "contact_name",
  "instagram",
  "genres",
  "references",
  "links",
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

    const firstName = String(body?.first_name || "").trim();
    if (!firstName) {
      return Response.json({ error: "Necesitamos tu nombre." }, { status: 400 });
    }

    // Envío idempotente: la misma clave devuelve el registro ya guardado.
    const requestKey = String(body?.request_key || "").trim();
    if (requestKey) {
      const existing = await base44.asServiceRole.entities.FullAccessApplication.filter({
        request_key: requestKey,
      });
      if (existing?.[0]) {
        return Response.json({ application: existing[0], duplicate: true });
      }
    }

    const payload: Record<string, unknown> = {
      status: "nueva",
      email,
      hubspot_sync_status: "pendiente",
      request_key: requestKey || crypto.randomUUID(),
      contact_name: `${firstName} ${String(body?.last_name || "").trim()}`.trim(),
    };

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
    } catch (syncError: any) {
      application = await base44.asServiceRole.entities.FullAccessApplication.update(created.id, {
        hubspot_sync_status: "error",
        hubspot_sync_error: String(syncError?.message || syncError).slice(0, 900),
      });
    }

    return Response.json({ application });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}