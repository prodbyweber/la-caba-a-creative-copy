import React, { useState } from "react";
import { motion } from "framer-motion";
import DashboardNav from "@/components/dashboard/DashboardNav";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import SessionsCalendar from "@/components/sessions/SessionsCalendar";
import SessionsList from "@/components/sessions/SessionsList";
import GoogleCalendarSync from "@/components/sessions/GoogleCalendarSync";
import CalendlySync from "@/components/sessions/CalendlySync";
import CreateSessionModal from "@/components/sessions/CreateSessionModal";
import { Calendar, List, Plus, Settings } from "lucide-react";

export default function Sessions() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState("calendar"); // calendar or list
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <DashboardNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="lg:pl-64 pt-16">
        <div className="p-6 max-w-[1600px] mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Calendario de <span className="text-emerald-400">Sesiones</span>
                </h1>
                <p className="text-gray-500">
                  Gestiona sesiones de estudio, reuniones y ensayos sincronizados con Google Calendar
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Sincronización</span>
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-purple-500 hover:shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Nueva Sesión
                </button>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 mt-6 bg-white/5 p-1 rounded-xl w-fit">
              <button
                onClick={() => setViewMode("calendar")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  viewMode === "calendar"
                    ? "bg-emerald-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Calendar className="w-4 h-4" />
                Calendario
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  viewMode === "list"
                    ? "bg-emerald-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <List className="w-4 h-4" />
                Lista
              </button>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {viewMode === "calendar" ? (
              <SessionsCalendar />
            ) : (
              <SessionsList />
            )}
          </motion.div>
        </div>
      </main>

      {/* Modals */}
      {showCreateModal && (
        <CreateSessionModal onClose={() => setShowCreateModal(false)} />
      )}

      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#111113] rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-hidden"
          >
            <div className="p-6 border-b border-white/5">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Sincronización de Calendarios</h2>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              <GoogleCalendarSync />
              <CalendlySync />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}