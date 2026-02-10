import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from "framer-motion";
import {
  DollarSign,
  Wallet,
  AlertCircle,
  Plus,
  Check,
  Clock,
  TrendingUp,
  CreditCard,
  Calendar,
  Building2,
  Zap
} from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, parseISO, isAfter } from "date-fns";
import { es } from "date-fns/locale";

export default function Accounting() {
  const [dateRange, setDateRange] = useState("month");
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showGastoModal, setShowGastoModal] = useState(false);
  
  const queryClient = useQueryClient();

  const getDateRange = () => {
    const now = new Date();
    if (dateRange === "today") return { start: startOfDay(now), end: now };
    if (dateRange === "week") return { start: startOfWeek(now, { locale: es }), end: endOfWeek(now, { locale: es }) };
    if (dateRange === "month") return { start: startOfMonth(now), end: endOfMonth(now) };
    return { start: startOfMonth(now), end: endOfMonth(now) };
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
      const amount = parseFloat(data.amount);
      return base44.entities.Income.create({
        ...data,
        amount,
        sueldo_porcentaje: 35,
        sueldo_monto_calculado: amount * 0.35,
        sueldo_estado: "Sin pagar"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['incomes']);
      setShowIncomeModal(false);
    }
  });

  const createGastoMutation = useMutation({
    mutationFn: (data) => base44.entities.GastoFijo.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['gastosFijos']);
      setShowGastoModal(false);
    }
  });

  const updateIncomeMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Income.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['incomes', 'personalLedger'])
  });

  const createLedgerMutation = useMutation({
    mutationFn: (data) => base44.entities.PersonalLedger.create(data),
    onSuccess: () => queryClient.invalidateQueries(['personalLedger'])
  });

  const updateGastoMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.GastoFijo.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['gastosFijos'])
  });

  // Filter by date range
  const filteredIncomes = incomes.filter(income => {
    const incomeDate = parseISO(income.date);
    return incomeDate >= start && incomeDate <= end;
  });

  // Calculations
  const totalFacturacion = filteredIncomes.reduce((s, i) => s + i.amount, 0);
  const sueldoCalculado = filteredIncomes.reduce((s, i) => s + (i.amount * 0.35), 0);
  const sueldoPagado = filteredIncomes.filter(i => i.sueldo_estado === "Pagado").reduce((s, i) => s + (i.amount * 0.35), 0);
  const sueldoPendiente = sueldoCalculado - sueldoPagado;
  
  // Distribución automática
  const negocioCalculado = filteredIncomes.reduce((s, i) => s + (i.amount * 0.40), 0);
  const reinversionCalculada = filteredIncomes.reduce((s, i) => s + (i.amount * 0.15), 0);
  const adsCalculado = filteredIncomes.reduce((s, i) => s + (i.amount * 0.10), 0);
  
  const totalGastosFijos = gastosFijos.reduce((s, g) => s + g.importe, 0);
  const gastosPagados = gastosFijos.filter(g => g.estado === "Pagado").reduce((s, g) => s + g.importe, 0);
  const porcentajePagado = totalGastosFijos > 0 ? (gastosPagados / totalGastosFijos) * 100 : 0;

  const gastosVencidos = gastosFijos.filter(g => {
    if (g.estado === "Pagado" || !g.proxima_fecha_pago) return false;
    return isAfter(new Date(), parseISO(g.proxima_fecha_pago));
  }).length;

  const ingresosSinPagar = filteredIncomes.filter(i => i.sueldo_estado === "Sin pagar").length;
  const alertasTotal = gastosVencidos + ingresosSinPagar;

  const toggleSueldoPagado = async (income) => {
    const nuevo = income.sueldo_estado === "Pagado" ? "Sin pagar" : "Pagado";
    const monto = income.amount * 0.35;

    await updateIncomeMutation.mutateAsync({
      id: income.id,
      data: {
        sueldo_estado: nuevo,
        sueldo_fecha_pago: nuevo === "Pagado" ? format(new Date(), 'yyyy-MM-dd') : null,
        sueldo_metodo_pago: nuevo === "Pagado" ? "Revolut" : null
      }
    });

    if (nuevo === "Pagado") {
      await createLedgerMutation.mutateAsync({
        fecha: format(new Date(), 'yyyy-MM-dd'),
        referencia_ingreso_id: income.id,
        monto,
        metodo: "Revolut",
        tipo: "Abono",
        nota: `Sueldo de ${income.client_name}`
      });
    }
  };

  const marcarGastoPagado = async (gasto) => {
    const calcularProximaFecha = (fecha, frecuencia) => {
      const base = new Date(fecha);
      if (frecuencia === "Mensual") base.setMonth(base.getMonth() + 1);
      else if (frecuencia === "Semanal") base.setDate(base.getDate() + 7);
      else if (frecuencia === "Trimestral") base.setMonth(base.getMonth() + 3);
      else if (frecuencia === "Anual") base.setFullYear(base.getFullYear() + 1);
      return format(base, 'yyyy-MM-dd');
    };

    await updateGastoMutation.mutateAsync({
      id: gasto.id,
      data: {
        estado: "Pagado",
        ultima_fecha_pagado: format(new Date(), 'yyyy-MM-dd'),
        proxima_fecha_pago: gasto.frecuencia !== "Puntual" ? calcularProximaFecha(new Date(), gasto.frecuencia) : null
      }
    });
  };

  const paymentMethodIcons = {
    'Efectivo': '💵',
    'Wise': '🌐',
    'Transferencia': '🏦',
    'Plataforma online': '💳',
    'Bizum': '📱'
  };

  return (
    <AdminLayout activePage="FinanceDashboard">
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0b] via-[#0d0d0f] to-[#0a0a0b]">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-[#0a0a0b]/80 backdrop-blur-2xl border-b border-white/5">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Panel Financiero</h1>
                <p className="text-sm text-gray-500">Prod. by Weber</p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex bg-white/5 rounded-xl p-1">
                  {['today', 'week', 'month'].map((range) => (
                    <button
                      key={range}
                      onClick={() => setDateRange(range)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        dateRange === range
                          ? 'bg-emerald-500 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {range === 'today' ? 'Hoy' : range === 'week' ? 'Semana' : 'Mes'}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowIncomeModal(true)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-white font-medium flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Ingreso</span>
                </button>

                <button
                  onClick={() => setShowGastoModal(true)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Gasto</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-transparent border border-emerald-500/30 rounded-2xl p-6 hover:border-emerald-500/50 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-emerald-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-sm text-emerald-300 mb-1">Facturación</div>
              <div className="text-3xl font-bold text-white mb-1">{totalFacturacion.toLocaleString('es-ES')}€</div>
              <div className="text-xs text-gray-500">{filteredIncomes.length} ingresos</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-500/20 via-blue-500/10 to-transparent border border-blue-500/30 rounded-2xl p-6 hover:border-blue-500/50 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <div className="text-sm text-blue-300 mb-1">Gastos Fijos</div>
              <div className="text-3xl font-bold text-white mb-1">{totalGastosFijos.toLocaleString('es-ES')}€</div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600" style={{ width: `${porcentajePagado}%` }} />
                </div>
                <span className="text-xs text-gray-500">{porcentajePagado.toFixed(0)}%</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-purple-500/20 via-purple-500/10 to-transparent border border-purple-500/30 rounded-2xl p-6 hover:border-purple-500/50 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-purple-400" />
                </div>
              </div>
              <div className="text-sm text-purple-300 mb-1">Tu Sueldo</div>
              <div className="text-3xl font-bold text-white mb-1">{sueldoPagado.toLocaleString('es-ES')}€</div>
              <div className="text-xs text-gray-500">
                Pendiente: <span className="text-orange-400 font-medium">{sueldoPendiente.toLocaleString('es-ES')}€</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`bg-gradient-to-br rounded-2xl p-6 transition-all cursor-pointer ${
                alertasTotal > 0
                  ? 'from-orange-500/20 via-orange-500/10 to-transparent border border-orange-500/30 hover:border-orange-500/50'
                  : 'from-white/5 via-white/5 to-transparent border border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  alertasTotal > 0 ? 'bg-orange-500/20' : 'bg-white/10'
                }`}>
                  <AlertCircle className={`w-6 h-6 ${alertasTotal > 0 ? 'text-orange-400' : 'text-gray-500'}`} />
                </div>
              </div>
              <div className="text-sm text-gray-400 mb-1">Alertas</div>
              <div className="text-3xl font-bold text-white mb-1">{alertasTotal}</div>
              <div className="text-xs text-gray-500">
                {gastosVencidos > 0 && `${gastosVencidos} gastos vencidos`}
                {gastosVencidos > 0 && ingresosSinPagar > 0 && ' · '}
                {ingresosSinPagar > 0 && `${ingresosSinPagar} sueldos pendientes`}
              </div>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Ingresos */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <h2 className="text-xl font-bold text-white">Ingresos</h2>
                  <p className="text-sm text-gray-500 mt-1">Toca un ingreso para marcar tu sueldo como pagado</p>
                </div>

                <div className="divide-y divide-white/5">
                  {filteredIncomes.map((income) => {
                    const montoSueldo = income.amount * 0.35;
                    const montoNegocio = income.amount * 0.40;
                    const montoReinversion = income.amount * 0.15;
                    const montoAds = income.amount * 0.10;
                    const isPaid = income.sueldo_estado === "Pagado";
                    
                    return (
                      <motion.div
                        key={income.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">{paymentMethodIcons[income.payment_method] || '💳'}</span>
                              <div className="flex-1">
                                <div className="font-semibold text-white text-lg">{income.client_name}</div>
                                <div className="text-sm text-gray-400">{income.concept || 'Sin concepto'}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-10">
                              <div className="text-xs text-gray-600 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(parseISO(income.date), 'dd MMM yyyy', { locale: es })}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-2xl font-bold text-emerald-400">+{income.amount.toLocaleString('es-ES')}€</div>
                          </div>
                        </div>

                        {/* Distribución automática */}
                        <div className="ml-10 p-3 bg-white/5 rounded-xl">
                          <div className="text-xs text-gray-500 mb-2">Distribución automática:</div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-purple-400">👤 Sueldo (35%)</span>
                              <span className="text-white font-medium">{montoSueldo.toLocaleString('es-ES')}€</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-blue-400">🏢 Negocio (40%)</span>
                              <span className="text-white font-medium">{montoNegocio.toLocaleString('es-ES')}€</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-amber-400">📈 Reinversión (15%)</span>
                              <span className="text-white font-medium">{montoReinversion.toLocaleString('es-ES')}€</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-pink-400">⚡ Ads (10%)</span>
                              <span className="text-white font-medium">{montoAds.toLocaleString('es-ES')}€</span>
                            </div>
                          </div>

                          <div className="mt-3 pt-3 border-t border-white/10">
                            <button
                              onClick={() => toggleSueldoPagado(income)}
                              className={`w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                                isPaid
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30'
                              }`}
                            >
                              {isPaid ? (
                                <>
                                  <Check className="w-4 h-4" />
                                  Sueldo pagado
                                </>
                              ) : (
                                <>
                                  <Clock className="w-4 h-4" />
                                  Marcar sueldo como pagado
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {filteredIncomes.length === 0 && (
                    <div className="p-12 text-center">
                      <div className="text-gray-500 mb-2">Sin ingresos en este período</div>
                      <button
                        onClick={() => setShowIncomeModal(true)}
                        className="text-emerald-400 text-sm hover:text-emerald-300"
                      >
                        Registrar primer ingreso
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Gastos Fijos */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <h2 className="text-xl font-bold text-white">Gastos Fijos</h2>
                  <p className="text-sm text-gray-500 mt-1">Checklist financiera mensual</p>
                </div>

                <div className="p-4 space-y-3">
                  {gastosFijos.map((gasto) => {
                    const isVencido = gasto.proxima_fecha_pago && isAfter(new Date(), parseISO(gasto.proxima_fecha_pago)) && gasto.estado !== "Pagado";
                    const isPagado = gasto.estado === "Pagado";
                    
                    return (
                      <div
                        key={gasto.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isVencido 
                            ? 'bg-red-500/10 border-red-500/30'
                            : isPagado
                            ? 'bg-emerald-500/10 border-emerald-500/30'
                            : 'bg-white/5 border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="font-semibold text-white mb-1">{gasto.nombre}</div>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span>{gasto.categoria}</span>
                              <span>·</span>
                              <span>{gasto.frecuencia}</span>
                              {gasto.proxima_fecha_pago && (
                                <>
                                  <span>·</span>
                                  <span>Vence: {format(parseISO(gasto.proxima_fecha_pago), 'dd MMM', { locale: es })}</span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="text-right flex items-center gap-3">
                            <div className="text-lg font-bold text-white">{gasto.importe.toLocaleString('es-ES')}€</div>
                            <button
                              onClick={() => marcarGastoPagado(gasto)}
                              disabled={isPagado}
                              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                isPagado
                                  ? 'bg-emerald-500/20 text-emerald-400 cursor-default'
                                  : 'bg-white/10 text-white hover:bg-emerald-500/20 hover:text-emerald-400'
                              }`}
                            >
                              <Check className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {gastosFijos.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Sin gastos fijos registrados
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar - Distribución */}
            <div className="space-y-4">
              {/* Tu Sueldo */}
              <div className="bg-gradient-to-br from-purple-500/20 via-purple-500/10 to-transparent border border-purple-500/30 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Tu Sueldo (35%)</h3>
                    <p className="text-xs text-gray-500">Personal · Revolut</p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Calculado</span>
                    <span className="text-lg font-bold text-white">{sueldoCalculado.toLocaleString('es-ES')}€</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Pagado</span>
                    <span className="text-lg font-bold text-emerald-400">{sueldoPagado.toLocaleString('es-ES')}€</span>
                  </div>
                  <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                    <span className="text-xs text-gray-400">Pendiente</span>
                    <span className="text-lg font-bold text-orange-400">{sueldoPendiente.toLocaleString('es-ES')}€</span>
                  </div>
                </div>

                {personalLedger.length > 0 && (
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="text-xs text-gray-400 mb-2 font-medium">Últimos pagos</div>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {personalLedger.slice(0, 5).map((entry) => (
                        <div key={entry.id} className="flex justify-between items-center text-xs">
                          <div className="text-gray-400">
                            {format(parseISO(entry.fecha), 'dd MMM', { locale: es })}
                          </div>
                          <div className="text-emerald-400 font-medium">+{entry.monto.toLocaleString('es-ES')}€</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Negocio */}
              <div className="bg-gradient-to-br from-blue-500/20 via-blue-500/10 to-transparent border border-blue-500/30 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Negocio (40%)</h3>
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-400">{negocioCalculado.toLocaleString('es-ES')}€</div>
                <p className="text-xs text-gray-500 mt-1">Operativo · Gastos fijos</p>
              </div>

              {/* Reinversión */}
              <div className="bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/30 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Reinversión (15%)</h3>
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-amber-400">{reinversionCalculada.toLocaleString('es-ES')}€</div>
                <p className="text-xs text-gray-500 mt-1">Crecimiento · Equipamiento</p>
              </div>

              {/* Ads */}
              <div className="bg-gradient-to-br from-pink-500/20 via-pink-500/10 to-transparent border border-pink-500/30 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center">
                      <Zap className="w-4 h-4 text-pink-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Ads (10%)</h3>
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-pink-400">{adsCalculado.toLocaleString('es-ES')}€</div>
                <p className="text-xs text-gray-500 mt-1">Marketing · Publicidad</p>
              </div>
            </div>
          </div>
        </div>

        {/* Income Modal */}
        {showIncomeModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#111113] rounded-t-3xl md:rounded-2xl border border-white/20 p-6 w-full md:max-w-md max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-bold text-white mb-6">Registrar Ingreso</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                createIncomeMutation.mutate({
                  date: fd.get('date'),
                  client_name: fd.get('client_name'),
                  concept: fd.get('concept'),
                  amount: fd.get('amount'),
                  payment_method: fd.get('payment_method'),
                  notes: fd.get('notes')
                });
              }} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Fecha</label>
                  <input type="date" name="date" required defaultValue={format(new Date(), 'yyyy-MM-dd')} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Cliente / Proyecto</label>
                  <input type="text" name="client_name" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500" placeholder="Nombre del cliente" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Concepto</label>
                  <input type="text" name="concept" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500" placeholder="Reserva, sesión, pago final..." />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Monto total</label>
                  <input type="number" step="0.01" name="amount" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-2xl font-bold focus:outline-none focus:border-emerald-500" placeholder="0.00" />
                  <p className="text-xs text-gray-600 mt-2">Tu sueldo será el 35% automáticamente</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Método de pago</label>
                  <select name="payment_method" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500">
                    <option value="Efectivo">💵 Efectivo</option>
                    <option value="Wise">🌐 Wise</option>
                    <option value="Transferencia">🏦 Transferencia</option>
                    <option value="Plataforma online">💳 Plataforma online</option>
                    <option value="Bizum">📱 Bizum</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Notas (opcional)</label>
                  <textarea name="notes" rows="2" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500" placeholder="Información adicional"></textarea>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowIncomeModal(false)} className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white font-medium transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" disabled={createIncomeMutation.isPending} className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-white font-medium transition-colors">
                    {createIncomeMutation.isPending ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Gasto Modal */}
        {showGastoModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#111113] rounded-t-3xl md:rounded-2xl border border-white/20 p-6 w-full md:max-w-md max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-bold text-white mb-6">Registrar Gasto Fijo</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                const frecuencia = fd.get('frecuencia');
                const diaVenc = parseInt(fd.get('dia_vencimiento') || '1');
                const now = new Date();
                const proximaFecha = new Date(now.getFullYear(), now.getMonth(), diaVenc);
                if (proximaFecha < now) proximaFecha.setMonth(proximaFecha.getMonth() + 1);
                
                createGastoMutation.mutate({
                  nombre: fd.get('nombre'),
                  categoria: fd.get('categoria'),
                  importe: parseFloat(fd.get('importe')),
                  frecuencia,
                  dia_vencimiento: frecuencia === 'Mensual' ? diaVenc : null,
                  proxima_fecha_pago: format(proximaFecha, 'yyyy-MM-dd'),
                  estado: "Pendiente",
                  notas: fd.get('notas')
                });
              }} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Nombre del gasto</label>
                  <input type="text" name="nombre" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500" placeholder="Alquiler, hosting..." />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Categoría</label>
                  <select name="categoria" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500">
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
                  <label className="text-sm text-gray-400 mb-2 block">Importe mensual</label>
                  <input type="number" step="0.01" name="importe" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-2xl font-bold focus:outline-none focus:border-blue-500" placeholder="0.00" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Frecuencia</label>
                  <select name="frecuencia" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500">
                    <option value="Mensual">Mensual</option>
                    <option value="Trimestral">Trimestral</option>
                    <option value="Anual">Anual</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Día de vencimiento</label>
                  <input type="number" min="1" max="31" name="dia_vencimiento" defaultValue="1" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowGastoModal(false)} className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white font-medium transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" disabled={createGastoMutation.isPending} className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl text-white font-medium transition-colors">
                    {createGastoMutation.isPending ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}