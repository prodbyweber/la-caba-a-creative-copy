import { base44 } from "@/api/base44Client";

/**
 * Notificación por correo de soundtracks — enviada directamente desde el frontend
 * al guardar (admin). Es la ÚNICA fuente de envío para evitar dobles disparos:
 * el flag `notify_mp3_update` se persiste siempre en false para que el evento de
 * entidad (automación) no vuelva a enviar.
 *
 *  - Inmediato: un solo `await` tras el guardado.
 *  - Una sola vez: una sola llamada a SendEmail.
 *  - Destinatario: email registrado del propietario del catálogo
 *      Track → Artist.user_id → User.email
 *    Nunca un correo fijo, nunca al admin creador.
 */

async function resolveOwnerEmail(track) {
  try {
    // Cadena: Soundtrack → Artista propietario → Cuenta del artista → Email registrado.
    // Nunca un correo fijo ni fallback al admin creador: si la cadena no resuelve,
    // se omite el envío (cada artista recibe únicamente sus propias notificaciones).
    if (!track?.artist_id) return { email: null, reason: "no-artist" };
    const artist = await base44.entities.Artist.get(track.artist_id);
    if (!artist?.user_id) return { email: null, reason: "artist-no-user" };
    const user = await base44.entities.User.get(artist.user_id);
    if (!user?.email) return { email: null, reason: "no-email" };
    return { email: user.email };
  } catch (e) {
    console.error("[trackNotify] resolveOwnerEmail error", e?.message);
    return { email: null, reason: "lookup-error", error: e?.message };
  }
}

function buildEmailBody(streamUrl, action) {
  const isCreate = action === "create";
  const content = isCreate
    ? "Tu soundtrack ya está en tu catálogo. Escúchalo, compártelo o descárgalo ahora."
    : "Hay una nueva versión de tu soundtrack en tu catálogo. Escúchala o descárgala ahora.";
  return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
  <p style="font-size: 15px; line-height: 1.5; color: #1a1a1a; margin: 0 0 28px;">${content}</p>
  <a href="${streamUrl}" style="display: inline-block; background: #0a0a0b; color: #ffffff; text-decoration: none; font-weight: 600; padding: 14px 30px; border-radius: 10px; font-size: 15px;">Escuchar ahora</a>
  <p style="margin: 22px 0 0; font-size: 12px; color: #aaa; line-height: 1.5; word-break: break-all;">${streamUrl}</p>
</div>`.trim();
}

/**
 * @param {object} track  Track guardado (con id, slug, artist_id, created_by_id)
 * @param {"create"|"update"} action
 * @returns {Promise<{ok: boolean, reason?: string, sent_to?: string}>}
 */
export async function sendTrackNotifyEmail(track, action = "update") {
  if (!track?.id) return { ok: false, reason: "no-track" };

  const { email, reason } = await resolveOwnerEmail(track);
  if (!email) {
    console.warn("[trackNotify] Sin destinatario válido — motivo:", reason, "track:", track.id);
    return { ok: false, reason };
  }

  const origin = (typeof window !== "undefined" && window.location?.origin) || "https://cabanacreative.es";
  const streamUrl = `${origin}${track.slug ? `/t/${track.slug}` : `/track/${track.id}`}`;
  const isCreate = action === "create";
  const subject = isCreate ? "Nuevo soundtrack disponible" : "Soundtrack actualizado";
  const body = buildEmailBody(streamUrl, action);

  try {
    await base44.integrations.Core.SendEmail({
      to: email,
      from_name: "Cabaña Creative",
      subject,
      body,
    });
    console.log("[trackNotify] SendEmail OK", { track_id: track.id, to: email, action });
    return { ok: true, sent_to: email };
  } catch (e) {
    console.error("[trackNotify] SendEmail FAILED", { track_id: track.id, to: email, error: e?.message });
    return { ok: false, reason: "send-failed", error: e?.message };
  }
}