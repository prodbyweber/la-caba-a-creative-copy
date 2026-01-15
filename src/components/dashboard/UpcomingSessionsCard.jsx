import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Plus, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format, parseISO, isToday, isTomorrow } from "date-fns";
import SessionDetailModal from "@/components/sessions/SessionDetailModal";

export default function UpcomingSessionsCard({ artistId }) {
  const [selectedSession, setSelectedSession] = useState(null);
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['artist-sessions', artistId],
    queryFn: async () => {
      if (!artistId) return [];
      const allSessions = await base44.entities.Session.filter({ 
        artist_id: artistId,
        status: 'Scheduled'
      });
      // Ordenar por fecha más cercana
      return allSessions.sort((a, b) => 
        new Date(a.start_time) - new Date(b.start_time)
      ).slice(0, 3);
    },
    enabled: !!artistId
  });

  const formatSessionDate = (dateString) => {
    try {
      const date = parseISO(dateString);
      if (isToday(date)) return "Hoy";
      if (isTomorrow(date)) return "Mañana";
      return format(date, "d MMM");
    } catch {
      return "Fecha no válida";
    }
  };

  const formatSessionTime = (dateString) => {
    try {
      return format(parseISO(dateString), "h:mm a");
    } catch {
      return "";
    }
  };

  const getSessionColor = (type) => {
    const colors = {
      'Session': 'emerald',
      'Meeting': 'purple',
      'StudioWork': 'orange'
    };
    return colors[type] || 'blue';
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[#111113] rounded-2xl border border-white/5 p-6"
      >
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/5 rounded w-1/2" />
          <div className="h-20 bg-white/5 rounded" />
        </div>
      </motion.div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-[#111113] rounded-2xl border border-white/5"
    >
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold">Próximas Sesiones</h3>
            <p className="text-xs text-gray-500">{sessions.length} sesiones programadas</p>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="p-4 space-y-3">
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-600" />
            <p>No hay sesiones programadas</p>
          </div>
        ) : (
          sessions.map((session, i) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              onClick={() => setSelectedSession(session)}
              className="group p-3 rounded-xl bg-[#0a0a0b] hover:bg-white/5 transition-all cursor-pointer"
            >
              <div className="flex items-start gap-3">
                {/* Color Indicator */}
                <div className={`w-1 h-12 rounded-full bg-${getSessionColor(session.type)}-500 flex-shrink-0`} />
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm mb-1">{session.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatSessionDate(session.start_time)} · {formatSessionTime(session.start_time)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <MapPin className="w-3 h-3" />
                    <span>{session.location}</span>
                  </div>
                </div>

                {/* Arrow */}
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* View All */}
      <div className="p-4 pt-0">
        <button className="w-full py-2.5 rounded-xl border border-white/10 text-sm text-gray-400 hover:text-white hover:border-white/20 transition-all">
          Ver Calendario Completo
        </button>
      </div>

      {selectedSession && (
        <SessionDetailModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          artists={[]}
          readOnly={true}
        />
      )}
    </motion.div>
  );
}