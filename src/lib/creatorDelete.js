import { base44 } from "@/api/base44Client";

// Borra por completo a un creador y todo su contenido vinculado.
// onStep(label, count) se llama tras cada paso para mostrar progreso.
// Los archivos en storage no se pueden purgar vía SDK, pero se eliminan
// todas las entidades y referencias que los apuntaban.
export async function deleteCreatorCascade(creator, onStep) {
  const { artist, profile, platformUser, userId: userIdProp } = creator || {};
  const artistId = artist?.id || null;
  const userId = artist?.user_id || profile?.user_id || platformUser?.id || userIdProp || null;
  const profileId = profile?.id || null;

  const step = async (label, fn) => {
    let count = 0;
    try {
      const res = await fn();
      count = res?.count ?? res?.deleted ?? (Array.isArray(res) ? res.length : 0);
    } catch {
      count = -1;
    }
    onStep?.(label, count);
  };

  if (artistId) {
    await step("Proyectos", () => base44.entities.Project.deleteMany({ artist_id: artistId }));
    await step("Tracks", () => base44.entities.Track.deleteMany({ artist_id: artistId }));
    await step("Clips", () => base44.entities.Clip.deleteMany({ artist_id: artistId }));
    await step("Sesiones", () => base44.entities.Session.deleteMany({ artist_id: artistId }));
    await step("Horas de estudio", () => base44.entities.StudioHoursLog.deleteMany({ artist_id: artistId }));
    await step("Explorar (items)", () => base44.entities.ExplorarItem.deleteMany({ artist_id: artistId }));
  }
  if (userId) {
    await step("Likes (beats)", () => base44.entities.BeatLike.deleteMany({ user_id: userId }));
    await step("Saves (beats)", () => base44.entities.BeatSave.deleteMany({ user_id: userId }));
    await step("Descargas (beats)", () => base44.entities.BeatDownload.deleteMany({ user_id: userId }));
    await step("Likes (explorar)", () => base44.entities.Like.deleteMany({ user_id: userId }));
    await step("Saves (explorar)", () => base44.entities.Save.deleteMany({ user_id: userId }));
    await step("Follows (dados)", () => base44.entities.Follow.deleteMany({ follower_user_id: userId }));
    await step("Follows (recibidos)", () => base44.entities.Follow.deleteMany({ following_user_id: userId }));
  }
  if (artistId) await step("Ficha de artista", () => base44.entities.Artist.delete(artistId));
  if (profileId) await step("Perfil de usuario", () => base44.entities.UserProfile.delete(profileId));
  if (userId) await step("Cuenta de usuario", () => base44.entities.User.delete(userId));
}