import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function AddPendingPurchaseModal({ isOpen, onClose, purchase }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(purchase || {
    product: "",
    price: 0,
    priority: "Media",
    impact: "Medio",
    status: "Pendiente",
    alternatives: "",
    reference_link: ""
  });

  const mutation = useMutation({
    mutationFn: (data) => {
      if (purchase) {
        return base44.entities.PendingPurchase.update(purchase.id, data);
      }
      return base44.entities.PendingPurchase.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingPurchases'] });
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
              {purchase ? "Editar Compra" : "Nueva Compra Pendiente"}
            </h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-300">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Producto *</label>
              <input
                type="text"
                required
                value={formData.product}
                onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                className="w-full px-3 py-2 bg-[#0a0a0b] border border-white/10 rounded-lg focus:ring-2 focus:ring-orange-500 text-white"
                placeholder="Nombre del producto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Precio (€) *</label>
              <input
                type="number"
                required
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-[#0a0a0b] border border-white/10 rounded-lg focus:ring-2 focus:ring-orange-500 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Prioridad</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0a0a0b] border border-white/10 rounded-lg focus:ring-2 focus:ring-orange-500 text-white"
                >
                  <option value="Alta">Alta</option>
                  <option value="Media">Media</option>
                  <option value="Baja">Baja</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Impacto</label>
                <select
                  value={formData.impact}
                  onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0a0a0b] border border-white/10 rounded-lg focus:ring-2 focus:ring-orange-500 text-white"
                >
                  <option value="Alto">Alto</option>
                  <option value="Medio">Medio</option>
                  <option value="Bajo">Bajo</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Estado</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-[#0a0a0b] border border-white/10 rounded-lg focus:ring-2 focus:ring-orange-500 text-white"
              >
                <option value="Aprobado">Aprobado</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Descartado">Descartado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Alternativas</label>
              <textarea
                value={formData.alternatives}
                onChange={(e) => setFormData({ ...formData, alternatives: e.target.value })}
                className="w-full px-3 py-2 bg-[#0a0a0b] border border-white/10 rounded-lg focus:ring-2 focus:ring-orange-500 text-white"
                rows="2"
                placeholder="Alternativas más económicas..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Link de Referencia</label>
              <input
                type="url"
                value={formData.reference_link}
                onChange={(e) => setFormData({ ...formData, reference_link: e.target.value })}
                className="w-full px-3 py-2 bg-[#0a0a0b] border border-white/10 rounded-lg focus:ring-2 focus:ring-orange-500 text-white"
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
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                {mutation.isPending ? "Guardando..." : purchase ? "Actualizar" : "Crear"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}