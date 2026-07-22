import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

/**
 * Notificaciones por correo de soundtracks — disparadas por EVENTOS DE ENTIDAD
 * (automación sobre Track: create + update). No depende de la UI ni del navegador.
 *
 *  - create  -> si el creador es admin, envía "Nuevo soundtrack disponible".
 *  - update  -> solo si cambió audio_file_url Y notify_mp3_update === true
 *               (casilla "Notificar al artista por correo", siempre off por defecto).
 *
 * Destinatario: email de la cuenta registrada del artista (Artist.user_id -> User.email).
 * Nunca al admin, nunca emails temporales.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

    const payload = await req.json().catch(() => ({}));
    const event = payload?.event || {};
    const eventType = event.type;
    const entityId = event.entity_id;
    if (!entityId) return Response.json({ error: 'sin entity_id' }, { status: 400 });

    let track = payload.data || null;
    const oldData = payload.old_data || null;
    if (!track || payload.payload_too_large) {
      try {
        track = await sr.entities.Track.get(entityId);
      } catch (e) {
        console.error('[notifyTrack] Track.get failed', entityId, e?.message);
        return Response.json({ error: 'Track no encontrado' }, { status: 404 });
      }
    }

    const logBase = { event: eventType, track_id: entityId, title: track?.title, artist_id: track?.artist_id };

    if (eventType === 'create') {
      const creatorId = track?.created_by_id;
      let creator = null;
      if (creatorId) {
        try { creator = await sr.entities.User.get(creatorId); }
        catch (e) { console.log('[notifyTrack] creator lookup failed', creatorId, e?.message); }
      }
      if (!creator || creator.role !== 'admin') {
        console.log('[notifyTrack] create skipped (non-admin creator)', logBase);
        return Response.json({ success: true, skipped: 'non-admin-creator' });
      }
      return await sendNotify(sr, track, 'create', logBase);
    }

    if (eventType === 'update') {
      const audioChanged = (track?.audio_file_url || null) !== ((oldData && oldData.audio_file_url) || null);
      const notify = track?.notify_mp3_update === true;
      if (!audioChanged || !notify) {
        console.log('[notifyTrack] update skipped', { ...logBase, audioChanged, notify });
        return Response.json({ success: true, skipped: 'no-mp3-notify' });
      }
      const result = await sendNotify(sr, track, 'update', logBase);
      // Resetear el flag para evitar reenvíos en futuras actualizaciones.
      try { await sr.entities.Track.update(entityId, { notify_mp3_update: false }); }
      catch (e) { console.log('[notifyTrack] flag reset failed', e?.message); }
      return result;
    }

    return Response.json({ success: true, skipped: 'ignored-event' });
  } catch (error) {
    console.error('[notifyTrack] Function error', error?.message, error?.stack);
    return Response.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
});

async function sendNotify(sr, track, action, logBase) {
  let toEmail = '';
  let recipientUser = null;
  let artistInfo = null;
  if (track?.artist_id) {
    try {
      const artist = await sr.entities.Artist.get(track.artist_id);
      artistInfo = { id: artist?.id, stageName: artist?.stageName, user_id: artist?.user_id };
      if (artist?.user_id) {
        try {
          recipientUser = await sr.entities.User.get(artist.user_id);
          if (recipientUser?.email) toEmail = recipientUser.email;
        } catch (e) { console.log('[notifyTrack] recipient user lookup failed', artist.user_id, e?.message); }
      }
    } catch (e) { console.log('[notifyTrack] artist lookup failed', track.artist_id, e?.message); }
  }

  if (!toEmail || recipientUser?.role === 'admin') {
    console.error('[notifyTrack] Sin destinatario válido', { ...logBase, artist: artistInfo });
    return Response.json({ error: 'Sin email de artista registrado', ...logBase, artist: artistInfo }, { status: 400 });
  }

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

  const ts = new Date().toISOString();
  try {
    const result = await sr.integrations.Core.SendEmail({
      to: toEmail,
      from_name: 'Cabaña Creative',
      subject,
      body,
    });
    console.log('[notifyTrack] SendEmail OK', { ts, ...logBase, to: toEmail, action, result });
    return Response.json({ success: true, sent_to: toEmail, action });
  } catch (sendError) {
    console.error('[notifyTrack] SendEmail FAILED', {
      ts, ...logBase, soundtrack: track?.title, artist: artistInfo,
      recipient: toEmail, action,
      provider_error: sendError?.message, provider_response: sendError?.data || null,
    });
    return Response.json({
      error: 'Fallo al enviar el correo',
      ts, ...logBase, recipient: toEmail, action,
      provider_error: sendError?.message || String(sendError),
      provider_response: sendError?.data || null,
    }, { status: 502 });
  }
}