import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import SessionDetailModal from "@/components/sessions/SessionDetailModal";
import DashboardNav from "@/components/dashboard/DashboardNav";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Plus, Calendar as CalendarIcon, Package, List, Clock, MapPin, User, CheckCircle2, AlertCircle, Archive, Trash2, Film, ExternalLink } from "lucide-react";
import ContentCalendar from "@/components/calendar/ContentCalendar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, isToday, differenceInHours, set } from "date-fns";

export default function Calendars() {
  const [activeTab, setActiveTab] = useState("sessions");
  const [viewMode, setViewMode] = useState("calendar");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showDeliverableModal, setShowDeliverableModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [dragItem, setDragItem] = useState(null); // { id, type: 'session'|'deliverable', data }
  const [dragOverDay, setDragOverDay] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const artistId = urlParams.get("artistId");

  const { data: allSessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => base44.entities.Session.list('-start_time')
  });

  const { data: allDeliverables = [] } = useQuery({
    queryKey: ['deliverables'],
    queryFn: () => base44.entities.Deliverable.list('-due_date_time')
  });

  const { data: artists = [] } = useQuery({
    queryKey: ['artists'],
    queryFn: () => base44.entities.Artist.list()
  });

  const { data: artist } = useQuery({
    queryKey: ['artist', artistId],
    queryFn: async () => {
      const artists = await base44.entities.Artist.list();
      return artists.find(a => a.id === artistId);
    },
    enabled: !!artistId
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list()
  });

  // Filtrar sesiones y entregables por artista si estamos en un dashboard de artista
  const sessions = artistId 
    ? allSessions.filter(session => session.artist_id === artistId)
    : allSessions;

  const deliverables = artistId 
    ? allDeliverables.filter(deliverable => deliverable.artist_id === artistId)
    : allDeliverables;

  const queryClient = useQueryClient();

  const moveSessionMutation = useMutation({
    mutationFn: ({ id, newDate, originalData }) => {
      const original = parseISO(originalData.start_time);
      const originalEnd = parseISO(originalData.end_time);
      const duration = originalEnd - original;
      const newStart = set(parseISO(originalData.start_time), {
        year: newDate.getFullYear(),
        month: newDate.getMonth(),
        date: newDate.getDate()
      });
      const newEnd = new Date(newStart.getTime() + duration);
      return base44.entities.Session.update(id, {
        start_time: newStart.toISOString(),
        end_time: newEnd.toISOString()
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions'] })
  });

  const moveDeliverableMutation = useMutation({
    mutationFn: ({ id, newDate, originalData }) => {
      const original = parseISO(originalData.due_date_time);
      const newDue = set(original, {
        year: newDate.getFullYear(),
        month: newDate.getMonth(),
        date: newDate.getDate()
      });
      return base44.entities.Deliverable.update(id, {
        due_date_time: newDue.toISOString()
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deliverables'] })
  });

  const handleDrop = (day) => {
    if (!dragItem) return;
    if (dragItem.type === 'session') {
      moveSessionMutation.mutate({ id: dragItem.id, newDate: day, originalData: dragItem.data });
    } else {
      moveDeliverableMutation.mutate({ id: dragItem.id, newDate: day, originalData: dragItem.data });
    }
    setDragItem(null);
    setDragOverDay(null);
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getSessionsForDay = (day) => {
    return sessions.filter(session => 
      session.start_time && isSameDay(parseISO(session.start_time), day)
    );
  };

  const getDeliverablesForDay = (day) => {
    return deliverables.filter(deliverable => 
      deliverable.due_date_time && isSameDay(parseISO(deliverable.due_date_time), day)
    );
  };

  return artistId ? (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <DashboardNav artistName={artist?.stageName} artistId={artistId} />
      <main className="pt-16">
        <div className="px-6 sm:px-12 lg:px-16 xl:px-24 py-6 max-w-[1600px] mx-auto">
        {/* Header Compacto */}
        <div className="flex items-center justify-end gap-2 mb-3">
          <button
            onClick={() => setShowSessionModal(true)}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva Sesión
          </button>
        </div>

        {/* Tabs & View Mode Toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <div className="flex gap-2">
            <button
              className="px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 bg-emerald-500 text-white"
            >
              <CalendarIcon className="w-4 h-4" />
              Sesiones ({sessions.length})
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-1 bg-white/5 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-3 py-1.5 rounded-md font-medium text-xs transition-all flex items-center gap-1.5 ${
                viewMode === "calendar"
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              Calendario
            </button>
            <button
              onClick={() => setViewMode("agenda")}
              className={`px-3 py-1.5 rounded-md font-medium text-xs transition-all flex items-center gap-1.5 ${
                viewMode === "agenda"
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Agenda
            </button>
          </div>
        </div>

        {/* Calendar/Agenda View */}
        {viewMode === "calendar" ? (
        <div className="bg-[#141414] rounded-lg border border-white/5 p-3 mb-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">{format(currentDate, 'MMMM yyyy')}</h2>
            <div className="flex gap-1.5">
              <button
                onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm"
              >
                ←
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs"
              >
                Hoy
              </button>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm"
              >
                →
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1.5 md:gap-2">
            {/* Desktop Headers */}
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
              <div key={day} className="hidden md:block text-center text-xs font-semibold text-gray-400 py-2 border-b border-white/10">
                {day}
              </div>
            ))}
            {/* Mobile Headers */}
            {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, idx) => (
              <div key={idx} className="md:hidden text-center text-[10px] font-medium text-gray-500 py-1">
                {day}
              </div>
            ))}
            
            {daysInMonth.map((day, i) => {
              const daySessions = getSessionsForDay(day);
              const hasItems = daySessions.length > 0;
              const isTodayDate = isToday(day);
              const isDragOver = dragOverDay && isSameDay(dragOverDay, day);

              return (
                <div
                  key={i}
                  className={`min-h-16 md:min-h-24 p-1.5 md:p-2 rounded-lg border transition-all cursor-pointer ${
                    isDragOver
                      ? 'bg-emerald-500/20 border-emerald-500/50'
                      : isTodayDate
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : hasItems
                      ? 'bg-white/5 border-white/10 hover:border-emerald-500/30 hover:bg-white/10'
                      : 'bg-white/5 border-white/5 hover:bg-white/10'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setDragOverDay(day); }}
                  onDragLeave={() => setDragOverDay(null)}
                  onDrop={() => handleDrop(day)}
                >
                  <div className={`text-xs md:text-sm font-bold mb-1 ${
                    isTodayDate ? 'text-emerald-400' : 'text-gray-400'
                  }`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-0.5 md:space-y-1">
                    {daySessions.slice(0, 2).map((session) => (
                      <button
                        key={session.id}
                        draggable
                        onDragStart={(e) => { e.stopPropagation(); setDragItem({ id: session.id, type: 'session', data: session }); }}
                        onDragEnd={() => setDragItem(null)}
                        onClick={() => setSelectedSession(session)}
                        className="w-full text-left text-[9px] md:text-[10px] p-1 md:p-1.5 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors border border-blue-500/20 cursor-grab active:cursor-grabbing"
                      >
                        <div className="font-bold truncate">
                          {format(parseISO(session.start_time), 'HH:mm')}
                        </div>
                        <div className="truncate leading-tight opacity-90">{session.title}</div>
                      </button>
                    ))}
                    {daySessions.length > 2 && (
                      <div className="text-[8px] md:text-[9px] text-gray-500 font-medium px-1">
                        +{daySessions.length - 2}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        ) : (
          /* Agenda View */
          <div className="space-y-3">
            <AgendaView 
              sessions={sessions} 
              artists={artists}
              onSessionClick={setSelectedSession}
            />
          </div>
        )}

        {/* Content Calendar Section */}
        <div className="mt-6">
          <ContentCalendar />
        </div>
        
        <CreateSessionModal
          isOpen={showSessionModal}
          onClose={() => setShowSessionModal(false)}
          artists={artists}
          projects={projects}
        />



        {selectedSession && (
          <SessionDetailModal
            session={selectedSession}
            onClose={() => setSelectedSession(null)}
            artists={artists}
          />
        )}
      </div>
      </main>
    </div>
  ) : (
    <AdminLayout activePage="Calendars">
      <div className="px-6 sm:px-12 lg:px-16 xl:px-24 py-6 max-w-[1600px] mx-auto">
        {/* Header Compacto */}
        <div className="flex items-center justify-end gap-2 mb-3">
          <button
            onClick={() => activeTab === "sessions" ? setShowSessionModal(true) : setShowDeliverableModal(true)}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {activeTab === "sessions" ? "Nueva Sesión" : "Nuevo Entregable"}
          </button>
        </div>

        {/* Tabs & View Mode Toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("sessions")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                activeTab === "sessions"
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              Sesiones ({sessions.length})
            </button>
            <button
              onClick={() => setActiveTab("deliverables")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                activeTab === "deliverables"
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <Package className="w-4 h-4" />
              Entregables ({deliverables.length})
            </button>
          </div>

          <div className="flex gap-1 bg-white/5 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-3 py-1.5 rounded-md font-medium text-xs transition-all flex items-center gap-1.5 ${
                viewMode === "calendar"
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              Calendario
            </button>
            <button
              onClick={() => setViewMode("agenda")}
              className={`px-3 py-1.5 rounded-md font-medium text-xs transition-all flex items-center gap-1.5 ${
                viewMode === "agenda"
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Agenda
            </button>
          </div>
        </div>

        {viewMode === "calendar" ? (
        <div className="bg-[#141414] rounded-lg border border-white/5 p-3 mb-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">{format(currentDate, 'MMMM yyyy')}</h2>
            <div className="flex gap-1.5">
              <button
                onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm"
              >
                ←
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs"
              >
                Hoy
              </button>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm"
              >
                →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 md:gap-2">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
              <div key={day} className="hidden md:block text-center text-xs font-semibold text-gray-400 py-2 border-b border-white/10">
                {day}
              </div>
            ))}
            {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, idx) => (
              <div key={idx} className="md:hidden text-center text-[10px] font-medium text-gray-500 py-1">
                {day}
              </div>
            ))}
            
            {daysInMonth.map((day, i) => {
              const daySessions = activeTab === "sessions" ? getSessionsForDay(day) : [];
              const dayDeliverables = activeTab === "deliverables" ? getDeliverablesForDay(day) : [];
              const hasItems = daySessions.length > 0 || dayDeliverables.length > 0;
              const isTodayDate = isToday(day);
              const isDragOver = dragOverDay && isSameDay(dragOverDay, day);

              return (
                <div
                  key={i}
                  className={`min-h-16 md:min-h-24 p-1.5 md:p-2 rounded-lg border transition-all cursor-pointer ${
                    isDragOver
                      ? 'bg-emerald-500/20 border-emerald-500/50'
                      : isTodayDate
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : hasItems
                      ? 'bg-white/5 border-white/10 hover:border-emerald-500/30 hover:bg-white/10'
                      : 'bg-white/5 border-white/5 hover:bg-white/10'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setDragOverDay(day); }}
                  onDragLeave={() => setDragOverDay(null)}
                  onDrop={() => handleDrop(day)}
                >
                  <div className={`text-xs md:text-sm font-bold mb-1 ${
                    isTodayDate ? 'text-emerald-400' : 'text-gray-400'
                  }`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-0.5 md:space-y-1">
                    {activeTab === "sessions" && daySessions.slice(0, 2).map((session) => (
                      <button
                        key={session.id}
                        draggable
                        onDragStart={(e) => { e.stopPropagation(); setDragItem({ id: session.id, type: 'session', data: session }); }}
                        onDragEnd={() => setDragItem(null)}
                        onClick={() => setSelectedSession(session)}
                        className="w-full text-left text-[9px] md:text-[10px] p-1 md:p-1.5 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors border border-blue-500/20 cursor-grab active:cursor-grabbing"
                      >
                        <div className="font-bold truncate">
                          {format(parseISO(session.start_time), 'HH:mm')}
                        </div>
                        <div className="truncate leading-tight opacity-90">{session.title}</div>
                      </button>
                    ))}
                    {activeTab === "deliverables" && dayDeliverables.slice(0, 2).map((deliverable) => (
                      <div
                        key={deliverable.id}
                        draggable
                        onDragStart={(e) => { e.stopPropagation(); setDragItem({ id: deliverable.id, type: 'deliverable', data: deliverable }); }}
                        onDragEnd={() => setDragItem(null)}
                        className={`text-[9px] md:text-[10px] p-1 md:p-1.5 rounded truncate font-medium border cursor-grab active:cursor-grabbing ${
                          deliverable.status === 'Overdue' 
                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                        }`}
                      >
                        {deliverable.title}
                      </div>
                    ))}
                    {((activeTab === "sessions" && daySessions.length > 2) || 
                      (activeTab === "deliverables" && dayDeliverables.length > 2)) && (
                      <div className="text-[8px] md:text-[9px] text-gray-500 font-medium px-1">
                        +{(activeTab === "sessions" ? daySessions : dayDeliverables).length - 2}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        ) : (
          <div className="space-y-3">
            {activeTab === "sessions" ? (
              <AgendaView 
                sessions={sessions} 
                artists={artists}
                onSessionClick={setSelectedSession}
              />
            ) : (
              <DeliverablesAgendaView 
                deliverables={deliverables}
                artists={artists}
                projects={projects}
              />
            )}
          </div>
        )}

        <div className="mt-6">
          <ContentCalendar />
        </div>
      </div>

      <CreateSessionModal
        isOpen={showSessionModal}
        onClose={() => setShowSessionModal(false)}
        artists={artists}
        projects={projects}
      />

      <CreateDeliverableModal
        isOpen={showDeliverableModal}
        onClose={() => setShowDeliverableModal(false)}
        artists={artists}
        projects={projects}
      />

      {selectedSession && (
        <SessionDetailModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          artists={artists}
        />
      )}
    </AdminLayout>
  );
}

function AgendaView({ sessions, artists, onSessionClick }) {
  const [showArchived, setShowArchived] = React.useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Session.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });

  // Separar sesiones activas y finalizadas
  const activeSessions = sessions.filter(s => s.status !== 'Done');
  const archivedSessions = sessions.filter(s => s.status === 'Done');

  // Ordenar activas por prioridad y fecha
  const sortedActiveSessions = [...activeSessions].sort((a, b) => {
    // Primero por estado (Pending > Confirmed > otros)
    const statusPriority = { 'Pending': 0, 'Scheduled': 1, 'Confirmed': 2 };
    const statusA = statusPriority[a.status] ?? 3;
    const statusB = statusPriority[b.status] ?? 3;
    if (statusA !== statusB) return statusA - statusB;
    
    // Luego por fecha
    return new Date(a.start_time) - new Date(b.start_time);
  });

  // Ordenar archivadas por fecha (más recientes primero)
  const sortedArchivedSessions = [...archivedSessions].sort((a, b) => 
    new Date(b.start_time) - new Date(a.start_time)
  );

  // Agrupar activas por fecha
  const activeSessionsByDate = sortedActiveSessions.reduce((acc, session) => {
    const date = format(parseISO(session.start_time), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(session);
    return acc;
  }, {});

  // Agrupar archivadas por fecha
  const archivedSessionsByDate = sortedArchivedSessions.reduce((acc, session) => {
    const date = format(parseISO(session.start_time), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(session);
    return acc;
  }, {});

  const handleDelete = (sessionId, sessionTitle) => {
    if (window.confirm(`¿Eliminar permanentemente "${sessionTitle}"?`)) {
      deleteMutation.mutate(sessionId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sesiones Activas */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg sm:text-xl font-bold text-emerald-400">
          Sesiones Pendientes ({activeSessions.length})
        </h2>
      </div>

      {Object.entries(activeSessionsByDate).map(([date, dateSessions]) => (
        <div key={date} className="bg-[#141414] rounded-xl sm:rounded-2xl border border-white/5 overflow-hidden">
          {/* Date Header */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/5 bg-white/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-base sm:text-lg font-bold">
                {format(parseISO(date), 'EEEE, d MMMM yyyy')}
              </h3>
              <span className="text-xs sm:text-sm text-gray-500">{dateSessions.length} sesiones</span>
            </div>
          </div>

          {/* Sessions List */}
          <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
            {dateSessions.map(session => {
              const artist = artists.find(a => a.id === session.artist_id);
              const duration = session.start_time && session.end_time 
                ? differenceInHours(parseISO(session.end_time), parseISO(session.start_time))
                : 0;
              const isConfirmed = session.status === 'Confirmed';
              const isDone = session.status === 'Done';

              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => onSessionClick(session)}
                  className="group relative bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-emerald-500/30 rounded-lg sm:rounded-xl p-3 sm:p-5 cursor-pointer transition-all"
                >
                  {/* Status Indicator */}
                  <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-lg sm:rounded-t-xl ${
                    isConfirmed ? 'bg-emerald-500' : 'bg-yellow-500'
                  }`} />

                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <h4 className="text-base sm:text-xl font-bold text-white truncate">{session.title}</h4>
                        <span className={`px-2 sm:px-3 py-1 rounded-lg text-xs font-bold border shrink-0 self-start ${
                          isConfirmed ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 
                          'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        }`}>
                          {isConfirmed ? (
                            <><CheckCircle2 className="w-3 h-3 inline mr-1" />Confirmado</>
                          ) : (
                            <><AlertCircle className="w-3 h-3 inline mr-1" />Por Confirmar</>
                          )}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                        {/* Time */}
                        <div className="flex items-center gap-2 text-gray-300">
                          <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-semibold truncate">
                              {format(parseISO(session.start_time), 'HH:mm')} - {format(parseISO(session.end_time), 'HH:mm')}
                            </div>
                            <div className="text-xs text-gray-500">{duration}h duración</div>
                          </div>
                        </div>

                        {/* Artist */}
                        {artist && (
                          <div className="flex items-center gap-2 text-gray-300">
                            <User className="w-4 h-4 text-purple-400 shrink-0" />
                            <div className="min-w-0">
                              <div className="text-xs sm:text-sm font-semibold truncate">{artist.stageName}</div>
                              <div className="text-xs text-gray-500">Artista</div>
                            </div>
                          </div>
                        )}

                        {/* Location */}
                        <div className="flex items-center gap-2 text-gray-300">
                          <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-semibold truncate">{session.location}</div>
                            <div className="text-xs text-gray-500">Ubicación</div>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {session.description && (
                        <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-400 line-clamp-2">{session.description}</p>
                      )}
                    </div>

                    {/* Type Badge */}
                    <span className={`px-2 sm:px-3 py-1 rounded-lg text-xs font-semibold shrink-0 self-start ${
                      session.type === 'Session' ? 'bg-emerald-500/10 text-emerald-400' :
                      session.type === 'Meeting' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-purple-500/10 text-purple-400'
                    }`}>
                      {session.type}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}

      {sortedActiveSessions.length === 0 && (
        <div className="bg-[#141414] rounded-xl sm:rounded-2xl border border-white/5 p-8 sm:p-12 text-center">
          <CalendarIcon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-600" />
          <p className="text-sm sm:text-base text-gray-500">No hay sesiones programadas</p>
        </div>
      )}

      {/* Sesiones Archivadas (Finalizadas) */}
      {archivedSessions.length > 0 && (
        <div className="mt-8 pt-8 border-t border-white/10">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="flex items-center justify-between w-full mb-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-500/20 flex items-center justify-center">
                <Archive className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-left">
                <h2 className="text-base sm:text-lg font-bold text-gray-400">
                  Sesiones Archivadas
                </h2>
                <p className="text-xs sm:text-sm text-gray-600">{archivedSessions.length} finalizadas</p>
              </div>
            </div>
            <motion.div
              animate={{ rotate: showArchived ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              ▼
            </motion.div>
          </button>

          {showArchived && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6"
            >
              {Object.entries(archivedSessionsByDate).map(([date, dateSessions]) => (
                <div key={date} className="bg-[#141414] rounded-xl sm:rounded-2xl border border-white/5 overflow-hidden opacity-70">
                  <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/5 bg-white/5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-gray-400">
                        {format(parseISO(date), 'EEEE, d MMMM yyyy')}
                      </h3>
                      <span className="text-xs sm:text-sm text-gray-600">{dateSessions.length} sesiones</span>
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                    {dateSessions.map(session => {
                      const artist = artists.find(a => a.id === session.artist_id);
                      const duration = session.start_time && session.end_time 
                        ? differenceInHours(parseISO(session.end_time), parseISO(session.start_time))
                        : 0;

                      return (
                        <div
                          key={session.id}
                          className="relative bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4"
                        >
                          <div className="absolute top-0 left-0 right-0 h-1 rounded-t-lg sm:rounded-t-xl bg-gray-500" />

                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                <h4 className="text-sm sm:text-base font-bold text-gray-400 truncate">{session.title}</h4>
                                <span className="px-2 py-0.5 rounded text-xs font-bold bg-gray-500/20 text-gray-400 self-start">
                                  🔴 FINALIZADO
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs sm:text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                                  <span className="truncate">{format(parseISO(session.start_time), 'HH:mm')} - {format(parseISO(session.end_time), 'HH:mm')}</span>
                                </div>
                                {artist && (
                                  <div className="flex items-center gap-2">
                                    <User className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                                    <span className="truncate">{artist.stageName}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                                  <span className="truncate">{session.location}</span>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(session.id, session.title);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium transition-colors flex items-center gap-1.5 self-start sm:self-center"
                            >
                              <Trash2 className="w-3 h-3" />
                              Eliminar
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}

function DeliverablesAgendaView({ deliverables, artists, projects }) {
  const sortedDeliverables = [...deliverables].sort((a, b) => 
    new Date(a.due_date_time) - new Date(b.due_date_time)
  );

  const deliverablesByDate = sortedDeliverables.reduce((acc, deliverable) => {
    const date = format(parseISO(deliverable.due_date_time), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(deliverable);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(deliverablesByDate).map(([date, dateDeliverables]) => (
        <div key={date} className="bg-[#141414] rounded-2xl border border-white/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 bg-white/5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">
                {format(parseISO(date), 'EEEE, d MMMM yyyy')}
              </h3>
              <span className="text-sm text-gray-500">{dateDeliverables.length} entregables</span>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {dateDeliverables.map(deliverable => {
              const artist = artists.find(a => a.id === deliverable.artist_id);
              const project = projects.find(p => p.id === deliverable.project_id);
              const isOverdue = deliverable.status === 'Overdue';

              return (
                <motion.div
                  key={deliverable.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-gradient-to-br from-white/5 to-transparent border rounded-xl p-5 ${
                    isOverdue ? 'border-red-500/30' : 'border-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="text-lg font-bold text-white">{deliverable.title}</h4>
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          isOverdue ? 'bg-red-500/20 text-red-400' :
                          deliverable.status === 'Sent' ? 'bg-blue-500/20 text-blue-400' :
                          deliverable.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {deliverable.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                        {artist && <span>👤 {artist.stageName}</span>}
                        {project && <span>📁 {project.title}</span>}
                        <span>🕐 {format(parseISO(deliverable.due_date_time), 'HH:mm')}</span>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-purple-500/10 text-purple-400">
                      {deliverable.deliverable_type}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}

      {sortedDeliverables.length === 0 && (
        <div className="bg-[#141414] rounded-2xl border border-white/5 p-12 text-center">
          <Package className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <p className="text-gray-500">No hay entregables programados</p>
        </div>
      )}
    </div>
  );
}

function CreateSessionModal({ isOpen, onClose, artists, projects }) {
  const [formData, setFormData] = useState({
    title: "",
    type: "Session",
    artist_id: "",
    project_id: "",
    start_time: "",
    end_time: "",
    location: "Studio",
    description: "",
    status: "Scheduled"
  });
  const [syncingGCal, setSyncingGCal] = useState(false);
  const [gcalStatus, setGcalStatus] = useState(null); // 'success' | 'error' | null

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data) => {
      // 1. Create session in DB
      const session = await base44.entities.Session.create({ ...data, source: 'cabana' });
      // 2. Sync to Google Calendar
      setSyncingGCal(true);
      try {
        const res = await base44.functions.invoke('createGoogleCalendarEvent', { session });
        if (res.data?.google_event_id) {
          await base44.entities.Session.update(session.id, {
            google_event_id: res.data.google_event_id,
            google_event_link: res.data.google_event_link
          });
          setGcalStatus('success');
        }
      } catch (e) {
        setGcalStatus('error');
      } finally {
        setSyncingGCal(false);
      }
      return session;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      setTimeout(() => { onClose(); setGcalStatus(null); }, gcalStatus === 'error' ? 1500 : 800);
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-lg bg-[#141414] rounded-2xl border border-white/10 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Nueva Sesión</h3>
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Google Calendar activo
          </div>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }} className="space-y-4">
          <input
            type="text"
            placeholder="Título de la sesión *"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50"
          />
          <div className="grid grid-cols-2 gap-4">
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="Session">Sesión</option>
              <option value="Meeting">Reunión</option>
              <option value="StudioWork">Trabajo Estudio</option>
            </select>
            <select
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="Studio">Estudio</option>
              <option value="Online">Online</option>
              <option value="External">Externo</option>
            </select>
          </div>
          <select
            value={formData.artist_id}
            onChange={(e) => setFormData({ ...formData, artist_id: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
          >
            <option value="">Seleccionar Artista</option>
            {artists.map((artist) => (
              <option key={artist.id} value={artist.id}>{artist.stageName}</option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="datetime-local"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
            />
            <input
              type="datetime-local"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          <textarea
            placeholder="Descripción..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 resize-none"
          />

          {/* GCal status feedback */}
          {syncingGCal && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 rounded-lg px-3 py-2">
              <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              Sincronizando con Google Calendar...
            </div>
          )}
          {gcalStatus === 'success' && (
            <div className="text-xs text-emerald-400 bg-emerald-500/10 rounded-lg px-3 py-2">
              ✓ Evento creado en Google Calendar
            </div>
          )}
          {gcalStatus === 'error' && (
            <div className="text-xs text-yellow-400 bg-yellow-500/10 rounded-lg px-3 py-2">
              ⚠ Sesión guardada, pero no se pudo sincronizar con Google Calendar
            </div>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10">Cancelar</button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {createMutation.isPending ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</>
              ) : 'Crear Sesión'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function CreateDeliverableModal({ isOpen, onClose, artists, projects }) {
  const [formData, setFormData] = useState({
    artist_id: "",
    project_id: "",
    deliverable_type: "Demo",
    title: "",
    due_date_time: "",
    status: "Pending",
    notes: ""
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Deliverable.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliverables'] });
      onClose();
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-lg bg-[#141414] rounded-2xl border border-white/10 p-6"
      >
        <h3 className="text-xl font-bold mb-6">New Deliverable</h3>
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }} className="space-y-4">
          <input
            type="text"
            placeholder="Deliverable Title *"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50"
          />
          <select
            value={formData.artist_id}
            onChange={(e) => setFormData({ ...formData, artist_id: e.target.value })}
            required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
          >
            <option value="">Select Artist *</option>
            {artists.map((artist) => (
              <option key={artist.id} value={artist.id}>{artist.stageName}</option>
            ))}
          </select>
          <select
            value={formData.project_id}
            onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
            required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
          >
            <option value="">Select Project *</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.title}</option>
            ))}
          </select>
          <select
            value={formData.deliverable_type}
            onChange={(e) => setFormData({ ...formData, deliverable_type: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
          >
            <option value="Demo">Demo</option>
            <option value="Beat">Beat</option>
            <option value="Recording">Recording</option>
            <option value="Mix">Mix</option>
            <option value="Master">Master</option>
            <option value="Stems">Stems</option>
            <option value="Visual">Visual</option>
            <option value="ContentPack">Content Pack</option>
          </select>
          <input
            type="datetime-local"
            value={formData.due_date_time}
            onChange={(e) => setFormData({ ...formData, due_date_time: e.target.value })}
            required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
          />
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600">Create</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}