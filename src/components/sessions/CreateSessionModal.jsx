import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Save, Loader, Calendar, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";
import { es } from "date-fns/locale";

const sessionTypes = [
  { value: "studio", label: "Sesión de Estudio" },
  { value: "meeting", label: "Reunión" },
  { value: "rehearsal", label: "Ensayo" },
  { value: "recording", label: "Grabación" },
  { value: "production", label: "Producción" },
  { value: "other", label: "Otro" }
];

export default function CreateSessionModal({ onClose }) {
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    session_type: "studio",
    location: "La Cabaña Creative - Lleida",
    artist_id: "",
    status: "scheduled",
    notes: ""
  });

  const { data: artists = [] } = useQuery({
    queryKey: ['artists'],
    queryFn: () => base44.entities.Artist.list(),
  });

  const handleSave = async () => {
    if (!formData.title || !selectedDate || !startTime || !endTime) {
      alert("Por favor completa los campos requeridos");
      return;
    }

    // Combinar fecha seleccionada con horas
    const [startHour, startMinute] = startTime.split(':');
    const [endHour, endMinute] = endTime.split(':');
    
    const startDateTime = new Date(selectedDate);
    startDateTime.setHours(parseInt(startHour), parseInt(startMinute), 0);
    
    const endDateTime = new Date(selectedDate);
    endDateTime.setHours(parseInt(endHour), parseInt(endMinute), 0);

    setSaving(true);
    try {
      await base44.entities.Session.create({
        ...formData,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString()
      });
      onClose();
      window.location.reload();
    } catch (error) {
      alert("Error al crear la sesión");
    } finally {
      setSaving(false);
    }
  };

  // Generar días del mes para el calendario
  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    
    // Calcular días vacíos al inicio para alinear con el día de la semana
    const firstDayOfWeek = start.getDay(); // 0 = Domingo, 6 = Sábado
    const emptyDays = Array(firstDayOfWeek).fill(null);
    
    return [...emptyDays, ...days];
  };

  const daysInMonth = getDaysInMonth();
  const weekDays = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#111113] rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Nueva Sesión</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Info Básica */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-400 mb-2 block">Título *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 transition-colors"
                placeholder="Ej: Grabación Album JLY"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 block">Tipo de Sesión *</label>
                <select
                  value={formData.session_type}
                  onChange={(e) => setFormData({ ...formData, session_type: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 transition-colors"
                >
                  {sessionTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 block">Artista</label>
                <select
                  value={formData.artist_id}
                  onChange={(e) => setFormData({ ...formData, artist_id: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 transition-colors"
                >
                  <option value="">Sin artista específico</option>
                  {artists.map(artist => (
                    <option key={artist.id} value={artist.id}>{artist.stageName}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Selector de Fecha Visual */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <h3 className="font-semibold">Seleccionar Fecha</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentMonth(addDays(currentMonth, -30))}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  ←
                </button>
                <span className="text-sm font-medium min-w-[120px] text-center">
                  {format(currentMonth, 'MMMM yyyy', { locale: es })}
                </span>
                <button
                  onClick={() => setCurrentMonth(addDays(currentMonth, 30))}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  →
                </button>
              </div>
            </div>

            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
              {weekDays.map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Días del mes */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {daysInMonth.map((day, index) => {
                // Si es un día vacío (null), renderizar espacio vacío
                if (!day) {
                  return <div key={`empty-${index}`} className="aspect-square" />;
                }
                
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentDay = isToday(day);
                
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      aspect-square rounded-lg text-sm font-medium transition-all
                      ${isSelected 
                        ? 'bg-gradient-to-br from-emerald-500 to-purple-500 text-white shadow-lg' 
                        : isCurrentDay
                        ? 'bg-white/10 text-white border border-emerald-500/50'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                      }
                    `}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>

            {/* Fecha Seleccionada */}
            <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <div className="text-xs text-gray-400 mb-1">Fecha seleccionada</div>
              <div className="text-lg font-bold text-emerald-400">
                {format(selectedDate, "EEEE, d 'de' MMMM yyyy", { locale: es })}
              </div>
            </div>
          </div>

          {/* Selector de Horas */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-purple-400" />
              <h3 className="font-semibold">Horario de la Sesión</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 block">Hora de Inicio *</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-lg font-medium focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 block">Hora de Fin *</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-lg font-medium focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>
            </div>

            {/* Preview de Duración */}
            <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
              <div className="text-xs text-gray-400 mb-1">Duración estimada</div>
              <div className="text-lg font-bold text-purple-400">
                {startTime} - {endTime}
              </div>
            </div>
          </div>

          {/* Detalles Adicionales */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-400 mb-2 block">Ubicación</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-400 mb-2 block">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 h-24 resize-none focus:outline-none focus:border-emerald-500/50 transition-colors"
                placeholder="Detalles de la sesión..."
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-400 mb-2 block">Notas</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 h-20 resize-none focus:outline-none focus:border-emerald-500/50 transition-colors"
                placeholder="Notas adicionales..."
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl border border-white/10 font-medium text-sm hover:bg-white/5 transition-all disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-purple-500 font-medium text-sm hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Crear Sesión
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}