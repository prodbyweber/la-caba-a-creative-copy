import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { deleteCreatorCascade } from "@/lib/creatorDelete";

// Confirmación rápida de borrado (sin escribir el nombre).
// Un solo botón elimina en cascada todo el contenido del creador.
export default function CreatorDeleteConfirm({ creator, onClose, onDone }) {
  const queryClient = useQueryClient();
  const [deleting, setDeleting] = useState(false);
  const [progress, setProgress] = useState([]);
  const [done, setDone] = useState(false);

  const target = creator?.displayName || "este creador";

  const handleDelete = async () => {
    setDeleting(true);
    setProgress([]);
    await deleteCreatorCascade(creator, (label, count) => {
      setProgress(p => [...p, { label, count }]);
    });
    setDeleting(false);
    setDone(true);
    queryClient.invalidateQueries({ queryKey: ["artists"] });
    queryClient.invalidateQueries({ queryKey: ["all-user-profiles"] });
    queryClient.invalidateQueries({ queryKey: ["platform-users"] });
    setTimeout(() => {
      onDone?.();
      onClose?.();
    }, 1200);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={done ? undefined : onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 10000,
          background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          onClick={e => e.stopPropagation()}
          style={{
            width: "100%", maxWidth: "360px",
            background: "#111113", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px", overflow: "hidden",
          }}
        >
          <div style={{ padding: "20px", textAlign: "center" }}>
            {!done ? (
              <>
                <div style={{
                  width: "44px", height: "44px", borderRadius: "50%", margin: "0 auto 12px",
                  background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <AlertTriangle size={20} color="#ef4444" />
                </div>
                <p style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 700, fontSize: "16px", color: "#fff", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
                  ¿Eliminar a {target}?
                </p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", margin: "0 0 16px", lineHeight: 1.5 }}>
                  Se borrará <b style={{ color: "rgba(255,255,255,0.8)" }}>todo</b>: proyectos, tracks, clips, sesiones, horas, items de Explorar, likes, saves, follows, ficha, perfil y cuenta. <b>Irreversible.</b>
                </p>

                {deleting && (
                  <div style={{ marginBottom: "14px", textAlign: "left" }}>
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
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={onClose} style={{
                      flex: 1, padding: "11px", borderRadius: "10px",
                      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.6)", fontSize: "12px", fontWeight: 600, cursor: "pointer",
                    }}>
                      Cancelar
                    </button>
                    <button onClick={handleDelete} style={{
                      flex: 1, padding: "11px", borderRadius: "10px",
                      background: "#ef4444", border: "none", color: "#fff",
                      fontSize: "12px", fontWeight: 700, cursor: "pointer",
                    }}>
                      Eliminar
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div style={{ padding: "10px 0" }}>
                <CheckCircle2 size={28} color="#10b981" style={{ margin: "0 auto 10px" }} />
                <p style={{ fontSize: "13px", color: "#10b981", fontWeight: 600 }}>Creador eliminado por completo</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}