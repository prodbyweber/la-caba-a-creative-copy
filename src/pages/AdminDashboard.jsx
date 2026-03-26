import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import VoiceAssistant from "@/components/admin/VoiceAssistant";
import CreateSessionModal from "@/components/admin/CreateSessionModal";
import CreateDeliverableModal from "@/components/admin/CreateDeliverableModal";
import CreateRevisionModal from "@/components/admin/CreateRevisionModal";
import StatusButton from "@/components/admin/StatusButton";
import {
  Calendar, Clock, AlertCircle, GitPullRequest, FolderKanban,
  TrendingUp, Users, CheckCircle2, Plus, Pencil, Trash2, Archive, MoreHorizontal
} from "lucide-react";
import { format, isToday, parseISO } from "date-fns";
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

export default function AdminDashboard() {
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showDeliverableModal, setShowDeliverableModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [editSession, setEditSession] = useState(null);
  const [editDeliverable, setEditDeliverable] = useState(null);
  const [editRevision, setEditRevision] = useState(null);

  const queryClient = useQueryClient();

  const { data: sessions = [] } = useQuery({ queryKey: ['sessions'], queryFn: () => base44.entities.Session.list('-start_time') });
  const { data: deliverables = [] } = useQuery({ queryKey: ['deliverables'], queryFn: () => base44.entities.Deliverable.list('-due_date_time') });
  const { data: revisions = [] } = useQuery({ queryKey: ['revisions'], queryFn: () => base44.entities.Revision.list('-created_date') });
  const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: () => base44.entities.Project.list('-created_date') });
  const { data: artists = [] } = useQuery({ queryKey: ['artists'], queryFn: () => base44.entities.Artist.list('-created_date') });

  // KPI calculations
  const todaySessions = sessions.filter(s => s.start_time && isToday(parseISO(s.start_time)));
  const upcomingSessions = sessions.filter(s => s.start_time && new Date(s.start_time) >= new Date() && s.status !== 'Done' && s.status !== 'Cancelled').sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
  const dueDeliverables = deliverables.filter(d => d.status === 'Pending' || d.status === 'Overdue');
  const overdueDeliverables = deliverables.filter(d => d.status === 'Overdue' || (d.due_date_time && new Date(d.due_date_time) < new Date() && d.status === 'Pending'));
  const openRevisions = revisions.filter(r => r.status === 'Open' || r.status === 'InProgress');
  const activeProjects = projects.filter(p => p.status !== 'Delivered' && p.status !== 'Archived');
  const activeArtists = artists.filter(a => a.status === 'Active');

  // Mutations - status
  const updateSessionStatus = useMutation({ mutationFn: ({ id, status }) => base44.entities.Session.update(id, { status }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions'] }) });
  const updateDeliverableStatus = useMutation({ mutationFn: ({ id, status }) => base44.entities.Deliverable.update(id, { status }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deliverables'] }) });
  const updateRevisionStatus = useMutation({ mutationFn: ({ id, status }) => base44.entities.Revision.update(id, { status }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['revisions'] }) });

  // Mutations - delete
  const deleteSession = useMutation({ mutationFn: (id) => base44.entities.Session.delete(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions'] }) });
  const deleteDeliverable = useMutation({ mutationFn: (id) => base44.entities.Deliverable.delete(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deliverables'] }) });
  const deleteRevision = useMutation({ mutationFn: (id) => base44.entities.Revision.delete(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['revisions'] }) });

  // Mutations - archive (mark as Done/Approved/Closed)
  const archiveSession = useMutation({ mutationFn: (id) => base44.entities.Session.update(id, { status: 'Done' }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions'] }) });
  const archiveDeliverable = useMutation({ mutationFn: (id) => base44.entities.Deliverable.update(id, { status: 'Approved' }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deliverables'] }) });
  const archiveRevision = useMutation({ mutationFn: (id) => base44.entities.Revision.update(id, { status: 'Closed' }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['revisions'] }) });

  const kpis = [
    { icon: Calendar, label: "Sessions Hoy", value: todaySessions.length, link: createPageUrl("Calendars") },
    { icon: Clock, label: "Entregables", value: dueDeliverables.length, link: createPageUrl("Calendars") },
    { icon: AlertCircle, label: "Atrasados", value: overdueDeliverables.length, link: createPageUrl("Calendars") },
    { icon: GitPullRequest, label: "Revisiones", value: openRevisions.length, link: createPageUrl("Revisions") },
    { icon: FolderKanban, label: "Proyectos", value: activeProjects.length, link: createPageUrl("Projects") },
    { icon: Users, label: "Artistas", value: activeArtists.length, link: createPageUrl("Artists") }
  ];

  const openEditSession = (s) => { setEditSession(s); setShowSessionModal(true); };
  const openEditDeliverable = (d) => { setEditDeliverable(d); setShowDeliverableModal(true); };
  const openEditRevision = (r) => { setEditRevision(r); setShowRevisionModal(true); };

  const handleCloseSession = () => { setShowSessionModal(false); setEditSession(null); };
  const handleCloseDeliverable = () => { setShowDeliverableModal(false); setEditDeliverable(null); };
  const handleCloseRevision = () => { setShowRevisionModal(false); setEditRevision(null); };

  return (
    <AdminLayout activePage="AdminDashboard">
      <div className="px-3 sm:px-8 lg:px-14 xl:px-20 py-6 max-w-[1600px] mx-auto overflow-x-hidden">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Admin Dashboard</h1>
          <p className="text-sm text-white/30">Actividades prioritarias de hoy</p>
        </motion.div>

        {/* KPI Cards - arriba */}
        <div className="mb-6">
          <p className="text-[11px] font-semibold text-white/20 uppercase tracking-widest mb-3">Resumen General</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {kpis.map((kpi, i) => (
              <Link key={i} to={kpi.link}>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-[#111113] border border-white/[0.06] rounded-xl p-4 hover:border-white/[0.14] hover:bg-white/[0.04] transition-all cursor-pointer"
                >
                  <kpi.icon className="w-4 h-4 text-white/25 mb-3" />
                  <div className="text-2xl font-black text-white mb-0.5">{kpi.value}</div>
                  <div className="text-[10px] text-white/25 font-medium">{kpi.label}</div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

        {/* Task Management Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111113] border border-white/[0.07] rounded-2xl p-4 sm:p-7 mb-6 overflow-hidden"
        >
          {/* Panel Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
            <div>
              <h2 className="text-lg font-bold text-white">Lista de Tareas y Sesiones</h2>
              <p className="text-xs text-white/30 mt-0.5">Gestiona sesiones, entregables y revisiones</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setEditSession(null); setShowSessionModal(true); }}
                className="flex items-center gap-1.5 text-xs px-3.5 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 transition-all font-medium"
              >
                <Plus className="w-3.5 h-3.5" /> Sesión
              </button>
              <button
                onClick={() => { setEditDeliverable(null); setShowDeliverableModal(true); }}
                className="flex items-center gap-1.5 text-xs px-3.5 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 transition-all font-medium"
              >
                <Plus className="w-3.5 h-3.5" /> Entregable
              </button>
              <button
                onClick={() => { setEditRevision(null); setShowRevisionModal(true); }}
                className="flex items-center gap-1.5 text-xs px-3.5 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl hover:bg-purple-500/20 transition-all font-medium"
              >
                <Plus className="w-3.5 h-3.5" /> Revisión
              </button>
              <Link to={createPageUrl("Calendars")}>
                <button className="text-xs px-3.5 py-2 bg-white/[0.04] text-white/40 border border-white/[0.07] rounded-xl hover:bg-white/[0.08] transition-all">
                  Ver Calendario
                </button>
              </Link>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-5 sm:gap-7">
            {/* Sesiones */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Sesiones de Hoy</h3>
                {todaySessions.length > 0 && (
                  <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {todaySessions.length}
                  </span>
                )}
              </div>
              {todaySessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 rounded-xl border border-white/[0.05] bg-white/[0.02]">
                  <Calendar className="w-10 h-10 text-white/10 mb-2" />
                  <p className="text-sm text-white/25">No hay sesiones para hoy</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {todaySessions.slice(0, 5).map((s) => (
                    <div key={s.id} className="group p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-all">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h4 className="font-semibold text-white text-sm truncate flex-1 min-w-0">{s.title}</h4>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="text-[10px] text-white/30">{format(parseISO(s.start_time), 'HH:mm')}</span>
                          <ItemMenu
                            onEdit={() => openEditSession(s)}
                            onDelete={() => deleteSession.mutate(s.id)}
                            onArchive={() => archiveSession.mutate(s.id)}
                            showArchive
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                            s.type === 'Session' ? 'bg-emerald-500/10 text-emerald-400' :
                            s.type === 'Meeting' ? 'bg-blue-500/10 text-blue-400' :
                            'bg-purple-500/10 text-purple-400'
                          }`}>{s.type}</span>
                          <span className="text-[10px] text-white/30 truncate">{s.location}</span>
                        </div>
                        <StatusButton status={s.status} onStatusChange={(id, status) => updateSessionStatus.mutate({ id, status })} entity="session" id={s.id} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Próximas Sesiones */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-white">Próximas Sesiones</h3>
                {upcomingSessions.length > 0 && (
                  <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {upcomingSessions.length}
                  </span>
                )}
              </div>
              {upcomingSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 rounded-xl border border-white/[0.05] bg-white/[0.02]">
                  <Calendar className="w-10 h-10 text-white/10 mb-2" />
                  <p className="text-sm text-white/25">No hay sesiones próximas</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {upcomingSessions.slice(0, 5).map((s) => (
                    <div key={s.id} className="group p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-all">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h4 className="font-semibold text-white text-sm truncate flex-1 min-w-0">{s.title}</h4>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="text-[10px] text-white/30">{format(parseISO(s.start_time), 'MMM d, HH:mm')}</span>
                          <ItemMenu
                            onEdit={() => openEditSession(s)}
                            onDelete={() => deleteSession.mutate(s.id)}
                            onArchive={() => archiveSession.mutate(s.id)}
                            showArchive
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                            s.type === 'Session' ? 'bg-emerald-500/10 text-emerald-400' :
                            s.type === 'Meeting' ? 'bg-blue-500/10 text-blue-400' :
                            'bg-purple-500/10 text-purple-400'
                          }`}>{s.type === 'StudioWork' ? 'Studio Work' : s.type}</span>
                          <span className="text-[10px] text-white/30 truncate">{s.location}</span>
                        </div>
                        <StatusButton status={s.status} onStatusChange={(id, status) => updateSessionStatus.mutate({ id, status })} entity="session" id={s.id} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Revisiones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#111113] border border-white/[0.07] rounded-2xl p-4 sm:p-7 mb-8 overflow-hidden"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <GitPullRequest className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-white">Revisiones Pendientes</h3>
              {openRevisions.length > 0 && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  {openRevisions.length}
                </span>
              )}
            </div>
            <Link to={createPageUrl("Revisions")}>
              <button className="text-xs text-white/35 hover:text-white/70 transition-colors">Ver todas →</button>
            </Link>
          </div>

          {openRevisions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 rounded-xl border border-white/[0.05] bg-white/[0.02]">
              <CheckCircle2 className="w-10 h-10 text-white/10 mb-2" />
              <p className="text-sm text-white/25">No hay revisiones pendientes</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-2">
              {openRevisions.slice(0, 6).map((r) => (
                <div key={r.id} className="group p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-all">
                  <div className="flex items-start gap-2 mb-2">
                    <p className="text-sm text-white font-medium flex-1 line-clamp-2">{r.request_text}</p>
                    <ItemMenu
                      onEdit={() => openEditRevision(r)}
                      onDelete={() => deleteRevision.mutate(r.id)}
                      onArchive={() => archiveRevision.mutate(r.id)}
                      showArchive
                    />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-medium">{r.revision_type}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      r.severity === 'Critical' ? 'bg-red-500/10 text-red-400' :
                      r.severity === 'Medium' ? 'bg-yellow-500/10 text-yellow-400' :
                      'bg-blue-500/10 text-blue-400'
                    }`}>{r.severity}</span>
                    <span className="text-[10px] text-white/25">{r.timecode}</span>
                    <div className="ml-auto">
                      <StatusButton status={r.status} onStatusChange={(id, status) => updateRevisionStatus.mutate({ id, status })} entity="revision" id={r.id} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>


      </div>

      {/* Modals */}
      <CreateSessionModal isOpen={showSessionModal} onClose={handleCloseSession} editData={editSession} />
      <CreateDeliverableModal isOpen={showDeliverableModal} onClose={handleCloseDeliverable} editData={editDeliverable} />
      <CreateRevisionModal isOpen={showRevisionModal} onClose={handleCloseRevision} editData={editRevision} />

      <VoiceAssistant />
    </AdminLayout>
  );
}