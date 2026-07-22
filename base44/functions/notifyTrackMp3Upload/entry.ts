import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import { sendVerificationEmail } from "../../shared/emailVerification.ts";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { track_id, is_first_upload, app_url } = await req.json().catch(() => ({}));
    if (!track_id) return Response.json({ error: 'track_id requerido' }, { status: 400 });

    const track = await base44.asServiceRole.entities.Track.get(track_id);
    if (!track) return Response.json({ error: 'Track no encontrado' }, { status: 404 });

    // Resolver el email vinculado al artista del track
    let toEmail = '';
    let emailVerified = false;
    let linkedUserId = null;
    let linkedArtist = null;
    if (track.artist_id) {
      try {
        const artist = await base44.asServiceRole.entities.Artist.get(track.artist_id);
        linkedArtist = artist;
        if (artist?.user_id) linkedUserId = artist.user_id;
      } catch (_e) { /* sin artista vinculado */ }
    }
    if (linkedUserId) {
      try {
        const linkedUser = await base44.asServiceRole.entities.User.get(linkedUserId);
        if (linkedUser?.email) toEmail = linkedUser.email;
        emailVerified = !!linkedUser?.email_verified;
      } catch (_e) { /* sin usuario vinculado */ }
    }
    if (!toEmail) {
      toEmail = user.email || '';
      emailVerified = !!user.email_verified;
      if (!linkedUserId) linkedUserId = user.id || null;
    }
    if (!toEmail) return Response.json({ error: 'Sin email de destino' }, { status: 400 });

    // Si el correo del artista aún no está verificado, se envía la verificación en lugar de la notificación.
    if (!emailVerified) {
      await sendVerificationEmail(base44, { userId: linkedUserId, app_url, artist: linkedArtist });
      return Response.json({ success: true, verification_sent: true });
    }

    const origin = (app_url || 'https://app.cabanacreative.es').replace(/\/$/, '');
    const slugOrId = track.slug || track.id;
    const streamUrl = `${origin}/t/${slugOrId}`;
    const appLink = `${origin}`;

    const subject = is_first_upload ? 'Nuevo soundtrack disponible' : 'Soundtrack actualizado';
    const content = is_first_upload
      ? 'Tu soundtrack ya está en tu catálogo. Escúchalo, compártelo o descárgalo ahora.'
      : 'Hay una nueva versión de tu soundtrack en tu catálogo. Escúchala o descárgala ahora.';
    const ctaLabel = is_first_upload ? 'Ir al catálogo' : 'Escuchar ahora';
    const ctaUrl = is_first_upload ? appLink : streamUrl;

    const body = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
  <p style="font-size: 18px; font-weight: 700; letter-spacing: -0.01em; color: #0a0a0b; margin: 0 0 22px;">Cabaña Creative</p>
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