import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import SessionDetailModal from "@/components/sessions/SessionDetailModal";
import DashboardNav from "@/components/dashboard/DashboardNav";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import CreateSessionModal from "@/components/admin/CreateSessionModal";
import CreateDeliverableModal from "@/components/admin/CreateDeliverableModal";
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, Clock, MapPin, User, CheckCircle2, AlertCircle, Archive, Trash2, ExternalLink } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, isToday, differenceInHours, set, startOfWeek, addDays, getDay } from "date-fns";
import { es } from "date-fns/locale";

const SESSION_COLORS = {
  Session: { bg: "#10b981", light: "rgba(16,185,129,0.15)", text: "#10b981", border: "rgba(16,185,129,0.4)" },
  Meeting: { bg: "#3b82f6", light: "rgba(59,130,246,0.15)", text: "#3b82f6", border: "rgba(59,130,246,0.4)" },
  StudioWork: { bg: "#8b5cf6", light: "rgba(139,92,246,0.15)", text: "#8b5cf6", border: "rgba(139,92,246,0.4)" },
  Deliverable: { bg: "#f59e0b", light: "rgba(245,158,11,0.15)", text: "#f59e0b", border: "rgba(245,158,11,0.4)" },
};

export default function Calendars() {
  const [viewMode, setViewMode] = useState(() => window.innerWidth < 640 ? "agenda" : "month"); // month | agenda
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showDeliverableModal, setShowDeliverableModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [dragItem, setDragItem] = useState(null);
  const [dragOverDay, setDragOverDay] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const artistId = urlParams.get("artistId");

  const { data: allSessions = [] } = useQuery({ queryKey: ['sessions'], queryFn: () => base44.entities.Session.list('-start_time') });
  const { data: allDeliverables = [] } = useQuery({ queryKey: ['deliverables'], queryFn: () => base44.entities.Deliverable.list('-due_date_time') });
  const { data: artists = [] } = useQuery({ queryKey: ['artists'], queryFn: () => base44.entities.Artist.list() });
  const { data: artist } = useQuery({ queryKey: ['artist', artistId], queryFn: async () => { const list = await base44.entities.Artist.list(); return list.find(a => a.id === artistId); }, enabled: !!artistId });
  const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: () => base44.entities.Project.list() });

  const sessions = artistId ? allSessions.filter(s => s.artist_id === artistId) : allSessions;
  const deliverables = artistId ? allDeliverables.filter(d => d.artist_id === artistId) : allDeliverables;

  const queryClient = useQueryClient();

  const moveSessionMutation = useMutation({
    mutationFn: async ({ id, newDate, originalData }) => {
      const original = parseISO(originalData.start_time);
      const originalEnd = parseISO(originalData.end_time);
      const duration = originalEnd - original;
      const newStart = set(original, { year: newDate.getFullYear(), month: newDate.getMonth(), date: newDate.getDate() });
      const newEnd = new Date(newStart.getTime() + duration);
      const updated = await base44.entities.Session.update(id, { start_time: newStart.toISOString(), end_time: newEnd.toISOString() });
      if (originalData.google_event_id) {
        try { await base44.functions.invoke('updateGoogleCalendarEvent', { session: { ...originalData, start_time: newStart.toISOString(), end_time: newEnd.toISOString() }, google_event_id: originalData.google_event_id }); } catch (e) {}
      }
      return updated;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions'] })
  });

  const deleteSessionMutation = useMutation({
    mutationFn: async (session) => {
      if (session.google_event_id) { try { await base44.functions.invoke('deleteGoogleCalendarEvent', { google_event_id: session.google_event_id }); } catch (e) {} }
      return base44.entities.Session.delete(session.id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions'] })
  });

  const handleDrop = (day) => {
    if (!dragItem) return;
    if (dragItem.type === 'session') moveSessionMutation.mutate({ id: dragItem.id, newDate: day, originalData: dragItem.data });
    setDragItem(null);
    setDragOverDay(null);
  };

  // Build calendar grid starting on Sunday
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const totalDays = 42;
  const calendarDays = Array.from({ length: totalDays }, (_, i) => addDays(gridStart, i));

  const getItemsForDay = (day) => {
    const daySessions = sessions.filter(s => s.start_time && isSameDay(parseISO(s.start_time), day));
    const dayDeliverables = deliverables.filter(d => d.due_date_time && isSameDay(parseISO(d.due_date_time), day));
    return { sessions: daySessions, deliverables: dayDeliverables };
  };

  const prevMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const content = (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* Top Bar — fila única en desktop, dos filas en móvil */}
      <div className="border-b border-white/5 bg-[#0a0a0b] flex-shrink-0">
        {/* Fila 1: nav mes + acciones */}
        <div className="flex items-center justify-between px-2 sm:px-4 py-2">
          {/* Izquierda: navegación mes */}
          <div className="flex items-center gap-1">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"><ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" /></button>
            <h2 className="text-sm sm:text-lg font-bold text-white px-1 text-center">
              {format(currentDate, 'MMMM yyyy', { locale: es }).replace(/^\w/, c => c.toUpperCase())}
            </h2>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"><ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" /></button>
          </div>

          {/* Derecha: view toggle + botones */}
          <div className="flex items-center gap-1.5">
            <button onClick={() => setCurrentDate(new Date())} className="px-2 py-1 rounded-lg border border-white/10 text-[11px] font-medium text-gray-300 hover:bg-white/10 transition-colors hidden sm:block">Hoy</button>

            {/* View toggle */}
            <div className="flex gap-0.5 bg-white/5 rounded-lg p-0.5">
              <button onClick={() => setViewMode("month")} className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all ${viewMode === "month" ? "bg-white/15 text-white" : "text-gray-400 hover:text-white"}`}>
                <CalendarIcon className="w-3 h-3" /><span className="hidden sm:inline">Mes</span>
              </button>
              <button onClick={() => setViewMode("agenda")} className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all ${viewMode === "agenda" ? "bg-white/15 text-white" : "text-gray-400 hover:text-white"}`}>
                <List className="w-3 h-3" /><span className="hidden sm:inline">Agenda</span>
              </button>
            </div>

            <button onClick={() => setShowSessionModal(true)} className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-medium transition-colors">
              <Plus className="w-3.5 h-3.5" /><span className="hidden sm:inline">Sesión</span>
            </button>
            {!artistId && (
              <button onClick={() => setShowDeliverableModal(true)} className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30 text-[11px] font-medium transition-colors">
                <Plus className="w-3.5 h-3.5" /><span className="hidden sm:inline">Entregable</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Calendar Body */}
      {viewMode === "month" ? (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-white/5 flex-shrink-0">
            {[['D','Dom'], ['L','Lun'], ['M','Mar'], ['M','Mié'], ['J','Jue'], ['V','Vie'], ['S','Sáb']].map(([short, full], i) => (
              <div key={i} className="py-1.5 text-center text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <span className="sm:hidden">{short}</span>
                <span className="hidden sm:inline">{full}</span>
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 flex-1 overflow-y-auto" style={{ gridTemplateRows: 'repeat(6, minmax(0, 1fr))' }}>
            {calendarDays.map((day, i) => {
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isTodayDate = isToday(day);
              const isDragOver = dragOverDay && isSameDay(dragOverDay, day);
              const { sessions: daySessions, deliverables: dayDeliverables } = getItemsForDay(day);
              const allItems = [
                ...daySessions.map(s => ({ ...s, _kind: 'session' })),
                ...dayDeliverables.map(d => ({ ...d, _kind: 'deliverable' }))
              ].sort((a, b) => {
                const aTime = a._kind === 'session' ? (a.start_time ? new Date(a.start_time) : 0) : (a.due_date_time ? new Date(a.due_date_time) : 0);
                const bTime = b._kind === 'session' ? (b.start_time ? new Date(b.start_time) : 0) : (b.due_date_time ? new Date(b.due_date_time) : 0);
                return aTime - bTime;
              });
              const maxVisible = 3;
              const overflow = allItems.length - maxVisible;

              return (
                <div
                  key={i}
                  className={`border-b border-r border-white/[0.06] p-0.5 sm:p-1 flex flex-col min-h-0 cursor-pointer transition-colors ${
                    isDragOver ? 'bg-emerald-500/10' : isCurrentMonth ? 'bg-transparent hover:bg-white/[0.02]' : 'bg-white/[0.01]'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setDragOverDay(day); }}
                  onDragLeave={() => setDragOverDay(null)}
                  onDrop={() => handleDrop(day)}
                >
                  {/* Day number */}
                  <div className="flex items-center justify-center sm:justify-start mb-0.5 sm:mb-1 px-0.5">
                    <span className={`text-[10px] sm:text-xs font-bold w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full ${
                      isTodayDate ? 'bg-blue-500 text-white' : isCurrentMonth ? 'text-gray-200' : 'text-gray-600'
                    }`}>
                      {format(day, 'd')}
                    </span>
                  </div>

                  {/* Events */}
                  <div className="space-y-0.5 flex-1 overflow-hidden">
                    {allItems.slice(0, maxVisible).map((item, idx) => {
                      const isSession = item._kind === 'session';
                      const colors = isSession ? SESSION_COLORS[item.type] || SESSION_COLORS.Session : SESSION_COLORS.Deliverable;
                      return (
                        <button
                          key={idx}
                          draggable={isSession}
                          onDragStart={isSession ? (e) => { e.stopPropagation(); setDragItem({ id: item.id, type: 'session', data: item }); } : undefined}
                          onDragEnd={isSession ? () => setDragItem(null) : undefined}
                          onClick={(e) => { e.stopPropagation(); if (isSession) setSelectedSession(item); }}
                          className="w-full text-left px-1 py-px rounded text-[9px] sm:text-[10px] font-medium truncate transition-opacity hover:opacity-80"
                          style={{ backgroundColor: colors.bg, color: '#fff', borderLeft: `2px solid ${colors.bg}` }}
                        >
                          <span className="hidden sm:inline opacity-80 mr-0.5">
                            {isSession && item.start_time ? format(parseISO(item.start_time), 'h:mm a') : ''}
                          </span>
                          {item.title}
                        </button>
                      );
                    })}
                    {overflow > 0 && (
                      <div className="text-[10px] text-gray-500 px-1 font-medium">+{overflow} más</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <AgendaView
          sessions={sessions}
          deliverables={deliverables}
          artists={artists}
          projects={projects}
          currentDate={currentDate}
          onSessionClick={setSelectedSession}
          onDeleteSession={(s) => { if (window.confirm(`¿Eliminar "${s.title}"?`)) deleteSessionMutation.mutate(s); }}
        />
      )}

      {/* FAB móvil — solo en agenda */}
      {viewMode === "agenda" && (
        <button
          onClick={() => setShowSessionModal(true)}
          className="sm:hidden fixed bottom-6 right-5 z-40 w-14 h-14 rounded-2xl bg-[#c7d0f5] flex items-center justify-center shadow-xl active:scale-95 transition-transform"
        >
          <Plus className="w-7 h-7 text-[#1a237e]" />
        </button>
      )}

      {/* Modals */}
      <CreateSessionModal isOpen={showSessionModal} onClose={() => setShowSessionModal(false)} editData={null} />
      {!artistId && <CreateDeliverableModal isOpen={showDeliverableModal} onClose={() => setShowDeliverableModal(false)} editData={null} />}
      {selectedSession && <SessionDetailModal session={selectedSession} onClose={() => setSelectedSession(null)} artists={artists} />}
    </div>
  );

  return artistId ? (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <DashboardNav artistName={artist?.stageName} artistId={artistId} />
      <main className="pt-14">{content}</main>
    </div>
  ) : (
    <AdminLayout activePage="Calendars">
      {content}
    </AdminLayout>
  );
}

const AGENDA_COLORS = {
  Session:     { bg: "#e8452c", text: "#fff" },
  Meeting:     { bg: "#3b82f6", text: "#fff" },
  StudioWork:  { bg: "#8b5cf6", text: "#fff" },
  Deliverable: { bg: "#0d9488", text: "#fff" },
};

function getWeekLabel(date) {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);
  const monthName = (d) => format(d, 'MMMM', { locale: es }).toUpperCase();
  if (weekStart.getMonth() === weekEnd.getMonth()) {
    return `${format(weekStart, 'd')}–${format(weekEnd, 'd')} DE ${monthName(weekStart)}`;
  }
  return `${format(weekStart, 'd')} ${monthName(weekStart)} – ${format(weekEnd, 'd')} ${monthName(weekEnd)}`;
}

function AgendaView({ sessions, deliverables, artists, projects, currentDate, onSessionClick, onDeleteSession }) {
  const todayRef = useRef(null);
  const scrollRef = useRef(null);

  // Show from 3 months before current to 6 months after
  const rangeStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 3, 1);
  const rangeEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 6, 0);

  useEffect(() => {
    // Scroll to today after render
    const frame = requestAnimationFrame(() => {
      if (todayRef.current && scrollRef.current) {
        const container = scrollRef.current;
        const el = todayRef.current;
        container.scrollTop = el.offsetTop - container.offsetTop - 8;
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [currentDate]);

  const allItems = [
    ...sessions.filter(s => {
      if (!s.start_time) return false;
      const d = parseISO(s.start_time);
      return d >= rangeStart && d <= rangeEnd;
    }).map(s => ({ ...s, _kind: 'session', _date: parseISO(s.start_time) })),
    ...deliverables.filter(d => {
      if (!d.due_date_time) return false;
      const dt = parseISO(d.due_date_time);
      return dt >= rangeStart && dt <= rangeEnd;
    }).map(d => ({ ...d, _kind: 'deliverable', _date: parseISO(d.due_date_time) })),
  ].sort((a, b) => a._date - b._date);

  // Group by date
  const byDate = {};
  allItems.forEach(item => {
    const key = format(item._date, 'yyyy-MM-dd');
    if (!byDate[key]) byDate[key] = [];
    byDate[key].push(item);
  });

  if (Object.keys(byDate).length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No hay eventos programados</p>
        </div>
      </div>
    );
  }

  // Build ordered list with week separators
  const entries = Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b));
  let lastWeekKey = null;
  const rows = [];

  entries.forEach(([dateKey, items]) => {
    const date = parseISO(dateKey);
    const weekKey = format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
    if (weekKey !== lastWeekKey) {
      rows.push({ type: 'week', key: 'w-' + weekKey, label: getWeekLabel(date) });
      lastWeekKey = weekKey;
    }
    rows.push({ type: 'day', key: dateKey, date, items });
  });

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto bg-[#0a0a0b]">
      {rows.map(row => {
        if (row.type === 'week') {
          return (
            <div key={row.key} className="px-4 pt-4 pb-1">
              <span className="text-[10px] font-semibold text-gray-500 tracking-widest uppercase">{row.label}</span>
            </div>
          );
        }

        const { date, items } = row;
        const isTodayDate = isToday(date);
        const dayAbbr = format(date, 'EEE', { locale: es }).toUpperCase().slice(0, 3);

        return (
          <div
            key={row.key}
            ref={isTodayDate ? todayRef : null}
            className="flex items-start px-2 sm:px-4 py-1 gap-3"
          >
            {/* Date column — fixed width, compact */}
            <div className="flex-shrink-0 w-12 flex flex-col items-center pt-1">
              <span className={`text-[11px] font-semibold uppercase tracking-wide leading-none ${isTodayDate ? 'text-blue-400' : 'text-gray-500'}`}>
                {dayAbbr}
              </span>
              <span className={`text-xl font-bold leading-tight mt-0.5 w-8 h-8 flex items-center justify-center rounded-full ${
                isTodayDate ? 'bg-blue-500 text-white' : 'text-white'
              }`}>
                {format(date, 'd')}
              </span>
            </div>

            {/* Events column */}
            <div className="flex-1 min-w-0 space-y-1.5 pb-2">
              {items.map((item, idx) => {
                const isSession = item._kind === 'session';
                const colorKey = isSession ? (item.type || 'Session') : 'Deliverable';
                const color = AGENDA_COLORS[colorKey] || AGENDA_COLORS.Session;
                const artist = artists.find(a => a.id === item.artist_id);
                const project = projects.find(p => p.id === item.project_id);

                let timeStr = '';
                if (isSession && item.start_time) {
                  timeStr = format(parseISO(item.start_time), 'h:mm a');
                  if (item.end_time) timeStr += ` – ${format(parseISO(item.end_time), 'h:mm a')}`;
                  if (item.location) timeStr += ` · ${item.location}`;
                } else if (!isSession && item.due_date_time) {
                  timeStr = `Hasta las ${format(parseISO(item.due_date_time), 'h:mm a')}`;
                }

                const subtitle = [
                  timeStr,
                  artist ? artist.stageName : null,
                  project ? project.title : null,
                ].filter(Boolean).join(' · ');

                return (
                  <div
                    key={idx}
                    onClick={() => isSession && onSessionClick(item)}
                    className={`w-full rounded-lg px-3 py-2 ${isSession ? 'cursor-pointer active:opacity-80' : ''}`}
                    style={{ backgroundColor: color.bg }}
                  >
                    <p className="text-sm font-semibold text-white leading-tight truncate">{item.title}</p>
                    {subtitle && (
                      <p className="text-[11px] text-white/80 mt-0.5 leading-tight truncate">{subtitle}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      {/* Bottom padding */}
      <div className="h-24" />
    </div>
  );
}