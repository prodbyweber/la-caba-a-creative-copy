import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import VoiceAssistant from "@/components/admin/VoiceAssistant";
import CreateSessionModal from "@/components/admin/CreateSessionModal";
import {
  Calendar, Clock, AlertCircle, FolderKanban,
  TrendingUp, Users, Plus, ArrowRight
} from "lucide-react";
import { format, isToday, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";




export default function AdminDashboard() {
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [editSession, setEditSession] = useState(null);

  const queryClient = useQueryClient();

  const { data: sessions = [] } = useQuery({ queryKey: ['sessions'], queryFn: () => base44.entities.Session.list('-start_time') });
  const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: () => base44.entities.Project.list('-created_date') });
  const { data: artists = [] } = useQuery({ queryKey: ['artists'], queryFn: () => base44.entities.Artist.list('-created_date') });

  // KPI calculations
  const todaySessions = sessions.filter(s => s.start_time && isToday(parseISO(s.start_time)));
  const upcomingSessions = sessions.filter(s => s.start_time && new Date(s.start_time) >= new Date() && s.status !== 'Done' && s.status !== 'Cancelled').sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
  const activeProjects = projects.filter(p => p.status !== 'Delivered' && p.status !== 'Archived');
  const activeArtists = artists.filter(a => a.status === 'Active');

  const kpis = [
    { icon: Calendar, label: "Sessions Hoy", value: todaySessions.length, link: createPageUrl("Calendars") },
    { icon: Clock, label: "Próximas", value: upcomingSessions.length, link: createPageUrl("Calendars") },
    { icon: FolderKanban, label: "Proyectos", value: activeProjects.length, link: createPageUrl("Projects") },
    { icon: Users, label: "Artistas", value: activeArtists.length, link: createPageUrl("Artists") }
  ];

  const handleCloseSession = () => { setShowSessionModal(false); setEditSession(null); };

  return (
    <AdminLayout activePage="AdminDashboard">
      <div className="px-4 sm:px-8 lg:px-12 py-8 max-w-7xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight" style={{ fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "-0.04em" }}>
            Admin Dashboard
          </h1>
          <p className="text-sm text-white/40 font-light">Resumen general y control de operaciones</p>
        </motion.div>

        {/* KPI Cards */}
        <div className="mb-12">
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] mb-4">Overview</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {kpis.map((kpi, i) => (
              <Link key={i} to={kpi.link}>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all cursor-pointer group"
                >
                  <kpi.icon className="w-4 h-4 text-white/30 group-hover:text-white/50 mb-3 transition-colors" />
                  <div className="text-2xl sm:text-3xl font-black text-white mb-1" style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>
                    {kpi.value}
                  </div>
                  <div className="text-[11px] text-white/40 font-medium tracking-wide">{kpi.label}</div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

        {/* Studio Hours & Dashboard Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-8">
            
            {/* Studio Hours */}
            <div className="flex-1">
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] mb-4">Horas</p>
              <h3 className="text-xl font-black text-white mb-6" style={{ fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "-0.03em" }}>
                Horas de Estudio
              </h3>
              <div className="space-y-3">
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <p className="text-xs text-white/40 mb-2">Horas disponibles</p>
                    <div className="h-8 bg-gradient-to-r from-white/10 to-white/5 rounded-xl overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-white/30 to-white/20 rounded-xl" style={{ width: "65%" }}></div>
                    </div>
                  </div>
                  <span className="text-lg font-black text-white">65%</span>
                </div>
                <p className="text-[11px] text-white/30">Total: 150 horas | Usadas: 97 horas</p>
              </div>
            </div>

            {/* Dashboard Button */}
            <div className="flex flex-col items-start sm:items-end gap-4 sm:justify-end">
              <Link to={createPageUrl("AdminDashboard")} className="w-full sm:w-auto">
                <button className="group relative inline-flex items-center gap-2 px-6 py-3 border border-white/20 rounded-xl overflow-hidden transition-all hover:border-white/40 w-full sm:w-auto justify-center sm:justify-start">
                  <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity" />
                  <span className="relative text-sm font-semibold text-white flex items-center gap-2" style={{ fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "0.05em" }}>
                    Ver Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </button>
              </Link>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Modals */}
      <CreateSessionModal isOpen={showSessionModal} onClose={handleCloseSession} editData={editSession} />
      
      <VoiceAssistant />
    </AdminLayout>
  );
}