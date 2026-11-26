import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";
import { syncAdmissionToHubspot } from "../../shared/admissionHubspot.ts";

const stamp = (text: string) => `${new Date().toISOString()} · ${text}`;

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    if (!body?.submission_id) {
      return Response.json({ error: "submission_id is required" }, { status: 400 });
    }

    const record = await base44.asServiceRole.entities.AdmissionSubmission.get(
      body.submission_id
    ).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
    if (!record) return Response.json({ error: "Not found" }, { status: 404 });

    const attempts = Number(record.hubspot_attempts || 0) + 1;

    try {
      const { contactId, warnings, notes, status } = await syncAdmissionToHubspot(base44, record);
      const updated = await base44.asServiceRole.entities.AdmissionSubmission.update(record.id, {
        hubspot_contact_id: contactId,
        hubspot_sync_status: status,
        hubspot_sync_error: "",
        hubspot_sync_warning: [...(notes || []), ...(warnings || [])].join(" · ").slice(0, 900),
        sync_warnings: (warnings || []).join(" · ").slice(0, 900),
        hubspot_last_sync: new Date().toISOString(),
        hubspot_attempts: attempts,
        activity: [
          ...(record.activity || []),
          stamp(`Reintento correcto · contacto ${contactId}`),
        ],
      });
      return Response.json({ submission: updated });
    } catch (error: any) {
      const message = String(error?.message || error).slice(0, 900);
      await base44.asServiceRole.entities.AdmissionSubmission.update(record.id, {
        hubspot_sync_status: "error",
        hubspot_sync_error: message,
        hubspot_last_sync: new Date().toISOString(),
        hubspot_attempts: attempts,
        activity: [...(record.activity || []), stamp(`Reintento fallido: ${message}`)],
      });
      return Response.json({ error: message }, { status: 502 });
    }
  } catch (error: any) {
    return Response.json({ error: "No se pudo reintentar la sincronización." }, { status: 500 });
  }
}