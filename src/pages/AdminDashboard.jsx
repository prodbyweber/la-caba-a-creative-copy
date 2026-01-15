import React from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import { 
  Calendar, 
  Clock, 
  AlertCircle, 
  GitPullRequest, 
  FolderKanban,
  TrendingUp,
  Users,
  CheckCircle2
} from "lucide-react";
import { format, isToday, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AdminDashboard() {
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
      <div className="p-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-500">Overview of La Cabaña Creative operations</p>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {kpis.map((kpi, i) => (
            <Link key={i} to={kpi.link}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-gradient-to-br from-${kpi.color}-500/10 to-${kpi.color}-500/5 border border-${kpi.color}-500/20 rounded-2xl p-6 hover:border-${kpi.color}-500/40 transition-all cursor-pointer`}
              >
                <kpi.icon className={`w-8 h-8 text-${kpi.color}-400 mb-3`} />
                <div className={`text-3xl font-bold text-${kpi.color}-400 mb-1`}>
                  {kpi.value}
                </div>
                <div className="text-sm text-gray-500">{kpi.label}</div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Today's Sessions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#141414] rounded-2xl border border-white/5 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Today's Sessions</h3>
              <Link to={createPageUrl("Calendars")}>
                <button className="text-sm text-emerald-400 hover:text-emerald-300">
                  View Calendar
                </button>
              </Link>
            </div>

            {todaySessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p>No sessions scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaySessions.slice(0, 5).map((session) => (
                  <div 
                    key={session.id}
                    className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-white">{session.title}</h4>
                      <span className="text-xs text-gray-500">
                        {format(parseISO(session.start_time), 'HH:mm')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        session.type === 'Session' ? 'bg-emerald-500/10 text-emerald-400' :
                        session.type === 'Meeting' ? 'bg-blue-500/10 text-blue-400' :
                        'bg-purple-500/10 text-purple-400'
                      }`}>
                        {session.type}
                      </span>
                      <span>{session.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Due Deliverables */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#141414] rounded-2xl border border-white/5 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Due Deliverables</h3>
              <Link to={createPageUrl("Calendars")}>
                <button className="text-sm text-emerald-400 hover:text-emerald-300">
                  View All
                </button>
              </Link>
            </div>

            {dueDeliverables.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p>All deliverables up to date!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dueDeliverables.slice(0, 5).map((deliverable) => {
                  const isOverdue = new Date(deliverable.due_date_time) < new Date();
                  return (
                    <div 
                      key={deliverable.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isOverdue 
                          ? 'bg-red-500/5 border-red-500/20' 
                          : 'bg-white/5 border-white/5'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-white">{deliverable.title}</h4>
                        {isOverdue && (
                          <span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400">
                            Overdue
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span className="px-2 py-0.5 rounded text-xs bg-blue-500/10 text-blue-400">
                          {deliverable.deliverable_type}
                        </span>
                        <span>
                          Due: {format(parseISO(deliverable.due_date_time), 'MMM d, HH:mm')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>

        {/* Second Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pending Revisions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-[#141414] rounded-2xl border border-white/5 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Revisiones Pendientes</h3>
              <Link to={createPageUrl("Revisions")}>
                <button className="text-sm text-emerald-400 hover:text-emerald-300">
                  Ver Todas
                </button>
              </Link>
            </div>

            {openRevisions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p>No hay revisiones pendientes</p>
              </div>
            ) : (
              <div className="space-y-3">
                {openRevisions.slice(0, 5).map((revision) => (
                  <div 
                    key={revision.id}
                    className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-1">{revision.request_text}</h4>
                        <div className="text-xs text-gray-500">Timecode: {revision.timecode}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs shrink-0 ml-2 ${
                        revision.severity === 'Critical' ? 'bg-red-500/20 text-red-400' :
                        revision.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {revision.severity}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
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

          {/* Tracks en Producción */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-[#141414] rounded-2xl border border-white/5 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Tracks en Producción</h3>
              <Link to={createPageUrl("Tracks")}>
                <button className="text-sm text-emerald-400 hover:text-emerald-300">
                  Ver Todos
                </button>
              </Link>
            </div>

            {tracks.filter(t => t.status !== 'completed').length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p>No hay tracks en producción</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tracks.filter(t => t.status !== 'completed').slice(0, 5).map((track) => {
                  const createdDate = new Date(track.created_date);
                  const deliveryDate = new Date(createdDate);
                  deliveryDate.setDate(deliveryDate.getDate() + 7);
                  const daysUntilDelivery = Math.ceil((deliveryDate - new Date()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div 
                      key={track.id}
                      className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">{track.title}</h4>
                          <div className="text-xs text-gray-500 mt-1">
                            Creado: {format(createdDate, 'dd/MM/yyyy')}
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs shrink-0 ml-2 ${
                          track.status === 'production' ? 'bg-yellow-500/20 text-yellow-400' :
                          track.status === 'mixing' ? 'bg-blue-500/20 text-blue-400' :
                          track.status === 'mastering' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {track.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">
                          Entrega: {format(deliveryDate, 'dd/MM/yyyy')}
                        </span>
                        <span className={`text-xs font-medium ${
                          daysUntilDelivery < 0 ? 'text-red-400' :
                          daysUntilDelivery <= 2 ? 'text-orange-400' :
                          'text-emerald-400'
                        }`}>
                          {daysUntilDelivery < 0 ? 'Retrasado' : `${daysUntilDelivery} días`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}