import React, { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import LandingEditorInner from "@/components/admin/LandingEditorInner";
import ExplorarAdminContent from "@/components/admin/ExplorarAdminContent";

export default function DesignEditor() {
  const [active, setActive] = useState("landing");

  return (
    <AdminLayout activePage="DesignEditor">
      {/* iOS-style toggle header */}
      <div className="px-4 sm:px-8 lg:px-12 pt-5 pb-0 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-white tracking-tight">Design Editor</h1>
          <p className="text-[11px] text-white/25 mt-0.5">
            {active === "landing" ? "Editor de la página de inicio" : "Editor de la plataforma Explorar"}
          </p>
        </div>
        {/* iOS pill toggle */}
        <div className="inline-flex bg-white/[0.05] border border-white/[0.08] rounded-xl p-1 gap-0.5">
          <button
            onClick={() => setActive("landing")}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
            style={active === "landing" ? {
              background: "#ffffff",
              color: "#000000",
              boxShadow: "0 1px 8px rgba(0,0,0,0.4)"
            } : { color: "rgba(255,255,255,0.35)" }}
          >
            Landing
          </button>
          <button
            onClick={() => setActive("explorar")}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
            style={active === "explorar" ? {
              background: "#ffffff",
              color: "#000000",
              boxShadow: "0 1px 8px rgba(0,0,0,0.4)"
            } : { color: "rgba(255,255,255,0.35)" }}
          >
            Explorar
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="mt-4 border-t border-white/[0.05]" />

      {/* Content */}
      {active === "landing" ? <LandingEditorInner /> : <ExplorarAdminContent />}
    </AdminLayout>
  );
}