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
          sessions.map((session, i) => {
            const isPending = session.status === 'Pending';
            const isConfirmed = session.status === 'Confirmed';
            const duration = calculateDuration(session.start_time, session.end_time);
            
            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                onClick={() => setSelectedSession(session)}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a0a0b] to-black border border-white/10 hover:border-emerald-500/30 transition-all cursor-pointer"
              >
                {/* Status Indicator Bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${
                  isConfirmed ? 'bg-emerald-500' : 'bg-yellow-500'
                }`} />

                <div className="p-4">
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-base mb-1 line-clamp-1">{session.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="capitalize">{session.type}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {session.location}
                        </div>
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold ${
                      isConfirmed 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      {isConfirmed ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          Confirmado
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3" />
                          Pendiente
                        </>
                      )}
                    </div>
                  </div>

                  {/* Time Info Row */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-white">
                        <Clock className="w-4 h-4 text-emerald-400" />
                        <span className="font-semibold">
                          {format(parseISO(session.start_time), 'HH:mm')} - {format(parseISO(session.end_time), 'HH:mm')}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatSessionDate(session.start_time)}
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                      {duration}h
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {isPending && (
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => handleConfirmSession(session.id, e)}
                        disabled={updateSessionMutation.isPending}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Confirmar Sesión
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSession(session);
                        }}
                        className="py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-semibold transition-all"
                      >
                        Ver Detalles
                      </button>
                    </div>
                  )}
                  
                  {isConfirmed && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSession(session);
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                    >
                      Ver Detalles Completos
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })
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