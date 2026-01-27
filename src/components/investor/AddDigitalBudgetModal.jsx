import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function AddDigitalBudgetModal({ isOpen, onClose, budget = null }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(budget || {
    concept: "",
    category: "Desarrollo Web",
    assigned_budget: 0,
    executed_cost: 0,
    status: "MVP"
  });

  const mutation = useMutation({
    mutationFn: (data) => budget 
      ? base44.entities.DigitalBudget.update(budget.id, data)
      : base44.entities.DigitalBudget.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digitalBudgets'] });
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
          className="bg-white rounded-2xl w-full max-w-md p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {budget ? "Editar Presupuesto" : "Agregar Presupuesto Digital"}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Concepto</label>
              <input
                type="text"
                required
                value={formData.concept}
                onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
                className="w-full px-3 py-2 bg-[#0f1011] border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 text-white"
                placeholder="Ej: Plataforma de Gestión"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Categoría</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-[#0f1011] border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 text-white"
              >
                <option value="Desarrollo Web">Desarrollo Web</option>
                <option value="Plataforma Digital">Plataforma Digital</option>
                <option value="Automatizaciones">Automatizaciones</option>
                <option value="Hosting">Hosting y Servidores</option>
                <option value="Herramientas">Herramientas Digitales</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Presupuesto Asignado (€)</label>
              <input
                type="number"
                required
                step="0.01"
                value={formData.assigned_budget}
                onChange={(e) => setFormData({ ...formData, assigned_budget: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-[#0f1011] border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Gasto Ejecutado (€)</label>
              <input
                type="number"
                step="0.01"
                value={formData.executed_cost}
                onChange={(e) => setFormData({ ...formData, executed_cost: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-[#0f1011] border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Estado del Desarrollo</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-[#0f1011] border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 text-white"
              >
                <option value="MVP">MVP</option>
                <option value="Mejora">Mejora</option>
                <option value="Mantenimiento">Mantenimiento</option>
                <option value="Completado">Completado</option>
              </select>
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
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {mutation.isPending ? "Guardando..." : budget ? "Actualizar" : "Crear"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}