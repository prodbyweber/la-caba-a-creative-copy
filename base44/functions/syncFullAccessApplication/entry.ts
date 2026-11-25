import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";
import { syncApplicationToHubspot } from "../../shared/fullAccessHubspot.ts";

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    if (!body?.application_id) {
      return Response.json({ error: "application_id is required" }, { status: 400 });
    }

    const application = await base44.asServiceRole.entities.FullAccessApplication.get(
      body.application_id
    ).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
    if (!application) return Response.json({ error: "Not found" }, { status: 404 });

    try {
      const { contactId } = await syncApplicationToHubspot(base44, application);
      const updated = await base44.asServiceRole.entities.FullAccessApplication.update(application.id, {
        hubspot_contact_id: contactId,
        hubspot_sync_status: "sincronizado",
        hubspot_sync_error: "",
      });
      return Response.json({ application: updated });
    } catch (error) {
      await base44.asServiceRole.entities.FullAccessApplication.update(application.id, {
        hubspot_sync_status: "error",
        hubspot_sync_error: String(error?.message || error).slice(0, 900),
      });
      return Response.json({ error: String(error?.message || error) }, { status: 502 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}