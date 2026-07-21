import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";

// Cascada de borrado completo de un creador:
// elimina todo el contenido vinculado (proyectos, tracks, clips, sesiones,
// horas de estudio, explorar items), interacciones (likes, saves, follows,
// descargas de beats) y finalmente la entidad Artist, el UserProfile y el
// usuario de la plataforma.
// Los archivos subidos al storage no se pueden purgar vía SDK, pero se
// elimina toda la data y referencias que los apuntaban.
export default function CreatorDeleteZone({ creator, onComplete }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [progress, setProgress] = useState([]);
  const [done, setDone] = useState(false);

  const { artist, profile, platformUser, userId: userIdProp } = creator;
  const artistId = artist?.id || null;
  const userId = artist?.user_id || profile?.user_id || platformUser?.id || userIdProp || null;
  const profileId = profile?.id || null;
  const target = creator.displayName || "este creador";

  const runStep = async (label, fn) => {
    let count = 0;
    try {
      const res = await fn();
      count = res?.count ?? res?.deleted ?? (Array.isArray(res) ? res.length : 0);
    } catch (e) {
      count = -1;
    }
    setProgress(p => [...p, { label, count }]);
  };

  const handleDelete = async () => {
    setDeleting(true);
    setProgress([]);

    if (artistId) {
      await runStep("Proyectos", () => base44.entities.Project.deleteMany({ artist_id: artistId }));
      await runStep("Tracks", () => base44.entities.Track.deleteMany({ artist_id: artistId }));
      await runStep("Clips", () => base44.entities.Clip.deleteMany({ artist_id: artistId }));
      await runStep("Sesiones", () => base44.entities.Session.deleteMany({ artist_id: artistId }));
      await runStep("Horas de estudio", () => base44.entities.StudioHoursLog.deleteMany({ artist_id: artistId }));
      await runStep("Explorar (items)", () => base44.entities.ExplorarItem.deleteMany({ artist_id: artistId }));
    }
    if (userId) {
      await runStep("Likes (beats)", () => base44.entities.BeatLike.deleteMany({ user_id: userId }));
      await runStep("Saves (beats)", () => base44.entities.BeatSave.deleteMany({ user_id: userId }));
      await runStep("Descargas (beats)", () => base44.entities.BeatDownload.deleteMany({ user_id: userId }));
      await runStep("Likes (explorar)", () => base44.entities.Like.deleteMany({ user_id: userId }));
      await runStep("Saves (explorar)", () => base44.entities.Save.deleteMany({ user_id: userId }));
      await runStep("Follows (dados)", () => base44.entities.Follow.deleteMany({ follower_user_id: userId }));
      await runStep("Follows (recibidos)", () => base44.entities.Follow.deleteMany({ following_user_id: userId }));
    }
    if (artistId) await runStep("Ficha de artista", () => base44.entities.Artist.delete(artistId));
    if (profileId) await runStep("Perfil de usuario", () => base44.entities.UserProfile.delete(profileId));
    if (userId) await runStep("Cuenta de usuario", () => base44.entities.User.delete(userId));

    setDeleting(false);
    setDone(true);
    queryClient.invalidateQueries({ queryKey: ["artists"] });
    queryClient.invalidateQueries({ queryKey: ["all-user-profiles"] });
    queryClient.invalidateQueries({ queryKey: ["platform-users"] });

    setTimeout(() => {
      onComplete?.();
    }, 1400);
  };

  const canConfirm = confirmText.trim().toLowerCase() === target.trim().toLowerCase();

  return (
    <div style={{ marginTop: "14px" }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", padding: "11px",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
          borderRadius: "10px", color: "#ef4444", fontSize: "12px", fontWeight: 700,
          cursor: "pointer", transition: "all 0.15s",
        }}
      >
        <Trash2 size={13} />
        Eliminar creador por completo
      </button>

      <AnimatePresence>
        {open && !done && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{
              marginTop: "10px", padding: "14px",
              background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)",
              borderRadius: "10px",
            }}>
              <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                <AlertTriangle size={14} color="#ef4444" style={{ flexShrink: 0, marginTop: "1px" }} />
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", margin: 0, lineHeight: 1.45 }}>
                  Se borrará <b style={{ color: "#fff" }}>{target}</b> y <b>todo</b> su contenido:
                  proyectos, tracks, clips, sesiones, horas de estudio, items de Explorar,
                  likes, saves, follows, su ficha de artista, su perfil y su cuenta de usuario.
                  Esta acción es <b>irreversible</b>.
                </p>
              </div>

              {!deleting && (
                <>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", margin: "0 0 6px" }}>
                    Escribe <b style={{ color: "#fff" }}>{target}</b> para confirmar:
                  </p>
                  <input
                    value={confirmText}
                    onChange={e => setConfirmText(e.target.value)}
                    placeholder={target}
                    style={{
                      width: "100%", padding: "8px 10px", marginBottom: "10px",
                      background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px", color: "#fff", fontSize: "12px", outline: "none",
                    }}
                  />
                </>
              )}

              {deleting && (
                <div style={{ marginBottom: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                    <Loader2 size={13} className="animate-spin" color="#ef4444" />
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>Eliminando…</span>
                  </div>
                  {progress.map((s, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "rgba(255,255,255,0.4)", padding: "1px 0" }}>
                      <span>{s.label}</span>
                      <span>{s.count >= 0 ? `${s.count}` : "error"}</span>
                    </div>
                  ))}
                </div>
              )}

              {!deleting && (
                <button
                  type="button"
                  disabled={!canConfirm}
                  onClick={handleDelete}
                  style={{
                    width: "100%", padding: "10px",
                    background: canConfirm ? "#ef4444" : "rgba(255,255,255,0.05)",
                    border: "none", borderRadius: "8px",
                    color: canConfirm ? "#fff" : "rgba(255,255,255,0.3)",
                    fontSize: "12px", fontWeight: 700, cursor: canConfirm ? "pointer" : "not-allowed",
                    transition: "all 0.15s",
                  }}
                >
                  Eliminar definitivamente
                </button>
              )}
            </div>
          </motion.div>
        )}

        {done && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{
              marginTop: "10px", padding: "14px",
              background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)",
              borderRadius: "10px", display: "flex", alignItems: "center", gap: "8px",
            }}
          >
            <CheckCircle2 size={14} color="#10b981" />
            <span style={{ fontSize: "12px", color: "#10b981", fontWeight: 600 }}>Creador eliminado por completo</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}