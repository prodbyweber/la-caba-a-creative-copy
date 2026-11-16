import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function clean(value, max) {
  return String(value ?? "").trim().slice(0, max);
}

export default async function (req) {
  try {
    const body = await req.json().catch(() => ({}));

    const type = body.type === "message" ? "message" : "access";
    const name = clean(body.name, 120);
    const email = clean(body.email, 160);
    const artistName = clean(body.artist_name, 120);
    const musicLink = clean(body.music_link, 400);
    const message = clean(body.message, 2000);

    if (!name || !EMAIL_RE.test(email)) {
      return Response.json({ error: "Nombre y email válidos son obligatorios" }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    const record = await base44.asServiceRole.entities.AccessRequest.create({
      type,
      name,
      email,
      artist_name: artistName,
      music_link: musicLink,
      message,
      status: "nueva",
    });

    const subject =
      type === "access"
        ? `Nueva solicitud de acceso — ${name}${artistName ? ` (${artistName})` : ""}`
        : `Nuevo mensaje desde la web — ${name}`;

    const lines = [
      `Tipo: ${type === "access" ? "Solicitud de acceso" : "Mensaje"}`,
      `Nombre: ${name}`,
      `Email: ${email}`,
      artistName ? `Nombre artístico: ${artistName}` : null,
      musicLink ? `Música: ${musicLink}` : null,
      message ? `Mensaje: ${message}` : null,
    ].filter(Boolean);

    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: "hola@cabanacreative.es",
        subject,
        body: `${lines.join("\n")}\n\nPuedes gestionarlo en el panel de administración, en Landing > Solicitudes.`,
      });
    } catch (mailError) {
      // El aviso por email es opcional: la solicitud ya está guardada.
    }

    return Response.json({ ok: true, id: record.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}