import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  Wallet,
  Calendar,
  Plus,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Building2,
  Sparkles
} from "lucide-react";
import { format, startOfMonth, endOfMonth, parseISO, addMonths, subMonths } from "date-fns";
import { es } from "date-fns/locale";

export default function Accounting() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showGastoModal, setShowGastoModal] = useState(false);
  const [showDistribution, setShowDistribution] = useState(false);
  
  const queryClient = useQueryClient();

  const start = startOfMonth(selectedDate);
  const end = endOfMonth(selectedDate);

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
      const calculatedData = {
        ...data,
        amount: amount,
        sueldo_porcentaje: 35,
        sueldo_monto_calculado: amount * 0.35,
        negocio_porcentaje: 40,
        reinversion_porcentaje: 15,
        ads_porcentaje: 10,
        sueldo_estado: "Sin pagar"
      };
      return base44.entities.Income.create(calculatedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['incomes']);
      setShowIncomeModal(false);
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

  const createGastoMutation = useMutation({
    mutationFn: (data) => base44.entities.GastoFijo.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['gastosFijos']);
      setShowGastoModal(false);
    }
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

  // Calculate totals
  const totalIngresos = filteredIncomes.reduce((sum, inc) => sum + (inc.amount || 0), 0);
  
  const sueldoCalculado = filteredIncomes.reduce((sum, inc) => {
    return sum + (inc.amount * 0.35);
  }, 0);
  
  const sueldoPagado = filteredIncomes
    .filter(inc => inc.sueldo_estado === "Pagado")
    .reduce((sum, inc) => sum + (inc.amount * 0.35), 0);
  
  const sueldoPendiente = sueldoCalculado - sueldoPagado;
  const negocioTotal = filteredIncomes.reduce((sum, inc) => sum + (inc.amount * 0.40), 0);
  const reinversionTotal = filteredIncomes.reduce((sum, inc) => sum + (inc.amount * 0.15), 0);
  const adsTotal = filteredIncomes.reduce((sum, inc) => sum + (inc.amount * 0.10), 0);

  const totalGastosFijos = gastosFijos.reduce((sum, g) => sum + (g.importe || 0), 0);
  const gastosPagados = gastosFijos.filter(g => g.estado === "Pagado").reduce((sum, g) => sum + g.importe, 0);
  const gastosPendientes = totalGastosFijos - gastosPagados;

  // Toggle sueldo pagado
  const toggleSueldoPagado = async (income) => {
    const nuevoEstado = income.sueldo_estado === "Pagado" ? "Sin pagar" : "Pagado";
    const montoSueldo = income.amount * 0.35;

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
        proxima_fecha_pago: gasto.frecuencia !== "Puntual" 
          ? calcularProximaFecha(new Date(), gasto.frecuencia)
          : null
      }
    });
  };

  return (
    <AdminLayout activePage="FinanceDashboard">
      <div className="min-h-screen bg-[#0a0a0b]">
        {/* Header con selector de mes */}
        <div className="sticky top-0 z-20 bg-[#0a0a0b]/95 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Finanzas</h1>
                <p className="text-sm text-gray-500">Prod. by Weber</p>
              </div>
              
              <button
                onClick={() => setShowIncomeModal(true)}
                className="w-10 h-10 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center transition-colors"
              >
                <Plus className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Month selector */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSelectedDate(subMonths(selectedDate, 1))}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
              
              <div className="text-center">
                <div className="text-sm text-gray-400">
                  {format(selectedDate, 'MMMM yyyy', { locale: es })}
                </div>
              </div>
              
              <button
                onClick={() => setSelectedDate(addMonths(selectedDate, 1))}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
          {/* Balance Card - Estilo Revolut */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-emerald-100 text-sm font-medium">Balance del mes</span>
              <Wallet className="w-5 h-5 text-emerald-100" />
            </div>
            <div className="text-4xl font-bold text-white mb-1">
              {totalIngresos.toFixed(2)}€
            </div>
            <div className="text-emerald-100 text-sm">
              {filteredIncomes.length} ingresos registrados
            </div>
          </motion.div>

          {/* Distribution Cards */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#111113] rounded-2xl p-4 border border-white/5"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-xs text-gray-400">Sueldo Personal</span>
              </div>
              <div className="text-xl font-bold text-white mb-1">{sueldoPagado.toFixed(0)}€</div>
              <div className="text-xs text-gray-500">de {sueldoCalculado.toFixed(0)}€ (35%)</div>
              {sueldoPendiente > 0 && (
                <div className="mt-2 text-xs text-orange-400">Pendiente: {sueldoPendiente.toFixed(0)}€</div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-[#111113] rounded-2xl p-4 border border-white/5"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-xs text-gray-400">Negocio</span>
              </div>
              <div className="text-xl font-bold text-white mb-1">{negocioTotal.toFixed(0)}€</div>
              <div className="text-xs text-gray-500">40% operativa</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#111113] rounded-2xl p-4 border border-white/5"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-orange-400" />
                </div>
                <span className="text-xs text-gray-400">Reinversión</span>
              </div>
              <div className="text-xl font-bold text-white mb-1">{reinversionTotal.toFixed(0)}€</div>
              <div className="text-xs text-gray-500">15% equipos</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-[#111113] rounded-2xl p-4 border border-white/5"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-pink-400" />
                </div>
                <span className="text-xs text-gray-400">Ads</span>
              </div>
              <div className="text-xl font-bold text-white mb-1">{adsTotal.toFixed(0)}€</div>
              <div className="text-xs text-gray-500">10% visibilidad</div>
            </motion.div>
          </div>

          {/* Gastos Fijos Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#111113] rounded-2xl border border-white/5 overflow-hidden"
          >
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Gastos Fijos</h3>
                  <p className="text-xs text-gray-500">{gastosFijos.length} gastos activos</p>
                </div>
              </div>
              <button
                onClick={() => setShowGastoModal(true)}
                className="w-8 h-8 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center transition-colors"
              >
                <Plus className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-400">Total mensual</span>
                <span className="text-lg font-bold text-white">{totalGastosFijos.toFixed(2)}€</span>
              </div>
              
              {gastosFijos.slice(0, 3).map((gasto) => (
                <div key={gasto.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{gasto.nombre}</div>
                    <div className="text-xs text-gray-500">{gasto.categoria}</div>
                  </div>
                  <div className="text-right mr-3">
                    <div className="text-sm font-bold text-white">{gasto.importe.toFixed(0)}€</div>
                  </div>
                  <button
                    onClick={() => marcarGastoPagado(gasto)}
                    disabled={gasto.estado === "Pagado"}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      gasto.estado === "Pagado"
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {gastosFijos.length === 0 && (
                <div className="text-center py-6 text-gray-500 text-sm">
                  No hay gastos fijos registrados
                </div>
              )}
            </div>
          </motion.div>

          {/* Transactions List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-[#111113] rounded-2xl border border-white/5 overflow-hidden"
          >
            <div className="p-4 border-b border-white/5">
              <h3 className="font-semibold text-white">Ingresos del mes</h3>
              <p className="text-xs text-gray-500">Toca un ingreso para marcar el sueldo como pagado</p>
            </div>

            <div className="divide-y divide-white/5">
              {filteredIncomes.map((income) => {
                const montoSueldo = income.amount * 0.35;
                const isPaid = income.sueldo_estado === "Pagado";
                
                return (
                  <div
                    key={income.id}
                    onClick={() => toggleSueldoPagado(income)}
                    className="p-4 hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full ${isPaid ? 'bg-emerald-400' : 'bg-orange-400'}`} />
                          <span className="font-semibold text-white">{income.client_name}</span>
                        </div>
                        <div className="text-sm text-gray-400">{income.concept}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          {format(parseISO(income.date), 'dd MMM yyyy', { locale: es })} · {income.payment_method}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">+{income.amount.toFixed(2)}€</div>
                        <div className={`text-xs font-medium ${isPaid ? 'text-emerald-400' : 'text-orange-400'}`}>
                          {isPaid ? '✓ Sueldo pagado' : `Sueldo: ${montoSueldo.toFixed(0)}€`}
                        </div>
                      </div>
                    </div>

                    {/* Distribution mini */}
                    <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-white/5">
                      <div className="text-center">
                        <div className="text-xs text-purple-400 font-medium">{(income.amount * 0.35).toFixed(0)}€</div>
                        <div className="text-[10px] text-gray-600">Sueldo</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-blue-400 font-medium">{(income.amount * 0.40).toFixed(0)}€</div>
                        <div className="text-[10px] text-gray-600">Negocio</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-orange-400 font-medium">{(income.amount * 0.15).toFixed(0)}€</div>
                        <div className="text-[10px] text-gray-600">Reinv.</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-pink-400 font-medium">{(income.amount * 0.10).toFixed(0)}€</div>
                        <div className="text-[10px] text-gray-600">Ads</div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredIncomes.length === 0 && (
                <div className="p-12 text-center text-gray-500 text-sm">
                  No hay ingresos en {format(selectedDate, 'MMMM', { locale: es })}
                </div>
              )}
            </div>
          </motion.div>

          {/* Historial Personal */}
          {personalLedger.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-2xl border border-purple-500/20 p-4"
            >
              <h3 className="font-semibold text-white mb-3">Historial de Pagos Personal</h3>
              <div className="space-y-2">
                {personalLedger.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      {format(parseISO(entry.fecha), 'dd MMM', { locale: es })} · {entry.metodo}
                    </span>
                    <span className="text-emerald-400 font-medium">+{entry.monto.toFixed(2)}€</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Income Modal */}
        <AnimatePresence>
          {showIncomeModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center">
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className="bg-[#111113] rounded-t-3xl md:rounded-3xl border-t md:border border-white/10 p-6 w-full md:max-w-md md:mx-4 max-h-[90vh] overflow-y-auto"
              >
                <h3 className="text-xl font-bold text-white mb-6">Nuevo Ingreso</h3>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  createIncomeMutation.mutate({
                    date: formData.get('date'),
                    client_name: formData.get('client_name'),
                    concept: formData.get('concept'),
                    amount: formData.get('amount'),
                    payment_method: formData.get('payment_method'),
                    notes: formData.get('notes')
                  });
                }} className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Fecha</label>
                    <input type="date" name="date" required defaultValue={format(new Date(), 'yyyy-MM-dd')} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Cliente</label>
                    <input type="text" name="client_name" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500" placeholder="Nombre del cliente" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Concepto</label>
                    <input type="text" name="concept" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500" placeholder="Producción, sesión, etc." />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Monto (€)</label>
                    <input type="number" step="0.01" name="amount" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-2xl font-bold focus:outline-none focus:border-emerald-500" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Método de pago</label>
                    <select name="payment_method" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500">
                      <option value="Efectivo">Efectivo</option>
                      <option value="Wise">Wise</option>
                      <option value="Transferencia">Transferencia</option>
                      <option value="Plataforma online">Plataforma online</option>
                      <option value="Bizum">Bizum</option>
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
        </AnimatePresence>

        {/* Gasto Modal */}
        <AnimatePresence>
          {showGastoModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center">
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className="bg-[#111113] rounded-t-3xl md:rounded-3xl border-t md:border border-white/10 p-6 w-full md:max-w-md md:mx-4 max-h-[90vh] overflow-y-auto"
              >
                <h3 className="text-xl font-bold text-white mb-6">Nuevo Gasto Fijo</h3>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const frecuencia = formData.get('frecuencia');
                  const diaVenc = parseInt(formData.get('dia_vencimiento') || '1');
                  const now = new Date();
                  const proximaFecha = new Date(now.getFullYear(), now.getMonth(), diaVenc);
                  if (proximaFecha < now) proximaFecha.setMonth(proximaFecha.getMonth() + 1);
                  
                  createGastoMutation.mutate({
                    nombre: formData.get('nombre'),
                    categoria: formData.get('categoria'),
                    importe: parseFloat(formData.get('importe')),
                    frecuencia: frecuencia,
                    dia_vencimiento: frecuencia === 'Mensual' ? diaVenc : null,
                    proxima_fecha_pago: format(proximaFecha, 'yyyy-MM-dd'),
                    estado: "Pendiente",
                    notas: formData.get('notas')
                  });
                }} className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Nombre</label>
                    <input type="text" name="nombre" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500" placeholder="Alquiler, hosting, etc." />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Categoría</label>
                    <select name="categoria" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500">
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
                    <label className="text-sm text-gray-400 mb-2 block">Importe (€)</label>
                    <input type="number" step="0.01" name="importe" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-2xl font-bold focus:outline-none focus:border-purple-500" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Frecuencia</label>
                    <select name="frecuencia" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500">
                      <option value="Mensual">Mensual</option>
                      <option value="Semanal">Semanal</option>
                      <option value="Trimestral">Trimestral</option>
                      <option value="Anual">Anual</option>
                      <option value="Puntual">Puntual</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Día de vencimiento</label>
                    <input type="number" min="1" max="31" name="dia_vencimiento" defaultValue="1" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500" />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setShowGastoModal(false)} className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white font-medium transition-colors">
                      Cancelar
                    </button>
                    <button type="submit" disabled={createGastoMutation.isPending} className="flex-1 px-4 py-3 bg-purple-500 hover:bg-purple-600 rounded-xl text-white font-medium transition-colors">
                      {createGastoMutation.isPending ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}