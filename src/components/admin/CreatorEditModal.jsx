import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ExternalLink, Clock } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function CreatorEditModal({ creator, onClose }) {
  const { artist } = creator;
  const queryClient = useQueryClient();

  const [hours, setHours] = useState(artist?.studio_hours_total || 0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!artist) return null;

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.Artist.update(artist.id, { studio_hours_total: hours });
    queryClient.invalidateQueries({ queryKey: ["artists"] });
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 1500);
  };

  const increment = (n) => setHours(h => Math.max(0, h + n));

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(12px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "16px",
        }}
      >
        <motion.div
          key="panel"
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          onClick={e => e.stopPropagation()}
          style={{
            width: "100%", maxWidth: "420px",
            background: "#111113",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div style={{
            padding: "20px 20px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex", alignItems: "center", gap: "12px",
          }}>
            {/* Avatar */}
            <div style={{
              width: "44px", height: "44px", borderRadius: "50%",
              overflow: "hidden", flexShrink: 0,
              background: "#1a1a1c",
              border: "1px solid rgba(255,255,255,0.1)",
            }}>
              {creator.avatarUrl ? (
                <img src={creator.avatarUrl} alt={creator.displayName}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "rgba(255,255,255,0.2)", fontWeight: 900, fontSize: "16px" }}>
                    {creator.displayName?.[0]?.toUpperCase() || "?"}
                  </span>
                </div>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 700, fontSize: "15px", color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>
                {creator.displayName}
              </p>
              {creator.email && (
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", margin: "2px 0 0" }}>{creator.email}</p>
              )}
            </div>
            <button onClick={onClose} style={{
              width: "32px", height: "32px", borderRadius: "50%",
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0, color: "rgba(255,255,255,0.4)",
              transition: "background 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
            >
              <X size={14} />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: "20px" }}>

            {/* Studio Hours */}
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "14px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "14px" }}>
                <Clock size={13} color="rgba(255,255,255,0.3)" />
                <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
                  Horas de estudio asignadas
                </span>
              </div>

              {/* Counter */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", justifyContent: "center" }}>
                <button
                  onClick={() => increment(-2)}
                  style={{
                    width: "36px", height: "36px", borderRadius: "50%",
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: "rgba(255,255,255,0.5)",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                >
                  <Minus size={14} />
                </button>

                <div style={{ textAlign: "center" }}>
                  <span style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 900, fontSize: "42px", color: "#fff", lineHeight: 1, letterSpacing: "-0.05em" }}>
                    {hours}
                  </span>
                  <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", margin: "2px 0 0" }}>horas</p>
                </div>

                <button
                  onClick={() => increment(2)}
                  style={{
                    width: "36px", height: "36px", borderRadius: "50%",
                    background: "rgba(255,88,51,0.12)", border: "1px solid rgba(255,88,51,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: "#ff5833",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,88,51,0.22)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,88,51,0.12)"}
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Quick presets */}
              <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginTop: "14px" }}>
                {[4, 8, 12, 20].map(n => (
                  <button
                    key={n}
                    onClick={() => setHours(n)}
                    style={{
                      padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 600,
                      cursor: "pointer", transition: "all 0.15s",
                      background: hours === n ? "rgba(255,88,51,0.15)" : "rgba(255,255,255,0.05)",
                      border: hours === n ? "1px solid rgba(255,88,51,0.35)" : "1px solid rgba(255,255,255,0.08)",
                      color: hours === n ? "#ff5833" : "rgba(255,255,255,0.4)",
                    }}
                  >
                    {n}h
                  </button>
                ))}
              </div>
            </div>

            {/* Botón Agendar sesión → /StudioSession */}
            <a
              href="/StudioSession"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                width: "100%", padding: "11px",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px", textDecoration: "none",
                color: "rgba(255,255,255,0.55)", fontSize: "12px", fontWeight: 600,
                transition: "all 0.15s", marginBottom: "10px",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}
            >
              <ExternalLink size={13} />
              Agendar sesión en La Cabaña
            </a>

            {/* Guardar */}
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                width: "100%", padding: "12px",
                background: saved ? "rgba(16,185,129,0.15)" : "#ff5833",
                border: saved ? "1px solid rgba(16,185,129,0.3)" : "none",
                borderRadius: "10px", color: saved ? "#10b981" : "#fff",
                fontSize: "13px", fontWeight: 700, cursor: saving ? "default" : "pointer",
                transition: "all 0.2s", opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? "Guardando..." : saved ? "✓ Guardado" : "Guardar cambios"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}