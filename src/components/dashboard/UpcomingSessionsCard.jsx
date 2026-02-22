import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Plus, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format, parseISO, isToday, isTomorrow, differenceInHours } from "date-fns";
import SessionDetailModal from "@/components/sessions/SessionDetailModal";

export default function UpcomingSessionsCard({ artistId }) {
  const [selectedSession, setSelectedSession] = useState(null);
  const queryClient = useQueryClient();

  const updateSessionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Session.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist-sessions', artistId] });
    }
  });
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['artist-sessions', artistId],
    queryFn: async () => {
      if (!artistId) return [];
      const allSessions = await base44.entities.Session.list('-start_time');
      // Filtrar solo sesiones de este artista que no estén finalizadas
      const artistSessions = allSessions.filter(s => 
        s.artist_id === artistId && 
        (s.status === 'Pending' || s.status === 'Confirmed')
      );
      // Ordenar por fecha más cercana
      return artistSessions.sort((a, b) => 
        new Date(a.start_time) - new Date(b.start_time)
      ).slice(0, 5);
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

  const handleConfirmSession = (sessionId, e) => {
    e.stopPropagation();
    updateSessionMutation.mutate({
      id: sessionId,
      data: { status: 'Confirmed' }
    });
  };

  const calculateDuration = (start, end) => {
    const hours = differenceInHours(parseISO(end), parseISO(start));
    return hours;
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
      className="bg-[#111113] rounded-lg border border-white/5"
    >
      {/* Header Compacto */}
      <div className="p-2.5 border-b border-white/5 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
          <Calendar className="w-3.5 h-3.5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">Próximas Sesiones</h3>
          <p className="text-[9px] text-gray-500">{sessions.length} programadas</p>
        </div>
      </div>

      {/* Sessions List Compacta */}
      <div className="p-2 space-y-2">
        {sessions.length === 0 ? (
          <div className="text-center py-4 text-gray-500 text-xs">
            <Calendar className="w-8 h-8 mx-auto mb-1 text-gray-600" />
            <p>Sin sesiones</p>
          </div>
        ) : (
          sessions.slice(0, 2).map((session, i) => {
            const isPending = session.status === 'Pending';
            const isConfirmed = session.status === 'Confirmed';
            
            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                onClick={() => setSelectedSession(session)}
                className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-[#0a0a0b] to-black border border-white/10 hover:border-purple-500/30 transition-all cursor-pointer"
              >
                <div className={`absolute top-0 left-0 right-0 h-0.5 ${
                  isConfirmed ? 'bg-emerald-500' : 'bg-yellow-500'
                }`} />

                <div className="p-2">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs mb-0.5 truncate">{session.title}</h4>
                      <div className="flex items-center gap-1.5 text-[9px] text-gray-500">
                        <Clock className="w-2.5 h-2.5 text-emerald-400" />
                        <span className="font-medium text-white">
                          {format(parseISO(session.start_time), 'HH:mm')}
                        </span>
                        <span>•</span>
                        <span>{formatSessionDate(session.start_time)}</span>
                      </div>
                    </div>
                    
                    <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-semibold ${
                      isConfirmed 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {isConfirmed ? (
                        <CheckCircle2 className="w-2 h-2" />
                      ) : (
                        <AlertCircle className="w-2 h-2" />
                      )}
                    </div>
                  </div>

                  {isPending && (
                    <button
                      onClick={(e) => handleConfirmSession(session.id, e)}
                      disabled={updateSessionMutation.isPending}
                      className="w-full py-1 px-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[9px] font-semibold transition-all flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Confirmar
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
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