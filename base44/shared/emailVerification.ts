import { getArtistDisplayName } from "./artistName.ts";

// Genera un token aleatorio de 32 caracteres hex.
export function generateToken() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Plantilla minimalista del correo de verificación (mismo diseño que el resto de correos).
export function verificationEmailBody(displayName, verifyUrl) {
  const greeting = displayName ? `Hola, ${displayName}.` : "Hola.";
  return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
  <p style="font-size: 18px; font-weight: 700; letter-spacing: -0.01em; color: #0a0a0b; margin: 0 0 22px;">Cabaña Creative</p>
  <p style="font-size: 15px; line-height: 1.5; color: #1a1a1a; margin: 0 0 16px;">${greeting}</p>
  <p style="font-size: 15px; line-height: 1.5; color: #1a1a1a; margin: 0 0 16px;">Antes de comenzar a recibir las notificaciones de tu catálogo, necesitamos confirmar tu dirección de correo electrónico.</p>
  <p style="font-size: 15px; line-height: 1.5; color: #1a1a1a; margin: 0 0 28px;">Activa tu correo para mantenerte al día con tus soundtracks y futuras actualizaciones.</p>
  <a href="${verifyUrl}" style="display: inline-block; background: #0a0a0b; color: #ffffff; text-decoration: none; font-weight: 600; padding: 14px 30px; border-radius: 10px; font-size: 15px;">Verificar correo</a>
  <p style="margin: 22px 0 0; font-size: 12px; color: #aaa; line-height: 1.5; word-break: break-all;">${verifyUrl}</p>
</div>`.trim();
}

// Lógica central de envío del correo de verificación.
// Si el usuario ya está verificado, no envía nada (idempotente).
export async function sendVerificationEmail(base44, opts) {
  if (!opts?.userId) throw new Error("userId requerido");
  const user = await base44.asServiceRole.entities.User.get(opts.userId);
  if (!user) throw new Error("Usuario no encontrado");
  if (user.email_verified) return { already_verified: true };

  // Resolver artista / perfil si no se pasaron, para obtener el nombre visible.
  let artist = opts.artist;
  let profile = opts.profile;
  if (!artist || !profile) {
    try {
      const artists = await base44.asServiceRole.entities.Artist.filter({ user_id: opts.userId });
      if (artists.length && !artist) artist = artists[0];
    } catch (_e) { /* sin artista vinculado */ }
    try {
      const profiles = await base44.asServiceRole.entities.UserProfile.filter({ user_id: opts.userId });
      if (profiles.length && !profile) profile = profiles[0];
    } catch (_e) { /* sin perfil vinculado */ }
  }

  const displayName = getArtistDisplayName(artist, profile, user);
  const token = generateToken();
  await base44.asServiceRole.entities.User.update(opts.userId, { email_verification_token: token });

  const origin = (opts.app_url || "https://app.cabanacreative.es").replace(/\/$/, "");
  const verifyUrl = `${origin}/verificar-email?token=${token}`;

  await base44.asServiceRole.integrations.Core.SendEmail({
    to: user.email,
    from_name: "Cabaña Creative",
    subject: "Activa tu correo electrónico",
    body: verificationEmailBody(displayName, verifyUrl),
  });
  return { sent: true };
}