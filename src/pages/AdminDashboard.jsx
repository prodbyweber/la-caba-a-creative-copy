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
  CheckCircle2,
  Video
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

  const { data: clips = [] } = useQuery({
    queryKey: ['clips'],
    queryFn: () => base44.entities.Clip.list('-created_date')
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

        {/* Artists & Clips Overview */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Active Artists */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#141414] rounded-2xl border border-white/5 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Artists</h3>
              <Link to={createPageUrl("Artists")}>
                <button className="text-sm text-emerald-400 hover:text-emerald-300">
                  View All
                </button>
              </Link>
            </div>

            <div className="space-y-3">
              {activeArtists.slice(0, 3).map((artist) => (
                <div 
                  key={artist.id}
                  className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-emerald-500/20 to-purple-500/20">
                    {artist.avatar_url ? (
                      <img src={artist.avatar_url} alt={artist.stageName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold">
                        {artist.stageName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white text-sm">{artist.stageName}</h4>
                    <p className="text-xs text-gray-500">{artist.genre || "Artist"}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-400">
                    {artist.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Clips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="lg:col-span-2 bg-[#141414] rounded-2xl border border-white/5 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Recent Clips</h3>
              <Link to={createPageUrl("Clips")}>
                <button className="text-sm text-emerald-400 hover:text-emerald-300">
                  View All
                </button>
              </Link>
            </div>

            {clips.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Video className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p>No clips yet</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {clips.slice(0, 4).map((clip) => {
                  const artist = artists.find(a => a.id === clip.artist_id);
                  return (
                    <div 
                      key={clip.id}
                      className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/30 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex-shrink-0">
                          {clip.thumbnail_url ? (
                            <img src={clip.thumbnail_url} alt={clip.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Video className="w-6 h-6 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-white text-sm mb-1 truncate">{clip.title}</h4>
                          {artist && (
                            <p className="text-xs text-gray-500 mb-2">{artist.stageName}</p>
                          )}
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              clip.status === 'published' ? 'bg-emerald-500/10 text-emerald-400' :
                              clip.status === 'scheduled' ? 'bg-blue-500/10 text-blue-400' :
                              'bg-gray-500/10 text-gray-400'
                            }`}>
                              {clip.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>

        {/* Today's Timeline */}
        <div className="grid lg:grid-cols-2 gap-6">
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
      </div>
    </AdminLayout>
  );
}