import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";
import { parseAnswers, validateStep } from "../../shared/admissionSchema.ts";

/**
 * Guarda el borrador de cada pantalla. No sincroniza con HubSpot:
 * el envío completo se hace una sola vez en `completeAdmission`.
 */

const MAX_PER_HOUR = 6;

const stamp = (text: string) => `${new Date().toISOString()} · ${text}`;
const clean = (value: unknown, max = 300) => String(value ?? "").trim().slice(0, max);

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    // Campo trampa: solo los bots lo rellenan.
    if (String(body?.company || "").trim()) {
      return Response.json({ error: "No hemos podido procesar la solicitud." }, { status: 400 });
    }

    const step = Number(body?.step);
    if (!(step >= 1 && step <= 8)) {
      return Response.json({ error: "Paso no válido." }, { status: 400 });
    }

    const answers = parseAnswers(body?.values || {});
    const errors = validateStep(step, answers);
    if (Object.keys(errors).length) {
      return Response.json({ error: "Revisa los datos del formulario.", errors }, { status: 400 });
    }

    const submissionId = clean(body?.submission_id, 80);
    let record: any = null;

    if (submissionId) {
      const found = await base44.asServiceRole.entities.AdmissionSubmission.filter({
        submission_id: submissionId,
      });
      record = found?.[0] || null;
    }
    // Cada envío crea su propio registro: nunca se reutiliza el de otra visita.
    if (!record && step !== 1) {
      return Response.json(
        { error: "No encontramos tus datos. Vuelve al primer paso." },
        { status: 404 }
      );
    }

    if (!record) {
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const recent = await base44.asServiceRole.entities.AdmissionSubmission.filter({
        email: answers.email,
        created_date: { $gte: hourAgo },
      });
      if ((recent || []).length >= MAX_PER_HOUR) {
        return Response.json(
          { error: "Hemos recibido varias solicitudes con este correo. Escríbenos y lo revisamos." },
          { status: 429 }
        );
      }
    }

    // Solo se escriben los campos con valor: un paso nunca borra lo anterior.
    const patch: Record<string, unknown> = {};
    Object.entries(answers).forEach(([key, value]) => {
      if (Array.isArray(value) ? value.length : String(value ?? "").trim()) patch[key] = value;
    });

    const activity = [...(record?.activity || []), stamp(`Paso ${step} guardado`)].slice(-30);

    let submission: any;
    if (record) {
      submission = await base44.asServiceRole.entities.AdmissionSubmission.update(record.id, {
        ...patch,
        activity,
      });
    } else {
      submission = await base44.asServiceRole.entities.AdmissionSubmission.create({
        ...patch,
        submission_id: crypto.randomUUID(),
        idempotency_key: clean(body?.idempotency_key, 80) || crypto.randomUUID(),
        hubspot_sync_status: "pendiente",
        hubspot_attempts: 0,
        source: clean(body?.source, 200) || "direct",
        source_url: clean(body?.source_url, 500),
        referrer: clean(body?.referrer, 500),
        utm_source: clean(body?.utm_source, 200),
        utm_medium: clean(body?.utm_medium, 200),
        utm_campaign: clean(body?.utm_campaign, 200),
        utm_content: clean(body?.utm_content, 200),
        utm_term: clean(body?.utm_term, 200),
        payload_json: JSON.stringify(answers).slice(0, 60000),
        activity: [...activity, stamp("Solicitud iniciada")],
      });
    }

    return Response.json({
      submission: {
        id: submission.id,
        submission_id: submission.submission_id,
        first_name: submission.first_name || "",
        email: submission.email || "",
      },
    });
  } catch (error: any) {
    return Response.json(
      { error: "No hemos podido guardar tus datos. Inténtalo de nuevo." },
      { status: 500 }
    );
  }
}