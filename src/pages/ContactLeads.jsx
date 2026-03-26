import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Mail, Phone, MessageSquare, Trash2, Archive, Eye,
  User, Calendar, CheckCircle2, Clock, X, Search, Filter
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const STATUS_CONFIG = {
  Nuevo: { label: "Nuevo", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  Revisado: { label: "Revisado", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  Archivado: { label: "Archivado", color: "bg-white/5 text-white/30 border-white/10" }
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
          {/* Header */}
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

          {/* Content */}
          <div className="p-6 space-y-5">
            {/* Meta */}
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

            {/* Message */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-3.5 h-3.5 text-[#ff5833]" />
                <p className="text-[10px] text-white/30 uppercase tracking-widest">Mensaje</p>
              </div>
              <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line">{lead.message}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 items-center">
              <a
                href={`mailto:${lead.email}?subject=Re: Tu mensaje en Cabaña Creative`}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#ff5833] hover:bg-[#e84d2a] text-white font-semibold text-sm transition-all"
              >
                <Mail className="w-4 h-4" />
                Responder por email
              </a>
              {lead.phone && lead.phone !== '-' && (
                <a
                  href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all text-sm font-medium"
                >
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default function ContactLeads() {
  const [selectedLead, setSelectedLead] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['contactLeads'],
    queryFn: () => base44.entities.ContactLead.list('-created_date')
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.ContactLead.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contactLeads'] })
  });

  const deleteLead = useMutation({
    mutationFn: (id) => base44.entities.ContactLead.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactLeads'] });
      setSelectedLead(null);
    }
  });

  const filtered = leads.filter(l => {
    const matchSearch = !search || l.name?.toLowerCase().includes(search.toLowerCase()) || l.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || l.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = {
    Nuevo: leads.filter(l => l.status === 'Nuevo').length,
    Revisado: leads.filter(l => l.status === 'Revisado').length,
    Archivado: leads.filter(l => l.status === 'Archivado').length,
  };

  const handleView = (lead) => {
    setSelectedLead(lead);
    if (lead.status === 'Nuevo') {
      updateStatus.mutate({ id: lead.id, status: 'Revisado' });
    }
  };

  return (
    <AdminLayout activePage="ContactLeads">
      <div className="px-4 sm:px-8 lg:px-14 xl:px-20 py-6 max-w-[1400px] mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Solicitudes de Contacto</h1>
          <p className="text-sm text-white/30">Mensajes recibidos desde el formulario de la web</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Nuevos", value: counts.Nuevo, color: "text-emerald-400" },
            { label: "Revisados", value: counts.Revisado, color: "text-blue-400" },
            { label: "Archivados", value: counts.Archivado, color: "text-white/30" },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[#111113] border border-white/[0.06] rounded-xl p-4"
            >
              <div className={`text-2xl font-black mb-0.5 ${s.color}`}>{s.value}</div>
              <div className="text-[11px] text-white/30">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-[#111113] border border-white/[0.08] rounded-xl text-white placeholder-white/25 focus:outline-none focus:border-white/20 text-sm"
            />
          </div>
          <div className="flex gap-2">
            {["all", "Nuevo", "Revisado", "Archivado"].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                  filterStatus === s
                    ? 'bg-white/10 text-white border-white/20'
                    : 'bg-transparent text-white/35 border-white/[0.07] hover:border-white/15 hover:text-white/60'
                }`}
              >
                {s === "all" ? "Todos" : s}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-white/[0.05] bg-white/[0.02]">
            <Mail className="w-12 h-12 text-white/10 mb-3" />
            <p className="text-white/25 text-sm">No hay solicitudes</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((lead, i) => {
              const cfg = STATUS_CONFIG[lead.status] || STATUS_CONFIG.Nuevo;
              return (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="group bg-[#111113] border border-white/[0.06] hover:border-white/[0.12] rounded-xl p-4 transition-all"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-sm ${
                      lead.status === 'Nuevo' ? 'bg-[#ff5833]/15 text-[#ff5833]' : 'bg-white/[0.06] text-white/40'
                    }`}>
                      {lead.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-semibold text-white">{lead.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${cfg.color}`}>
                          {cfg.label}
                        </span>
                        {lead.status === 'Nuevo' && (
                          <span className="w-2 h-2 rounded-full bg-[#ff5833] animate-pulse" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-white/35 mb-2 flex-wrap">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{lead.email}</span>
                        {lead.phone && lead.phone !== '-' && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{lead.phone}</span>}
                        {lead.created_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(parseISO(lead.created_date), "d MMM yyyy", { locale: es })}</span>}
                      </div>
                      <p className="text-xs text-white/40 line-clamp-2 leading-relaxed">{lead.message}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleView(lead)}
                        className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/10 flex items-center justify-center transition-colors"
                        title="Ver detalle"
                      >
                        <Eye className="w-3.5 h-3.5 text-white/50" />
                      </button>
                      <button
                        onClick={() => updateStatus.mutate({ id: lead.id, status: lead.status === 'Archivado' ? 'Revisado' : 'Archivado' })}
                        className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/10 flex items-center justify-center transition-colors"
                        title={lead.status === 'Archivado' ? 'Desarchivar' : 'Archivar'}
                      >
                        <Archive className={`w-3.5 h-3.5 ${lead.status === 'Archivado' ? 'text-[#ff5833]' : 'text-white/50'}`} />
                      </button>
                      <button
                        onClick={() => deleteLead.mutate(lead.id)}
                        className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-red-500/10 flex items-center justify-center transition-colors group/del"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-white/30 group-hover/del:text-red-400 transition-colors" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
    </AdminLayout>
  );
}