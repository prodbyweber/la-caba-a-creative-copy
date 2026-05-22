/**
 * ensureUserProvisioned
 * 
 * Auto-healing utility: verifica que el usuario tenga todos los registros 
 * necesarios (UserProfile + Artist) y los crea si faltan.
 * 
 * Uso: llamar en ArtistDashboard al detectar que falta Artist record.
 */
import { base44 } from "@/api/base44Client";

/**
 * Garantiza que el usuario tenga un Artist record vinculado.
 * Llama al backend function que usa .filter() correctamente.
 * Retorna el artistId creado o existente.
 */
export async function ensureArtistRecord() {
  try {
    const res = await base44.functions.invoke('createArtistProfileForNewUser', {});
    return res?.data?.artistId || null;
  } catch (e) {
    console.warn('[ensureUserProvisioned] Failed to ensure artist record:', e);
    return null;
  }
}

/**
 * Garantiza que el usuario tenga un UserProfile básico.
 * Si no existe, crea uno mínimo para que el resto del sistema funcione.
 */
export async function ensureUserProfile(user) {
  if (!user?.id) return null;
  
  try {
    const existing = await base44.entities.UserProfile.filter({ user_id: user.id });
    if (existing.length > 0) return existing[0];
    
    // Crear perfil mínimo
    const profile = await base44.entities.UserProfile.create({
      user_id: user.id,
      user_email: user.email,
      full_name: user.full_name || user.email?.split('@')[0] || '',
      display_name: user.full_name || user.email?.split('@')[0] || '',
      account_type: 'artist',
      onboarding_completed: false,
    });
    return profile;
  } catch (e) {
    console.warn('[ensureUserProvisioned] Failed to ensure user profile:', e);
    return null;
  }
}

/**
 * Función principal: asegura que el usuario tenga TODOS los registros necesarios.
 * - UserProfile
 * - Artist record con user_id vinculado
 * 
 * @param {object} user - Objeto user de base44.auth.me()
 * @param {object} options
 * @param {Function} options.onArtistCreated - Callback para refrescar queries tras crear Artist
 */
export async function ensureUserSetupComplete(user, { onArtistCreated } = {}) {
  if (!user?.id) return;

  // 1. Asegurar UserProfile
  await ensureUserProfile(user);

  // 2. Verificar si ya tiene Artist
  const existingArtists = await base44.entities.Artist.filter({ user_id: user.id });
  if (existingArtists.length > 0) return; // Ya tiene todo, no hacer nada

  // 3. No tiene Artist → crear via backend function
  const artistId = await ensureArtistRecord();
  
  if (artistId && onArtistCreated) {
    onArtistCreated(artistId);
  }
}