import { base44 } from "@/api/base44Client";

/**
 * Notificación por correo al artista cuando el administrador AÑADE beats a su
 * catálogo (subida de beat privado o asignación de beats públicos).
 *
 * Mismo criterio que los soundtracks (src/lib/trackNotify.js): el envío se hace
 * desde el frontend, una sola vez, justo después de guardar.
 *
 * Destinatario: email registrado del artista propietario
 *   Artist.user_id → User.email
 * Nunca un correo fijo, nunca al admin creador.
 */

async function resolveArtistEmail(artistId) {
  if (!artistId) return { email: null, reason: "no-artist" };
  try {
    const artist = await base44.entities.Artist.get(artistId);
    if (!artist?.user_id) return { email: null, reason: "artist-no-user" };
    const user = await base44.entities.User.get(artist.user_id);
    if (!user?.email) return { email: null, reason: "no-email" };
    return { email: user.email };
  } catch (e) {
    console.error("[beatNotify] resolveArtistEmail error", e?.message);
    return { email: null, reason: "lookup-error", error: e?.message };
  }
}

function buildEmailBody(titles, panelUrl) {
  const list = titles
    .map((t) => `<li style="margin: 0 0 6px;">${t}</li>`)
    .join("");
  return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
  <p style="font-size: 15px; line-height: 1.5; color: #1a1a1a; margin: 0 0 20px;">Hay nuevos beats en tu catálogo. Escúchalos y descárgalos desde tu panel.</p>
  <ul style="font-size: 14px; color: #444; padding-left: 18px; margin: 0 0 28px;">${list}</ul>
  <a href="${panelUrl}" style="display: inline-block; background: #0a0a0b; color: #ffffff; text-decoration: none; font-weight: 600; padding: 14px 30px; border-radius: 10px; font-size: 15px;">Escuchar ahora</a>
  <p style="margin: 22px 0 0; font-size: 12px; color: #aaa; line-height: 1.5; word-break: break-all;">${panelUrl}</p>
</div>`.trim();
}

/**
 * @param {string} artistId  ID del artista propietario del catálogo
 * @param {string[]} titles  Títulos de los beats añadidos
 * @returns {Promise<{ok: boolean, reason?: string, sent_to?: string}>}
 */
export async function sendBeatNotifyEmail(artistId, titles) {
  const list = (titles || []).filter(Boolean);
  if (!list.length) return { ok: false, reason: "no-beats" };

  const { email, reason } = await resolveArtistEmail(artistId);
  if (!email) {
    console.warn("[beatNotify] Sin destinatario válido — motivo:", reason);
    return { ok: false, reason };
  }

  const origin =
    (typeof window !== "undefined" && window.location?.origin) ||
    "https://cabanacreative.es";
  const panelUrl = `${origin}/ArtistDashboard?artistId=${artistId}`;

  try {
    await base44.integrations.Core.SendEmail({
      to: email,
      from_name: "Cabaña Creative",
      subject:
        list.length > 1
          ? "Nuevos beats en tu catálogo"
          : "Nuevo beat en tu catálogo",
      body: buildEmailBody(list, panelUrl),
    });
    console.log("[beatNotify] SendEmail OK", { artist_id: artistId, to: email, beats: list.length });
    return { ok: true, sent_to: email };
  } catch (e) {
    console.error("[beatNotify] SendEmail FAILED", { artist_id: artistId, error: e?.message });
    return { ok: false, reason: "send-failed", error: e?.message };
  }
}