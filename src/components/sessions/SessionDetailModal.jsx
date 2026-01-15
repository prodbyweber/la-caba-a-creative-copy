import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Save, Clock, MapPin, Link as LinkIcon, Calendar, FileText, Trash2, Video, HardDrive } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";

export default function SessionDetailModal({ session, onClose, artists, readOnly = false }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: session.title || "",
    description: session.description || "",
    notes: session.notes || "",
    start_time: session.start_time ? format(parseISO(session.start_time), "yyyy-MM-dd'T'HH:mm") : "",
    end_time: session.end_time ? format(parseISO(session.end_time), "yyyy-MM-dd'T'HH:mm") : "",
    location: session.location || "Studio",
    status: session.status || "Pending",
    google_meet_link: session.google_meet_link || "",
    drive_link: session.drive_link || "",
    artist_id: session.artist_id || ""
  });

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Session.update(session.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      setIsEditing(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.Session.delete(session.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      onClose();
    }
  });

  const handleStatusChange = (newStatus) => {
    updateMutation.mutate({ status: newStatus });
    setFormData({ ...formData, status: newStatus });
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "Pending": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Confirmed": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "Done": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Cancelled": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const artist = artists.find(a => a.id === formData.artist_id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#111113] rounded-2xl border border-white/10 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full text-xl sm:text-2xl font-bold bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500/50"
                />
              ) : (
                <h2 className="text-xl sm:text-2xl font-bold">{session.title}</h2>
              )}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${getStatusColor(formData.status)}`}>
                  {formData.status}
                </span>
                <span className="text-xs sm:text-sm text-gray-500">
                  {session.type}
                </span>
                {artist && (
                  <span className="text-xs sm:text-sm text-gray-400">
                    • {artist.stageName}
                  </span>
                )}
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors flex-shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Status Buttons - Solo para admins */}
          {!readOnly && (
            <div>
              <label className="text-sm font-medium text-gray-400 mb-3 block">Estado de la Sesión</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleStatusChange("Pending")}
                  disabled={updateMutation.isPending}
                  className={`py-2.5 px-4 rounded-xl font-medium text-sm transition-all ${
                    formData.status === "Pending"
                      ? 'bg-yellow-500 text-black'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  Pendiente
                </button>
                <button
                  onClick={() => handleStatusChange("Confirmed")}
                  disabled={updateMutation.isPending}
                  className={`py-2.5 px-4 rounded-xl font-medium text-sm transition-all ${
                    formData.status === "Confirmed"
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  Confirmado
                </button>
                <button
                  onClick={() => handleStatusChange("Done")}
                  disabled={updateMutation.isPending || deleteMutation.isPending}
                  className="py-2.5 px-4 rounded-xl font-medium text-sm bg-white/5 text-gray-400 hover:bg-blue-500/20 hover:text-blue-400 transition-all"
                >
                  Finalizado
                </button>
              </div>
            </div>
          )}

          {/* Date & Time */}
          <div className="bg-white/5 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <Calendar className="w-5 h-5" />
              <span className="font-semibold">Fecha y Horario</span>
            </div>
            
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Inicio</label>
                  <input
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Fin</label>
                  <input
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    {session.start_time && format(parseISO(session.start_time), "HH:mm")} - 
                    {session.end_time && format(parseISO(session.end_time), "HH:mm")}
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  {session.start_time && format(parseISO(session.start_time), "EEEE, d 'de' MMMM yyyy")}
                </div>
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="text-sm font-medium text-gray-400 mb-2 block flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Ubicación
            </label>
            {isEditing ? (
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50"
              >
                <option value="Studio">Studio</option>
                <option value="Online">Online</option>
                <option value="External">External</option>
              </select>
            ) : (
              <p className="text-white">{session.location || "No especificado"}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-400 mb-2 block flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Descripción
            </label>
            {isEditing ? (
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 h-24 resize-none focus:outline-none focus:border-emerald-500/50"
                placeholder="Detalles de la sesión..."
              />
            ) : (
              <p className="text-gray-300">{session.description || "Sin descripción"}</p>
            )}
          </div>

          {/* Links */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-400 mb-2 block flex items-center gap-2">
                <Video className="w-4 h-4" />
                Google Meet (opcional)
              </label>
              {isEditing ? (
                <input
                  type="url"
                  value={formData.google_meet_link}
                  onChange={(e) => setFormData({ ...formData, google_meet_link: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50"
                  placeholder="https://meet.google.com/..."
                />
              ) : (
                formData.google_meet_link ? (
                  <a 
                    href={formData.google_meet_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 flex items-center gap-2 text-sm"
                  >
                    <LinkIcon className="w-4 h-4" />
                    Unirse a la reunión
                  </a>
                ) : (
                  <p className="text-gray-500 text-sm">No configurado</p>
                )
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-400 mb-2 block flex items-center gap-2">
                <HardDrive className="w-4 h-4" />
                Drive / WeTransfer (opcional)
              </label>
              {isEditing ? (
                <input
                  type="url"
                  value={formData.drive_link}
                  onChange={(e) => setFormData({ ...formData, drive_link: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50"
                  placeholder="https://drive.google.com/... o https://wetransfer.com/..."
                />
              ) : (
                formData.drive_link ? (
                  <a 
                    href={formData.drive_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 flex items-center gap-2 text-sm"
                  >
                    <LinkIcon className="w-4 h-4" />
                    Ver archivos
                  </a>
                ) : (
                  <p className="text-gray-500 text-sm">No configurado</p>
                )
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-gray-400 mb-2 block">Notas</label>
            {isEditing ? (
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 h-32 resize-none focus:outline-none focus:border-emerald-500/50"
                placeholder="Notas adicionales sobre la sesión..."
              />
            ) : (
              <p className="text-gray-300">{session.notes || "Sin notas"}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {!readOnly ? (
            <>
              <button
                onClick={() => {
                  if (window.confirm("¿Estás seguro de eliminar esta sesión?")) {
                    deleteMutation.mutate();
                  }
                }}
                disabled={deleteMutation.isPending}
                className="px-4 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
              
              <div className="flex gap-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          title: session.title || "",
                          description: session.description || "",
                          notes: session.notes || "",
                          start_time: session.start_time ? format(parseISO(session.start_time), "yyyy-MM-dd'T'HH:mm") : "",
                          end_time: session.end_time ? format(parseISO(session.end_time), "yyyy-MM-dd'T'HH:mm") : "",
                          location: session.location || "Studio",
                          status: session.status || "Pending",
                          google_meet_link: session.google_meet_link || "",
                          drive_link: session.drive_link || ""
                        });
                      }}
                      disabled={updateMutation.isPending}
                      className="flex-1 px-6 py-2.5 rounded-xl border border-white/10 font-medium text-sm hover:bg-white/5 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={updateMutation.isPending}
                      className="flex-1 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-purple-500 font-medium text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {updateMutation.isPending ? "Guardando..." : "Guardar"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-medium text-sm transition-colors"
                  >
                    Editar
                  </button>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 font-medium text-sm transition-colors"
            >
              Cerrar
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}