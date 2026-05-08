import React from "react";

const SOCIALS = [
  { label: "Instagram", href: "https://instagram.com/cabanacreative" },
  { label: "TikTok", href: "https://tiktok.com/@cabanacreative" },
  { label: "YouTube", href: "https://youtube.com/@cabanacreative" },
];

const LINKS = [
  { label: "Plataforma", href: "/Explorar" },
  { label: "Contacto", href: "mailto:hola@cabanacreative.es" },
];

export default function StartFooter() {
  return (
    <footer
      className="px-6 sm:px-12 lg:px-20 py-12"
      style={{ background: "#0c0c0c", borderTop: "1px solid rgba(240,237,232,0.06)" }}
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <img
            src="https://media.base44.com/images/public/6966ddf48947f217e81ea27c/6b7c4002a_Titulo.png"
            alt="Cabaña Creative"
            className="h-8 w-auto opacity-70"
          />
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center gap-6 sm:gap-8">
          {SOCIALS.map(s => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold uppercase tracking-widest transition-opacity hover:opacity-100"
              style={{ color: "rgba(240,237,232,0.35)", letterSpacing: "0.15em" }}
            >
              {s.label}
            </a>
          ))}
          {LINKS.map(l => (
            <a
              key={l.label}
              href={l.href}
              className="text-xs font-semibold uppercase tracking-widest transition-opacity hover:opacity-100"
              style={{ color: "rgba(240,237,232,0.35)", letterSpacing: "0.15em" }}
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Copyright */}
        <p className="text-[10px] font-medium" style={{ color: "rgba(240,237,232,0.2)", letterSpacing: "0.08em" }}>
          © {new Date().getFullYear()} Cabaña Creative
        </p>
      </div>
    </footer>
  );
}