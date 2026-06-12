import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Users, Download, Trash2, ChevronDown } from "lucide-react";

const STATUS_OPTIONS = ["nueva", "revisada", "contactada", "aceptada", "rechazada"];
const STATUS_COLORS = {
  nueva: { bg: "rgba(255,88,51,0.1)", color: "#ff5833", border: "rgba(255,88,51,0.25)" },
  revisada: { bg: "rgba(59,130,246,0.1)", color: "#60a5fa", border: "rgba(59,130,246,0.25)" },
  contactada: { bg: "rgba(168,85,247,0.1)", color: "#c084fc", border: "rgba(168,85,247,0.25)" },
  aceptada: { bg: "rgba(16,185,129,0.1)", color: "#34d399", border: "rgba(16,185,129,0.25)" },
  rechazada: { bg: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.2)", border: "rgba(255,255,255,0.08)" },
};

function exportToExcel(apps) {
  const headers = ["Nombre","Apellidos","Email","Teléfono","Fecha Nacimiento","País Residencia","Nacionalidad","Disponibilidad Madrid","Situación Laboral","Experiencia Música","Presupuesto +2000€","Estado","Fecha Solicitud"];
  const rows = apps.map(a => [
    a.nombre || "",
    a.apellidos || "",
    a.email || "",
    a.telefono || "",
    a.fecha_nacimiento || "",
    a.pais_residencia || "",
    a.nacionalidad || "",
    a.disponibilidad_viaje_madrid === "si" ? "Sí" : "No",
    a.situacion_laboral || "",
    a.experiencia_musica || "",
    a.presupuesto_minimo ? "Sí" : "No",
    a.status || "nueva",
    a.created_date ? new Date(a.created_date).toLocaleDateString("es-ES") : "",
  ]);

  const csvContent = [headers, ...rows]
    .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `solicitudes_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function StatusSelect({ current, onChange }) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_COLORS[current] || STATUS_COLORS.nueva;
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={e => { e.stopPropagation(); setOpen(!open); }}
        style={{
          display: "flex", alignItems: "center", gap: "4px",
          background: cfg.bg, border: `1px solid ${cfg.border}`,
          borderRadius: "20px", padding: "3px 10px 3px 8px",
          fontSize: "11px", fontWeight: 600, color: cfg.color,
          cursor: "pointer", fontFamily: "'Helvetica Neue', sans-serif",
          textTransform: "capitalize",
        }}
      >
        {current || "nueva"} <ChevronDown size={11} />
      </button>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 10 }} onClick={() => setOpen(false)} />
          <div style={{
            position: "absolute", top: "110%", left: 0, zIndex: 20,
            background: "#1a1a1c", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "10px", overflow: "hidden", minWidth: "130px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}>
            {STATUS_OPTIONS.map(s => {
              const c = STATUS_COLORS[s];
              return (
                <button
                  key={s}
                  onClick={e => { e.stopPropagation(); onChange(s); setOpen(false); }}
                  style={{
                    display: "block", width: "100%", textAlign: "left",
                    padding: "8px 14px", fontSize: "12px", fontWeight: 600,
                    color: c.color, background: "transparent", border: "none",
                    cursor: "pointer", fontFamily: "'Helvetica Neue', sans-serif",
                    textTransform: "capitalize",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default function ApplicationsPanel() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("artistas");

  const { data: apps = [] } = useQuery({
    queryKey: ["applicationForms"],
    queryFn: () => base44.entities.ApplicationForm.list("-created_date"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.ApplicationForm.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["applicationForms"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ApplicationForm.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["applicationForms"] }),
  });

  const artistasApps = apps.filter(a => !a.tipo || a.tipo === "Artista");
  const marcasApps = apps.filter(a => a.tipo === "Marca");
  const visibleApps = activeTab === "artistas" ? artistasApps : marcasApps;

  const nuevasArtistas = artistasApps.filter(a => !a.status || a.status === "nueva").length;
  const nuevasMarcas = marcasApps.filter(a => !a.status || a.status === "nueva").length;

  return (
    <div className="bg-[#111113] border border-white/[0.07] rounded-2xl p-4 sm:p-5 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Users className="w-4 h-4 text-orange-400" />
        <h3 className="text-sm font-semibold text-white flex-1">Solicitudes</h3>
        {visibleApps.length > 0 && (
          <button
            onClick={() => exportToExcel(visibleApps)}
            className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            <Download className="w-3 h-3" />
            Exportar
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 p-1 bg-white/[0.03] rounded-xl border border-white/[0.05]">
        {[
          { key: "artistas", label: "Artistas", count: nuevasArtistas },
          { key: "marcas", label: "Marcas", count: nuevasMarcas },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: activeTab === tab.key ? "rgba(255,88,51,0.12)" : "transparent",
              color: activeTab === tab.key ? "#ff5833" : "rgba(255,255,255,0.3)",
              border: activeTab === tab.key ? "1px solid rgba(255,88,51,0.2)" : "1px solid transparent",
            }}
          >
            {tab.label}
            {tab.count > 0 && (
              <span style={{
                fontSize: "9px", fontWeight: 700, padding: "1px 5px",
                borderRadius: "20px", background: "rgba(255,88,51,0.2)", color: "#ff5833",
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {visibleApps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 rounded-xl border border-white/[0.05] bg-white/[0.02]">
          <Users className="w-8 h-8 text-white/10 mb-2" />
          <p className="text-xs text-white/25">No hay solicitudes todavía</p>
        </div>
      ) : (
        <div className="space-y-2">
          {visibleApps.map(app => (
            <div
              key={app.id}
              className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.1] transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-white truncate">
                      {app.nombre} {app.apellidos}
                    </p>
                    <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)" }}>·</span>
                    <p className="text-xs text-white/30 truncate">{app.email}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {app.telefono && <span className="text-[11px] text-white/25">{app.telefono}</span>}
                    {app.pais_residencia && <span className="text-[11px] text-white/25">· {app.pais_residencia}</span>}
                    {activeTab === "artistas" && app.disponibilidad_viaje_madrid && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${app.disponibilidad_viaje_madrid === "si" ? "bg-emerald-500/10 text-emerald-400" : "bg-white/[0.05] text-white/20"}`}>
                        Madrid: {app.disponibilidad_viaje_madrid === "si" ? "Sí" : "No"}
                      </span>
                    )}
                    {activeTab === "marcas" && app.situacion_laboral && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-medium">
                        {app.situacion_laboral}
                      </span>
                    )}
                    {activeTab === "marcas" && app.disponibilidad_viaje_madrid && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.05] text-white/30 font-medium">
                        {app.disponibilidad_viaje_madrid}
                      </span>
                    )}
                    {app.created_date && (
                      <span className="text-[10px] text-white/20 ml-auto">
                        {new Date(app.created_date).toLocaleDateString("es-ES", { timeZone: "Europe/Madrid" })}
                        {" · "}
                        {new Date(app.created_date).toLocaleTimeString("es-ES", { timeZone: "Europe/Madrid", hour: "2-digit", minute: "2-digit", hour12: true })}
                      </span>
                    )}
                  </div>
                  {app.presupuesto && (
                    <p className="text-[10px] text-white/20 mt-1 truncate">{app.presupuesto}</p>
                  )}
                  {/* Nuevos campos paso 3 — solo artistas */}
                  {activeTab === "artistas" && (app.generos_musicales?.length > 0 || app.fase_proyecto || app.objetivo_cabana || app.presupuesto_disponible || app.timing_arranque) && (
                    <div className="mt-2 space-y-1.5">
                      {app.generos_musicales?.length > 0 && (
                        <div className="flex items-start gap-1.5 flex-wrap">
                          <span className="text-[10px] text-white/30 font-semibold shrink-0 mt-0.5">Géneros:</span>
                          {app.generos_musicales.map(g => (
                            <span key={g} style={{ fontSize: "9px", padding: "2px 7px", borderRadius: "20px", background: "rgba(255,88,51,0.1)", border: "1px solid rgba(255,88,51,0.2)", color: "#ff5833", fontWeight: 600, fontFamily: "'Helvetica Neue', sans-serif" }}>
                              {g}
                            </span>
                          ))}
                        </div>
                      )}
                      {app.fase_proyecto && (
                        <p className="text-[10px] text-white/30"><span className="font-semibold text-white/40">Fase:</span> {app.fase_proyecto}</p>
                      )}
                      {app.objetivo_cabana && (
                        <p className="text-[10px] text-white/30"><span className="font-semibold text-white/40">Objetivo:</span> {app.objetivo_cabana}</p>
                      )}
                      {app.presupuesto_disponible && (
                        <p className="text-[10px] text-white/30"><span className="font-semibold text-white/40">Presupuesto:</span> {app.presupuesto_disponible}</p>
                      )}
                      {app.timing_arranque && (
                        <p className="text-[10px] text-white/30"><span className="font-semibold text-white/40">Arranque:</span> {app.timing_arranque}</p>
                      )}
                      {app.fecha_envio && (
                        <p className="text-[10px] text-white/20">
                          <span className="font-semibold">Enviado el:</span>{" "}
                          {new Date(app.fecha_envio).toLocaleString("es-ES", { timeZone: "Europe/Madrid", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusSelect
                    current={app.status || "nueva"}
                    onChange={(status) => updateMutation.mutate({ id: app.id, status })}
                  />
                  <button
                    onClick={() => deleteMutation.mutate(app.id)}
                    className="w-7 h-7 rounded-lg bg-white/0 hover:bg-red-500/10 flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-white/20 hover:text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}