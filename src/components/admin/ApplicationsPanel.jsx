import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Users, Download, Trash2, ChevronDown, ChevronUp, Music, Mail, MessageCircle } from "lucide-react";

const STATUS_OPTIONS = ["nueva", "revisada", "contactada", "aceptada", "rechazada"];
const STATUS_COLORS = {
  nueva: { bg: "rgba(255,88,51,0.1)", color: "#ff5833", border: "rgba(255,88,51,0.25)" },
  revisada: { bg: "rgba(59,130,246,0.1)", color: "#60a5fa", border: "rgba(59,130,246,0.25)" },
  contactada: { bg: "rgba(168,85,247,0.1)", color: "#c084fc", border: "rgba(168,85,247,0.25)" },
  aceptada: { bg: "rgba(16,185,129,0.1)", color: "#34d399", border: "rgba(16,185,129,0.25)" },
  rechazada: { bg: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.2)", border: "rgba(255,255,255,0.08)" },
};

function formatDate(isoStr) {
  if (!isoStr) return null;
  return new Date(isoStr).toLocaleString("es-ES", {
    timeZone: "Europe/Madrid",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function exportToExcel(apps) {
  const headers = ["Nombre","Apellidos","Email","Teléfono","Instagram","Fecha Nacimiento","País Residencia","Nacionalidad","Viaje Madrid","Géneros","Fase Proyecto","Objetivo","Presupuesto","Timing","Estado","Fecha Envío"];
  const rows = apps.map(a => [
    a.nombre || "",
    a.apellidos || "",
    a.email || "",
    a.telefono || "",
    a.instagram ? "@"+a.instagram : "",
    a.fecha_nacimiento || "",
    a.pais_residencia || "",
    a.nacionalidad || "",
    a.disponibilidad_viaje_madrid === "si" ? "Sí" : a.disponibilidad_viaje_madrid === "no" ? "No" : "",
    (a.generos_musicales || []).join(", "),
    a.fase_proyecto || "",
    a.objetivo_cabana || "",
    a.presupuesto_disponible || "",
    a.timing_arranque || "",
    a.status || "nueva",
    a.fecha_envio ? formatDate(a.fecha_envio) : (a.created_date ? formatDate(a.created_date) : ""),
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
                <button key={s}
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
                >{s}</button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* ── reusable section header ── */
function SectionTitle({ children }) {
  return (
    <div style={{
      fontFamily: "'Helvetica Neue', sans-serif",
      fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em",
      color: "rgba(255,255,255,0.2)", textTransform: "uppercase",
      marginBottom: "8px",
    }}>{children}</div>
  );
}

/* ── 2‑column row inside a section ── */
function FieldPair({ left, right }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px",
      marginBottom: "6px",
    }}>
      <div>
        <span style={{ fontFamily: "'Helvetica Neue', sans-serif", fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.25)", display: "block", marginBottom: "1px" }}>{left.label}</span>
        <span style={{ fontFamily: "'Helvetica Neue', sans-serif", fontSize: "11px", color: left.orange ? "#ff5833" : "rgba(240,237,232,0.7)", lineHeight: 1.4 }}>
          {left.value || <span style={{ color: "rgba(255,255,255,0.15)" }}>No especificado</span>}
        </span>
      </div>
      {right && (
        <div>
          <span style={{ fontFamily: "'Helvetica Neue', sans-serif", fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.25)", display: "block", marginBottom: "1px" }}>{right.label}</span>
          <span style={{ fontFamily: "'Helvetica Neue', sans-serif", fontSize: "11px", color: right.orange ? "#ff5833" : "rgba(240,237,232,0.7)", lineHeight: 1.4 }}>
            {right.value || <span style={{ color: "rgba(255,255,255,0.15)" }}>No especificado</span>}
          </span>
        </div>
      )}
    </div>
  );
}

/* ── full‑width row ── */
function FieldFull({ label, value }) {
  return (
    <div style={{ marginBottom: "6px" }}>
      <span style={{ fontFamily: "'Helvetica Neue', sans-serif", fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.25)", display: "block", marginBottom: "1px" }}>{label}</span>
      <span style={{ fontFamily: "'Helvetica Neue', sans-serif", fontSize: "11px", color: "rgba(240,237,232,0.7)", lineHeight: 1.4 }}>
        {value || <span style={{ color: "rgba(255,255,255,0.15)" }}>No especificado</span>}
      </span>
    </div>
  );
}

const SECTION_SEPARATOR = { borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "12px", marginTop: "12px" };

export default function ApplicationsPanel() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("artistas");
  const [expandedId, setExpandedId] = useState(null);

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
      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-4">
        <Users className="w-4 h-4 text-orange-400" />
        <h3 className="text-sm font-semibold text-white flex-1">Solicitudes</h3>
        {visibleApps.length > 0 && (
          <button
            onClick={() => exportToExcel(visibleApps)}
            className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            <Download className="w-3 h-3" /> Exportar
          </button>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 mb-4 p-1 bg-white/[0.03] rounded-xl border border-white/[0.05]">
        {[
          { key: "artistas", label: "Artistas", count: nuevasArtistas },
          { key: "marcas", label: "Marcas", count: nuevasMarcas },
        ].map(tab => (
          <button key={tab.key}
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
              <span style={{ fontSize: "9px", fontWeight: 700, padding: "1px 5px", borderRadius: "20px", background: "rgba(255,88,51,0.2)", color: "#ff5833" }}>{tab.count}</span>
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
          {visibleApps.map(app => {
            const isExpanded = expandedId === app.id;
            const fechaDisplay = app.fecha_envio
              ? formatDate(app.fecha_envio)
              : app.created_date ? formatDate(app.created_date) : null;
            const generos = Array.isArray(app.generos_musicales) ? app.generos_musicales : [];

            return (
              <div key={app.id}
                className="rounded-xl bg-white/[0.03] border transition-all"
                style={{ borderColor: isExpanded ? "rgba(255,88,51,0.2)" : "rgba(255,255,255,0.06)" }}
              >
                {/* ═══════════ COLLAPSED HEADER ═══════════ */}
                <div
                  className="p-3.5 flex items-start gap-3 cursor-pointer hover:bg-white/[0.02] transition-colors rounded-xl"
                  onClick={() => setExpandedId(isExpanded ? null : app.id)}
                >
                  <div className="flex-1 min-w-0">
                    {/* Row 1: nombre · email */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-white">{app.nombre} {app.apellidos}</p>
                      <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)" }}>·</span>
                      <p className="text-xs text-white/30 truncate">{app.email}</p>
                    </div>
                    {/* Row 2: indicators */}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {app.telefono && <span className="text-[10px] text-white/25">{app.telefono}</span>}
                      {app.pais_residencia && <span className="text-[10px] text-white/25">· {app.pais_residencia}</span>}
                      {generos.length > 0 && (
                        <span style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "9px", padding: "1px 6px", borderRadius: "20px", background: "rgba(255,88,51,0.08)", border: "1px solid rgba(255,88,51,0.18)", color: "#ff5833", fontWeight: 700 }}>
                          <Music size={8} /> {generos.length}
                        </span>
                      )}
                      {app.presupuesto_disponible && (
                        <span className="text-[10px] text-white/25 max-w-[200px] truncate">{app.presupuesto_disponible}</span>
                      )}
                      {app.timing_arranque && (
                        <span className="text-[10px] text-white/20 max-w-[150px] truncate">{app.timing_arranque}</span>
                      )}
                      {fechaDisplay && (
                        <span className="text-[10px] text-white/20 ml-auto">{fechaDisplay}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusSelect current={app.status || "nueva"} onChange={(status) => updateMutation.mutate({ id: app.id, status })} />
                    <button onClick={e => { e.stopPropagation(); deleteMutation.mutate(app.id); }}
                      className="w-7 h-7 rounded-lg bg-white/0 hover:bg-red-500/10 flex items-center justify-center transition-colors">
                      <Trash2 className="w-3.5 h-3.5 text-white/20 hover:text-red-400" />
                    </button>
                    <div className="w-5 flex items-center justify-center">
                      {isExpanded ? <ChevronUp size={13} className="text-white/30" /> : <ChevronDown size={13} className="text-white/20" />}
                    </div>
                  </div>
                </div>

                {/* ═══════════ EXPANDED DETAIL ═══════════ */}
                {isExpanded && (
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "14px 16px 16px" }}>

                    {/* ── DATOS PERSONALES ── */}
                    <SectionTitle>Datos personales</SectionTitle>
                    <FieldPair
                      left={{ label: "Nombre", value: app.nombre }}
                      right={{ label: "Email", value: app.email, orange: true }}
                    />
                    <FieldPair
                      left={{ label: "Teléfono", value: app.telefono }}
                      right={{ label: "Fecha de nacimiento", value: app.fecha_nacimiento }}
                    />
                    <FieldPair
                      left={{
                        label: "Instagram",
                        value: app.instagram ? (
                          <a href={`https://instagram.com/${app.instagram}`} target="_blank" rel="noreferrer" style={{ color: "#ff5833", textDecoration: "none" }} onMouseEnter={e => e.target.style.textDecoration = "underline"} onMouseLeave={e => e.target.style.textDecoration = "none"}>@{app.instagram}</a>
                        ) : null
                      }}
                      right={null}
                    />

                    {/* ── UBICACIÓN ── */}
                    <div style={SECTION_SEPARATOR}>
                      <SectionTitle>Ubicación</SectionTitle>
                      <FieldPair
                        left={{ label: "País de residencia", value: app.pais_residencia }}
                        right={{ label: "Nacionalidad", value: app.nacionalidad }}
                      />
                      <FieldPair
                        left={{
                          label: "Viaje a Madrid",
                          value: app.disponibilidad_viaje_madrid === "si" ? "Sí" : app.disponibilidad_viaje_madrid === "no" ? "No" : app.disponibilidad_viaje_madrid || null
                        }}
                        right={null}
                      />
                    </div>

                    {/* ── SU PROYECTO ── */}
                    <div style={SECTION_SEPARATOR}>
                      <SectionTitle>Su proyecto</SectionTitle>

                      {/* Géneros — chips */}
                      <div style={{ marginBottom: "8px" }}>
                        <span style={{ fontFamily: "'Helvetica Neue', sans-serif", fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.25)", display: "block", marginBottom: "4px" }}>Géneros musicales</span>
                        {generos.length > 0 ? (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                            {generos.map(g => (
                              <span key={g} style={{
                                fontSize: "10px", padding: "4px 12px", borderRadius: "20px",
                                background: "rgba(255,88,51,0.15)", border: "1px solid rgba(255,88,51,0.35)",
                                color: "#ff5833", fontWeight: 600,
                                fontFamily: "'Helvetica Neue', sans-serif",
                              }}>{g}</span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.15)", fontFamily: "'Helvetica Neue', sans-serif" }}>No especificado</span>
                        )}
                      </div>

                      <FieldPair
                        left={{ label: "Fase del proyecto", value: app.fase_proyecto }}
                        right={{ label: "Objetivo con Cabaña", value: app.objetivo_cabana }}
                      />
                      <FieldPair
                        left={{ label: "Presupuesto", value: app.presupuesto_disponible }}
                        right={{ label: "Cuándo quiere arrancar", value: app.timing_arranque }}
                      />
                    </div>

                    {/* ── REGISTRO ── */}
                    <div style={SECTION_SEPARATOR}>
                      <SectionTitle>Registro</SectionTitle>
                      <FieldFull label="Enviado el" value={fechaDisplay || "No disponible"} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}