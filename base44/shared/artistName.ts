// Devuelve el nombre visible del artista para usar en correos.
// Prioridad: 1) Nombre artístico, 2) Primer nombre.
// Nunca devuelve "Cabaña Creative" como nombre de destinatario.
export function getArtistDisplayName(artist, profile, user) {
  const stage = artist?.stageName || profile?.artist_name || profile?.display_name;
  if (stage && String(stage).trim()) return String(stage).trim();

  const first =
    profile?.first_name ||
    (user?.full_name ? String(user.full_name).split(" ")[0] : "") ||
    (profile?.full_name ? String(profile.full_name).split(" ")[0] : "");
  if (first && first.trim()) return first.trim();

  return "";
}