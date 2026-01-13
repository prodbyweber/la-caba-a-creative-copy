import React from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Clock, MapPin, User, Calendar, Loader } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const sessionTypeConfig = {
  studio: { label: "Sesión de Estudio", color: "purple" },
  meeting: { label: "Reunión", color: "blue" },
  rehearsal: { label: "Ensayo", color: "green" },
  recording: { label: "Grabación", color: "red" },
  production: { label: "Producción", color: "orange" },
  other: { label: "Otro", color: "gray" }
};

const statusConfig = {
  scheduled: { label: "Programada", color: "bg-blue-500/10 text-blue-400" },
  confirmed: { label: "Confirmada", color: "bg-green-500/10 text-green-400" },
  in_progress: { label: "En Progreso", color: "bg-yellow-500/10 text-yellow-400" },
  completed: { label: "Completada", color: "bg-gray-500/10 text-gray-400" },
  cancelled: { label: "Cancelada", color: "bg-red-500/10 text-red-400" }
};

export default function SessionsList() {
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => base44.entities.Session.list('-start_time'),
  });

  const { data: artists = [] } = useQuery({
    queryKey: ['artists'],
    queryFn: () => base44.entities.Artist.list(),
  });

  const getArtistName = (artistId) => {
    const artist = artists.find(a => a.id === artistId);
    return artist?.name || "Sin artista";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-20 bg-[#111113] rounded-2xl border border-white/5">
        <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No hay sesiones programadas</h3>
        <p className="text-gray-500">Crea tu primera sesión para comenzar</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session, i) => {
        const typeConfig = sessionTypeConfig[session.session_type];
        const statusInfo = statusConfig[session.status];

        return (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-[#111113] rounded-2xl border border-white/5 p-6 hover:border-white/10 transition-all"
          >
            <div className="flex items-start gap-4">
              {/* Color indicator */}
              <div className={`w-1 h-full bg-${typeConfig.color}-500 rounded-full`} />

              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{session.title}</h3>
                    <p className="text-sm text-gray-500">{typeConfig.label}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>

                {session.description && (
                  <p className="text-gray-400 mb-4">{session.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {format(parseISO(session.start_time), "EEEE d 'de' MMMM, yyyy", { locale: es })}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {format(parseISO(session.start_time), "HH:mm")} - {format(parseISO(session.end_time), "HH:mm")}
                  </div>
                  {session.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {session.location}
                    </div>
                  )}
                  {session.artist_id && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {getArtistName(session.artist_id)}
                    </div>
                  )}
                </div>

                {session.notes && (
                  <div className="mt-4 p-3 bg-white/5 rounded-lg">
                    <p className="text-sm text-gray-400">{session.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}