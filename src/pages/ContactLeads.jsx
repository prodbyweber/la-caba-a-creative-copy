import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Mail, Phone, MessageSquare, Trash2, Archive, Eye,
  User, Calendar, X, Search, FileText, Download
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const LEAD_STATUS_CONFIG = {
  Nuevo: { label: "Nuevo", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  Revisado: { label: "Revisado", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  Archivado: { label: "Archivado", color: "bg-white/5 text-white/30 border-white/10" }
};

const APP_STATUS_CONFIG = {
  nueva: { label: "Nueva", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  revisada: { label: "Revisada", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  contactada: { label: "Contactada", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  aceptada: { label: "Aceptada", color: "bg-[#ff5833]/10 text-[#ff5833] border-[#ff5833]/20" },
  rechazada: { label: "Rechazada", color: "bg-red-500/10 text-red-400 border-red-500/20" },
};

function LeadDetailModal({ lead, onClose }) {
  if (!lead) return null;
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
                <User className="w-5 h-5 text-[#ff5833]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{lead.name}</h3>
                <p className="text-xs text-white/40">{lead.email}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/10 flex items-center justify-center transition-colors">
              <X className="w-4 h-4 text-white/50" />
            </button>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Email</p>
                <a href={`mailto:${lead.email}`} className="text-sm text-[#ff5833] hover:underline break-all">{lead.email}</a>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Teléfono</p>
                {lead.phone && lead.phone !== '-' ? (
                  <a href={`tel:${lead.phone}`} className="text-sm text-white/70 hover:text-white">{lead.phone}</a>
                ) : (
                  <p className="text-sm text-white/25 italic">No indicado</p>
                )}
              </div>
            </div>
            {/* Botones de acción arriba */}
            <div className="flex flex-col sm:flex-row gap-2 mb-4 pb-4 border-b border-white/[0.06]">
              <a
                href={`mailto:${lead.email}?subject=Re: Tu mensaje en Cabaña Creative`}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#ff5833] hover:bg-[#e84d2a] text-white font-semibold text-sm transition-all"
              >
                <Mail className="w-4 h-4" />
                Responder email
              </a>
              {lead.phone && lead.phone !== '-' && (
                <a
                  href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${lead.name}, soy el equipo de Cabaña Creative. Hemos recibido tu mensaje y estamos aquí para ayudarte. ¿Cuándo te vendría bien una videollamada?`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all text-sm font-medium"
                >
                  <MessageSquare className="w-4 h-4" />
                  WhatsApp
                </a>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Email</p>
                <a href={`mailto:${lead.email}`} className="text-sm text-[#ff5833] hover:underline break-all">{lead.email}</a>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Teléfono</p>
                {lead.phone && lead.phone !== '-' ? (
                  <a href={`tel:${lead.phone}`} className="text-sm text-white/70 hover:text-white">{lead.phone}</a>
                ) : (
                  <p className="text-sm text-white/25 italic">No indicado</p>
                )}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Fecha</p>
              <p className="text-sm text-white/60">
                {lead.created_date ? format(parseISO(lead.created_date), "d 'de' MMMM yyyy, HH:mm", { locale: es }) : '—'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-3.5 h-3.5 text-[#ff5833]" />
                <p className="text-[10px] text-white/30 uppercase tracking-widest">Mensaje</p>
              </div>
              <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line">{lead.message}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function ApplicationDetailModal({ app, onClose }) {
  if (!app) return null;
  const cfg = APP_STATUS_CONFIG[app.status] || APP_STATUS_CONFIG.nueva;
  const fields = [
    { label: "Nombre", value: `${app.nombre || ''} ${app.apellidos || ''}`.trim() },
    { label: "Email", value: app.email, href: `mailto:${app.email}` },
    { label: "Teléfono", value: app.telefono },
    { label: "Fecha nacimiento", value: app.fecha_nacimiento },
    { label: "País de residencia", value: app.pais_residencia },
    { label: "Nacionalidad", value: app.nacionalidad },
    { label: "Viaje a Madrid", value: app.disponibilidad_viaje_madrid === 'si' ? 'Sí' : app.disponibilidad_viaje_madrid === 'no' ? 'No' : app.disponibilidad_viaje_madrid },
    { label: "Situación laboral", value: app.situacion_laboral },
    { label: "Experiencia música", value: app.experiencia_musica },
    { label: "Presupuesto", value: app.presupuesto || 'No especificado' },
  ];
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
                <FileText className="w-5 h-5 text-[#ff5833]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{app.nombre} {app.apellidos}</h3>
                <p className="text-xs text-white/40">{app.email}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/10 flex items-center justify-center transition-colors">
              <X className="w-4 h-4 text-white/50" />
            </button>
          </div>
          <div className="p-6 space-y-3">
            {/* Botones de acción arriba */}
            <div className="flex flex-col sm:flex-row gap-2 mb-4 pb-4 border-b border-white/[0.06]">
              <a
                href={`mailto:${app.email}?subject=Tu solicitud en Cabaña Creative`}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#ff5833] hover:bg-[#e84d2a] text-white font-semibold text-sm transition-all"
              >
                <Mail className="w-4 h-4" />
                Enviar email
              </a>
              {app.telefono && app.telefono !== '-' && (
                <a
                  href={`https://wa.me/${app.telefono.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${app.nombre}, soy el equipo de Cabaña Creative. Hemos recibido tu solicitud y nos gustaría conocer más sobre tu proyecto. ¿Tienes disponibilidad para una videollamada esta semana?`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all text-sm font-medium"
                >
                  <MessageSquare className="w-4 h-4" />
                  WhatsApp
                </a>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {fields.map(f => f.value ? (
                <div key={f.label} className="p-2.5 sm:p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">{f.label}</p>
                  {f.href ? (
                    <a href={f.href} className="text-xs sm:text-sm text-[#ff5833] hover:underline break-all">{f.value}</a>
                  ) : (
                    <p className="text-xs sm:text-sm text-white/70">{f.value}</p>
                  )}
                </div>
              ) : null)}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function exportCSV(apps) {
  const headers = ["Nombre","Apellidos","Email","Teléfono","F. Nacimiento","País","Nacionalidad","Viaje Madrid","Sit. Laboral","Exp. Música","Presupuesto","Estado","Fecha"];
  const rows = apps.map(a => [
    a.nombre,a.apellidos,a.email,a.telefono,a.fecha_nacimiento,a.pais_residencia,a.nacionalidad,
    a.disponibilidad_viaje_madrid,a.situacion_laboral,a.experiencia_musica,
    a.presupuesto_minimo?"Sí":"No",a.status,
    a.created_date ? format(parseISO(a.created_date),"d/MM/yyyy HH:mm"):""
  ]);
  const csv = [headers,...rows].map(r=>r.map(v=>`"${(v||"").toString().replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob([csv],{type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "solicitudes.csv"; a.click();
  URL.revokeObjectURL(url);
}

export default function ContactLeads() {
  const [tab, setTab] = useState("applications");
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Hide mobile bottom nav when modal is open
  useEffect(() => {
    if (modalOpen) {
      document.body.classList.add('admin-modal-open');
    } else {
      document.body.classList.remove('admin-modal-open');
    }
    return () => document.body.classList.remove('admin-modal-open');
  }, [modalOpen]);

  const { data: leads = [], isLoading: leadsLoading } = useQuery({
    queryKey: ['contactLeads'],
    queryFn: () => base44.entities.ContactLead.list('-created_date')
  });

  const { data: applications = [], isLoading: appsLoading } = useQuery({
    queryKey: ['applicationForms'],
    queryFn: () => base44.entities.ApplicationForm.list('-created_date')
  });

  const updateLeadStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.ContactLead.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contactLeads'] })
  });

  const updateAppStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.ApplicationForm.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['applicationForms'] })
  });

  const deleteLead = useMutation({
    mutationFn: (id) => base44.entities.ContactLead.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['contactLeads'] }); setSelectedLead(null); }
  });

  const deleteApp = useMutation({
    mutationFn: (id) => base44.entities.ApplicationForm.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['applicationForms'] }); setSelectedApp(null); }
  });

  // Filtered leads
  const filteredLeads = leads.filter(l => {
    const matchSearch = !search || l.name?.toLowerCase().includes(search.toLowerCase()) || l.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || l.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Filtered applications
  const filteredApps = applications.filter(a => {
    const name = `${a.nombre || ''} ${a.apellidos || ''}`.toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase()) || a.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleViewLead = (lead) => {
    setSelectedLead(lead);
    setModalOpen(true);
    if (lead.status === 'Nuevo') updateLeadStatus.mutate({ id: lead.id, status: 'Revisado' });
  };

  const handleCloseModal = () => {
    setSelectedLead(null);
    setModalOpen(false);
  };

  const handleViewApp = (app) => {
    setSelectedApp(app);
    setModalOpen(true);
  };

  const newAppsCount = applications.filter(a => a.status === 'nueva').length;
  const newLeadsCount = leads.filter(l => l.status === 'Nuevo').length;

  return (
    <AdminLayout activePage="ContactLeads">
      <div className="px-4 sm:px-6 lg:px-10 xl:px-16 py-8 sm:py-10 max-w-[1400px] mx-auto pb-24 sm:pb-16" style={{ paddingBottom: modalOpen ? '2rem' : undefined }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">Solicitudes</h1>
          <p className="text-xs sm:text-sm text-white/30">Gestión de todas las solicitudes recibidas</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 sm:gap-2 mb-5 sm:mb-6 border-b border-white/[0.07] pb-0">
          <button
            onClick={() => { setTab("applications"); setSearch(""); setFilterStatus("all"); }}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition-all border-b-2 -mb-px ${
              tab === "applications"
                ? "border-[#ff5833] text-white"
                : "border-transparent text-white/35 hover:text-white/60"
            }`}
          >
            Solicitudes de Plaza
            {newAppsCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#ff5833] text-white font-bold">{newAppsCount}</span>
            )}
          </button>
          <button
            onClick={() => { setTab("contact"); setSearch(""); setFilterStatus("all"); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-px ${
              tab === "contact"
                ? "border-[#ff5833] text-white"
                : "border-transparent text-white/35 hover:text-white/60"
            }`}
          >
            Mensajes de Contacto
            {newLeadsCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#ff5833] text-white font-bold">{newLeadsCount}</span>
            )}
          </button>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5 sm:mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 sm:py-2.5 bg-[#111113] border border-white/[0.08] rounded-xl text-white placeholder-white/25 focus:outline-none focus:border-white/20 text-xs sm:text-sm"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {tab === "applications" ? (
              <>
                {["all","nueva","revisada","contactada","aceptada","rechazada"].map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)}
                    className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-medium transition-all border ${
                      filterStatus === s ? 'bg-white/10 text-white border-white/20' : 'bg-transparent text-white/35 border-white/[0.07] hover:border-white/15 hover:text-white/60'
                    }`}>
                    {s === "all" ? "Todos" : (APP_STATUS_CONFIG[s]?.label || s)}
                  </button>
                ))}
                <button onClick={() => exportCSV(applications)} className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-medium border border-white/[0.07] text-white/35 hover:text-white/60 hover:border-white/15 transition-all">
                  <Download className="w-3.5 h-3.5" /> CSV
                </button>
              </>
            ) : (
              ["all","Nuevo","Revisado","Archivado"].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                    filterStatus === s ? 'bg-white/10 text-white border-white/20' : 'bg-transparent text-white/35 border-white/[0.07] hover:border-white/15 hover:text-white/60'
                  }`}>
                  {s === "all" ? "Todos" : s}
                </button>
              ))
            )}
          </div>
        </div>

        {/* APPLICATION FORMS */}
        {tab === "applications" && (
          appsLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-white/[0.05] bg-white/[0.02]">
              <FileText className="w-12 h-12 text-white/10 mb-3" />
              <p className="text-white/25 text-sm">No hay solicitudes de plaza</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4 pb-4">
              {filteredApps.map((app, i) => {
                const cfg = APP_STATUS_CONFIG[app.status] || APP_STATUS_CONFIG.nueva;
                const presupuestoTexto = app.presupuesto || 'No especificado';
                return (
                  <motion.div key={app.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.025 }}
                    className="group bg-[#111113] border border-white/[0.06] hover:border-white/[0.12] rounded-xl p-3 sm:p-4 transition-all"
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-xs sm:text-sm ${
                        app.status === 'nueva' ? 'bg-[#ff5833]/15 text-[#ff5833]' : 'bg-white/[0.06] text-white/40'
                      }`}>
                        {app.nombre?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className="text-sm sm:text-base font-semibold text-white">{app.nombre} {app.apellidos}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${cfg.color}`}>{cfg.label}</span>
                        </div>
                        {app.status === 'nueva' && <span className="w-2 h-2 rounded-full bg-[#ff5833] animate-pulse mb-2" />}
                        <div className="flex flex-col gap-1.5 text-xs text-white/40 mb-2">
                          <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" />{app.email}</span>
                          {app.telefono && <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{app.telefono}</span>}
                          {app.pais_residencia && <span className="flex items-center gap-1.5"><span className="w-3 h-3 flex items-center justify-center">📍</span>{app.pais_residencia}</span>}
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className="text-[10px] px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/50">{app.situacion_laboral || 'N/A'}</span>
                          <span className="text-[10px] px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/50">{app.experiencia_musica || 'N/A'}</span>
                          <span className="text-[10px] px-2 py-1 rounded-lg bg-[#ff5833]/10 border border-[#ff5833]/20 text-[#ff5833] font-medium">Presupuesto: {presupuestoTexto}</span>
                        </div>
                        {app.created_date && <p className="text-[10px] text-white/25 flex items-center gap-1"><Calendar className="w-3 h-3" />{format(parseISO(app.created_date), "d MMM yyyy", { locale: es })}</p>}
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button onClick={() => handleViewApp(app)} className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/[0.05] hover:bg-white/10 flex items-center justify-center transition-colors" title="Ver detalle">
                          <Eye className="w-3.5 h-3.5 text-white/50" />
                        </button>
                        <select
                          value={app.status}
                          onChange={e => updateAppStatus.mutate({ id: app.id, status: e.target.value })}
                          className="h-7 sm:h-8 px-1.5 sm:px-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/50 text-[10px] sm:text-xs focus:outline-none hover:bg-white/10 transition-colors cursor-pointer"
                          style={{ appearance: "none", paddingRight: "6px" }}
                        >
                          {Object.entries(APP_STATUS_CONFIG).map(([k, v]) => (
                            <option key={k} value={k} style={{ background: "#111" }}>{v.label}</option>
                          ))}
                        </select>
                        <button onClick={() => deleteApp.mutate(app.id)} className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/[0.05] hover:bg-red-500/10 flex items-center justify-center transition-colors group/del" title="Eliminar">
                          <Trash2 className="w-3.5 h-3.5 text-white/30 group-hover/del:text-red-400 transition-colors" />
                        </button>
                      </div>
                      </div>
                      </motion.div>
                      );
              })}
            </div>
          )
        )}

        {/* CONTACT LEADS */}
        {tab === "contact" && (
          leadsLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-white/[0.05] bg-white/[0.02]">
              <Mail className="w-12 h-12 text-white/10 mb-3" />
              <p className="text-white/25 text-sm">No hay mensajes de contacto</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4 pb-4">
              {filteredLeads.map((lead, i) => {
                const cfg = LEAD_STATUS_CONFIG[lead.status] || LEAD_STATUS_CONFIG.Nuevo;
                return (
                  <motion.div key={lead.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="group bg-[#111113] border border-white/[0.06] hover:border-white/[0.12] rounded-xl p-3 sm:p-4 transition-all"
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-xs sm:text-sm ${
                        lead.status === 'Nuevo' ? 'bg-[#ff5833]/15 text-[#ff5833]' : 'bg-white/[0.06] text-white/40'
                      }`}>
                        {lead.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className="text-sm sm:text-base font-semibold text-white">{lead.name}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${cfg.color}`}>{cfg.label}</span>
                        </div>
                        {lead.status === 'Nuevo' && <span className="w-2 h-2 rounded-full bg-[#ff5833] animate-pulse mb-2" />}
                        <div className="flex flex-col gap-2 text-xs text-white/40 mb-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" />{lead.email}</span>
                          </div>
                          {lead.phone && lead.phone !== '-' && (
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{lead.phone}</span>
                              <a href={`tel:${lead.phone}`} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.06] text-white/60 border border-white/[0.08] hover:bg-white/[0.1] hover:text-white transition-all text-[10px] font-medium">
                                <Phone className="w-3 h-3" /> Llamar
                              </a>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-white/50 leading-relaxed mb-2 line-clamp-2">{lead.message}</p>
                        {lead.created_date && <p className="text-[10px] text-white/25 flex items-center gap-1"><Calendar className="w-3 h-3" />{format(parseISO(lead.created_date), "d MMM yyyy", { locale: es })}</p>}
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button onClick={() => handleViewLead(lead)} className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/[0.05] hover:bg-white/10 flex items-center justify-center transition-colors" title="Ver detalle">
                          <Eye className="w-3.5 h-3.5 text-white/50" />
                        </button>
                        <button onClick={() => updateLeadStatus.mutate({ id: lead.id, status: lead.status === 'Archivado' ? 'Revisado' : 'Archivado' })}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/[0.05] hover:bg-white/10 flex items-center justify-center transition-colors" title={lead.status === 'Archivado' ? 'Desarchivar' : 'Archivar'}>
                          <Archive className={`w-3.5 h-3.5 ${lead.status === 'Archivado' ? 'text-[#ff5833]' : 'text-white/50'}`} />
                        </button>
                        <button onClick={() => deleteLead.mutate(lead.id)} className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/[0.05] hover:bg-red-500/10 flex items-center justify-center transition-colors group/del" title="Eliminar">
                          <Trash2 className="w-3.5 h-3.5 text-white/30 group-hover/del:text-red-400 transition-colors" />
                        </button>
                      </div>
                      </div>
                      </motion.div>
                      );
              })}
            </div>
          )
        )}
      </div>

      <LeadDetailModal lead={selectedLead} onClose={handleCloseModal} />
      <ApplicationDetailModal app={selectedApp} onClose={handleCloseModal} />
    </AdminLayout>
  );
}