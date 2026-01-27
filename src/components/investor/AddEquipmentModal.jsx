import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function AddEquipmentModal({ isOpen, onClose, equipment = null }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(equipment || {
    name: "",
    category: "Audio",
    price: 0,
    status: "Planificado",
    impact: "Medio",
    purchase_date: "",
    reference_link: ""
  });

  const mutation = useMutation({
    mutationFn: (data) => equipment 
      ? base44.entities.Equipment.update(equipment.id, data)
      : base44.entities.Equipment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
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
          className="bg-[#1a1a1c] rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto border border-white/10"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">
              {equipment ? "Editar Equipo" : "Agregar Equipo"}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Nombre</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-[#0f1011] border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Categoría</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-[#0f1011] border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
              >
                <option value="Audio">Audio</option>
                <option value="Video">Video</option>
                <option value="Iluminación">Iluminación</option>
                <option value="Hardware">Hardware</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Precio (€)</label>
              <input
                type="number"
                required
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-[#0f1011] border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Estado</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-[#0f1011] border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
              >
                <option value="Planificado">Planificado</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Comprado">Comprado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Impacto</label>
              <select
                value={formData.impact}
                onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                className="w-full px-3 py-2 bg-[#0f1011] border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
              >
                <option value="Bajo">Bajo</option>
                <option value="Medio">Medio</option>
                <option value="Alto">Alto</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Fecha de Compra</label>
              <input
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                className="w-full px-3 py-2 bg-[#0f1011] border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Link de Referencia</label>
              <input
                type="url"
                value={formData.reference_link}
                onChange={(e) => setFormData({ ...formData, reference_link: e.target.value })}
                className="w-full px-3 py-2 bg-[#0f1011] border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                placeholder="https://..."
              />
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
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {mutation.isPending ? "Guardando..." : equipment ? "Actualizar" : "Crear"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}