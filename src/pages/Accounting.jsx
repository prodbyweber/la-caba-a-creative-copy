import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import AdminLayout from "@/components/admin/AdminLayout";
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Calendar,
  DollarSign,
  Building2,
  User,
  Download,
  Filter,
  X
} from "lucide-react";

export default function Accounting() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  const { data: incomes = [] } = useQuery({
    queryKey: ['incomes', selectedYear, selectedMonth],
    queryFn: async () => {
      const all = await base44.entities.Income.list('-date');
      return all.filter(i => i.year === selectedYear && i.month === selectedMonth);
    }
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses', selectedYear, selectedMonth],
    queryFn: async () => {
      const all = await base44.entities.Expense.list('-date');
      return all.filter(e => e.year === selectedYear && e.month === selectedMonth);
    }
  });

  const totalIncome = incomes.reduce((sum, i) => sum + (i.amount || 0), 0);
  const businessExpenses = expenses.filter(e => e.category === 'Empresa').reduce((sum, e) => sum + (e.amount || 0), 0);
  const personalExpenses = expenses.filter(e => e.category === 'Personal').reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalExpenses = businessExpenses + personalExpenses;
  const netProfit = totalIncome - totalExpenses;

  // Total de todos los gastos del año
  const { data: allExpenses = [] } = useQuery({
    queryKey: ['allExpenses', selectedYear],
    queryFn: async () => {
      const all = await base44.entities.Expense.list('-date');
      return all.filter(e => e.year === selectedYear);
    }
  });
  const totalYearExpenses = allExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Contabilidad</h1>
            <p className="text-gray-500">Gestión financiera completa del estudio</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium flex items-center gap-2 transition-colors">
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-900 focus:outline-none focus:border-emerald-500/50"
            style={{ color: '#111' }}
          >
            {[2024, 2025, 2026, 2027].map(year => (
              <option key={year} value={year} style={{ color: '#111' }}>{year}</option>
            ))}
          </select>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-900 focus:outline-none focus:border-emerald-500/50"
            style={{ color: '#111' }}
          >
            {months.map((month, idx) => (
              <option key={idx} value={idx + 1} style={{ color: '#111' }}>{month}</option>
            ))}
          </select>
        </div>

        {/* Total Gastos del Año */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Total de Gastos {selectedYear}</h3>
              <div className="text-4xl font-bold text-white">€{totalYearExpenses.toLocaleString()}</div>
              <p className="text-sm text-gray-400 mt-2">Acumulado del año completo</p>
            </div>
            <div className="w-16 h-16 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <TrendingDown className="w-8 h-8 text-orange-400" />
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              €{totalIncome.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Ingresos Totales</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-red-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              €{businessExpenses.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Gastos Empresa</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <User className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              €{personalExpenses.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Gastos Personales</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`bg-gradient-to-br ${netProfit >= 0 ? 'from-blue-500/10 to-blue-600/5 border-blue-500/20' : 'from-orange-500/10 to-orange-600/5 border-orange-500/20'} border rounded-2xl p-6`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${netProfit >= 0 ? 'bg-blue-500/20' : 'bg-orange-500/20'} flex items-center justify-center`}>
                <DollarSign className={`w-6 h-6 ${netProfit >= 0 ? 'text-blue-400' : 'text-orange-400'}`} />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              €{netProfit.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Balance Neto</div>
          </motion.div>
        </div>

        {/* Income Table */}
        <div className="bg-[#111113] rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Ingresos</h3>
              <p className="text-sm text-gray-500">{months[selectedMonth - 1]} {selectedYear}</p>
            </div>
            <button
              onClick={() => setShowIncomeModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Agregar Ingreso
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Fecha</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Artista</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Servicios</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Método Pago</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Monto</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {incomes.map((income) => (
                  <tr key={income.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm text-white">
                      {new Date(income.date).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {income.artist_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-wrap gap-1">
                        {income.services?.map((s, i) => (
                          <span key={i} className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">{income.payment_method}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-emerald-400">
                      €{income.amount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {income.notes || '-'}
                    </td>
                  </tr>
                ))}
                {incomes.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No hay ingresos registrados para este período
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expense Table */}
        <div className="bg-[#111113] rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Gastos</h3>
              <p className="text-sm text-gray-500">{months[selectedMonth - 1]} {selectedYear}</p>
            </div>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Agregar Gasto
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Fecha</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Categoría</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Concepto</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Método Pago</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Monto</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm text-white">
                      {new Date(expense.date).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        expense.category === 'Empresa' 
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'bg-purple-500/10 text-purple-400'
                      }`}>
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">{expense.concept}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{expense.payment_method}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-red-400">
                      €{expense.amount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {expense.notes || '-'}
                    </td>
                  </tr>
                ))}
                {expenses.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No hay gastos registrados para este período
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Income Modal */}
      {showIncomeModal && (
        <IncomeModal
          onClose={() => setShowIncomeModal(false)}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <ExpenseModal
          onClose={() => setShowExpenseModal(false)}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />
      )}
    </AdminLayout>
  );
}

