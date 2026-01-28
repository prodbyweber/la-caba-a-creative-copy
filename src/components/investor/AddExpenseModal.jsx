import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function AddExpenseModal({ isOpen, onClose, expense = null, defaultMonth }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    month: defaultMonth || new Date().toISOString().slice(0, 7),
    category: "Operativos",
    amount: 0,
    description: "",
    is_recurring: false,
    payment_status: "unpaid"
  });

  React.useEffect(() => {
    if (expense) {
      setFormData(expense);
    } else {
      setFormData({
        month: defaultMonth || new Date().toISOString().slice(0, 7),
        category: "Operativos",
        amount: 0,
        description: "",
        is_recurring: false,
        payment_status: "unpaid"
      });
    }
  }, [expense, defaultMonth]);

  const mutation = useMutation({
    mutationFn: (data) => expense 
      ? base44.entities.MonthlyExpense.update(expense.id, data)
      : base44.entities.MonthlyExpense.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthlyExpenses'] });
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
              {expense ? "Editar Gasto" : "Agregar Gasto"}
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
                className="w-full px-3 py-2 bg-[#0f1011] border border-white/10 rounded-lg focus:ring-2 focus:ring-red-500 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Categoría</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-[#0f1011] border border-white/10 rounded-lg focus:ring-2 focus:ring-red-500 text-white"
              >
                <option value="Alquiler">Alquiler</option>
                <option value="Software">Software</option>
                <option value="Marketing">Marketing</option>
                <option value="Personal">Personal</option>
                <option value="Operativos">Operativos</option>
                <option value="Otro">Otro</option>
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
                className="w-full px-3 py-2 bg-[#0f1011] border border-white/10 rounded-lg focus:ring-2 focus:ring-red-500 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-[#0f1011] border border-white/10 rounded-lg focus:ring-2 focus:ring-red-500 text-white"
                rows="3"
                placeholder="Detalles del gasto..."
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="recurring"
                checked={formData.is_recurring}
                onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="recurring" className="text-sm text-gray-300">
                Es un gasto recurrente
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Estado de Pago</label>
              <select
                value={formData.payment_status}
                onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
                className="w-full px-3 py-2 bg-[#0f1011] border border-white/10 rounded-lg focus:ring-2 focus:ring-red-500 text-white"
              >
                <option value="unpaid">Sin Pagar</option>
                <option value="paid">Pagado</option>
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
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {mutation.isPending ? "Guardando..." : expense ? "Actualizar" : "Crear"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}