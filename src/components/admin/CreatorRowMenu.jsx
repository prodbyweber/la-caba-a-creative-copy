import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";

// Menú de tres puntos visible en cada fila de creador.
// Acciones rápidas: Editar (modal) y Eliminar (confirmación).
export default function CreatorRowMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <button
        type="button"
        onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
        aria-label="Acciones"
        style={{
          width: "28px", height: "28px", borderRadius: "8px",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
          cursor: "pointer", color: "rgba(255,255,255,0.55)",
          transition: "all 0.15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "#fff"; }}
        onMouseLeave={e => { if (!open) { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.55)"; } }}
      >
        <MoreVertical size={15} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.14 }}
            onClick={e => e.stopPropagation()}
            style={{
              position: "absolute", top: "32px", right: 0, zIndex: 50,
              background: "#1a1a1c", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "10px", padding: "4px", minWidth: "150px",
              boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
            }}
          >
            <button
              onClick={e => { e.stopPropagation(); setOpen(false); onEdit?.(); }}
              style={{
                width: "100%", padding: "9px 10px", display: "flex", alignItems: "center", gap: "8px",
                background: "transparent", border: "none", borderRadius: "7px",
                color: "rgba(255,255,255,0.75)", fontSize: "12px", fontWeight: 600, cursor: "pointer",
                textAlign: "left",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <Pencil size={13} /> Editar datos
            </button>
            <button
              onClick={e => { e.stopPropagation(); setOpen(false); onDelete?.(); }}
              style={{
                width: "100%", padding: "9px 10px", display: "flex", alignItems: "center", gap: "8px",
                background: "transparent", border: "none", borderRadius: "7px",
                color: "#ef4444", fontSize: "12px", fontWeight: 600, cursor: "pointer", textAlign: "left",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <Trash2 size={13} /> Eliminar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}