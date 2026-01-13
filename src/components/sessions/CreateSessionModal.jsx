import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Save, Loader } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

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
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    session_type: "studio",
    start_time: "",
    end_time: "",
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
    if (!formData.title || !formData.start_time || !formData.end_time) {
      alert("Por favor completa los campos requeridos");
      return;
    }

    setSaving(true);
    try {
      await base44.entities.Session.create(formData);
      onClose();
      window.location.reload();
    } catch (error) {
      alert("Error al crear la sesión");
    } finally {
      setSaving(false);
    }
  };

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
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
                <option key={artist.id} value={artist.id}>{artist.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-400 mb-2 block">Inicio *</label>
              <input
                type="datetime-local"
                value={formData.start_time ? new Date(formData.start_time).toISOString().slice(0, 16) : ''}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-400 mb-2 block">Fin *</label>
              <input
                type="datetime-local"
                value={formData.end_time ? new Date(formData.end_time).toISOString().slice(0, 16) : ''}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
          </div>

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