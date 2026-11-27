import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";
import { parseAnswers, qualify, validateStep } from "../../shared/admissionSchema.ts";
import { syncAdmissionToHubspot } from "../../shared/admissionHubspot.ts";

/**
 * Envío final de la admisión: guarda la solicitud completa en Base44 y,
 * solo después, la sincroniza con HubSpot. Si HubSpot falla, la solicitud
 * queda guardada y el visitante puede continuar.
 */

const STEPS = 8;

const stamp = (text: string) => `${new Date().toISOString()} · ${text}`;
const clean = (value: unknown, max = 300) => String(value ?? "").trim().slice(0, max);

function summarize(record: any) {
  return {
    id: record.id,
    submission_id: record.submission_id,
    first_name: record.first_name || "",
    last_name: record.last_name || "",
    email: record.email || "",
    phone: record.phone || "",
    qualification_status: record.qualification_status || "",
    hubspot_sync_status: record.hubspot_sync_status || "pendiente",
    submitted_at: record.submitted_at || "",
    booking_status: record.booking_status || "",
  };
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    if (String(body?.company || "").trim()) {
      return Response.json({ error: "No hemos podido procesar la solicitud." }, { status: 400 });
    }

    const answers = parseAnswers(body?.values || {});
    const errors: Record<string, string> = {};
    for (let step = 1; step <= STEPS; step += 1) Object.assign(errors, validateStep(step, answers));
    if (Object.keys(errors).length) {
      return Response.json({ error: "Revisa tus datos.", errors }, { status: 400 });
    }

    const submissionId = clean(body?.submission_id, 80);
    let record: any = null;

    if (submissionId) {
      const found = await base44.asServiceRole.entities.AdmissionSubmission.filter({
        submission_id: submissionId,
      });
      record = found?.[0] || null;
    }
    if (!record && answers.email) {
      const page = await base44.asServiceRole.entities.AdmissionSubmission.filter(
        { email: answers.email, submitted_at: { $exists: false } },
        { sort: "-created_date", limit: 1 }
      );
      record = page?.items?.[0] || null;
    }
    if (!record) {
      return Response.json(
        { error: "No encontramos tus datos. Vuelve al primer paso." },
        { status: 404 }
      );
    }

    // Idempotencia: un doble clic devuelve la solicitud ya enviada.
    if (record.submitted_at) {
      return Response.json({ submission: summarize(record), duplicate: true });
    }

    const qualification = qualify(answers.budget);

    let submission = await base44.asServiceRole.entities.AdmissionSubmission.update(record.id, {
      ...answers,
      qualification_status: qualification,
      submitted_at: new Date().toISOString(),
      source: clean(body?.source, 200) || record.source || "direct",
      source_url: clean(body?.source_url, 500) || record.source_url || "",
      payload_json: JSON.stringify(answers).slice(0, 60000),
      activity: [
        ...(record.activity || []),
        stamp(`Solicitud enviada · ${qualification}`),
      ].slice(-30),
    });

    const attempts = Number(submission.hubspot_attempts || 0) + 1;

    try {
      const { contactId, warnings, notes, status, results, noteCreated } =
        await syncAdmissionToHubspot(base44, submission);
      submission = await base44.asServiceRole.entities.AdmissionSubmission.update(submission.id, {
        hubspot_contact_id: contactId,
        hubspot_sync_status: status,
        hubspot_sync_error: "",
        hubspot_sync_warning: [...notes, ...warnings].join(" · ").slice(0, 900),
        sync_warnings: warnings.join(" · ").slice(0, 900),
        hubspot_property_results: results,
        note_created: noteCreated,
        hubspot_last_sync: new Date().toISOString(),
        hubspot_attempts: attempts,
        activity: [
          ...(submission.activity || []),
          stamp(
            `Sincronizado con HubSpot · contacto ${contactId}${warnings.length ? " · parcial" : ""}`
          ),
        ].slice(-30),
      });
      return Response.json({ submission: summarize(submission) });
    } catch (syncError: any) {
      const message = String(syncError?.message || syncError).slice(0, 900);
      submission = await base44.asServiceRole.entities.AdmissionSubmission.update(submission.id, {
        hubspot_sync_status: "error",
        hubspot_sync_error: message,
        hubspot_last_sync: new Date().toISOString(),
        hubspot_attempts: attempts,
        activity: [
          ...(submission.activity || []),
          stamp(`Error de sincronización: ${message}`),
        ].slice(-30),
      });
      // La solicitud ya está guardada: el visitante continúa su proceso.
      return Response.json({ submission: summarize(submission), hubspot_error: message });
    }
  } catch (error: any) {
    return Response.json(
      { error: "No hemos podido guardar tu solicitud. Inténtalo de nuevo." },
      { status: 500 }
    );
  }
}