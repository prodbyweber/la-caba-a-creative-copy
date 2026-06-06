import React, { useState, useEffect } from "react";

const STORAGE_KEY = "cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [prefs, setPrefs] = useState({ analytics: true, marketing: true });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) setVisible(true);
  }, []);

  const save = (analytics, marketing) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ analytics, marketing, necessary: true }));
    setVisible(false);
    setShowModal(false);
  };

  if (!visible) return null;

  return (
    <>
      {/* Banner */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9999,
        background: "#141414", borderTop: "1px solid rgba(255,255,255,0.08)",
        padding: "16px 24px", display: "flex", flexWrap: "wrap",
        alignItems: "center", gap: "12px",
      }}>
        <p style={{
          fontFamily: "Arial, sans-serif", fontSize: "0.85rem", color: "rgba(255,255,255,0.72)",
          margin: 0, flex: 1, minWidth: "220px", lineHeight: 1.5,
        }}>
          Usamos cookies propias y de terceros para mejorar tu experiencia y analizar el tráfico. Puedes aceptarlas, configurarlas o rechazarlas.{" "}
          <a href="/politica-de-cookies" style={{ color: "#ff5833", textDecoration: "underline" }}>Más información</a>
        </p>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <BtnSecondary onClick={() => save(false, false)}>Rechazar</BtnSecondary>
          <BtnSecondary onClick={() => setShowModal(true)}>Configurar</BtnSecondary>
          <BtnPrimary onClick={() => save(true, true)}>Aceptar todas</BtnPrimary>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 10000,
          background: "rgba(0,0,0,0.75)", display: "flex",
          alignItems: "center", justifyContent: "center", padding: "24px",
        }}>
          <div style={{
            background: "#1a1a1a", borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.08)",
            padding: "32px", maxWidth: "480px", width: "100%",
          }}>
            <h2 style={{ fontFamily: "Arial, sans-serif", fontWeight: 700, fontSize: "1.15rem", color: "#f0ede8", margin: "0 0 8px" }}>
              Configurar cookies
            </h2>
            <p style={{ fontFamily: "Arial, sans-serif", fontSize: "0.85rem", color: "#aaaaaa", marginBottom: "24px", lineHeight: 1.6 }}>
              Selecciona qué tipos de cookies deseas permitir.
            </p>

            <ToggleRow
              label="Necesarias"
              desc="Imprescindibles para el funcionamiento del sitio."
              enabled={true}
              locked={true}
            />
            <ToggleRow
              label="Analíticas"
              desc="Nos ayudan a entender cómo se usa el sitio."
              enabled={prefs.analytics}
              onChange={v => setPrefs(p => ({ ...p, analytics: v }))}
            />
            <ToggleRow
              label="Marketing"
              desc="Usadas para mostrarte publicidad relevante (Meta Pixel)."
              enabled={prefs.marketing}
              onChange={v => setPrefs(p => ({ ...p, marketing: v }))}
            />

            <div style={{ display: "flex", gap: "10px", marginTop: "28px", justifyContent: "flex-end" }}>
              <BtnSecondary onClick={() => save(false, false)}>Rechazar todas</BtnSecondary>
              <BtnPrimary onClick={() => save(prefs.analytics, prefs.marketing)}>Guardar preferencias</BtnPrimary>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ToggleRow({ label, desc, enabled, locked, onChange }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", justifyContent: "space-between",
      padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", gap: "16px",
    }}>
      <div>
        <p style={{ fontFamily: "Arial, sans-serif", fontSize: "0.9rem", fontWeight: 700, color: "#f0ede8", margin: "0 0 3px" }}>{label}</p>
        <p style={{ fontFamily: "Arial, sans-serif", fontSize: "0.8rem", color: "#aaaaaa", margin: 0 }}>{desc}</p>
      </div>
      {locked ? (
        <span style={{ fontSize: "0.75rem", color: "#666", whiteSpace: "nowrap", marginTop: "4px" }}>Siempre activas</span>
      ) : (
        <button
          onClick={() => onChange(!enabled)}
          style={{
            width: "44px", height: "24px", borderRadius: "12px", border: "none",
            background: enabled ? "#ff5833" : "rgba(255,255,255,0.12)",
            cursor: "pointer", position: "relative", flexShrink: 0, transition: "background 0.2s",
          }}
        >
          <span style={{
            position: "absolute", top: "3px",
            left: enabled ? "23px" : "3px",
            width: "18px", height: "18px", borderRadius: "50%",
            background: "#fff", transition: "left 0.2s",
          }} />
        </button>
      )}
    </div>
  );
}

function BtnPrimary({ onClick, children }) {
  return (
    <button onClick={onClick} style={{
      fontFamily: "Arial, sans-serif", fontSize: "0.85rem", fontWeight: 700,
      background: "#ff5833", color: "#fff", border: "none",
      borderRadius: "8px", padding: "10px 20px", cursor: "pointer",
    }}>
      {children}
    </button>
  );
}

function BtnSecondary({ onClick, children }) {
  return (
    <button onClick={onClick} style={{
      fontFamily: "Arial, sans-serif", fontSize: "0.85rem", fontWeight: 400,
      background: "transparent", color: "rgba(255,255,255,0.65)",
      border: "1px solid rgba(255,255,255,0.2)",
      borderRadius: "8px", padding: "10px 20px", cursor: "pointer",
    }}>
      {children}
    </button>
  );
}