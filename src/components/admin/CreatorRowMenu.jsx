import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MoreVertical, Pencil, Trash2, MailCheck, Mail } from "lucide-react";

// Menú de tres puntos visible en cada fila de creador.
// Se renderiza en un portal (position: fixed) para evitar que
// contenedores padres con overflow-hidden recorten el dropdown,
// incluso en la última fila de la lista.
export default function CreatorRowMenu({ onEdit, onDelete, verified, onSendVerification }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, right: 0 });

  const updatePos = () => {
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    setCoords({
      top: r.bottom + 4,
      right: window.innerWidth - r.right,
    });
  };

  useEffect(() => {
    if (!open) return;
    updatePos();
    const handler = (e) => {
      if (
        btnRef.current?.contains(e.target) ||
        menuRef.current?.contains(e.target)
      ) return;
      setOpen(false);
    };
    const onScroll = () => setOpen(false);
    document.addEventListener("mousedown", handler, true);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("mousedown", handler, true);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

  return (
    <>
      <div ref={btnRef} style={{ position: "relative", flexShrink: 0 }}>
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
      </div>

      {open && createPortal(
        <AnimatePresence>
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.14 }}
            onClick={e => e.stopPropagation()}
            style={{
              position: "fixed", top: `${coords.top}px`, right: `${coords.right}px`,
              zIndex: 10001,
              background: "#1a1a1c", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "10px", padding: "4px", minWidth: "160px",
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

            {verified ? (
              <button
                disabled
                style={{
                  width: "100%", padding: "9px 10px", display: "flex", alignItems: "center", gap: "8px",
                  background: "transparent", border: "none", borderRadius: "7px",
                  color: "rgba(52,211,153,0.85)", fontSize: "12px", fontWeight: 600, cursor: "default",
                  textAlign: "left", opacity: 0.6,
                }}
              >
                <MailCheck size={13} /> Correo ya verificado
              </button>
            ) : (
              <button
                onClick={e => { e.stopPropagation(); setOpen(false); onSendVerification?.(); }}
                style={{
                  width: "100%", padding: "9px 10px", display: "flex", alignItems: "center", gap: "8px",
                  background: "transparent", border: "none", borderRadius: "7px",
                  color: "rgba(255,255,255,0.75)", fontSize: "12px", fontWeight: 600, cursor: "pointer",
                  textAlign: "left",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <Mail size={13} /> Enviar verificación
              </button>
            )}

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
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}