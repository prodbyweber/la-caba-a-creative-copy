import React, { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import LandingEditorInner from "@/components/admin/LandingEditorInner";
import ExplorarAdminContent from "@/components/admin/ExplorarAdminContent";
import ParaTiAdmin from "@/components/admin/ParaTiAdmin";
import CatalogoAdminPanel from "@/components/admin/CatalogoAdminPanel";

export default function DesignEditor() {
  const [active, setActive] = useState("landing");
  const tabs = [
    { key: "landing", label: "Landing" },
    { key: "catalogo", label: "Catálogo" },
    { key: "explorar", label: "Explorar" },
    { key: "parati", label: "Para Ti" },
  ];

  return (
    <AdminLayout activePage="DesignEditor">
      {/* Top navigation buttons */}
      <div className="px-4 sm:px-8 lg:px-12 pt-5 pb-0 flex items-center gap-3">
        <a
          href="/start"
          className="px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
          style={{
            background: "#ff5833",
            color: "#fff",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px"
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#e04a28"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#ff5833"; }}
        >
          <span>🎵</span> Ver Start
        </a>
        <a
          href="/Marcas"
          className="px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
          style={{
            background: "#ff5833",
            color: "#fff",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px"
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#e04a28"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#ff5833"; }}
        >
          <span>🏢</span> Ver Marcas
        </a>
      </div>

      {/* iOS-style toggle header */}
      <div className="px-4 sm:px-8 lg:px-12 pt-5 pb-0 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-white tracking-tight">Design Editor</h1>
          <p className="text-[11px] text-white/25 mt-0.5">
            {active === "landing" ? "Editor de la página de inicio" : active === "explorar" ? "Editor de la plataforma Explorar" : "Gestión del feed Para Ti"}
          </p>
        </div>
        {/* iOS pill toggle */}
        <div className="inline-flex bg-white/[0.05] border border-white/[0.08] rounded-xl p-1 gap-0.5 flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
              style={active === tab.key ? {
                background: "#ffffff",
                color: "#000000",
                boxShadow: "0 1px 8px rgba(0,0,0,0.4)"
              } : { color: "rgba(255,255,255,0.35)" }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="mt-4 border-t border-white/[0.05]" />

      {/* Content — full width */}
      <div className="w-full">
        {active === "landing" && <LandingEditorInner />}
        {active === "catalogo" && <CatalogoAdminPanel />}
        {active === "explorar" && <ExplorarAdminContent />}
        {active === "parati" && <ParaTiAdmin />}
      </div>
    </AdminLayout>
  );
}