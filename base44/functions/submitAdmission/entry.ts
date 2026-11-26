import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";
import { qualify, validateAdmission } from "../../shared/admissionSchema.ts";
import { syncAdmissionToHubspot } from "../../shared/admissionHubspot.ts";

const MAX_PER_HOUR = 5;

const stamp = (text: string) => `${new Date().toISOString()} · ${text}`;

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    // Campo trampa: solo los bots lo rellenan.
    if (String(body?.company || "").trim()) {
      return Response.json({ error: "No hemos podido procesar la solicitud." }, { status: 400 });
    }

    const { data, errors } = validateAdmission(body);
    if (Object.keys(errors).length) {
      return Response.json({ error: "Faltan datos obligatorios.", errors }, { status: 400 });
    }

    const idempotencyKey = String(body?.idempotency_key || "").slice(0, 80);
    if (idempotencyKey) {
      const existing = await base44.asServiceRole.entities.AdmissionSubmission.filter({
        idempotency_key: idempotencyKey,
      });
      if (existing?.[0]) {
        return Response.json({ submission: summarize(existing[0]), duplicate: true });
      }
    }

    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const recent = await base44.asServiceRole.entities.AdmissionSubmission.filter({
      email: data.email,
      created_date: { $gte: hourAgo },
    });
    if ((recent || []).length >= MAX_PER_HOUR) {
      return Response.json(
        { error: "Hemos recibido varias solicitudes con este correo. Escríbenos y lo revisamos." },
        { status: 429 }
      );
    }

    const qualification = qualify(data.availability, data.budget);
    const submissionId = crypto.randomUUID();

    const record = await base44.asServiceRole.entities.AdmissionSubmission.create({
      ...data,
      submission_id: submissionId,
      idempotency_key: idempotencyKey || submissionId,
      qualification_status: qualification,
      hubspot_sync_status: "pendiente",
      hubspot_attempts: 0,
      source: String(body?.source || "admision").slice(0, 200),
      utm_source: String(body?.utm_source || "").slice(0, 200),
      utm_medium: String(body?.utm_medium || "").slice(0, 200),
      utm_campaign: String(body?.utm_campaign || "").slice(0, 200),
      utm_content: String(body?.utm_content || "").slice(0, 200),
      utm_term: String(body?.utm_term || "").slice(0, 200),
      referrer: String(body?.referrer || "").slice(0, 500),
      payload_json: JSON.stringify(body).slice(0, 60000),
      activity: [stamp(`Solicitud recibida · ${qualification}`)],
    });

    let submission = record;
    try {
      const { contactId, warnings } = await syncAdmissionToHubspot(base44, record);
      submission = await base44.asServiceRole.entities.AdmissionSubmission.update(record.id, {
        hubspot_contact_id: contactId,
        hubspot_sync_status: "sincronizado",
        hubspot_sync_error: "",
        hubspot_sync_warning: (warnings || []).join(" · ").slice(0, 900),
        hubspot_last_sync: new Date().toISOString(),
        hubspot_attempts: 1,
        activity: [
          ...(record.activity || []),
          stamp(`Sincronizado con HubSpot · contacto ${contactId}`),
        ],
      });
    } catch (syncError: any) {
      const message = String(syncError?.message || syncError).slice(0, 900);
      submission = await base44.asServiceRole.entities.AdmissionSubmission.update(record.id, {
        hubspot_sync_status: "error",
        hubspot_sync_error: message,
        hubspot_last_sync: new Date().toISOString(),
        hubspot_attempts: 1,
        activity: [...(record.activity || []), stamp(`Error de sincronización: ${message}`)],
      });
    }

    return Response.json({ submission: summarize(submission) });
  } catch (error: any) {
    return Response.json({ error: "No hemos podido guardar la solicitud." }, { status: 500 });
  }
}

function summarize(record: any) {
  return {
    id: record.id,
    submission_id: record.submission_id,
    first_name: record.first_name,
    last_name: record.last_name,
    email: record.email,
    qualification_status: record.qualification_status,
    hubspot_sync_status: record.hubspot_sync_status,
    created_date: record.created_date,
  };
}