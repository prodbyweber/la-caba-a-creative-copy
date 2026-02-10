import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  Wallet,
  Calendar,
  Plus,
  Check,
  X,
  Download,
  Filter,
  ChevronRight
} from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isAfter, isBefore, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export default function Accounting() {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showGastoModal, setShowGastoModal] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState(null);
  const [showDistributionPanel, setShowDistributionPanel] = useState(false);
  
  const queryClient = useQueryClient();

  const getDateRange = () => {
    const [year, month] = selectedMonth.split('-');
    const start = new Date(parseInt(year), parseInt(month) - 1, 1);
    const end = new Date(parseInt(year), parseInt(month), 0);
    return { start, end };
  };

  const { start, end } = getDateRange();

  // Queries
  const { data: incomes = [] } = useQuery({
    queryKey: ['incomes'],
    queryFn: () => base44.entities.Income.list('-date')
  });

  const { data: gastosFijos = [] } = useQuery({
    queryKey: ['gastosFijos'],
    queryFn: () => base44.entities.GastoFijo.list()
  });

  const { data: personalLedger = [] } = useQuery({
    queryKey: ['personalLedger'],
    queryFn: () => base44.entities.PersonalLedger.list('-fecha')
  });

  // Mutations
  const createIncomeMutation = useMutation({
    mutationFn: (data) => {
      const calculatedData = {
        ...data,
        sueldo_monto_calculado: data.amount * (data.sueldo_porcentaje || 35) / 100,
        sueldo_estado: "Sin pagar"
      };
      return base44.entities.Income.create(calculatedData);
    },
    onSuccess: () => queryClient.invalidateQueries(['incomes'])
  });

  const updateIncomeMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Income.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['incomes', 'personalLedger'])
  });

  const createLedgerMutation = useMutation({
    mutationFn: (data) => base44.entities.PersonalLedger.create(data),
    onSuccess: () => queryClient.invalidateQueries(['personalLedger'])
  });

  const createGastoMutation = useMutation({
    mutationFn: (data) => base44.entities.GastoFijo.create(data),
    onSuccess: () => queryClient.invalidateQueries(['gastosFijos'])
  });

  const updateGastoMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.GastoFijo.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['gastosFijos'])
  });

  // Filter incomes by date range
  const filteredIncomes = incomes.filter(income => {
    const incomeDate = parseISO(income.date);
    return incomeDate >= start && incomeDate <= end;
  });

  // Calculate KPIs
  const totalIngresos = filteredIncomes.reduce((sum, inc) => sum + (inc.amount || 0), 0);
  const totalGastosFijos = gastosFijos.reduce((sum, g) => sum + (g.importe || 0), 0);
  const gastosPagados = gastosFijos.filter(g => g.estado === "Pagado").reduce((sum, g) => sum + g.importe, 0);
  
  const sueldoCalculado = filteredIncomes.reduce((sum, inc) => {
    return sum + (inc.amount * (inc.sueldo_porcentaje || 35) / 100);
  }, 0);
  
  const sueldoPagado = filteredIncomes
    .filter(inc => inc.sueldo_estado === "Pagado")
    .reduce((sum, inc) => sum + (inc.amount * (inc.sueldo_porcentaje || 35) / 100), 0);
  
  const sueldoPendiente = sueldoCalculado - sueldoPagado;

  const negocioCalculado = filteredIncomes.reduce((sum, inc) => sum + (inc.amount * 0.40), 0);
  const reinversionCalculado = filteredIncomes.reduce((sum, inc) => sum + (inc.amount * 0.15), 0);
  const adsCalculado = filteredIncomes.reduce((sum, inc) => sum + (inc.amount * 0.10), 0);

  const gastosVencidos = gastosFijos.filter(g => {
    if (g.estado === "Pagado" || !g.proxima_fecha_pago) return false;
    return isAfter(new Date(), parseISO(g.proxima_fecha_pago));
  }).length;

  // Toggle sueldo pagado
  const toggleSueldoPagado = async (income) => {
    const nuevoEstado = income.sueldo_estado === "Pagado" ? "Sin pagar" : "Pagado";
    const montoSueldo = income.amount * (income.sueldo_porcentaje || 35) / 100;

    await updateIncomeMutation.mutateAsync({
      id: income.id,
      data: {
        sueldo_estado: nuevoEstado,
        sueldo_fecha_pago: nuevoEstado === "Pagado" ? format(new Date(), 'yyyy-MM-dd') : null,
        sueldo_metodo_pago: nuevoEstado === "Pagado" ? "Revolut" : null
      }
    });

    if (nuevoEstado === "Pagado") {
      await createLedgerMutation.mutateAsync({
        fecha: format(new Date(), 'yyyy-MM-dd'),
        referencia_ingreso_id: income.id,
        monto: montoSueldo,
        metodo: "Revolut",
        tipo: "Abono",
        nota: `Sueldo de ingreso: ${income.client_name}`
      });
    }
  };

  const marcarGastoPagado = async (gasto) => {
    const calcularProximaFecha = (fecha, frecuencia) => {
      const base = new Date(fecha);
      if (frecuencia === "Mensual") {
        base.setMonth(base.getMonth() + 1);
      } else if (frecuencia === "Semanal") {
        base.setDate(base.getDate() + 7);
      } else if (frecuencia === "Trimestral") {
        base.setMonth(base.getMonth() + 3);
      } else if (frecuencia === "Anual") {
        base.setFullYear(base.getFullYear() + 1);
      }
      return format(base, 'yyyy-MM-dd');
    };

    await updateGastoMutation.mutateAsync({
      id: gasto.id,
      data: {
        estado: "Pagado",
        ultima_fecha_pagado: format(new Date(), 'yyyy-MM-dd'),
        proxima_fecha_pago: gasto.frecuencia !== "Puntual" 
          ? calcularProximaFecha(new Date(), gasto.frecuencia)
          : null
      }
    });
  };

  return (
    <AdminLayout activePage="FinanceDashboard">
      <div className="min-h-screen bg-[#0a0a0b] p-4 md:p-6">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Control Financiero</h1>
              <p className="text-gray-400 text-sm">Dashboard de ingresos, gastos y sueldo personal</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
              />

              <button
                onClick={() => setShowDistributionPanel(!showDistributionPanel)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-xl text-white text-sm font-medium flex items-center gap-2"
              >
                <Wallet className="w-4 h-4" />
                Distribución
              </button>

              <button
                onClick={() => setShowIncomeModal(true)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-white text-sm font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Ingreso</span>
              </button>

              <button
                onClick={() => setShowGastoModal(true)}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-xl text-white text-sm font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Gasto</span>
              </button>
            </div>
          </div>

          {/* Distribution Panel */}
          {showDistributionPanel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-2xl p-6 mb-6"
            >
              <h3 className="text-lg font-bold text-white mb-4">Distribución del mes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="text-sm text-gray-400 mb-1">Sueldo Personal (35%)</div>
                  <div className="text-xl font-bold text-purple-400">{sueldoCalculado.toFixed(2)}€</div>
                  <div className="text-xs text-gray-500 mt-2">Pagado: {sueldoPagado.toFixed(2)}€</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="text-sm text-gray-400 mb-1">Negocio (40%)</div>
                  <div className="text-xl font-bold text-blue-400">{negocioCalculado.toFixed(2)}€</div>
                  <div className="text-xs text-gray-500 mt-2">Operativa del estudio</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="text-sm text-gray-400 mb-1">Reinversión (15%)</div>
                  <div className="text-xl font-bold text-orange-400">{reinversionCalculado.toFixed(2)}€</div>
                  <div className="text-xs text-gray-500 mt-2">Equipos y mejoras</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="text-sm text-gray-400 mb-1">Ads / Visibilidad (10%)</div>
                  <div className="text-xl font-bold text-pink-400">{adsCalculado.toFixed(2)}€</div>
                  <div className="text-xs text-gray-500 mt-2">Marketing y publicidad</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-500/20 rounded-2xl p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-sm text-gray-400">Facturación</span>
              </div>
              <div className="text-2xl font-bold text-white">{totalIngresos.toFixed(2)}€</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/20 rounded-2xl p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-red-400" />
                </div>
                <span className="text-sm text-gray-400">Gastos Fijos</span>
              </div>
              <div className="text-2xl font-bold text-white">{totalGastosFijos.toFixed(2)}€</div>
              <div className="text-xs text-gray-500 mt-1">
                {((gastosPagados / totalGastosFijos) * 100 || 0).toFixed(0)}% pagado
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-2xl p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-sm text-gray-400">Beneficio</span>
              </div>
              <div className="text-2xl font-bold text-white">{(totalIngresos - totalGastosFijos).toFixed(2)}€</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-2xl p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-sm text-gray-400">Sueldo Personal</span>
              </div>
              <div className="text-2xl font-bold text-white">{sueldoPagado.toFixed(2)}€</div>
              <div className="text-xs text-gray-500 mt-1">
                Pendiente: {sueldoPendiente.toFixed(2)}€
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-2xl p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-orange-400" />
                </div>
                <span className="text-sm text-gray-400">Pendientes</span>
              </div>
              <div className="text-2xl font-bold text-white">{gastosVencidos}</div>
              <div className="text-xs text-gray-500 mt-1">Gastos vencidos</div>
            </motion.div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Ingresos Panel */}
            <div className="lg:col-span-2 bg-[#111113] rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Ingresos</h2>
                <select
                  value={paymentMethodFilter}
                  onChange={(e) => setPaymentMethodFilter(e.target.value)}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                >
                  <option value="all">Todos</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Wise">Wise</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Plataforma online">Plataforma online</option>
                </select>
              </div>

              <div className="space-y-3">
                {filteredIncomes
                  .filter(inc => paymentMethodFilter === "all" || inc.payment_method === paymentMethodFilter)
                  .map((income) => {
                    const montoSueldo = income.amount * (income.sueldo_porcentaje || 35) / 100;
                    return (
                      <div
                        key={income.id}
                        className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-colors"
                      >
                        <div className="flex flex-col gap-3">
                         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                           <div className="flex-1">
                             <div className="flex items-center gap-2 mb-1 flex-wrap">
                               <span className="font-semibold text-white">{income.client_name}</span>
                               <span className="text-xs px-2 py-0.5 bg-white/10 rounded text-gray-400">
                                 {income.payment_method}
                               </span>
                             </div>
                             <div className="text-sm text-gray-400">{income.concept}</div>
                             <div className="text-xs text-gray-500 mt-1">
                               {format(parseISO(income.date), 'dd MMM yyyy', { locale: es })}
                             </div>
                           </div>

                           <div className="flex items-center gap-3">
                             <div className="text-right">
                               <div className="text-lg font-bold text-white">{income.amount.toFixed(2)}€</div>
                               <div className="text-xs text-purple-400">Sueldo: {montoSueldo.toFixed(2)}€</div>
                             </div>

                             <button
                               onClick={() => toggleSueldoPagado(income)}
                               disabled={updateIncomeMutation.isPending}
                               className={`px-3 py-2 rounded-xl font-medium text-xs sm:text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
                                 income.sueldo_estado === "Pagado"
                                   ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                   : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
                               }`}
                             >
                               {income.sueldo_estado === "Pagado" ? (
                                 <>
                                   <Check className="w-4 h-4" />
                                   <span className="hidden sm:inline">Pagado</span>
                                 </>
                               ) : (
                                 <>
                                   <X className="w-4 h-4" />
                                   <span className="hidden sm:inline">Sin pagar</span>
                                 </>
                               )}
                             </button>
                           </div>
                         </div>

                         {/* Distribution breakdown */}
                         <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/5">
                           <div className="text-xs">
                             <span className="text-gray-500">Negocio (40%)</span>
                             <div className="text-blue-400 font-medium">{(income.amount * 0.40).toFixed(2)}€</div>
                           </div>
                           <div className="text-xs">
                             <span className="text-gray-500">Reinversión (15%)</span>
                             <div className="text-orange-400 font-medium">{(income.amount * 0.15).toFixed(2)}€</div>
                           </div>
                           <div className="text-xs">
                             <span className="text-gray-500">Ads (10%)</span>
                             <div className="text-pink-400 font-medium">{(income.amount * 0.10).toFixed(2)}€</div>
                           </div>
                           <div className="text-xs">
                             <span className="text-gray-500">Sueldo (35%)</span>
                             <div className="text-purple-400 font-medium">{montoSueldo.toFixed(2)}€</div>
                           </div>
                         </div>
                        </div>
                      </div>
                    );
                  })}

                {filteredIncomes.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No hay ingresos en este período
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar: Gastos Fijos + Personal */}
            <div className="space-y-6">
              {/* Gastos Fijos */}
              <div className="bg-[#111113] rounded-2xl border border-white/10 p-6">
                <h2 className="text-xl font-bold text-white mb-4">Gastos Fijos</h2>
                <div className="space-y-3">
                  {gastosFijos.map((gasto) => {
                    const isVencido = gasto.proxima_fecha_pago && isAfter(new Date(), parseISO(gasto.proxima_fecha_pago)) && gasto.estado !== "Pagado";
                    return (
                      <div
                        key={gasto.id}
                        className={`bg-white/5 rounded-xl p-3 border transition-colors ${
                          isVencido ? 'border-red-500/30' : 'border-white/10'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="font-semibold text-white text-sm">{gasto.nombre}</div>
                            <div className="text-xs text-gray-500">{gasto.categoria}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-white text-sm">{gasto.importe.toFixed(2)}€</div>
                            <div className="text-xs text-gray-500">{gasto.frecuencia}</div>
                          </div>
                        </div>

                        {gasto.proxima_fecha_pago && (
                          <div className="text-xs text-gray-500 mb-2">
                            Vence: {format(parseISO(gasto.proxima_fecha_pago), 'dd MMM', { locale: es })}
                          </div>
                        )}

                        <button
                          onClick={() => marcarGastoPagado(gasto)}
                          disabled={gasto.estado === "Pagado" || updateGastoMutation.isPending}
                          className={`w-full py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            gasto.estado === "Pagado"
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-white/5 text-gray-400 hover:bg-white/10'
                          }`}
                        >
                          {gasto.estado === "Pagado" ? "✓ Pagado" : "Marcar pagado"}
                        </button>
                      </div>
                    );
                  })}

                  {gastosFijos.length === 0 && (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      No hay gastos fijos registrados
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Sueldo */}
              <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-4">Sueldo Personal</h2>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Calculado</span>
                    <span className="font-bold text-white">{sueldoCalculado.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Pagado</span>
                    <span className="font-bold text-emerald-400">{sueldoPagado.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-white/10">
                    <span className="text-sm text-gray-400">Pendiente</span>
                    <span className="font-bold text-orange-400">{sueldoPendiente.toFixed(2)}€</span>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-3">
                  <div className="text-xs text-gray-400 mb-2">Últimos movimientos</div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {personalLedger.slice(0, 5).map((entry) => (
                      <div key={entry.id} className="flex justify-between text-xs">
                        <span className="text-gray-400">
                          {format(parseISO(entry.fecha), 'dd MMM', { locale: es })}
                        </span>
                        <span className="text-emerald-400 font-medium">+{entry.monto.toFixed(2)}€</span>
                      </div>
                    ))}
                    {personalLedger.length === 0 && (
                      <div className="text-xs text-gray-500 text-center py-2">
                        Sin movimientos
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Income Modal */}
      {showIncomeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#111113] rounded-2xl border border-white/10 p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-xl font-bold text-white mb-4">Nuevo Ingreso</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              await createIncomeMutation.mutateAsync({
                date: formData.get('date'),
                client_name: formData.get('client_name'),
                concept: formData.get('concept'),
                amount: parseFloat(formData.get('amount')),
                payment_method: formData.get('payment_method'),
                notes: formData.get('notes')
              });
              setShowIncomeModal(false);
              e.target.reset();
            }} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Fecha</label>
                <input type="date" name="date" required className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Cliente</label>
                <input type="text" name="client_name" required className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Concepto</label>
                <input type="text" name="concept" required className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Monto (€)</label>
                <input type="number" step="0.01" name="amount" required className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Método de pago</label>
                <select name="payment_method" required className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white">
                  <option value="Efectivo">Efectivo</option>
                  <option value="Wise">Wise</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Plataforma online">Plataforma online</option>
                  <option value="Bizum">Bizum</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Notas (opcional)</label>
                <textarea name="notes" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white" rows="2"></textarea>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowIncomeModal(false)} className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white">
                  Cancelar
                </button>
                <button type="submit" disabled={createIncomeMutation.isPending} className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-white">
                  {createIncomeMutation.isPending ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Gasto Fijo Modal */}
      {showGastoModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#111113] rounded-2xl border border-white/10 p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-xl font-bold text-white mb-4">Nuevo Gasto Fijo</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const frecuencia = formData.get('frecuencia');
              const diaVenc = parseInt(formData.get('dia_vencimiento') || '1');
              
              // Calcular próxima fecha de pago
              const now = new Date();
              const proximaFecha = new Date(now.getFullYear(), now.getMonth(), diaVenc);
              if (proximaFecha < now) {
                proximaFecha.setMonth(proximaFecha.getMonth() + 1);
              }
              
              await createGastoMutation.mutateAsync({
                nombre: formData.get('nombre'),
                categoria: formData.get('categoria'),
                importe: parseFloat(formData.get('importe')),
                frecuencia: frecuencia,
                dia_vencimiento: frecuencia === 'Mensual' ? diaVenc : null,
                proxima_fecha_pago: format(proximaFecha, 'yyyy-MM-dd'),
                estado: "Pendiente",
                notas: formData.get('notas')
              });
              setShowGastoModal(false);
              e.target.reset();
            }} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Nombre</label>
                <input type="text" name="nombre" required className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Categoría</label>
                <select name="categoria" required className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white">
                  <option value="Alquiler">Alquiler</option>
                  <option value="Suscripciones">Suscripciones</option>
                  <option value="Ads">Ads</option>
                  <option value="Estudio">Estudio</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Servicios">Servicios</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Importe (€)</label>
                <input type="number" step="0.01" name="importe" required className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Frecuencia</label>
                <select name="frecuencia" required className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white">
                  <option value="Mensual">Mensual</option>
                  <option value="Semanal">Semanal</option>
                  <option value="Trimestral">Trimestral</option>
                  <option value="Anual">Anual</option>
                  <option value="Puntual">Puntual</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Día de vencimiento (1-31)</label>
                <input type="number" min="1" max="31" name="dia_vencimiento" defaultValue="1" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Notas (opcional)</label>
                <textarea name="notas" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white" rows="2"></textarea>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowGastoModal(false)} className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white">
                  Cancelar
                </button>
                <button type="submit" disabled={createGastoMutation.isPending} className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-xl text-white">
                  {createGastoMutation.isPending ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AdminLayout>
  );
}