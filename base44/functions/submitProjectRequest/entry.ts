import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+[1-9]\d{6,15}$/;

function clean(value, max) {
  return String(value ?? "").trim().slice(0, max);
}

function cleanList(value, max = 14, itemMax = 80) {
  if (!Array.isArray(value)) return [];
  return value.map((v) => clean(v, itemMax)).filter(Boolean).slice(0, max);
}

export default async function (req) {
  try {
    const body = await req.json().catch(() => ({}));

    const name = clean(body.name, 120);
    const email = clean(body.email, 160);
    const phone = clean(body.phone, 25);

    if (!name || !EMAIL_RE.test(email)) {
      return Response.json({ error: "Nombre y email válidos son obligatorios" }, { status: 400 });
    }
    if (!PHONE_RE.test(phone)) {
      return Response.json({ error: "El WhatsApp debe ir en formato internacional (E.164)" }, { status: 400 });
    }

    const genres = cleanList(body.genres);
    const needs = cleanList(body.needs);
    const stage = clean(body.stage, 80);
    const country = clean(body.country, 80);
    const demoLink = clean(body.demo_link, 500);
    const demoFileUri = clean(body.demo_file_uri, 500);
    const demoFileName = clean(body.demo_file_name, 200);
    const moods = cleanList(body.moods, 12, 60);
    const references = clean(body.references, 600);
    const instructions = clean(body.instructions, 1200);

    const summary = [
      genres.length ? `Géneros: ${genres.join(", ")}` : null,
      needs.length ? `Necesita: ${needs.join(", ")}` : null,
      stage ? `Etapa: ${stage}` : null,
      country ? `Ubicación: ${country}` : null,
      moods.length ? `Mood: ${moods.join(", ")}` : null,
      references ? `Referencias: ${references}` : null,
      instructions ? `Instrucciones: ${instructions}` : null,
      demoLink ? `Demo: ${demoLink}` : null,
      demoFileName ? `Audio adjunto: ${demoFileName}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const base44 = createClientFromRequest(req);

    const record = await base44.asServiceRole.entities.ContactLead.create({
      name,
      email,
      phone,
      message: summary || "Solicitud enviada desde el configurador de la home.",
      status: "Nuevo",
      source: "proyecto-home",
      genres,
      needs,
      stage,
      country,
      demo_link: demoLink,
      demo_file_uri: demoFileUri,
      demo_file_name: demoFileName,
      moods,
      references,
      instructions,
    });

    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: "hola@cabanacreative.es",
        subject: `Nuevo proyecto desde la home — ${name}`,
        body: `Nombre: ${name}\nEmail: ${email}\nWhatsApp: ${phone}\n\n${summary}\n\nPuedes gestionarlo en el panel, en Solicitudes > Mensajes de contacto.`,
      });
    } catch (mailError) {
      // El aviso por email es opcional: la solicitud ya está guardada.
    }

    return Response.json({ ok: true, id: record.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}