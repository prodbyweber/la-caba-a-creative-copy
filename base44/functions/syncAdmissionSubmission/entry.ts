import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";
import { syncAdmissionToHubspot } from "../../shared/admissionHubspot.ts";

/**
 * Resincronización de propiedades (sin crear nota nueva).
 * Acepta `{ submission_id }` o `{ ids: [...] }` para varias filas a la vez.
 */

const stamp = (text: string) => `${new Date().toISOString()} · ${text}`;

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const ids: string[] = Array.isArray(body?.ids)
      ? body.ids.filter((id: unknown) => typeof id === "string").slice(0, 50)
      : body?.submission_id
      ? [String(body.submission_id)]
      : [];

    if (!ids.length) {
      return Response.json({ error: "submission_id or ids is required" }, { status: 400 });
    }

    const done: any[] = [];
    const failed: any[] = [];

    for (const id of ids) {
      const record = await base44.asServiceRole.entities.AdmissionSubmission.get(id).catch((e) =>
        e.status === 404 ? null : Promise.reject(e)
      );
      if (!record) {
        failed.push({ id, error: "Not found" });
        continue;
      }

      const attempts = Number(record.hubspot_attempts || 0) + 1;

      try {
        const { contactId, status, results, warnings, notes, noteCreated } =
          await syncAdmissionToHubspot(base44, record, { note: false });

        const updated = await base44.asServiceRole.entities.AdmissionSubmission.update(record.id, {
          hubspot_contact_id: contactId,
          hubspot_sync_status: status,
          hubspot_sync_error: "",
          hubspot_sync_warning: [...(notes || []), ...(warnings || [])].join(" · ").slice(0, 900),
          sync_warnings: (warnings || []).join(" · ").slice(0, 900),
          hubspot_property_results: results,
          note_created: noteCreated,
          hubspot_last_sync: new Date().toISOString(),
          hubspot_attempts: attempts,
          activity: [
            ...(record.activity || []),
            stamp(`Propiedades resincronizadas · contacto ${contactId} · ${status}`),
          ].slice(-30),
        });

        done.push({
          id: record.id,
          contactId,
          status,
          results,
          warnings,
          notes,
        });
      } catch (error: any) {
        const message = String(error?.message || error).slice(0, 900);
        await base44.asServiceRole.entities.AdmissionSubmission.update(record.id, {
          hubspot_sync_status: "error",
          hubspot_sync_error: message,
          hubspot_last_sync: new Date().toISOString(),
          hubspot_attempts: attempts,
          activity: [
            ...(record.activity || []),
            stamp(`Error al resincronizar propiedades: ${message}`),
          ].slice(-30),
        });
        failed.push({ id: record.id, error: message });
      }
    }

    return Response.json({ done, failed });
  } catch (error: any) {
    return Response.json({ error: "No se pudo resincronizar con HubSpot." }, { status: 500 });
  }
}