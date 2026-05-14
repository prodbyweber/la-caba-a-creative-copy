import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import CreateSessionModal from "@/components/admin/CreateSessionModal";
import CreateDeliverableModal from "@/components/admin/CreateDeliverableModal";
import StatusButton from "@/components/admin/StatusButton";
import {
  Calendar, Clock, Package, CheckCircle2, Plus, Pencil, Trash2, Archive, MoreHorizontal, Music2
} from "lucide-react";
import { format, parseISO, isToday } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";




function ItemMenu({ onEdit, onDelete, onArchive, showArchive = false }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="w-7 h-7 rounded-lg bg-white/0 hover:bg-white/10 flex items-center justify-center transition-colors"
      >
        <MoreHorizontal className="w-4 h-4 text-white/30 hover:text-white/70" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 bg-[#1a1a1c] border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[140px]">
            <button onClick={(e) => { e.stopPropagation(); setOpen(false); onEdit(); }}
              className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-white/70 hover:bg-white/[0.07] hover:text-white transition-colors">
              <Pencil className="w-3.5 h-3.5" /> Editar
            </button>
            {showArchive && (
              <button onClick={(e) => { e.stopPropagation(); setOpen(false); onArchive(); }}
                className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-white/70 hover:bg-white/[0.07] hover:text-white transition-colors">
                <Archive className="w-3.5 h-3.5" /> Archivar
              </button>
            )}
            <button onClick={(e) => { e.stopPropagation(); setOpen(false); onDelete(); }}
              className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Eliminar
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const SESSION_CARD_COLORS = {
  Session:    "#10b981",
  Meeting:    "#3b82f6",
  StudioWork: "#8b5cf6",
};

function SessionRow({ s, onEdit, onDelete, onArchive, onStatusChange, showDate }) {
  const color = SESSION_CARD_COLORS[s.type] || SESSION_CARD_COLORS.Session;
  const typeLabel = s.type === 'StudioWork' ? 'Studio Work' : s.type;

  const timeStr = s.start_time
    ? showDate
      ? format(parseISO(s.start_time), 'MMM d · h:mm a') + (s.end_time ? ` – ${format(parseISO(s.end_time), 'h:mm a')}` : '')
      : format(parseISO(s.start_time), 'h:mm a') + (s.end_time ? ` – ${format(parseISO(s.end_time), 'h:mm a')}` : '')
    : '';

  const subtitle = [timeStr, s.location].filter(Boolean).join(' · ');

  return (
    <div
      className="group flex items-stretch rounded-xl overflow-hidden cursor-default transition-opacity hover:opacity-90"
      style={{ backgroundColor: color }}
    >
      {/* Content */}
      <div className="flex-1 px-3 py-2.5 min-w-0">
        <p className="text-sm font-semibold text-white leading-tight truncate">{s.title}</p>
        {subtitle && (
          <p className="text-[11px] text-white/80 mt-0.5 leading-tight truncate">{subtitle}</p>
        )}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/20 text-white/80 font-medium">{typeLabel}</span>
          <div className="ml-auto">
            <StatusButton status={s.status} onStatusChange={(id, status) => onStatusChange.mutate({ id, status })} entity="session" id={s.id} />
          </div>
        </div>
      </div>
      {/* Actions menu */}
      <div className="flex items-start pt-1.5 pr-1.5">
        <ItemMenu onEdit={() => onEdit(s)} onDelete={() => onDelete.mutate(s)} onArchive={() => onArchive.mutate(s.id)} showArchive />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showDeliverableModal, setShowDeliverableModal] = useState(false);
  const [editSession, setEditSession] = useState(null);
  const [editDeliverable, setEditDeliverable] = useState(null);

  const queryClient = useQueryClient();

  const { data: sessions = [] } = useQuery({ queryKey: ['sessions'], queryFn: () => base44.entities.Session.list('-start_time') });
  const { data: deliverables = [] } = useQuery({ queryKey: ['deliverables'], queryFn: () => base44.entities.Deliverable.list('-due_date_time') });

  // KPI calculations
  const now = new Date();
  const todaySessions = sessions.filter(s => s.start_time && isToday(parseISO(s.start_time))).sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
  const upcomingSessions = sessions.filter(s => s.start_time && new Date(s.start_time) > now && !isToday(parseISO(s.start_time)) && s.status !== 'Done' && s.status !== 'Cancelled').sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
  const pendingDeliverables = deliverables.filter(d => d.status === 'Pending' || d.status === 'Overdue');

  // Mutations - status
  const updateSessionStatus = useMutation({ mutationFn: ({ id, status }) => base44.entities.Session.update(id, { status }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions'] }) });
  const updateDeliverableStatus = useMutation({ mutationFn: ({ id, status }) => base44.entities.Deliverable.update(id, { status }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deliverables'] }) });

  // Mutations - delete
  const deleteSession = useMutation({
    mutationFn: async (session) => {
      if (session.google_event_id) {
        try {
          await base44.functions.invoke('deleteGoogleCalendarEvent', { google_event_id: session.google_event_id });
        } catch (e) { }
      }
      return base44.entities.Session.delete(session.id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions'] })
  });
  const deleteDeliverable = useMutation({ mutationFn: (id) => base44.entities.Deliverable.delete(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deliverables'] }) });

  // Mutations - archive
  const archiveSession = useMutation({ mutationFn: (id) => base44.entities.Session.update(id, { status: 'Done' }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions'] }) });
  const archiveDeliverable = useMutation({ mutationFn: (id) => base44.entities.Deliverable.update(id, { status: 'Approved' }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deliverables'] }) });

  const openEditSession = (s) => { setEditSession(s); setShowSessionModal(true); };
  const openEditDeliverable = (d) => { setEditDeliverable(d); setShowDeliverableModal(true); };

  const handleCloseSession = () => { setShowSessionModal(false); setEditSession(null); };
  const handleCloseDeliverable = () => { setShowDeliverableModal(false); setEditDeliverable(null); };

  return (
    <AdminLayout activePage="AdminDashboard">
      <div className="px-3 sm:px-8 lg:px-14 xl:px-20 pt-2 pb-6 max-w-[1600px] mx-auto">

        {/* Task Management Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111113] border border-white/[0.07] rounded-2xl p-4 sm:p-5 mb-6"
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">Panel de Control</p>
              <h2 className="text-base font-bold text-white leading-tight">Sesiones & Entregables</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setEditSession(null); setShowSessionModal(true); }}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 transition-all font-medium"
              >
                <Plus className="w-3.5 h-3.5" /> Sesión
              </button>
              <button
                onClick={() => { setEditDeliverable(null); setShowDeliverableModal(true); }}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 transition-all font-medium"
              >
                <Plus className="w-3.5 h-3.5" /> Entregable
              </button>
            </div>
          </div>

          <div className="w-full space-y-6">

            {/* Sesiones de Hoy */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Sesiones de Hoy</h3>
                {todaySessions.length > 0 && (
                  <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {todaySessions.length}
                  </span>
                )}
              </div>
              {todaySessions.length === 0 ? (
                <div className="flex items-center justify-center py-6 rounded-xl border border-white/[0.05] bg-white/[0.02]">
                  <p className="text-xs text-white/25">No hay sesiones para hoy</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {todaySessions.slice(0, 5).map((s) => (
                    <SessionRow key={s.id} s={s} onEdit={openEditSession} onDelete={deleteSession} onArchive={archiveSession} onStatusChange={updateSessionStatus} showDate={false} />
                  ))}
                </div>
              )}
            </div>

            {/* Próximas Sesiones */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-white">Próximas Sesiones</h3>
                {upcomingSessions.length > 0 && (
                  <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {upcomingSessions.length}
                  </span>
                )}
              </div>
              {upcomingSessions.length === 0 ? (
                <div className="flex items-center justify-center py-6 rounded-xl border border-white/[0.05] bg-white/[0.02]">
                  <p className="text-xs text-white/25">No hay sesiones próximas</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {upcomingSessions.slice(0, 6).map((s) => (
                    <SessionRow key={s.id} s={s} onEdit={openEditSession} onDelete={deleteSession} onArchive={archiveSession} onStatusChange={updateSessionStatus} showDate={true} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Entregables Pendientes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#111113] border border-white/[0.07] rounded-2xl p-4 sm:p-7 mb-8"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-white">Entregables Pendientes</h3>
              {pendingDeliverables.length > 0 && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {pendingDeliverables.length}
                </span>
              )}
            </div>
            <button
              onClick={() => { setEditDeliverable(null); setShowDeliverableModal(true); }}
              className="text-xs text-white/35 hover:text-white/70 transition-colors"
            >
              + Nuevo
            </button>
          </div>

          {pendingDeliverables.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 rounded-xl border border-white/[0.05] bg-white/[0.02]">
              <CheckCircle2 className="w-10 h-10 text-white/10 mb-2" />
              <p className="text-sm text-white/25">No hay entregables pendientes</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {pendingDeliverables.slice(0, 6).map((d) => (
                <div key={d.id} className="group p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-all">
                  <div className="flex items-start gap-2 mb-2">
                    <p className="text-sm text-white font-medium flex-1 line-clamp-2">{d.title}</p>
                    <ItemMenu
                      onEdit={() => openEditDeliverable(d)}
                      onDelete={() => deleteDeliverable.mutate(d.id)}
                      onArchive={() => archiveDeliverable.mutate(d.id)}
                      showArchive
                    />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-medium">{d.deliverable_type}</span>
                    {d.due_date_time && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        new Date(d.due_date_time) < new Date() ? 'bg-red-500/10 text-red-400' : 'bg-white/[0.05] text-white/30'
                      }`}>
                        {format(parseISO(d.due_date_time), 'MMM d')}
                      </span>
                    )}
                    <div className="ml-auto">
                      <StatusButton status={d.status} onStatusChange={(id, status) => updateDeliverableStatus.mutate({ id, status })} entity="deliverable" id={d.id} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

      </div>

        {/* Studio Session — acceso discreto al final */}
        <div className="px-3 sm:px-8 lg:px-14 xl:px-20 pb-8">
          <Link to="/StudioSession" className="inline-flex items-center gap-2 text-xs text-white/20 hover:text-white/50 transition-colors">
            <Music2 className="w-3 h-3" />
            Studio Session
          </Link>
        </div>

      {/* Modals */}
      <CreateSessionModal isOpen={showSessionModal} onClose={handleCloseSession} editData={editSession} />
      <CreateDeliverableModal isOpen={showDeliverableModal} onClose={handleCloseDeliverable} editData={editDeliverable} />

      {/* FAB — Nueva Sesión */}
      <button
        onClick={() => { setEditSession(null); setShowSessionModal(true); }}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 shadow-lg shadow-emerald-500/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        title="Nueva Sesión"
      >
        <Calendar className="w-6 h-6 text-black" />
      </button>
    </AdminLayout>
  );
}