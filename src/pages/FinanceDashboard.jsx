import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import AdminLayout from "@/components/admin/AdminLayout";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  CreditCard,
  Smartphone,
  Banknote,
  Building2,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  ShoppingBag,
  Shield,
  Plus,
  Edit2,
  Trash2,
  X
} from "lucide-react";

export default function FinanceDashboard() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showPersonalExpenseModal, setShowPersonalExpenseModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const queryClient = useQueryClient();

  // Queries
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
      return all.filter(e => e.year === selectedYear && e.month === selectedMonth && e.category === 'Empresa');
    }
  });

  const { data: personalExpenses = [] } = useQuery({
    queryKey: ['personalExpenses', selectedYear, selectedMonth],
    queryFn: async () => {
      const all = await base44.entities.PersonalExpense.list('-date');
      return all.filter(e => e.year === selectedYear && e.month === selectedMonth);
    }
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list()
  });

  const { data: contracts = [] } = useQuery({
    queryKey: ['contracts'],
    queryFn: () => base44.entities.Contract.list()
  });

  const { data: paymentStatuses = [] } = useQuery({
    queryKey: ['paymentStatuses'],
    queryFn: () => base44.entities.PaymentStatus.list()
  });

  // Cálculos
  const totalIncome = incomes.reduce((sum, i) => sum + (i.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalPersonalExpenses = personalExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const studioBenefit = totalIncome - totalExpenses;

  // Métodos de cobro
  const paymentMethodStats = {
    'Tarjeta': incomes.filter(i => i.payment_method === 'Tarjeta').reduce((sum, i) => sum + i.amount, 0),
    'Bizum': incomes.filter(i => i.payment_method === 'Bizum').reduce((sum, i) => sum + i.amount, 0),
    'Efectivo': incomes.filter(i => i.payment_method === 'Efectivo').reduce((sum, i) => sum + i.amount, 0),
    'Transferencia': incomes.filter(i => i.payment_method === 'Transferencia Bancaria').reduce((sum, i) => sum + i.amount, 0)
  };

  // Estados de cobro
  const cobrado = paymentStatuses.filter(p => p.status === 'Cobrado');
  const pendiente = paymentStatuses.filter(p => p.status === 'Pendiente');
  const porCobrar = paymentStatuses.filter(p => p.status === 'Por cobrar');

  // Alertas
  const clientsWithoutContract = clients.filter(c => !c.contract_signed).length;
  const overduePayments = pendiente.filter(p => p.days_overdue > 0).length;
  const pendingContracts = contracts.filter(c => c.status === 'Pendiente').length;

  // Delete mutations
  const deleteIncome = useMutation({
    mutationFn: (id) => base44.entities.Income.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['incomes'] })
  });

  const deleteExpense = useMutation({
    mutationFn: (id) => base44.entities.Expense.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] })
  });

  const deletePersonalExpense = useMutation({
    mutationFn: (id) => base44.entities.PersonalExpense.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['personalExpenses'] })
  });

  const deleteClient = useMutation({
    mutationFn: (id) => base44.entities.Client.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] })
  });

  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  return (
    <AdminLayout activePage="FinanceDashboard">
      <div className="max-w-[1800px] mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Panel de Contabilidad Pro</h1>
            <p className="text-gray-400">La Cabaña Creative · Gestión Financiera Completa</p>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-2.5 bg-white rounded-xl text-gray-900 border border-white/20 focus:outline-none focus:border-emerald-500"
            >
              {[2024, 2025, 2026, 2027].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-4 py-2.5 bg-white rounded-xl text-gray-900 border border-white/20 focus:outline-none focus:border-emerald-500"
            >
              {months.map((month, idx) => (
                <option key={idx} value={idx + 1}>{month}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 1️⃣ RESUMEN GENERAL - SOLO NEGOCIO */}
        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl border border-blue-500/20 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Resumen del Estudio</h2>
            <div className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-sm font-medium">
              Solo Negocio · No incluye gastos personales
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">€{totalIncome.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Caja del Estudio</div>
            </motion.div>

            <motion.div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">€{totalIncome.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Ingresos del Mes</div>
            </motion.div>

            <motion.div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-red-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">€{totalExpenses.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Gastos del Mes</div>
            </motion.div>

            <motion.div className={`bg-white/5 backdrop-blur-sm rounded-xl p-6 border ${studioBenefit >= 0 ? 'border-emerald-500/20' : 'border-red-500/20'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-12 h-12 rounded-xl ${studioBenefit >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'} flex items-center justify-center`}>
                  <DollarSign className={`w-6 h-6 ${studioBenefit >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">€{studioBenefit.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Beneficio del Estudio</div>
            </motion.div>
          </div>
        </div>

        {/* 2️⃣ MÉTODOS DE COBRO */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#111113] rounded-2xl border border-white/5 p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              Métodos de Cobro
            </h3>
            <div className="space-y-3">
              {[
                { icon: CreditCard, label: 'Tarjeta', amount: paymentMethodStats['Tarjeta'], color: 'blue' },
                { icon: Smartphone, label: 'Bizum', amount: paymentMethodStats['Bizum'], color: 'purple' },
                { icon: Banknote, label: 'Efectivo', amount: paymentMethodStats['Efectivo'], color: 'emerald' },
                { icon: Building2, label: 'Transferencia', amount: paymentMethodStats['Transferencia'], color: 'orange' }
              ].map((method, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-${method.color}-500/20 flex items-center justify-center`}>
                      <method.icon className={`w-5 h-5 text-${method.color}-400`} />
                    </div>
                    <span className="text-white font-medium">{method.label}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">€{method.amount.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{totalIncome > 0 ? ((method.amount / totalIncome) * 100).toFixed(1) : 0}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3️⃣ ESTADO DE COBROS */}
          <div className="bg-[#111113] rounded-2xl border border-white/5 p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Estado de Cobros
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-emerald-400 font-medium">🟢 Cobrado</span>
                  <span className="text-2xl font-bold text-white">{cobrado.length}</span>
                </div>
                <div className="text-sm text-gray-400">€{cobrado.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}</div>
              </div>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-yellow-400 font-medium">🟡 Pendiente</span>
                  <span className="text-2xl font-bold text-white">{pendiente.length}</span>
                </div>
                <div className="text-sm text-gray-400">€{pendiente.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}</div>
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-400 font-medium">🔵 Por Cobrar</span>
                  <span className="text-2xl font-bold text-white">{porCobrar.length}</span>
                </div>
                <div className="text-sm text-gray-400">€{porCobrar.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 4️⃣ CLIENTES */}
        <div className="bg-[#111113] rounded-2xl border border-white/5 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Clientes
            </h3>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 text-sm font-medium border border-yellow-500/20">
                Pendientes ({clients.filter(c => c.amount_pending > 0).length})
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-sm font-medium border border-red-500/20">
                Sin contrato ({clientsWithoutContract})
              </button>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setShowClientModal(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Agregar Cliente
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Servicio</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Estado</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Total</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Cobrado</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Pendiente</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase">Contrato</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-4 py-3 text-sm text-white font-medium">{client.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{client.service}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        client.status === 'Activo' ? 'bg-emerald-500/10 text-emerald-400' :
                        client.status === 'Pendiente' ? 'bg-yellow-500/10 text-yellow-400' :
                        'bg-gray-500/10 text-gray-400'
                      }`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-white">€{client.total_agreed.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-sm text-emerald-400">€{client.amount_paid.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-sm text-red-400">€{client.amount_pending.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      {client.contract_signed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-yellow-400 mx-auto" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingItem(client);
                            setShowClientModal(true);
                          }}
                          className="p-1 hover:bg-blue-500/20 rounded text-blue-400"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => deleteClient.mutate(client.id)}
                          className="p-1 hover:bg-red-500/20 rounded text-red-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {clients.length === 0 && (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                      No hay clientes registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5️⃣ GASTOS DEL NEGOCIO & INGRESOS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* INGRESOS */}
          <div className="bg-[#111113] rounded-2xl border border-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Ingresos del Mes
              </h3>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setShowIncomeModal(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Agregar
              </button>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {incomes.map((income) => (
                <div key={income.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg group">
                  <div className="flex-1">
                    <div className="text-gray-300 text-sm font-medium">{income.artist_name || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{new Date(income.date).toLocaleDateString('es-ES')}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">€{income.amount.toLocaleString()}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingItem(income);
                          setShowIncomeModal(true);
                        }}
                        className="p-1 hover:bg-emerald-500/20 rounded text-emerald-400"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => deleteIncome.mutate(income.id)}
                        className="p-1 hover:bg-red-500/20 rounded text-red-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {incomes.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No hay ingresos registrados
                </div>
              )}
            </div>
          </div>

          {/* GASTOS */}
          <div className="bg-[#111113] rounded-2xl border border-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-red-400" />
                Gastos del Negocio
              </h3>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setShowExpenseModal(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Agregar
              </button>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {expenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg group">
                  <div className="flex-1">
                    <div className="text-gray-300 text-sm font-medium">{expense.concept}</div>
                    <div className="text-xs text-gray-500">{new Date(expense.date).toLocaleDateString('es-ES')}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">€{expense.amount.toLocaleString()}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingItem(expense);
                          setShowExpenseModal(true);
                        }}
                        className="p-1 hover:bg-red-500/20 rounded text-red-400"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => deleteExpense.mutate(expense.id)}
                        className="p-1 hover:bg-red-500/20 rounded text-red-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {expenses.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No hay gastos registrados
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 6️⃣ GASTOS PERSONALES */}
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-purple-400" />
              Gastos Personales
            </h3>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-purple-300 font-medium">Privado · No afecta al estudio</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setShowPersonalExpenseModal(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Agregar Gasto
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="text-sm text-gray-400 mb-1">Total del Mes</div>
              <div className="text-2xl font-bold text-white">€{totalPersonalExpenses.toLocaleString()}</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="text-sm text-gray-400 mb-1">Promedio Mensual</div>
              <div className="text-2xl font-bold text-white">€{(totalPersonalExpenses / 1).toLocaleString()}</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="text-sm text-gray-400 mb-1">Gastos del Estudio</div>
              <div className="text-2xl font-bold text-white">€{totalExpenses.toLocaleString()}</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Categoría</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Concepto</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Fecha</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Monto</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Método</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {personalExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-lg bg-purple-500/10 text-purple-400 text-xs font-medium">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">{expense.concept}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{new Date(expense.date).toLocaleDateString('es-ES')}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-white">€{expense.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{expense.payment_method}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingItem(expense);
                            setShowPersonalExpenseModal(true);
                          }}
                          className="p-1 hover:bg-purple-500/20 rounded text-purple-400"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => deletePersonalExpense.mutate(expense.id)}
                          className="p-1 hover:bg-red-500/20 rounded text-red-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {personalExpenses.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                      No hay gastos personales registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 7️⃣ CONTRATOS & DOCUSIGN */}
        <div className="bg-[#111113] rounded-2xl border border-white/5 p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Contratos & DocuSign
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Estado</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Monto</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Fecha</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase">DocuSign</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {contracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-sm text-white font-medium">{contract.client_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{contract.type}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        contract.status === 'Firmado' ? 'bg-emerald-500/10 text-emerald-400' :
                        contract.status === 'Enviado' ? 'bg-blue-500/10 text-blue-400' :
                        'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        {contract.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-white">€{contract.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {contract.signed_date ? new Date(contract.signed_date).toLocaleDateString('es-ES') : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {contract.docusign_url ? (
                        <a href={contract.docusign_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                          Ver
                        </a>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                  </tr>
                ))}
                {contracts.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                      No hay contratos registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 8️⃣ ALERTAS INTELIGENTES */}
        {(clientsWithoutContract > 0 || overduePayments > 0 || pendingContracts > 0) && (
          <div className="bg-gradient-to-br from-yellow-500/10 to-red-500/10 rounded-2xl border border-yellow-500/20 p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              Alertas Inteligentes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {clientsWithoutContract > 0 && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <span className="text-red-400 font-medium">Clientes sin contrato</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{clientsWithoutContract}</div>
                </div>
              )}
              
              {overduePayments > 0 && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-5 h-5 text-yellow-400" />
                    <span className="text-yellow-400 font-medium">Pagos atrasados</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{overduePayments}</div>
                </div>
              )}

              {pendingContracts > 0 && (
                <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-5 h-5 text-orange-400" />
                    <span className="text-orange-400 font-medium">Contratos pendientes</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{pendingContracts}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showIncomeModal && (
        <IncomeModal
          onClose={() => {
            setShowIncomeModal(false);
            setEditingItem(null);
          }}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          editingIncome={editingItem}
        />
      )}

      {showExpenseModal && (
        <ExpenseModal
          onClose={() => {
            setShowExpenseModal(false);
            setEditingItem(null);
          }}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          editingExpense={editingItem}
        />
      )}

      {showPersonalExpenseModal && (
        <PersonalExpenseModal
          onClose={() => {
            setShowPersonalExpenseModal(false);
            setEditingItem(null);
          }}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          editingExpense={editingItem}
        />
      )}

      {showClientModal && (
        <ClientModal
          onClose={() => {
            setShowClientModal(false);
            setEditingItem(null);
          }}
          editingClient={editingItem}
        />
      )}
    </AdminLayout>
  );
}

// Income Modal Component
function IncomeModal({ onClose, selectedMonth, selectedYear, editingIncome }) {
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

  React.useEffect(() => {
    if (editingIncome) {
      setFormData({
        ...editingIncome,
        services: editingIncome.services || []
      });
    } else {
      setFormData({
        date: currentDate.toISOString().split('T')[0],
        artist_id: '',
        artist_name: '',
        services: [],
        amount: '',
        payment_method: '',
        notes: '',
        month: selectedMonth,
        year: selectedYear
      });
    }
  }, [editingIncome, selectedMonth, selectedYear]);

  const queryClient = useQueryClient();
  const { data: artists = [] } = useQuery({
    queryKey: ['artists'],
    queryFn: () => base44.entities.Artist.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => editingIncome 
      ? base44.entities.Income.update(editingIncome.id, data)
      : base44.entities.Income.create(data),
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
      amount: Number(formData.amount),
      month: formData.month,
      year: formData.year
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
          <h3 className="text-xl font-bold text-white">{editingIncome ? 'Editar Ingreso' : 'Nuevo Ingreso'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Mes *</label>
              <select
                value={formData.month}
                onChange={(e) => {
                  const newMonth = Number(e.target.value);
                  const dateObj = new Date(formData.date);
                  dateObj.setMonth(newMonth - 1);
                  setFormData({ 
                    ...formData, 
                    month: newMonth,
                    date: dateObj.toISOString().split('T')[0]
                  });
                }}
                className="w-full px-4 py-3 bg-white rounded-xl text-gray-900 border border-white/20 focus:outline-none focus:border-emerald-500"
                required
              >
                {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((month, idx) => (
                  <option key={idx} value={idx + 1}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Día *</label>
              <input
                type="number"
                min="1"
                max="31"
                value={formData.date ? new Date(formData.date).getDate() : 1}
                onChange={(e) => {
                  const dateObj = new Date(formData.date || new Date());
                  dateObj.setDate(Number(e.target.value));
                  setFormData({ 
                    ...formData, 
                    date: dateObj.toISOString().split('T')[0]
                  });
                }}
                className="w-full px-4 py-3 bg-white rounded-xl text-gray-900 border border-white/20 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Año *</label>
              <select
                value={formData.year}
                onChange={(e) => {
                  const newYear = Number(e.target.value);
                  const dateObj = new Date(formData.date);
                  dateObj.setFullYear(newYear);
                  setFormData({ 
                    ...formData, 
                    year: newYear,
                    date: dateObj.toISOString().split('T')[0]
                  });
                }}
                className="w-full px-4 py-3 bg-white rounded-xl text-gray-900 border border-white/20 focus:outline-none focus:border-emerald-500"
                required
              >
                {[2024, 2025, 2026, 2027, 2028].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Artista</label>
            <select
              value={formData.artist_id}
              onChange={(e) => setFormData({ ...formData, artist_id: e.target.value })}
              className="w-full px-4 py-3 bg-white rounded-xl text-gray-900 border border-white/20 focus:outline-none focus:border-emerald-500"
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
                className="w-full px-4 py-3 bg-white rounded-xl text-gray-900 border border-white/20 placeholder:text-gray-500 focus:outline-none focus:border-emerald-500 mt-2"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Monto (€) *</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-3 bg-white rounded-xl text-gray-900 border border-white/20 focus:outline-none focus:border-emerald-500"
              required
            />
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
              className="w-full px-4 py-3 bg-white rounded-xl text-gray-900 border border-white/20 focus:outline-none focus:border-emerald-500"
              required
            >
              <option value="">Seleccionar...</option>
              <option value="Tarjeta">Tarjeta</option>
              <option value="Bizum">Bizum</option>
              <option value="Transferencia Bancaria">Transferencia Bancaria</option>
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
              className="w-full px-4 py-3 bg-white rounded-xl text-gray-900 border border-white/20 placeholder:text-gray-500 focus:outline-none focus:border-emerald-500 resize-none"
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
              {createMutation.isPending ? 'Guardando...' : (editingIncome ? 'Actualizar' : 'Guardar')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// Expense Modal Component
function ExpenseModal({ onClose, selectedMonth, selectedYear, editingExpense }) {
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

  React.useEffect(() => {
    if (editingExpense) {
      setFormData(editingExpense);
    } else {
      setFormData({
        date: currentDate.toISOString().split('T')[0],
        category: 'Empresa',
        concept: '',
        amount: '',
        payment_method: '',
        notes: '',
        month: selectedMonth,
        year: selectedYear
      });
    }
  }, [editingExpense, selectedMonth, selectedYear]);

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => editingExpense
      ? base44.entities.Expense.update(editingExpense.id, data)
      : base44.entities.Expense.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      onClose();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      amount: Number(formData.amount),
      month: formData.month,
      year: formData.year
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
          <h3 className="text-xl font-bold text-white">{editingExpense ? 'Editar Gasto' : 'Nuevo Gasto'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Mes *</label>
              <select
                value={formData.month}
                onChange={(e) => {
                  const newMonth = Number(e.target.value);
                  const dateObj = new Date(formData.date);
                  dateObj.setMonth(newMonth - 1);
                  setFormData({ 
                    ...formData, 
                    month: newMonth,
                    date: dateObj.toISOString().split('T')[0]
                  });
                }}
                className="w-full px-4 py-3 bg-white rounded-xl text-gray-900 border border-white/20 focus:outline-none focus:border-emerald-500"
                required
              >
                {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((month, idx) => (
                  <option key={idx} value={idx + 1}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Día *</label>
              <input
                type="number"
                min="1"
                max="31"
                value={formData.date ? new Date(formData.date).getDate() : 1}
                onChange={(e) => {
                  const dateObj = new Date(formData.date || new Date());
                  dateObj.setDate(Number(e.target.value));
                  setFormData({ 
                    ...formData, 
                    date: dateObj.toISOString().split('T')[0]
                  });
                }}
                className="w-full px-4 py-3 bg-white rounded-xl text-gray-900 border border-white/20 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Año *</label>
              <select
                value={formData.year}
                onChange={(e) => {
                  const newYear = Number(e.target.value);
                  const dateObj = new Date(formData.date);
                  dateObj.setFullYear(newYear);
                  setFormData({ 
                    ...formData, 
                    year: newYear,
                    date: dateObj.toISOString().split('T')[0]
                  });
                }}
                className="w-full px-4 py-3 bg-white rounded-xl text-gray-900 border border-white/20 focus:outline-none focus:border-emerald-500"
                required
              >
                {[2024, 2025, 2026, 2027, 2028].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
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
              className="w-full px-4 py-3 bg-white rounded-xl text-gray-900 border border-white/20 placeholder:text-gray-500 focus:outline-none focus:border-emerald-500"
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
                className="w-full px-4 py-3 bg-white rounded-xl text-gray-900 border border-white/20 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Método de Pago</label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="w-full px-4 py-3 bg-white rounded-xl text-gray-900 border border-white/20 focus:outline-none focus:border-emerald-500"
              >
                <option value="">Seleccionar...</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Bizum">Bizum</option>
                <option value="Transferencia Bancaria">Transferencia Bancaria</option>
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
              className="w-full px-4 py-3 bg-white rounded-xl text-gray-900 border border-white/20 placeholder:text-gray-500 focus:outline-none focus:border-emerald-500 resize-none"
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
              {createMutation.isPending ? 'Guardando...' : (editingExpense ? 'Actualizar' : 'Guardar')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// Personal Expense Modal Component
function PersonalExpenseModal({ onClose, selectedMonth, selectedYear, editingExpense }) {
  const currentDate = new Date();
  const [formData, setFormData] = useState({
    date: currentDate.toISOString().split('T')[0],
    category: 'Otro',
    concept: '',
    amount: '',
    payment_method: '',
    notes: '',
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear()
  });

  React.useEffect(() => {
    if (editingExpense) {
      setFormData(editingExpense);
    } else {
      setFormData({
        date: currentDate.toISOString().split('T')[0],
        category: 'Otro',
        concept: '',
        amount: '',
        payment_method: '',
        notes: '',
        month: selectedMonth,
        year: selectedYear
      });
    }
  }, [editingExpense, selectedMonth, selectedYear]);

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => editingExpense
      ? base44.entities.PersonalExpense.update(editingExpense.id, data)
      : base44.entities.PersonalExpense.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personalExpenses'] });
      onClose();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      amount: Number(formData.amount),
      month: formData.month,
      year: formData.year
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#111113] rounded-2xl border border-purple-500/20 w-full max-w-2xl"
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">{editingExpense ? 'Editar Gasto Personal' : 'Nuevo Gasto Personal'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Mes *</label>
              <select
                value={formData.month}
                onChange={(e) => {
                  const newMonth = Number(e.target.value);
                  const dateObj = new Date(formData.date);
                  dateObj.setMonth(newMonth - 1);
                  setFormData({ 
                    ...formData, 
                    month: newMonth,
                    date: dateObj.toISOString().split('T')[0]
                  });
                }}
                className="w-full px-4 py-3 bg-white rounded-xl text-gray-900 border border-white/20 focus:outline-none focus:border-purple-500"
                required
              >
                {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((month, idx) => (
                  <option key={idx} value={idx + 1}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Día *</label>
              <input
                type="number"
                min="1"
                max="31"
                value={formData.date ? new Date(formData.date).getDate() : 1}
                onChange={(e) => {
                  const dateObj = new Date(formData.date || new Date());
                  dateObj.setDate(Number(e.target.value));
                  setFormData({ 
                    ...formData, 
                    date: dateObj.toISOString().split('T')[0]
                  });
                }}
                className="w-full px-4 py-3 bg-white rounded-xl text-gray-900 border border-white/20 focus:outline-none focus:border-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Año *</label>
              <select
                value={formData.year}
                onChange={(e) => {
                  const newYear = Number(e.target.value);
                  const dateObj = new Date(formData.date);
                  dateObj.setFullYear(newYear);
                  setFormData({ 
                    ...formData, 
                    year: newYear,
                    date: dateObj.toISOString().split('T')[0]
                  });
                }}
                className="w-full px-4 py-3 bg-white rounded-xl text-gray-900 border border-white/20 focus:outline-none focus:border-purple-500"
                required
              >
                {[2024, 2025, 2026, 2027, 2028].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Categoría *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 bg-white rounded-xl text-gray-900 border border-white/20 focus:outline-none focus:border-purple-500"
              required
            >
              <option value="Comida">Comida</option>
              <option value="Transporte">Transporte</option>
              <option value="Ocio">Ocio</option>
              <option value="Salud">Salud</option>
              <option value="Ropa">Ropa</option>
              <option value="Vivienda">Vivienda</option>
              <option value="Educación">Educación</option>
              <option value="Suscripciones">Suscripciones</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Concepto *</label>
            <input
              type="text"
              value={formData.concept}
              onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
              placeholder="Descripción del gasto..."
              className="w-full px-4 py-3 bg-white rounded-xl text-gray-900 border border-white/20 placeholder:text-gray-500 focus:outline-none focus:border-purple-500"
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
                className="w-full px-4 py-3 bg-white rounded-xl text-gray-900 border border-white/20 focus:outline-none focus:border-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Método de Pago</label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="w-full px-4 py-3 bg-white rounded-xl text-gray-900 border border-white/20 focus:outline-none focus:border-purple-500"
              >
                <option value="">Seleccionar...</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Bizum">Bizum</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
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
              className="w-full px-4 py-3 bg-white rounded-xl text-gray-900 border border-white/20 placeholder:text-gray-500 focus:outline-none focus:border-purple-500 resize-none"
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
              className="flex-1 px-4 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-medium transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? 'Guardando...' : (editingExpense ? 'Actualizar' : 'Guardar')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// Client Modal Component
function ClientModal({ onClose, editingClient }) {
  const [formData, setFormData] = useState({
    name: '',
    service: '',
    status: 'Activo',
    total_agreed: 0,
    amount_paid: 0,
    amount_pending: 0,
    payment_method: '',
    contract_signed: false,
    contract_id: '',
    email: '',
    phone: ''
  });

  React.useEffect(() => {
    if (editingClient) {
      setFormData(editingClient);
    }
  }, [editingClient]);

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => editingClient
      ? base44.entities.Client.update(editingClient.id, data)
      : base44.entities.Client.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      onClose();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      total_agreed: Number(formData.total_agreed),
      amount_paid: Number(formData.amount_paid),
      amount_pending: Number(formData.amount_pending)
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
          <h3 className="text-xl font-bold text-white">{editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nombre *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-white rounded-xl text-gray-900 border border-white/20 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Servicio *</label>
              <input
                type="text"
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                className="w-full px-4 py-3 bg-white rounded-xl text-gray-900 border border-white/20 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-white rounded-xl text-gray-900 border border-white/20 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Teléfono</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-white rounded-xl text-gray-900 border border-white/20 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Total Acordado (€) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.total_agreed}
                onChange={(e) => setFormData({ ...formData, total_agreed: e.target.value })}
                className="w-full px-4 py-3 bg-white rounded-xl text-gray-900 border border-white/20 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Cobrado (€)</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount_paid}
                onChange={(e) => setFormData({ ...formData, amount_paid: e.target.value })}
                className="w-full px-4 py-3 bg-white rounded-xl text-gray-900 border border-white/20 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Pendiente (€)</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount_pending}
                onChange={(e) => setFormData({ ...formData, amount_pending: e.target.value })}
                className="w-full px-4 py-3 bg-white rounded-xl text-gray-900 border border-white/20 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Estado</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 bg-white rounded-xl text-gray-900 border border-white/20 focus:outline-none focus:border-blue-500"
              >
                <option value="Activo">Activo</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Completado">Completado</option>
                <option value="Pausado">Pausado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Método de Pago</label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="w-full px-4 py-3 bg-white rounded-xl text-gray-900 border border-white/20 focus:outline-none focus:border-blue-500"
              >
                <option value="">Seleccionar...</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Bizum">Bizum</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="contract_signed"
              checked={formData.contract_signed}
              onChange={(e) => setFormData({ ...formData, contract_signed: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="contract_signed" className="text-sm text-gray-300">
              ¿Tiene contrato firmado?
            </label>
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
              className="flex-1 px-4 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? 'Guardando...' : (editingClient ? 'Actualizar' : 'Guardar')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}