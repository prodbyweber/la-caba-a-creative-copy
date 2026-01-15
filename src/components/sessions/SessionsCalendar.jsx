import React, { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import SessionDetailModal from "@/components/sessions/SessionDetailModal";
import { 
  ChevronLeft, 
  ChevronRight,
  Loader,
  Clock,
  MapPin
} from "lucide-react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
  isWithinInterval
} from "date-fns";
import { es } from "date-fns/locale";

const sessionTypeColors = {
  studio: "bg-purple-500/20 border-purple-500/50 text-purple-400",
  meeting: "bg-blue-500/20 border-blue-500/50 text-blue-400",
  rehearsal: "bg-green-500/20 border-green-500/50 text-green-400",
  recording: "bg-red-500/20 border-red-500/50 text-red-400",
  production: "bg-orange-500/20 border-orange-500/50 text-orange-400",
  other: "bg-gray-500/20 border-gray-500/50 text-gray-400"
};

export default function SessionsCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSession, setSelectedSession] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const allSessions = await base44.entities.Session.list('-start_time');
      // Si el usuario no es admin, filtrar solo sus sesiones
      if (user && user.role !== 'admin') {
        const artists = await base44.entities.Artist.filter({ email: user.email });
        if (artists.length > 0) {
          const artistId = artists[0].id;
          return allSessions.filter(s => s.artist_id === artistId);
        }
        return [];
      }
      return allSessions;
    },
    enabled: !!user
  });

  const { data: artists = [] } = useQuery({
    queryKey: ['artists'],
    queryFn: () => base44.entities.Artist.list()
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getSessionsForDay = (day) => {
    return sessions.filter(session => {
      const startTime = parseISO(session.start_time);
      return isSameDay(startTime, day);
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold">
            {format(currentDate, "MMMM yyyy", { locale: es })}
          </h2>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors"
          >
            Hoy
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-[#111113] rounded-2xl border border-white/5 overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-white/5">
          {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(day => (
            <div
              key={day}
              className="p-4 text-center text-sm font-medium text-gray-500 border-r border-white/5 last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, i) => {
            const daySessions = getSessionsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());

            return (
              <motion.div
                key={day.toString()}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.01 }}
                className={`min-h-32 p-3 border-r border-b border-white/5 last:border-r-0 ${
                  !isCurrentMonth ? "bg-white/[0.02]" : ""
                } ${isToday ? "bg-emerald-500/5" : ""}`}
              >
                <div className={`text-sm font-medium mb-2 ${
                  !isCurrentMonth ? "text-gray-600" : isToday ? "text-emerald-400" : "text-gray-400"
                }`}>
                  {format(day, "d")}
                </div>

                <div className="space-y-1">
                  {daySessions.slice(0, 3).map(session => {
                    const isDone = session.status === "Done";
                    return (
                      <button
                        key={session.id}
                        onClick={() => setSelectedSession(session)}
                        className={`w-full text-left px-2 py-1 rounded-lg text-xs font-medium border cursor-pointer hover:opacity-80 transition-all ${
                          isDone 
                            ? 'bg-red-500/10 border-red-500/30 text-red-400 opacity-60' 
                            : sessionTypeColors[session.session_type] || 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                        }`}
                      >
                        <div className="flex items-center gap-1 mb-0.5">
                          <Clock className="w-3 h-3" />
                          {format(parseISO(session.start_time), "HH:mm")}
                        </div>
                        <div className="truncate">{session.title}</div>
                        {isDone && (
                          <div className="text-[10px] mt-0.5 font-semibold">FINALIZADO</div>
                        )}
                      </button>
                    );
                  })}
                  {daySessions.length > 3 && (
                    <div className="text-xs text-gray-500 pl-2">
                      +{daySessions.length - 3} más
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {selectedSession && (
        <SessionDetailModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          artists={artists}
          readOnly={user?.role !== 'admin'}
        />
      )}
    </div>
  );
}