import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, MessageSquare, Trash2, Eye, User, Calendar, X, Download, Copy, Check, Building2, MapPin, Target, Clock, DollarSign, MonitorSmartphone, Users } from "lucide-react";

export const BRAND_STATUS_CONFIG = {
  nueva: { label: "Nueva", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  revisada: { label: "Revisada", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  contactada: { label: "Contactada", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  aceptada: { label: "Aceptada", color: "bg-[#ff5833]/10 text-[#ff5833] border-[#ff5833]/20" },
  rechazada: { label: "Rechazada", color: "bg-red-500/10 text-red-400 border-red-500/20" },
};

export function exportBrandCSV(brands) {
  const headers = ["Nombre","Apellidos","Email","Teléfono","Cargo","Sectores","Tamaño Equipo","Ubicación","Presencia Digital","Objetivo","Presupuesto","Timing","Estado","Enviado el"];
  const rows = brands.map(b => {
    const sectores = Array.isArray(b.sector_empresa) ? b.sector_empresa.join(", ") : "";
    const fechaDisplay = b.fecha_envio
      ? new Date(b.fecha_envio).toLocaleString("es-ES", { timeZone: "Europe/Madrid", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
      : (b.created_date ? new Date(b.created_date).toLocaleString("es-ES", { timeZone: "Europe/Madrid", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "");
    return [
      b.nombre, b.apellidos, b.email, b.telefono, b.cargo_empresa,
      sectores, b.tamano_equipo, b.disponibilidad_ubicacion,
      b.presencia_digital, b.objetivo_marca, b.presupuesto_disponible,
      b.timing_arranque, b.status, fechaDisplay
    ];
  });
  const csv = [headers,...rows].map(r=>r.map(v=>`"${(v||"").toString().replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv],{type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "solicitudes_marca.csv"; a.click();
  URL.revokeObjectURL(url);
}

function BrandDetailModal({ brand, onClose }) {
  if (!brand) return null;
  const cfg = BRAND_STATUS_CONFIG[brand.status] || BRAND_STATUS_CONFIG.nueva;
  const sectores = Array.isArray(brand.sector_empresa) ? brand.sector_empresa : [];
  const fechaDisplay = brand.fecha_envio
    ? new Date(brand.fecha_envio).toLocaleString("es-ES", { timeZone: "Europe/Madrid", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : (brand.created_date ? new Date(brand.created_date).toLocaleString("es-ES", { timeZone: "Europe/Madrid", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : null);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#111113] border border-white/[0.08] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#ff5833]/10 border border-[#ff5833]/20 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[#ff5833]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{brand.nombre} {brand.apellidos}</h3>
                <p className="text-xs text-white/40">{brand.email}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/10 flex items-center justify-center transition-colors">
              <X className="w-4 h-4 text-white/50" />
            </button>
          </div>
          <div className="p-6 space-y-3">
            {/* Acciones */}
            <div className="flex flex-col sm:flex-row gap-2 mb-4 pb-4 border-b border-white/[0.06]">
              <a
                href={`mailto:${brand.email}?subject=Tu solicitud en Cabaña Creative`}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#ff5833] hover:bg-[#e84d2a] text-white font-semibold text-sm transition-all"
              >
                <Mail className="w-4 h-4" /> Enviar email
              </a>
              {brand.telefono && (
                <a
                  href={`https://wa.me/${brand.telefono.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${brand.nombre}, soy el equipo de Cabaña Creative. Hemos recibido tu solicitud y nos gustaría conocer más sobre tu proyecto. ¿Tienes disponibilidad para una videollamada esta semana?`)}`}
                  target="_blank" rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all text-sm font-medium"
                >
                  <MessageSquare className="w-4 h-4" /> WhatsApp
                </a>
              )}
            </div>

            {/* Datos personales */}
            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1">Datos de contacto</p>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <Field label="Nombre" value={brand.nombre} />
              <Field label="Apellidos" value={brand.apellidos} />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <Field label="Email" value={brand.email} link={`mailto:${brand.email}`} accent />
              <Field label="Teléfono" value={brand.telefono} />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <Field label="Cargo" value={brand.cargo_empresa} />
              <Field label="Estado" value={cfg.label} />
            </div>

            {/* Empresa */}
            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1 pt-1">Empresa</p>
            <div className="p-2.5 sm:p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1.5">Sectores</p>
              {sectores.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {sectores.map(s => (
                    <span key={s} style={{ fontSize: "10px", padding: "3px 10px", borderRadius: "20px", background: "rgba(255,88,51,0.15)", border: "1px solid rgba(255,88,51,0.35)", color: "#ff5833", fontWeight: 600, fontFamily: "'Helvetica Neue', sans-serif" }}>{s}</span>
                  ))}
                </div>
              ) : <p className="text-xs text-white/25 italic">No especificado</p>}
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <Field label="Tamaño equipo" value={brand.tamano_equipo} />
              <Field label="Ubicación" value={brand.disponibilidad_ubicacion} />
            </div>

            {/* Marca */}
            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1 pt-1">Estrategia de marca</p>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <Field label="Presencia digital" value={brand.presencia_digital} />
              <Field label="Objetivo" value={brand.objetivo_marca} />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <Field label="Presupuesto" value={brand.presupuesto_disponible} />
              <Field label="Timing" value={brand.timing_arranque} />
            </div>

            {/* Registro */}
            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1 pt-1">Registro</p>
            <div className="p-2.5 sm:p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Enviado el</p>
              <p className="text-xs sm:text-sm text-white/70">{fechaDisplay || 'No disponible'}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function Field({ label, value, link, accent }) {
  const content = link ? (
    <a href={link} className={`text-xs sm:text-sm hover:underline break-all ${accent ? "text-[#ff5833]" : "text-white/70"}`}>{value || 'No especificado'}</a>
  ) : (
    <p className="text-xs sm:text-sm text-white/70">{value || 'No especificado'}</p>
  );
  return (
    <div className="p-2.5 sm:p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
      <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">{label}</p>
      {content}
    </div>
  );
}

export default function BrandLeadsPanel({
  brands, isLoading, updateBrandStatus, deleteBrand, selectedBrand, setSelectedBrand,
  copiedId, setCopiedId, filterStatus
}) {
  const newCount = brands.filter(b => b.status === 'nueva').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
      </div>
    );
  }

  if (brands.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-white/[0.05] bg-white/[0.02]">
        <Building2 className="w-12 h-12 text-white/10 mb-3" />
        <p className="text-white/25 text-sm">No hay solicitudes de marca</p>
      </div>
    );
  }

  const copyBrandData = async (brand) => {
    const sectores = Array.isArray(brand.sector_empresa) ? brand.sector_empresa : [];
    const fechaDisplay = brand.fecha_envio
      ? new Date(brand.fecha_envio).toLocaleString("es-ES", { timeZone: "Europe/Madrid", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
      : (brand.created_date ? new Date(brand.created_date).toLocaleString("es-ES", { timeZone: "Europe/Madrid", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : 'N/A');
    const text = `📋 Solicitud de Marca
👤 Contacto: ${brand.nombre} ${brand.apellidos}
📧 Email: ${brand.email}
📱 Teléfono: ${brand.telefono || 'No especificado'}
💼 Cargo: ${brand.cargo_empresa || 'No especificado'}
🏢 Sectores: ${sectores.join(', ') || 'No especificado'}
👥 Tamaño equipo: ${brand.tamano_equipo || 'No especificado'}
📍 Ubicación: ${brand.disponibilidad_ubicacion || 'No especificado'}
🖥️ Presencia digital: ${brand.presencia_digital || 'No especificado'}
🎯 Objetivo: ${brand.objetivo_marca || 'No especificado'}
💰 Presupuesto: ${brand.presupuesto_disponible || 'No especificado'}
⏱️ Timing: ${brand.timing_arranque || 'No especificado'}
🏷️ Estado: ${brand.status}
📅 Enviado: ${fechaDisplay}`;
    await navigator.clipboard.writeText(text);
    setCopiedId(brand.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      <div className="space-y-3 sm:space-y-4 pb-4">
        {brands.map((brand, i) => {
          const cfg = BRAND_STATUS_CONFIG[brand.status] || BRAND_STATUS_CONFIG.nueva;
          const sectores = Array.isArray(brand.sector_empresa) ? brand.sector_empresa : [];
          return (
            <motion.div key={brand.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.025 }}
              className="group bg-[#111113] border border-white/[0.06] hover:border-white/[0.12] rounded-xl p-3 sm:p-4 transition-all"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-xs sm:text-sm ${
                  brand.status === 'nueva' ? 'bg-[#ff5833]/15 text-[#ff5833]' : 'bg-white/[0.06] text-white/40'
                }`}>
                  {brand.nombre?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm sm:text-base font-semibold text-white">{brand.nombre} {brand.apellidos}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    {brand.status === 'nueva' && <span className="w-2 h-2 rounded-full bg-[#ff5833] animate-pulse" />}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                    <div className="flex flex-col gap-1 text-xs text-white/40">
                      <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" />{brand.email}</span>
                      {brand.telefono && <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{brand.telefono}</span>}
                      {brand.cargo_empresa && <span className="flex items-center gap-1.5"><User className="w-3 h-3" />{brand.cargo_empresa}</span>}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {sectores.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {sectores.slice(0, 3).map(s => (
                            <span key={s} style={{ fontSize: "9px", padding: "1px 6px", borderRadius: "20px", background: "rgba(255,88,51,0.12)", border: "1px solid rgba(255,88,51,0.25)", color: "#ff5833", fontWeight: 600, fontFamily: "'Helvetica Neue', sans-serif" }}>{s}</span>
                          ))}
                          {sectores.length > 3 && <span className="text-[9px] text-white/25">+{sectores.length - 3}</span>}
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-1">
                        {brand.tamano_equipo && <span className="text-[10px] px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/50 flex items-center gap-1"><Users className="w-2.5 h-2.5" />{brand.tamano_equipo}</span>}
                        {brand.presupuesto_disponible && <span className="text-[10px] px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/50 flex items-center gap-1"><DollarSign className="w-2.5 h-2.5" />{brand.presupuesto_disponible}</span>}
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-white/25 flex items-center gap-1 mb-2">
                    <Calendar className="w-3 h-3 flex-shrink-0" />
                    {brand.fecha_envio
                      ? new Date(brand.fecha_envio).toLocaleString("en-GB", { timeZone: "Europe/Madrid", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                      : brand.created_date
                        ? new Date(brand.created_date).toLocaleString("en-GB", { timeZone: "Europe/Madrid", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                        : 'No date available'
                    }
                  </p>
                  <div className="flex items-center gap-1.5">
                    <a href={`mailto:${brand.email}`} className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/50 hover:text-white hover:border-white/15 transition-all text-[10px] font-medium" title="Enviar email">
                      <Mail className="w-3 h-3" />
                    </a>
                    {brand.telefono && (
                      <>
                        <a href={`tel:${brand.telefono}`} className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/50 hover:text-white hover:border-white/15 transition-all text-[10px] font-medium" title="Llamar">
                          <Phone className="w-3 h-3" />
                        </a>
                        <a
                          href={`https://wa.me/${brand.telefono.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${brand.nombre}, soy el equipo de Cabaña Creative. Hemos recibido tu solicitud y nos gustaría conocer más sobre tu proyecto. ¿Tienes disponibilidad para una videollamada esta semana?`)}`}
                          target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/50 hover:text-emerald-400 hover:border-emerald-500/30 transition-all text-[10px] font-medium" title="WhatsApp"
                        >
                          <MessageSquare className="w-3 h-3" />
                        </a>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => copyBrandData(brand)} className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/[0.05] hover:bg-[#ff5833]/20 flex items-center justify-center transition-colors" title="Copiar datos">
                    {copiedId === brand.id ? <Check className="w-3.5 h-3.5 text-[#ff5833]" /> : <Copy className="w-3.5 h-3.5 text-white/50" />}
                  </button>
                  <button onClick={() => setSelectedBrand(brand)} className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/[0.05] hover:bg-white/10 flex items-center justify-center transition-colors" title="Ver detalle">
                    <Eye className="w-3.5 h-3.5 text-white/50" />
                  </button>
                  <select
                    value={brand.status}
                    onChange={e => updateBrandStatus.mutate({ id: brand.id, status: e.target.value })}
                    className="h-7 sm:h-8 px-1.5 sm:px-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/50 text-[10px] sm:text-xs focus:outline-none hover:bg-white/10 transition-colors cursor-pointer"
                    style={{ appearance: "none", paddingRight: "6px" }}
                  >
                    {Object.entries(BRAND_STATUS_CONFIG).map(([k, v]) => (
                      <option key={k} value={k} style={{ background: "#111" }}>{v.label}</option>
                    ))}
                  </select>
                  <button onClick={() => deleteBrand.mutate(brand.id)} className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/[0.05] hover:bg-red-500/10 flex items-center justify-center transition-colors group/del" title="Eliminar">
                    <Trash2 className="w-3.5 h-3.5 text-white/30 group-hover/del:text-red-400 transition-colors" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <BrandDetailModal brand={selectedBrand} onClose={() => setSelectedBrand(null)} />
    </>
  );
}