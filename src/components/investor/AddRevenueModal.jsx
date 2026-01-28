import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function AddRevenueModal({ isOpen, onClose, revenue = null, defaultMonth }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    month: defaultMonth || new Date().toISOString().slice(0, 7),
    source: "Estudio",
    amount: 0,
    description: ""
  });

  React.useEffect(() => {
    if (revenue) {
      setFormData(revenue);
    } else {
      setFormData({
        month: defaultMonth || new Date().toISOString().slice(0, 7),
        source: "Estudio",
        amount: 0,
        description: ""
      });
    }
  }, [revenue, defaultMonth, isOpen]);

  const mutation = useMutation({
    mutationFn: (data) => revenue 
      ? base44.entities.Revenue.update(revenue.id, data)
      : base44.entities.Revenue.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revenues'] });
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
              {revenue ? "Editar Ingreso" : "Agregar Ingreso"}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Mes</label>
              <input
                type="month"
                required
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                className="w-full px-3 py-2 bg-[#0f1011] border border-white/10 rounded-lg focus:ring-2 focus:ring-emerald-500 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Fuente de Ingreso</label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-3 py-2 bg-[#0f1011] border border-white/10 rounded-lg focus:ring-2 focus:ring-emerald-500 text-white"
              >
                <option value="Estudio">Estudio</option>
                <option value="Plataforma">Plataforma</option>
                <option value="Productos Digitales">Productos Digitales</option>
                <option value="Otros">Otros</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Monto (€)</label>
              <input
                type="number"
                required
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-[#0f1011] border border-white/10 rounded-lg focus:ring-2 focus:ring-emerald-500 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-[#0f1011] border border-white/10 rounded-lg focus:ring-2 focus:ring-emerald-500 text-white"
                rows="3"
                placeholder="Detalles del ingreso..."
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
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                {mutation.isPending ? "Guardando..." : revenue ? "Actualizar" : "Crear"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}