import React from "react";

export default function StartFooter() {
  const year = new Date().getFullYear();
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(240,237,232,0.06)",
        padding: "clamp(24px, 4vw, 40px) clamp(24px, 6vw, 56px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
        background: "#0c0c0c",
      }}
    >
      <span
        style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontWeight: 700,
          fontSize: "11px",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "rgba(240,237,232,0.25)",
        }}
      >
        © {year} Cabaña Creative
      </span>
      <div style={{ display: "flex", gap: "clamp(16px, 3vw, 32px)" }}>
        {["Instagram", "TikTok", "YouTube"].map(s => (
          <a
            key={s}
            href="#"
            style={{
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontWeight: 600,
              fontSize: "10px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(240,237,232,0.25)",
              textDecoration: "none",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={e => e.currentTarget.style.color = "#f0ede8"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(240,237,232,0.25)"}
          >
            {s}
          </a>
        ))}
      </div>
    </footer>
  );
}