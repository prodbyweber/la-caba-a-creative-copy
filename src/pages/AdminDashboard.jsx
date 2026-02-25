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
  Calendar, 
  Clock, 
  AlertCircle, 
  GitPullRequest, 
  FolderKanban,
  TrendingUp,
  Users,
  CheckCircle2,
  Plus
} from "lucide-react";
import { format, isToday, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import TeamEditor from "@/components/admin/TeamEditor";

export default function AdminDashboard() {
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showDeliverableModal, setShowDeliverableModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  
  const queryClient = useQueryClient();

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => base44.entities.Session.list('-start_time')
  });

  const { data: deliverables = [] } = useQuery({
    queryKey: ['deliverables'],
    queryFn: () => base44.entities.Deliverable.list('-due_date_time')
  });

  const { data: revisions = [] } = useQuery({
    queryKey: ['revisions'],
    queryFn: () => base44.entities.Revision.list('-created_date')
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list('-created_date')
  });

  const { data: artists = [] } = useQuery({
    queryKey: ['artists'],
    queryFn: () => base44.entities.Artist.list('-created_date')
  });

  const { data: tracks = [] } = useQuery({
    queryKey: ['tracks'],
    queryFn: () => base44.entities.Track.list('-created_date')
  });

  // Calculate KPIs
  const todaySessions = sessions.filter(s => 
    s.start_time && isToday(parseISO(s.start_time))
  );

  const dueDeliverables = deliverables.filter(d => 
    d.status === 'Pending' || d.status === 'Overdue'
  );

  const overdueDeliverables = deliverables.filter(d => 
    d.status === 'Overdue' || (d.due_date_time && new Date(d.due_date_time) < new Date() && d.status === 'Pending')
  );

  const openRevisions = revisions.filter(r => 
    r.status === 'Open' || r.status === 'InProgress'
  );

  const activeProjects = projects.filter(p => 
    p.status !== 'Delivered' && p.status !== 'Archived'
  );

  const activeArtists = artists.filter(a => a.status === 'Active');

  // Update status mutations
  const updateSessionStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Session.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions'] })
  });

  const updateDeliverableStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Deliverable.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deliverables'] })
  });

  const updateRevisionStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Revision.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['revisions'] })
  });

  const kpis = [
    {
      icon: Calendar,
      label: "Sessions Today",
      value: todaySessions.length,
      color: "emerald",
      link: createPageUrl("Calendars")
    },
    {
      icon: Clock,
      label: "Due Deliverables",
      value: dueDeliverables.length,
      color: "blue",
      link: createPageUrl("Calendars")
    },
    {
      icon: AlertCircle,
      label: "Overdue",
      value: overdueDeliverables.length,
      color: "red",
      link: createPageUrl("Calendars")
    },
    {
      icon: GitPullRequest,
      label: "Open Revisions",
      value: openRevisions.length,
      color: "purple",
      link: createPageUrl("Revisions")
    },
    {
      icon: FolderKanban,
      label: "Active Projects",
      value: activeProjects.length,
      color: "orange",
      link: createPageUrl("Projects")
    },
    {
      icon: Users,
      label: "Active Artists",
      value: activeArtists.length,
      color: "pink",
      link: createPageUrl("Artists")
    }
  ];

  return (
    <AdminLayout activePage="AdminDashboard">
      <div className="px-6 sm:px-12 lg:px-16 xl:px-24 py-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-500">Actividades prioritarias</p>
        </motion.div>

        {/* Task Management Section - PRIORIDAD MÁXIMA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-emerald-500/5 to-purple-500/5 rounded-2xl border-2 border-emerald-500/20 p-4 sm:p-6 mb-6 shadow-xl shadow-emerald-500/10"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold">Lista de Tareas y Sesiones</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowSessionModal(true)}
                className="text-xs sm:text-sm px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-all flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Sesión
              </button>
              <button
                onClick={() => setShowDeliverableModal(true)}
                className="text-xs sm:text-sm px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Entregable
              </button>
              <button
                onClick={() => setShowRevisionModal(true)}
                className="text-xs sm:text-sm px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Revisión
              </button>
              <Link to={createPageUrl("Calendars")}>
                <button className="text-xs sm:text-sm px-3 py-1.5 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 transition-all">
                  Ver Calendario
                </button>
              </Link>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Today's Sessions */}
            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                Sesiones Hoy
              </h3>

              {todaySessions.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-gray-500 bg-white/5 rounded-xl border border-white/5">
                  <Calendar className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 text-gray-600" />
                  <p className="text-sm">No hay sesiones programadas para hoy</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {todaySessions.slice(0, 5).map((session) => (
                    <div 
                      key={session.id}
                      className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-white text-sm sm:text-base">{session.title}</h4>
                        <div className="flex items-center gap-2 ml-2">
                          <StatusButton 
                            status={session.status}
                            onStatusChange={(id, status) => updateSessionStatus.mutate({ id, status })}
                            entity="session"
                            id={session.id}
                          />
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {format(parseISO(session.start_time), 'HH:mm')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          session.type === 'Session' ? 'bg-emerald-500/10 text-emerald-400' :
                          session.type === 'Meeting' ? 'bg-blue-500/10 text-blue-400' :
                          'bg-purple-500/10 text-purple-400'
                        }`}>
                          {session.type}
                        </span>
                        <span className="truncate">{session.location}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Due Deliverables */}
            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                Entregables Pendientes
              </h3>

              {dueDeliverables.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-gray-500 bg-white/5 rounded-xl border border-white/5">
                  <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 text-gray-600" />
                  <p className="text-sm">¡Todos los entregables al día!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {dueDeliverables.slice(0, 5).map((deliverable) => {
                    const isOverdue = new Date(deliverable.due_date_time) < new Date();
                    return (
                      <div 
                        key={deliverable.id}
                        className={`p-3 sm:p-4 rounded-xl border transition-all cursor-pointer ${
                          isOverdue 
                            ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40' 
                            : 'bg-white/5 border-white/5 hover:border-blue-500/30'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-white text-sm sm:text-base flex-1">{deliverable.title}</h4>
                          <div className="flex items-center gap-2 ml-2">
                            <StatusButton 
                              status={deliverable.status}
                              onStatusChange={(id, status) => updateDeliverableStatus.mutate({ id, status })}
                              entity="deliverable"
                              id={deliverable.id}
                            />
                            {isOverdue && (
                              <span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400 whitespace-nowrap">
                                Atrasado
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-400">
                          <span className="px-2 py-0.5 rounded text-xs bg-blue-500/10 text-blue-400">
                            {deliverable.deliverable_type}
                          </span>
                          <span className="text-xs">
                            {format(parseISO(deliverable.due_date_time), 'MMM d, HH:mm')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Additional Info Row */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-8">
          {/* Pending Revisions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#141414] rounded-2xl border border-white/5 p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
                <GitPullRequest className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                Revisiones Pendientes
              </h3>
              <Link to={createPageUrl("Revisions")}>
                <button className="text-xs sm:text-sm text-emerald-400 hover:text-emerald-300">
                  Ver Todas
                </button>
              </Link>
            </div>

            {openRevisions.length === 0 ? (
              <div className="text-center py-6 sm:py-8 text-gray-500 bg-white/5 rounded-xl border border-white/5">
                <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 text-gray-600" />
                <p className="text-sm">No hay revisiones pendientes</p>
              </div>
            ) : (
              <div className="space-y-2">
                {openRevisions.slice(0, 5).map((revision) => (
                  <div 
                    key={revision.id}
                    className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/30 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-1 text-sm sm:text-base">{revision.request_text}</h4>
                        <div className="text-xs text-gray-500">Timecode: {revision.timecode}</div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <StatusButton 
                          status={revision.status}
                          onStatusChange={(id, status) => updateRevisionStatus.mutate({ id, status })}
                          entity="revision"
                          id={revision.id}
                        />
                        <span className={`px-2 py-0.5 rounded text-xs shrink-0 ${
                          revision.severity === 'Critical' ? 'bg-red-500/20 text-red-400' :
                          revision.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {revision.severity}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                      <span className="px-2 py-0.5 rounded text-xs bg-purple-500/10 text-purple-400">
                        {revision.revision_type}
                      </span>
                      <span className="text-xs">→ {revision.assigned_to}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* KPI Cards - Resumen General (Al final) */}
        <div className="border-t border-white/10 pt-6">
          <h2 className="text-lg font-bold text-gray-400 mb-4">Resumen General</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {kpis.map((kpi, i) => (
              <Link key={i} to={kpi.link}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.05 }}
                  className={`bg-gradient-to-br from-${kpi.color}-500/10 to-${kpi.color}-500/5 border border-${kpi.color}-500/20 rounded-xl p-3 sm:p-4 hover:border-${kpi.color}-500/40 transition-all cursor-pointer`}
                >
                  <kpi.icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${kpi.color}-400 mb-2`} />
                  <div className={`text-xl sm:text-2xl font-bold text-${kpi.color}-400 mb-0.5`}>
                    {kpi.value}
                  </div>
                  <div className="text-xs text-gray-500 leading-tight">{kpi.label}</div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateSessionModal isOpen={showSessionModal} onClose={() => setShowSessionModal(false)} />
      <CreateDeliverableModal isOpen={showDeliverableModal} onClose={() => setShowDeliverableModal(false)} />
      <CreateRevisionModal isOpen={showRevisionModal} onClose={() => setShowRevisionModal(false)} />
      
      {/* Voice Assistant */}
      <VoiceAssistant />
    </AdminLayout>
  );
}