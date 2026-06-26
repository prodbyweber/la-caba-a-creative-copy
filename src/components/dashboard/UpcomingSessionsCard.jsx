import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Plus, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format, parseISO, isToday, isTomorrow, differenceInHours } from "date-fns";
import SessionDetailModal from "@/components/sessions/SessionDetailModal";
import StudioHoursBlock from "./StudioHoursBlock";

export default function UpcomingSessionsCard({ artistId }) {
  const [selectedSession, setSelectedSession] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
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
      <div className="p-2.5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <Calendar className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Próximas Sesiones</h3>
            <p className="text-[9px] text-gray-500">{sessions.length} programadas</p>
          </div>
        </div>
        <a
          href="/StudioSession"
          className="px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white text-[9px] font-medium transition-all flex items-center gap-1 no-underline"
          style={{ textDecoration: "none" }}
        >
          <Plus className="w-2.5 h-2.5" />
          Agendar
        </a>
      </div>

      {/* Studio Hours Block */}
      <div className="px-2 pt-2">
        <StudioHoursBlock artist={{ id: artistId }} />
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

      {showScheduleModal && (
        <ScheduleSessionModal
          artistId={artistId}
          onClose={() => setShowScheduleModal(false)}
          onSuccess={() => {
            setShowScheduleModal(false);
            queryClient.invalidateQueries({ queryKey: ['artist-sessions', artistId] });
          }}
        />
      )}
    </motion.div>
  );
}

function ScheduleSessionModal({ artistId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    type: 'Session',
    title: '',
    start_time: '',
    end_time: '',
    location: 'Studio',
    description: ''
  });

  const createSessionMutation = useMutation({
    mutationFn: (data) => base44.entities.Session.create(data),
    onSuccess: () => {
      onSuccess();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createSessionMutation.mutate({
      ...formData,
      artist_id: artistId,
      status: 'Pending'
    });
  };

  const sessionTypes = [
    { value: 'Session', label: 'Sesión', icon: '🎵' },
    { value: 'Meeting', label: 'Reunión', icon: '💼' },
    { value: 'StudioWork', label: 'Estudio', icon: '🎙️' }
  ];

  const locations = [
    { value: 'Studio', label: 'Estudio' },
    { value: 'Online', label: 'Online' },
    { value: 'External', label: 'Externo' }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#111113] rounded-2xl border border-white/10 max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-base font-semibold">Agendar Sesión</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Tipo de Sesión */}
          <div>
            <label className="block text-xs text-gray-400 mb-2">Tipo de Sesión</label>
            <div className="grid grid-cols-3 gap-2">
              {sessionTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                  className={`p-2 rounded-lg text-xs font-medium transition-all ${
                    formData.type === type.value
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="text-base mb-0.5">{type.icon}</div>
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Título */}
          <div>
            <label className="block text-xs text-gray-400 mb-2">Título</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
              placeholder="Ej: Grabación de voces"
            />
          </div>

          {/* Fecha y Hora Inicio */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-2">Fecha Inicio</label>
              <input
                type="date"
                required
                value={formData.start_time ? formData.start_time.split('T')[0] : ''}
                onChange={(e) => {
                  const time = formData.start_time ? formData.start_time.split('T')[1] : '09:00';
                  setFormData(prev => ({ ...prev, start_time: `${e.target.value}T${time}` }));
                }}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-2">Hora Inicio</label>
              <input
                type="time"
                required
                value={formData.start_time ? formData.start_time.split('T')[1] : ''}
                onChange={(e) => {
                  const date = formData.start_time ? formData.start_time.split('T')[0] : format(new Date(), 'yyyy-MM-dd');
                  setFormData(prev => ({ ...prev, start_time: `${date}T${e.target.value}` }));
                }}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
          </div>

          {/* Fecha y Hora Fin */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-2">Fecha Fin</label>
              <input
                type="date"
                required
                value={formData.end_time ? formData.end_time.split('T')[0] : ''}
                onChange={(e) => {
                  const time = formData.end_time ? formData.end_time.split('T')[1] : '10:00';
                  setFormData(prev => ({ ...prev, end_time: `${e.target.value}T${time}` }));
                }}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-2">Hora Fin</label>
              <input
                type="time"
                required
                value={formData.end_time ? formData.end_time.split('T')[1] : ''}
                onChange={(e) => {
                  const date = formData.end_time ? formData.end_time.split('T')[0] : format(new Date(), 'yyyy-MM-dd');
                  setFormData(prev => ({ ...prev, end_time: `${date}T${e.target.value}` }));
                }}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
          </div>

          {/* Ubicación */}
          <div>
            <label className="block text-xs text-gray-400 mb-2">Ubicación</label>
            <div className="grid grid-cols-3 gap-2">
              {locations.map((loc) => (
                <button
                  key={loc.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, location: loc.value }))}
                  className={`p-2 rounded-lg text-xs font-medium transition-all ${
                    formData.location === loc.value
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {loc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs text-gray-400 mb-2">Descripción (opcional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
              placeholder="Detalles adicionales..."
            />
          </div>

          {/* Botones */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createSessionMutation.isPending}
              className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {createSessionMutation.isPending ? 'Agendando...' : 'Agendar'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}