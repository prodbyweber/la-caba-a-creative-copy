import React from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Plus, ChevronRight } from "lucide-react";

const sessions = [
  {
    id: 1,
    title: "Sesión de Grabación",
    date: "Hoy",
    time: "2:00 PM",
    location: "Estudio A",
    type: "recording",
    color: "emerald"
  },
  {
    id: 2,
    title: "Revisión de Mezcla",
    date: "Mañana",
    time: "11:00 AM",
    location: "Virtual",
    type: "review",
    color: "purple"
  },
  {
    id: 3,
    title: "Planificación de Contenido",
    date: "18 Ene",
    time: "3:00 PM",
    location: "Oficina",
    type: "planning",
    color: "orange"
  }
];

export default function UpcomingSessionsCard() {
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
            <p className="text-xs text-gray-500">3 sesiones esta semana</p>
          </div>
        </div>
        <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Sessions List */}
      <div className="p-4 space-y-3">
        {sessions.map((session, i) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            className="group p-3 rounded-xl bg-[#0a0a0b] hover:bg-white/5 transition-all cursor-pointer"
          >
            <div className="flex items-start gap-3">
              {/* Color Indicator */}
              <div className={`w-1 h-12 rounded-full bg-${session.color}-500 flex-shrink-0`} />
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm mb-1">{session.title}</h4>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{session.date} · {session.time}</span>
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
        ))}
      </div>

      {/* View All */}
      <div className="p-4 pt-0">
        <button className="w-full py-2.5 rounded-xl border border-white/10 text-sm text-gray-400 hover:text-white hover:border-white/20 transition-all">
          Ver Calendario Completo
        </button>
      </div>
    </motion.div>
  );
}