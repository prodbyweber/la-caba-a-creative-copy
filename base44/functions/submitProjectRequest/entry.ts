import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function clean(value, max) {
  return String(value ?? "").trim().slice(0, max);
}

function cleanList(value, max = 12, itemMax = 80) {
  if (!Array.isArray(value)) return [];
  return value.map((v) => clean(v, itemMax)).filter(Boolean).slice(0, max);
}

export default async function (req) {
  try {
    const body = await req.json().catch(() => ({}));

    const name = clean(body.name, 120);
    const email = clean(body.email, 160);
    const whatsapp = clean(body.whatsapp, 40);

    if (!name || !EMAIL_RE.test(email)) {
      return Response.json({ error: "Nombre y email válidos son obligatorios" }, { status: 400 });
    }

    const genres = cleanList(body.genres);
    const needs = cleanList(body.needs);
    const stage = clean(body.stage, 80);
    const country = clean(body.country, 80);
    const demoLink = clean(body.demo_link, 500);
    const demoFileUri = clean(body.demo_file_uri, 500);
    const demoFileName = clean(body.demo_file_name, 200);
    const directions = cleanList(body.creative_directions, 8, 80);
    const message = clean(body.message, 2000);

    const base44 = createClientFromRequest(req);

    const record = await base44.asServiceRole.entities.SolicitudProyecto.create({
      name,
      email,
      whatsapp,
      genres,
      needs,
      stage,
      country,
      demo_link: demoLink,
      demo_file_uri: demoFileUri,
      demo_file_name: demoFileName,
      creative_directions: directions,
      message,
      status: "nueva",
    });

    const lines = [
      `Nombre: ${name}`,
      `Email: ${email}`,
      whatsapp ? `WhatsApp: ${whatsapp}` : null,
      genres.length ? `Géneros: ${genres.join(", ")}` : null,
      needs.length ? `Necesita: ${needs.join(", ")}` : null,
      stage ? `Etapa: ${stage}` : null,
      country ? `Ubicación: ${country}` : null,
      demoLink ? `Demo: ${demoLink}` : null,
      demoFileName ? `Audio adjunto: ${demoFileName}` : null,
      directions.length ? `Dirección creativa: ${directions.join(", ")}` : null,
      message ? `Notas: ${message}` : null,
    ].filter(Boolean);

    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: "hola@cabanacreative.es",
        subject: `Nuevo proyecto desde la home — ${name}`,
        body: `${lines.join("\n")}\n\nPuedes gestionarlo en el panel de administración, en Admin > Solicitudes.`,
      });
    } catch (mailError) {
      // El aviso por email es opcional: la solicitud ya está guardada.
    }

    return Response.json({ ok: true, id: record.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}