function IncomeModal({ onClose, selectedMonth, selectedYear }) {
  const currentDate = new Date();
  const [formData, setFormData] = useState({
    date: currentDate.toISOString().split('T')[0],
    artist_id: '',
    artist_name: '',
    services: [],
    amount: '',
    payment_method: '',
    notes: '',
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear()
  });

  const queryClient = useQueryClient();
  const { data: artists = [] } = useQuery({
    queryKey: ['artists'],
    queryFn: () => base44.entities.Artist.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Income.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      onClose();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedArtist = artists.find(a => a.id === formData.artist_id);
    createMutation.mutate({
      ...formData,
      artist_name: selectedArtist?.stageName || formData.artist_name,
      amount: Number(formData.amount)
    });
  };

  const serviceOptions = [
    'Grabación', 'Beat Making', 'Plan La Cabaña', 'Mezcla',
    'Masterización', 'Producción', 'Sesión de Estudio', 'Consultoría', 'Otro'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#111113] rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Nuevo Ingreso</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Mes *</label>
              <select
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                required
              >
                {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((month, idx) => (
                  <option key={idx} value={idx + 1}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Año *</label>
              <select
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                required
              >
                {[2024, 2025, 2026, 2027, 2028].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Fecha *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Monto (€) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Artista</label>
            <select
              value={formData.artist_id}
              onChange={(e) => setFormData({ ...formData, artist_id: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="">Seleccionar artista...</option>
              {artists.map(artist => (
                <option key={artist.id} value={artist.id}>{artist.stageName}</option>
              ))}
            </select>
            {!formData.artist_id && (
              <input
                type="text"
                value={formData.artist_name}
                onChange={(e) => setFormData({ ...formData, artist_name: e.target.value })}
                placeholder="O escribe el nombre..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 mt-2"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Servicios *</label>
            <div className="grid grid-cols-2 gap-2">
              {serviceOptions.map(service => (
                <label key={service} className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.services.includes(service)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, services: [...formData.services, service] });
                      } else {
                        setFormData({ ...formData, services: formData.services.filter(s => s !== service) });
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-300">{service}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Método de Pago *</label>
            <select
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
              required
            >
              <option value="">Seleccionar...</option>
              <option value="Visum">Visum</option>
              <option value="Transferencia Bancaria">Transferencia Bancaria</option>
              <option value="PayPal">PayPal</option>
              <option value="Tarjeta">Tarjeta</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Notas</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? 'Guardando...' : 'Guardar Ingreso'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function ExpenseModal({ onClose, selectedMonth, selectedYear }) {
  const currentDate = new Date();
  const [formData, setFormData] = useState({
    date: currentDate.toISOString().split('T')[0],
    category: 'Empresa',
    concept: '',
    amount: '',
    payment_method: '',
    notes: '',
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear()
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Expense.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      onClose();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      amount: Number(formData.amount)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#111113] rounded-2xl border border-white/10 w-full max-w-2xl"
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Nuevo Gasto</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Mes *</label>
              <select
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                required
              >
                {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((month, idx) => (
                  <option key={idx} value={idx + 1}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Año *</label>
              <select
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                required
              >
                {[2024, 2025, 2026, 2027, 2028].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Fecha *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Categoría *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                required
              >
                <option value="Empresa">Empresa</option>
                <option value="Personal">Personal</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Concepto *</label>
            <input
              type="text"
              value={formData.concept}
              onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
              placeholder="Equipamiento, alquiler, servicios..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Monto (€) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Método de Pago</label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
              >
                <option value="">Seleccionar...</option>
                <option value="Visum">Visum</option>
                <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                <option value="PayPal">PayPal</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Notas</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? 'Guardando...' : 'Guardar Gasto'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}