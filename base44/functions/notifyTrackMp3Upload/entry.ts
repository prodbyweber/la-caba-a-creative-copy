import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    // Solo las acciones de administrador disparan correos. El artista nunca recibe correos por sus propias acciones.
    if (user.role !== 'admin') return Response.json({ success: true, skipped: 'non-admin' });

    const { track_id, action, app_url } = await req.json().catch(() => ({}));
    if (!track_id) return Response.json({ error: 'track_id requerido' }, { status: 400 });

    const track = await base44.asServiceRole.entities.Track.get(track_id);
    if (!track) return Response.json({ error: 'Track no encontrado' }, { status: 404 });

    // El correo se envía siempre al email registrado del artista dueño del catálogo (nunca al admin).
    let toEmail = '';
    if (track.artist_id) {
      try {
        const artist = await base44.asServiceRole.entities.Artist.get(track.artist_id);
        if (artist?.user_id) {
          try {
            const linkedUser = await base44.asServiceRole.entities.User.get(artist.user_id);
            if (linkedUser?.email) toEmail = linkedUser.email;
          } catch (_e) { /* sin usuario vinculado */ }
        }
        if (!toEmail && artist?.email) toEmail = artist.email;
      } catch (_e) { /* sin artista vinculado */ }
    }
    if (!toEmail) return Response.json({ error: 'Sin email de artista' }, { status: 400 });

    // Enlaces siempre al dominio de producción (nunca a URLs de previsualización).
    const origin = 'https://cabanacreative.es';
    const slugOrId = track.slug || track.id;
    const streamUrl = `${origin}/track/${slugOrId}`;
    const appLink = `${origin}`;

    const isCreate = action === 'create';
    const subject = isCreate ? 'Nuevo soundtrack disponible' : 'Soundtrack actualizado';
    const content = isCreate
      ? 'Tu soundtrack ya está en tu catálogo. Escúchalo, compártelo o descárgalo ahora.'
      : 'Hay una nueva versión de tu soundtrack en tu catálogo. Escúchala o descárgala ahora.';
    const ctaLabel = isCreate ? 'Ir al catálogo' : 'Escuchar ahora';
    const ctaUrl = isCreate ? appLink : streamUrl;

    const body = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
  <p style="font-size: 15px; line-height: 1.5; color: #1a1a1a; margin: 0 0 28px;">${content}</p>
  <a href="${ctaUrl}" style="display: inline-block; background: #0a0a0b; color: #ffffff; text-decoration: none; font-weight: 600; padding: 14px 30px; border-radius: 10px; font-size: 15px;">${ctaLabel}</a>
  <p style="margin: 22px 0 0; font-size: 12px; color: #aaa; line-height: 1.5; word-break: break-all;">${ctaUrl}</p>
</div>`.trim();

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: toEmail,
      from_name: 'Cabaña Creative',
      subject,
      body,
    });

    return Response.json({ success: true, sent_to: toEmail });
  } catch (error) {
    return Response.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
});