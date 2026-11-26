import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";
import { syncAdmissionToHubspot } from "../../shared/admissionHubspot.ts";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_PER_HOUR = 6;

const STAGES = [
  "Estoy comenzando y quiero encontrar mi identidad artística.",
  "Tengo ideas y demos, pero necesito convertirlas en canciones.",
  "Ya he publicado música y quiero evolucionar mi sonido.",
  "Estoy desarrollando un proyecto profesional y quiero dar el siguiente paso.",
  "Tengo un catálogo y experiencia, pero necesito una dirección más clara.",
];

const MODALITIES = [
  "Presencial: prefiero realizar las sesiones de grabación en persona.",
  "Online / Remoto: prefiero trabajar a distancia.",
  "Híbrido: desarrollar el proyecto online y realizar las grabaciones de voces presencialmente.",
  "Estoy abierto/a a valorarlo: quiero conocer las posibilidades según mi ubicación y el proyecto.",
];

const RELEASES = [
  "Un single.",
  "Varios singles.",
  "Un EP.",
  "Un álbum.",
  "Todavía estoy definiendo mi próximo proyecto.",
];

const BUDGETS = [
  "Puedo asumir una inversión desde 2.000 €.",
  "Me interesa, pero necesitaría valorar un pago fraccionado.",
  "Mi presupuesto actual está entre los 700 € a 1200€",
  "Ahora mismo no cuento con presupuesto para invertir.",
];

const NO_BUDGET = "Ahora mismo no cuento con presupuesto para invertir.";

const stamp = (text: string) => `${new Date().toISOString()} · ${text}`;
const clean = (value: unknown, max = 300) => String(value ?? "").trim().slice(0, max);

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    if (String(body?.company || "").trim()) {
      return Response.json({ error: "No hemos podido procesar la solicitud." }, { status: 400 });
    }

    const step = Number(body?.step);
    if (![1, 2, 3, 4].includes(step)) {
      return Response.json({ error: "Paso no válido." }, { status: 400 });
    }

    const values = body?.values || {};
    const email = clean(values.email, 180).toLowerCase();
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!clean(values.full_name, 250)) errors.full_name = "Escribe tu nombre.";
      if (!EMAIL_RE.test(email)) errors.email = "Revisa tu correo electrónico.";
      if (clean(values.phone, 60).replace(/\D/g, "").length < 6) {
        errors.phone = "Necesitamos un teléfono de contacto.";
      }
    }
    if (step === 2 && !STAGES.includes(clean(values.project_stage))) {
      errors.project_stage = "Elige la opción que mejor te represente.";
    }
    if (step === 3) {
      if (!clean(values.country, 120)) errors.country = "Indica tu país.";
      if (!clean(values.city, 120)) errors.city = "Indica tu ciudad.";
      if (!MODALITIES.includes(clean(values.modality, 300))) {
        errors.modality = "Elige cómo prefieres trabajar.";
      }
    }
    if (step === 4) {
      if (!RELEASES.includes(clean(values.release_type, 120))) {
        errors.release_type = "Elige el formato de lanzamiento.";
      }
      if (!BUDGETS.includes(clean(values.budget, 200))) {
        errors.budget = "Elige la opción que mejor refleje tu situación.";
      }
    }

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
    if (!record && email) {
      const page = await base44.asServiceRole.entities.AdmissionSubmission.filter(
        { email },
        { sort: "-created_date", limit: 1 }
      );
      record = page?.items?.[0] || null;
    }

    if (!record && step !== 1) {
      return Response.json(
        { error: "No encontramos tus datos. Vuelve al primer paso." },
        { status: 404 }
      );
    }

    if (!record) {
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const recent = await base44.asServiceRole.entities.AdmissionSubmission.filter({
        email,
        created_date: { $gte: hourAgo },
      });
      if ((recent || []).length >= MAX_PER_HOUR) {
        return Response.json(
          { error: "Hemos recibido varias solicitudes con este correo. Escríbenos y lo revisamos." },
          { status: 429 }
        );
      }
    }

    const patch: any = {};
    if (step === 1) {
      patch.first_name = clean(values.full_name, 250);
      patch.email = email;
      patch.phone = clean(values.phone, 60);
      patch.source = clean(body?.source, 200) || "admision";
      patch.referrer = clean(body?.referrer, 500);
      patch.utm_source = clean(body?.utm_source, 200);
      patch.utm_medium = clean(body?.utm_medium, 200);
      patch.utm_campaign = clean(body?.utm_campaign, 200);
      patch.utm_content = clean(body?.utm_content, 200);
      patch.utm_term = clean(body?.utm_term, 200);
    }
    if (step === 2) patch.project_stage = clean(values.project_stage);
    if (step === 3) {
      patch.country = clean(values.country, 120);
      patch.city = clean(values.city, 120);
      patch.modality = clean(values.modality, 300);
    }
    if (step === 4) {
      patch.release_type = clean(values.release_type, 120);
      patch.budget = clean(values.budget, 200);
      patch.qualification_status =
        clean(values.budget) === NO_BUDGET ? "SIN PRESUPUESTO DISPONIBLE" : "APTO PARA AGENDAR";
    }

    const activity = [
      ...(record?.activity || []),
      stamp(`Paso ${step} completado`),
    ].slice(-30);

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
        payload_json: JSON.stringify(body).slice(0, 60000),
        activity: [...activity, stamp("Solicitud iniciada")],
      });
    }

    // Sincronización con HubSpot: si falla, los datos ya están guardados en Base44.
    try {
      const { contactId, warnings } = await syncAdmissionToHubspot(base44, submission);
      submission = await base44.asServiceRole.entities.AdmissionSubmission.update(submission.id, {
        hubspot_contact_id: contactId,
        hubspot_sync_status: "sincronizado",
        hubspot_sync_error: "",
        hubspot_sync_warning: (warnings || []).join(" · ").slice(0, 900),
        hubspot_last_sync: new Date().toISOString(),
        hubspot_attempts: (submission.hubspot_attempts || 0) + 1,
        activity: [
          ...(submission.activity || []),
          stamp(`Sincronizado con HubSpot · contacto ${contactId}`),
        ].slice(-30),
      });
    } catch (syncError: any) {
      const message = String(syncError?.message || syncError).slice(0, 900);
      submission = await base44.asServiceRole.entities.AdmissionSubmission.update(submission.id, {
        hubspot_sync_status: "error",
        hubspot_sync_error: message,
        hubspot_last_sync: new Date().toISOString(),
        hubspot_attempts: (submission.hubspot_attempts || 0) + 1,
        activity: [...(submission.activity || []), stamp(`Error de sincronización: ${message}`)].slice(-30),
      });
    }

    return Response.json({
      submission: {
        id: submission.id,
        submission_id: submission.submission_id,
        first_name: submission.first_name,
        email: submission.email,
        hubspot_contact_id: submission.hubspot_contact_id || "",
        hubspot_sync_status: submission.hubspot_sync_status,
        hubspot_sync_error: submission.hubspot_sync_error || "",
      },
    });
  } catch (error: any) {
    return Response.json(
      { error: "No hemos podido guardar tus datos. Inténtalo de nuevo." },
      { status: 500 }
    );
  }
}