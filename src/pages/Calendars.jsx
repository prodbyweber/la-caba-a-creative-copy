import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import SessionDetailModal from "@/components/sessions/SessionDetailModal";
import { Plus, Calendar as CalendarIcon, Package, List, Clock, MapPin, User, CheckCircle2, AlertCircle } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, isToday, differenceInHours } from "date-fns";

export default function Calendars() {
  const [activeTab, setActiveTab] = useState("sessions");
  const [viewMode, setViewMode] = useState("calendar"); // "calendar" or "agenda"
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showDeliverableModal, setShowDeliverableModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => base44.entities.Session.list('-start_time')
  });

  const { data: deliverables = [] } = useQuery({
    queryKey: ['deliverables'],
    queryFn: () => base44.entities.Deliverable.list('-due_date_time')
  });

  const { data: artists = [] } = useQuery({
    queryKey: ['artists'],
    queryFn: () => base44.entities.Artist.list()
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list()
  });

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

  return (
    <AdminLayout activePage="Calendars">
      <div className="p-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Calendars</h1>
            <p className="text-gray-500">Manage sessions and deliverables</p>
          </div>
          <button
            onClick={() => activeTab === "sessions" ? setShowSessionModal(true) : setShowDeliverableModal(true)}
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            {activeTab === "sessions" ? "New Session" : "New Deliverable"}
          </button>
        </div>

        {/* Tabs & View Mode Toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("sessions")}
              className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                activeTab === "sessions"
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <CalendarIcon className="w-5 h-5" />
              Sessions Calendar ({sessions.length})
            </button>
            <button
              onClick={() => setActiveTab("deliverables")}
              className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                activeTab === "deliverables"
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <Package className="w-5 h-5" />
              Deliverables ({deliverables.length})
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2 bg-white/5 rounded-xl p-1">
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                viewMode === "calendar"
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              Calendario
            </button>
            <button
              onClick={() => setViewMode("agenda")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                viewMode === "agenda"
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
              Agenda
            </button>
          </div>
        </div>

        {/* Calendar/Agenda View */}
        {viewMode === "calendar" ? (
        <div className="bg-[#141414] rounded-2xl border border-white/5 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{format(currentDate, 'MMMM yyyy')}</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10"
              >
                ←
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10"
              >
                →
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {/* Desktop Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="hidden md:block text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
            {/* Mobile Headers */}
            {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, idx) => (
              <div key={idx} className="md:hidden text-center text-xs font-medium text-gray-500 py-1">
                {day}
              </div>
            ))}
            
            {daysInMonth.map((day, i) => {
              const daySessions = activeTab === "sessions" ? getSessionsForDay(day) : [];
              const dayDeliverables = activeTab === "deliverables" ? getDeliverablesForDay(day) : [];
              const hasItems = daySessions.length > 0 || dayDeliverables.length > 0;
              const isTodayDate = isToday(day);

              return (
                <div
                  key={i}
                  className={`min-h-16 md:min-h-24 p-1 md:p-2 rounded-lg border transition-all ${
                    isTodayDate
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : hasItems
                      ? 'bg-white/5 border-white/10 hover:border-emerald-500/30'
                      : 'bg-white/5 border-white/5'
                  }`}
                >
                  <div className={`text-xs md:text-sm font-medium mb-0.5 md:mb-1 ${
                    isTodayDate ? 'text-emerald-400' : 'text-gray-400'
                  }`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-0.5 md:space-y-1">
                    {activeTab === "sessions" && daySessions.slice(0, 2).map((session) => (
                      <button
                        key={session.id}
                        onClick={() => setSelectedSession(session)}
                        className="w-full text-left text-[9px] md:text-xs p-0.5 md:p-1 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                      >
                        <div className="font-semibold truncate mb-0.5">
                          {format(parseISO(session.start_time), 'HH:mm')}
                        </div>
                        <div className="truncate leading-tight">{session.title}</div>
                      </button>
                    ))}
                    {activeTab === "deliverables" && dayDeliverables.slice(0, 2).map((deliverable) => (
                      <div
                        key={deliverable.id}
                        className={`text-[9px] md:text-xs p-0.5 md:p-1 rounded truncate ${
                          deliverable.status === 'Overdue' 
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-purple-500/20 text-purple-400'
                        }`}
                      >
                        {deliverable.title}
                      </div>
                    ))}
                    {((activeTab === "sessions" && daySessions.length > 2) || 
                      (activeTab === "deliverables" && dayDeliverables.length > 2)) && (
                      <div className="text-[8px] md:text-[10px] text-gray-500">
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
          /* Agenda View */
          <div className="space-y-6">
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
  // Ordenar sesiones por fecha
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(a.start_time) - new Date(b.start_time)
  );

  // Agrupar por fecha
  const sessionsByDate = sortedSessions.reduce((acc, session) => {
    const date = format(parseISO(session.start_time), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(session);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(sessionsByDate).map(([date, dateSessions]) => (
        <div key={date} className="bg-[#141414] rounded-2xl border border-white/5 overflow-hidden">
          {/* Date Header */}
          <div className="px-6 py-4 border-b border-white/5 bg-white/5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">
                {format(parseISO(date), 'EEEE, d MMMM yyyy')}
              </h3>
              <span className="text-sm text-gray-500">{dateSessions.length} sesiones</span>
            </div>
          </div>

          {/* Sessions List */}
          <div className="p-4 space-y-3">
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
                  className="group relative bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-emerald-500/30 rounded-xl p-5 cursor-pointer transition-all"
                >
                  {/* Status Indicator */}
                  <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl ${
                    isDone ? 'bg-red-500' :
                    isConfirmed ? 'bg-emerald-500' : 'bg-yellow-500'
                  }`} />

                  <div className="flex items-start justify-between gap-4">
                    {/* Left Column */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="text-xl font-bold text-white truncate">{session.title}</h4>
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold border shrink-0 ${
                          isDone ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                          isConfirmed ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 
                          'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        }`}>
                          {isDone ? (
                            <>🔴 FINALIZADO</>
                          ) : isConfirmed ? (
                            <><CheckCircle2 className="w-3 h-3 inline mr-1" />Confirmado</>
                          ) : (
                            <><AlertCircle className="w-3 h-3 inline mr-1" />Por Confirmar</>
                          )}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Time */}
                        <div className="flex items-center gap-2 text-gray-300">
                          <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div>
                            <div className="text-sm font-semibold">
                              {format(parseISO(session.start_time), 'HH:mm')} - {format(parseISO(session.end_time), 'HH:mm')}
                            </div>
                            <div className="text-xs text-gray-500">{duration}h de duración</div>
                          </div>
                        </div>

                        {/* Artist */}
                        {artist && (
                          <div className="flex items-center gap-2 text-gray-300">
                            <User className="w-4 h-4 text-purple-400 shrink-0" />
                            <div>
                              <div className="text-sm font-semibold">{artist.stageName}</div>
                              <div className="text-xs text-gray-500">Artista</div>
                            </div>
                          </div>
                        )}

                        {/* Location */}
                        <div className="flex items-center gap-2 text-gray-300">
                          <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                          <div>
                            <div className="text-sm font-semibold">{session.location}</div>
                            <div className="text-xs text-gray-500">Ubicación</div>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {session.description && (
                        <p className="mt-3 text-sm text-gray-400 line-clamp-2">{session.description}</p>
                      )}
                    </div>

                    {/* Type Badge */}
                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 ${
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

      {sortedSessions.length === 0 && (
        <div className="bg-[#141414] rounded-2xl border border-white/5 p-12 text-center">
          <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <p className="text-gray-500">No hay sesiones programadas</p>
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

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Session.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
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
        <h3 className="text-xl font-bold mb-6">New Session</h3>
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }} className="space-y-4">
          <input
            type="text"
            placeholder="Session Title *"
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
              <option value="Session">Session</option>
              <option value="Meeting">Meeting</option>
              <option value="StudioWork">Studio Work</option>
            </select>
            <select
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="Studio">Studio</option>
              <option value="Online">Online</option>
              <option value="External">External</option>
            </select>
          </div>
          <select
            value={formData.artist_id}
            onChange={(e) => setFormData({ ...formData, artist_id: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
          >
            <option value="">Select Artist</option>
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
            placeholder="Description..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 resize-none"
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