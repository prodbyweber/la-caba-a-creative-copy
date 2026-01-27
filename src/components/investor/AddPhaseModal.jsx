import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function AddPhaseModal({ isOpen, onClose, phase }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(phase || {
    phase_name: "",
    objectives: "",
    budget: 0,
    start_date: "",
    end_date: "",
    completion_percentage: 0,
    status: "Planificada"
  });

  const mutation = useMutation({
    mutationFn: (data) => {
      if (phase) {
        return base44.entities.ProjectPhase.update(phase.id, data);
      }
      return base44.entities.ProjectPhase.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phases'] });
      onClose();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#0f1011] rounded-2xl w-full max-w-lg p-6 border border-white/10"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">
              {phase ? "Editar Fase" : "Nueva Fase del Proyecto"}
            </h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-300">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Nombre de la Fase *</label>
              <input
                type="text"
                required
                value={formData.phase_name}
                onChange={(e) => setFormData({ ...formData, phase_name: e.target.value })}
                className="w-full px-3 py-2 bg-[#0a0a0b] border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                placeholder="Ej: Fase 1 - Infraestructura"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Objetivos</label>
              <textarea
                value={formData.objectives}
                onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                className="w-full px-3 py-2 bg-[#0a0a0b] border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                rows="2"
                placeholder="Objetivos de esta fase..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Presupuesto (€) *</label>
              <input
                type="number"
                required
                step="0.01"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-[#0a0a0b] border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Fecha Inicio *</label>
                <input
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0a0a0b] border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Fecha Fin *</label>
                <input
                  type="date"
                  required
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0a0a0b] border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Progreso (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.completion_percentage}
                  onChange={(e) => setFormData({ ...formData, completion_percentage: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-[#0a0a0b] border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Estado</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0a0a0b] border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                >
                  <option value="Planificada">Planificada</option>
                  <option value="En Progreso">En Progreso</option>
                  <option value="Completada">Completada</option>
                  <option value="Retrasada">Retrasada</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-white/10 rounded-lg text-gray-300 hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {mutation.isPending ? "Guardando..." : phase ? "Actualizar" : "Crear"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}