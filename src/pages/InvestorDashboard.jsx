import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import AddEquipmentModal from "@/components/investor/AddEquipmentModal";
import AddDigitalBudgetModal from "@/components/investor/AddDigitalBudgetModal";
import AddExpenseModal from "@/components/investor/AddExpenseModal";
import AddRevenueModal from "@/components/investor/AddRevenueModal";
import { 
  TrendingUp, 
  DollarSign, 
  Activity, 
  Target,
  Calendar,
  ShoppingCart,
  Briefcase,
  BarChart3,
  Package,
  CreditCard,
  Clock,
  AlertCircle,
  CheckCircle2,
  Plus,
  Pencil,
  Trash2
} from "lucide-react";

export default function InvestorDashboard() {
  const [selectedMonth, setSelectedMonth] = useState("2026-01");
  const [revenueView, setRevenueView] = useState("mensual"); // mensual, trimestral, semestral
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [showDigitalModal, setShowDigitalModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const queryClient = useQueryClient();

  // Queries
  const { data: investments = [] } = useQuery({
    queryKey: ['investments'],
    queryFn: () => base44.entities.Investment.list()
  });

  const { data: equipment = [] } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => base44.entities.Equipment.list()
  });

  const { data: digitalBudgets = [] } = useQuery({
    queryKey: ['digitalBudgets'],
    queryFn: () => base44.entities.DigitalBudget.list()
  });

  const { data: monthlyExpenses = [] } = useQuery({
    queryKey: ['monthlyExpenses'],
    queryFn: () => base44.entities.MonthlyExpense.list()
  });

  const { data: revenues = [] } = useQuery({
    queryKey: ['revenues'],
    queryFn: () => base44.entities.Revenue.list()
  });

  const { data: pendingPurchases = [] } = useQuery({
    queryKey: ['pendingPurchases'],
    queryFn: () => base44.entities.PendingPurchase.list()
  });

  const { data: phases = [] } = useQuery({
    queryKey: ['phases'],
    queryFn: () => base44.entities.ProjectPhase.list()
  });

  // Calculations
  const investment = investments[0] || {
    total_capital: 0,
    return_generated: 0,
    projected_return: 0,
    roi_percentage: 0,
    available_cash: 0,
    project_status: "Activo",
    health_indicator: "green",
    progress_percentage: 0
  };

  const totalEquipmentCost = equipment.reduce((sum, eq) => sum + eq.price, 0);
  const purchasedEquipmentCost = equipment
    .filter(eq => eq.status === "Comprado")
    .reduce((sum, eq) => sum + eq.price, 0);

  const totalDigitalBudget = digitalBudgets.reduce((sum, db) => sum + db.assigned_budget, 0);
  const totalDigitalExecuted = digitalBudgets.reduce((sum, db) => sum + db.executed_cost, 0);

  const monthExpenses = monthlyExpenses.filter(exp => exp.month === selectedMonth);
  const totalMonthExpense = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Revenue calculations based on view
  const getRevenueData = () => {
    const currentDate = new Date(selectedMonth + "-01");
    
    if (revenueView === "mensual") {
      const filtered = revenues.filter(rev => rev.month === selectedMonth);
      return { data: filtered, total: filtered.reduce((sum, rev) => sum + rev.amount, 0) };
    } else if (revenueView === "trimestral") {
      const months = [];
      for (let i = 0; i < 3; i++) {
        const date = new Date(currentDate);
        date.setMonth(date.getMonth() - i);
        months.push(date.toISOString().slice(0, 7));
      }
      const filtered = revenues.filter(rev => months.includes(rev.month));
      return { data: filtered, total: filtered.reduce((sum, rev) => sum + rev.amount, 0) };
    } else {
      const months = [];
      for (let i = 0; i < 6; i++) {
        const date = new Date(currentDate);
        date.setMonth(date.getMonth() - i);
        months.push(date.toISOString().slice(0, 7));
      }
      const filtered = revenues.filter(rev => months.includes(rev.month));
      return { data: filtered, total: filtered.reduce((sum, rev) => sum + rev.amount, 0) };
    }
  };

  const { data: revenueData, total: totalRevenue } = getRevenueData();
  const monthRevenues = revenueData;
  const totalMonthRevenue = totalRevenue;

  const netProfit = totalMonthRevenue - totalMonthExpense;
  const profitMargin = totalMonthRevenue > 0 ? ((netProfit / totalMonthRevenue) * 100).toFixed(1) : 0;

  // Delete mutations
  const deleteEquipment = useMutation({
    mutationFn: (id) => base44.entities.Equipment.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['equipment'] })
  });

  const deleteDigitalBudget = useMutation({
    mutationFn: (id) => base44.entities.DigitalBudget.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['digitalBudgets'] })
  });

  const deleteExpense = useMutation({
    mutationFn: (id) => base44.entities.MonthlyExpense.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['monthlyExpenses'] })
  });

  const deleteRevenue = useMutation({
    mutationFn: (id) => base44.entities.Revenue.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['revenues'] })
  });

  const kpis = [
    {
      icon: DollarSign,
      label: "Capital Invertido",
      value: `€${investment.total_capital.toLocaleString()}`,
      color: "blue"
    },
    {
      icon: TrendingUp,
      label: "Retorno Generado",
      value: `€${investment.return_generated.toLocaleString()}`,
      color: "emerald"
    },
    {
      icon: Target,
      label: "Retorno Proyectado",
      value: `€${investment.projected_return.toLocaleString()}`,
      color: "purple"
    },
    {
      icon: BarChart3,
      label: "ROI",
      value: `${investment.roi_percentage}%`,
      color: "orange"
    },
    {
      icon: Briefcase,
      label: "Cash Disponible",
      value: `€${investment.available_cash.toLocaleString()}`,
      color: "cyan"
    },
    {
      icon: Activity,
      label: "Estado",
      value: investment.project_status,
      color: investment.health_indicator === "green" ? "emerald" : investment.health_indicator === "yellow" ? "yellow" : "red"
    }
  ];

  const getHealthColor = (indicator) => {
    return indicator === "green" ? "bg-emerald-500" : indicator === "yellow" ? "bg-yellow-500" : "bg-red-500";
  };

  return (
    <AdminLayout activePage="InvestorDashboard">
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900">Panel de Inversor</h1>
          <p className="text-sm sm:text-base text-gray-600">Visión ejecutiva y control financiero</p>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
          {kpis.map((kpi, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <kpi.icon className={`w-5 h-5 text-${kpi.color}-600 mb-2`} />
              <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                {kpi.value}
              </div>
              <div className="text-xs text-gray-600">{kpi.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Progreso del Proyecto</h3>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getHealthColor(investment.health_indicator)}`} />
              <span className="text-sm text-gray-600">
                {investment.health_indicator === "green" ? "Saludable" : investment.health_indicator === "yellow" ? "Advertencia" : "Crítico"}
              </span>
            </div>
          </div>
          <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${investment.progress_percentage}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className={`h-full ${getHealthColor(investment.health_indicator)} transition-all`}
            />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
              {investment.progress_percentage}%
            </span>
          </div>
        </motion.div>

        {/* Equipment Investment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Inversión en Equipo Audiovisual
            </h2>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm text-gray-600">Invertido</div>
                <div className="text-lg font-bold text-gray-900">€{purchasedEquipmentCost.toLocaleString()}</div>
              </div>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setShowEquipmentModal(true);
                }}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Agregar
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-gray-700 font-medium">Equipo</th>
                  <th className="text-left py-2 px-3 text-gray-700 font-medium">Categoría</th>
                  <th className="text-right py-2 px-3 text-gray-700 font-medium">Precio</th>
                  <th className="text-center py-2 px-3 text-gray-700 font-medium">Estado</th>
                  <th className="text-center py-2 px-3 text-gray-700 font-medium">Impacto</th>
                  <th className="text-center py-2 px-3 text-gray-700 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {equipment.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-500">
                      No hay equipos registrados
                    </td>
                  </tr>
                ) : (
                  equipment.map((eq) => (
                    <tr key={eq.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-3 font-medium text-gray-900">{eq.name}</td>
                      <td className="py-3 px-3 text-gray-600">{eq.category}</td>
                      <td className="py-3 px-3 text-right font-semibold text-gray-900">€{eq.price.toLocaleString()}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          eq.status === "Comprado" ? "bg-emerald-100 text-emerald-700" :
                          eq.status === "Pendiente" ? "bg-yellow-100 text-yellow-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {eq.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          eq.impact === "Alto" ? "bg-red-100 text-red-700" :
                          eq.impact === "Medio" ? "bg-orange-100 text-orange-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                          {eq.impact}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setEditingItem(eq);
                              setShowEquipmentModal(true);
                            }}
                            className="p-1 hover:bg-blue-50 rounded text-blue-600"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteEquipment.mutate(eq.id)}
                            className="p-1 hover:bg-red-50 rounded text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Digital Budget & Global Budget */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
          {/* Digital Budget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-600" />
                Presupuesto Desarrollo Digital
              </h3>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setShowDigitalModal(true);
                }}
                className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Agregar
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1">Asignado</div>
                <div className="text-lg font-bold text-blue-700">€{totalDigitalBudget.toLocaleString()}</div>
              </div>
              <div className="bg-red-50 rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1">Ejecutado</div>
                <div className="text-lg font-bold text-red-700">€{totalDigitalExecuted.toLocaleString()}</div>
              </div>
              <div className="bg-emerald-50 rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1">Disponible</div>
                <div className="text-lg font-bold text-emerald-700">€{(totalDigitalBudget - totalDigitalExecuted).toLocaleString()}</div>
              </div>
            </div>

            <div className="space-y-2">
              {digitalBudgets.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-sm">
                  No hay presupuestos registrados
                </div>
              ) : (
                digitalBudgets.map((db) => (
                  <div key={db.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">{db.concept}</div>
                      <div className="text-xs text-gray-600">{db.category}</div>
                    </div>
                    <div className="text-right mr-2">
                      <div className="text-sm font-semibold text-gray-900">€{db.executed_cost.toLocaleString()} / €{db.assigned_budget.toLocaleString()}</div>
                      <span className="text-xs text-gray-600">{db.status}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingItem(db);
                          setShowDigitalModal(true);
                        }}
                        className="p-1 hover:bg-purple-50 rounded text-purple-600"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteDigitalBudget.mutate(db.id)}
                        className="p-1 hover:bg-red-50 rounded text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Global Budget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-orange-600" />
              Presupuesto Global de Equipo
            </h3>

            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-700">Presupuesto Total</span>
                  <span className="text-xl font-bold text-gray-900">€{totalEquipmentCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-700">Gasto Real</span>
                  <span className="text-xl font-bold text-red-600">€{purchasedEquipmentCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Disponible</span>
                  <span className="text-xl font-bold text-emerald-600">€{(totalEquipmentCost - purchasedEquipmentCost).toLocaleString()}</span>
                </div>
              </div>

              <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${totalEquipmentCost > 0 ? (purchasedEquipmentCost / totalEquipmentCost) * 100 : 0}%` }}
                  transition={{ duration: 1, delay: 0.8 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                />
              </div>
              <div className="text-center text-sm text-gray-600">
                {totalEquipmentCost > 0 ? ((purchasedEquipmentCost / totalEquipmentCost) * 100).toFixed(1) : 0}% ejecutado
              </div>
            </div>
          </motion.div>
        </div>

        {/* Monthly Expenses & Revenues */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
          {/* Monthly Expenses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-600" />
                Gastos Mensuales
              </h3>
              <div className="flex items-center gap-2">
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setShowExpenseModal(true);
                  }}
                  className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Agregar
                </button>
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4 mb-4">
              <div className="text-sm text-gray-700 mb-1">Total del Mes</div>
              <div className="text-2xl font-bold text-red-700">€{totalMonthExpense.toLocaleString()}</div>
            </div>

            <div className="space-y-2">
              {monthExpenses.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-sm">
                  No hay gastos registrados para este mes
                </div>
              ) : (
                monthExpenses.map((exp) => (
                  <div key={exp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-medium text-gray-900 text-sm">{exp.category}</div>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          exp.payment_status === 'paid' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {exp.payment_status === 'paid' ? 'Pagado' : 'Sin Pagar'}
                        </span>
                      </div>
                      {exp.description && <div className="text-xs text-gray-600">{exp.description}</div>}
                    </div>
                    <div className="text-sm font-semibold text-gray-900 mr-2">€{exp.amount.toLocaleString()}</div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingItem(exp);
                          setShowExpenseModal(true);
                        }}
                        className="p-1 hover:bg-red-50 rounded text-red-600"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteExpense.mutate(exp.id);
                        }}
                        className="p-1 hover:bg-red-50 rounded text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Revenues */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Ingresos
              </h3>
              <div className="flex items-center gap-2">
                <select
                  value={revenueView}
                  onChange={(e) => setRevenueView(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="mensual">Mensual</option>
                  <option value="trimestral">Trimestral (3 meses)</option>
                  <option value="semestral">Semestral (6 meses)</option>
                </select>
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setShowRevenueModal(true);
                  }}
                  className="px-3 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Agregar
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-emerald-50 rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1">Ingresos</div>
                <div className="text-lg font-bold text-emerald-700">€{totalMonthRevenue.toLocaleString()}</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1">Beneficio Neto</div>
                <div className={`text-lg font-bold ${netProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                  €{netProfit.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Margen</span>
                <span className={`text-lg font-bold ${netProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                  {profitMargin}%
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {monthRevenues.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-sm">
                  No hay ingresos registrados para este mes
                </div>
              ) : (
                monthRevenues.map((rev) => (
                  <div key={rev.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">{rev.source}</div>
                      <div className="text-xs text-gray-600">
                        {rev.description && <span>{rev.description} • </span>}
                        <span>{rev.month}</span>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-emerald-700 mr-2">€{rev.amount.toLocaleString()}</div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingItem(rev);
                          setShowRevenueModal(true);
                        }}
                        className="p-1 hover:bg-emerald-50 rounded text-emerald-600"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteRevenue.mutate(rev.id)}
                        className="p-1 hover:bg-red-50 rounded text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Pending Purchases */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6 shadow-sm"
        >
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-orange-600" />
            Productos y Compras Pendientes
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-gray-700 font-medium">Producto</th>
                  <th className="text-right py-2 px-3 text-gray-700 font-medium">Precio</th>
                  <th className="text-center py-2 px-3 text-gray-700 font-medium">Prioridad</th>
                  <th className="text-center py-2 px-3 text-gray-700 font-medium">Impacto</th>
                  <th className="text-center py-2 px-3 text-gray-700 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {pendingPurchases.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-500">
                      No hay compras pendientes
                    </td>
                  </tr>
                ) : (
                  pendingPurchases.map((purchase) => (
                    <tr key={purchase.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-3 font-medium text-gray-900">{purchase.product}</td>
                      <td className="py-3 px-3 text-right font-semibold text-gray-900">€{purchase.price.toLocaleString()}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          purchase.priority === "Alta" ? "bg-red-100 text-red-700" :
                          purchase.priority === "Media" ? "bg-yellow-100 text-yellow-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                          {purchase.priority}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          purchase.impact === "Alto" ? "bg-red-100 text-red-700" :
                          purchase.impact === "Medio" ? "bg-orange-100 text-orange-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                          {purchase.impact}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          purchase.status === "Aprobado" ? "bg-emerald-100 text-emerald-700" :
                          purchase.status === "Pendiente" ? "bg-yellow-100 text-yellow-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {purchase.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Project Phases */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm"
        >
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Cronograma y Fases del Proyecto
          </h2>

          {phases.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay fases registradas
            </div>
          ) : (
            <div className="space-y-4">
              {phases.map((phase) => (
                <div key={phase.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-gray-900 text-base">{phase.phase_name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{phase.objectives}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      phase.status === "Completada" ? "bg-emerald-100 text-emerald-700" :
                      phase.status === "En Progreso" ? "bg-blue-100 text-blue-700" :
                      phase.status === "Retrasada" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {phase.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                    <div>
                      <div className="text-xs text-gray-600">Presupuesto</div>
                      <div className="text-sm font-semibold text-gray-900">€{phase.budget.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Inicio</div>
                      <div className="text-sm font-semibold text-gray-900">{new Date(phase.start_date).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Fin</div>
                      <div className="text-sm font-semibold text-gray-900">{new Date(phase.end_date).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Progreso</div>
                      <div className="text-sm font-semibold text-gray-900">{phase.completion_percentage}%</div>
                    </div>
                  </div>

                  <div className="relative w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${phase.completion_percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Modals */}
      <AddEquipmentModal 
        isOpen={showEquipmentModal} 
        onClose={() => {
          setShowEquipmentModal(false);
          setEditingItem(null);
        }} 
        equipment={editingItem}
      />
      <AddDigitalBudgetModal 
        isOpen={showDigitalModal} 
        onClose={() => {
          setShowDigitalModal(false);
          setEditingItem(null);
        }} 
        budget={editingItem}
      />
      <AddExpenseModal 
        isOpen={showExpenseModal} 
        onClose={() => {
          setShowExpenseModal(false);
          setEditingItem(null);
        }} 
        expense={editingItem}
        defaultMonth={selectedMonth}
      />
      <AddRevenueModal 
        isOpen={showRevenueModal} 
        onClose={() => {
          setShowRevenueModal(false);
          setEditingItem(null);
        }} 
        revenue={editingItem}
        defaultMonth={selectedMonth}
      />
    </AdminLayout>
  );
}