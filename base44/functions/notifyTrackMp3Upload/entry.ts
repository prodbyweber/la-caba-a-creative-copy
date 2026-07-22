import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

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
    let artistName = '';
    if (track.artist_id) {
      try {
        const artist = await base44.asServiceRole.entities.Artist.get(track.artist_id);
        artistName = artist?.stageName || artist?.legalName || '';
        if (artist?.user_id) {
          const linkedUser = await base44.asServiceRole.entities.User.get(artist.user_id);
          if (linkedUser?.email) toEmail = linkedUser.email;
        }
      } catch (_e) { /* sin artista vinculado */ }
    }
    if (!toEmail) toEmail = user.email || '';
    if (!toEmail) return Response.json({ error: 'Sin email de destino' }, { status: 400 });

    const origin = (app_url || 'https://app.cabanacreative.es').replace(/\/$/, '');
    const slugOrId = track.slug || track.id;
    const streamUrl = `${origin}/t/${slugOrId}`;
    const appLink = `${origin}`;

    const title = track.title || 'tu soundtrack';
    const greeting = artistName ? `¡Hola, ${artistName}!` : '¡Hola!';

    const subject = is_first_upload
      ? `🎧 "${title}" — tu MP3 ya está en Cabaña Creative`
      : `🔄 "${title}" — MP3 actualizado en Cabaña Creative`;

    const lead = is_first_upload
      ? `¡Buenas noticias! 🎧<br/>Tu MP3 <strong>"${title}"</strong> ya está subido a Cabaña Creative y listo para streamear.`
      : `El MP3 de tu soundtrack <strong>"${title}"</strong> ha sido actualizado en Cabaña Creative.`;

    const body = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a1a;">
  <p style="font-size: 16px;">${greeting}</p>
  <p style="font-size: 15px; line-height: 1.5;">${lead}</p>
  <p style="margin: 24px 0 8px; font-size: 12px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.05em;">▶ Escúchalo ahora (página del soundtrack)</p>
  <a href="${streamUrl}" style="display: inline-block; background: #ff5833; color: #ffffff; text-decoration: none; font-weight: 600; padding: 12px 22px; border-radius: 999px; font-size: 14px;">Streamear "${title}"</a>
  <p style="margin: 26px 0 8px; font-size: 12px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.05em;">🔐 Inicia sesión / abre la app</p>
  <a href="${appLink}" style="display: inline-block; background: #111; color: #ffffff; text-decoration: none; font-weight: 600; padding: 12px 22px; border-radius: 999px; font-size: 14px;">Abrir Cabaña Creative</a>
  <p style="margin-top: 28px; font-size: 12px; color: #999;">Si no puedes abrir los botones, copia estos enlaces:<br/>🎧 ${streamUrl}<br/>🔐 ${appLink}</p>
  <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
  <p style="font-size: 13px; color: #666;">Un abrazo,<br/><strong>Cabaña Creative</strong></p>
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