import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  Check,
  ChevronLeft,
  ChevronRight,
  Building2,
  User,
  ShoppingBag,
  Zap,
  Home
} from "lucide-react";
import { format, startOfMonth, endOfMonth, parseISO, addMonths, subMonths } from "date-fns";
import { es } from "date-fns/locale";

export default function Accounting() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(null);
  
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

  const { data: gastosUnicos = [] } = useQuery({
    queryKey: ['gastosUnicos'],
    queryFn: () => base44.entities.GastoUnico.list('-fecha')
  });

  const { data: gastosPersonalesFijos = [] } = useQuery({
    queryKey: ['gastosPersonalesFijos'],
    queryFn: () => base44.entities.GastoPersonalFijo.list()
  });

  const { data: gastosPersonalesUnicos = [] } = useQuery({
    queryKey: ['gastosPersonalesUnicos'],
    queryFn: () => base44.entities.GastoPersonalUnico.list('-fecha')
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
      setShowModal(null);
    }
  });

  const createGastoFijoMutation = useMutation({
    mutationFn: (data) => base44.entities.GastoFijo.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['gastosFijos']);
      setShowModal(null);
    }
  });

  const createGastoUnicoMutation = useMutation({
    mutationFn: (data) => base44.entities.GastoUnico.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['gastosUnicos']);
      setShowModal(null);
    }
  });

  const createGastoPersonalFijoMutation = useMutation({
    mutationFn: (data) => base44.entities.GastoPersonalFijo.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['gastosPersonalesFijos']);
      setShowModal(null);
    }
  });

  const createGastoPersonalUnicoMutation = useMutation({
    mutationFn: (data) => base44.entities.GastoPersonalUnico.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['gastosPersonalesUnicos']);
      setShowModal(null);
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

  // Filter by month
  const filteredIncomes = incomes.filter(i => {
    const d = parseISO(i.date);
    return d >= start && d <= end;
  });

  const filteredGastosUnicos = gastosUnicos.filter(g => {
    const d = parseISO(g.fecha);
    return d >= start && d <= end;
  });

  const filteredGastosPersonalesUnicos = gastosPersonalesUnicos.filter(g => {
    const d = parseISO(g.fecha);
    return d >= start && d <= end;
  });

  // Calculations
  const totalIngresos = filteredIncomes.reduce((s, i) => s + i.amount, 0);
  const sueldoCalculado = filteredIncomes.reduce((s, i) => s + (i.amount * 0.35), 0);
  const sueldoPagado = filteredIncomes.filter(i => i.sueldo_estado === "Pagado").reduce((s, i) => s + (i.amount * 0.35), 0);
  const sueldoPendiente = sueldoCalculado - sueldoPagado;

  const totalGastosFijos = gastosFijos.reduce((s, g) => s + g.importe, 0);
  const totalGastosUnicos = filteredGastosUnicos.reduce((s, g) => s + g.importe, 0);
  const totalGastosPersonalesFijos = gastosPersonalesFijos.reduce((s, g) => s + g.importe, 0);
  const totalGastosPersonalesUnicos = filteredGastosPersonalesUnicos.reduce((s, g) => s + g.importe, 0);

  const balance = totalIngresos - totalGastosFijos - totalGastosUnicos;
  const balancePersonal = sueldoPagado - totalGastosPersonalesFijos - totalGastosPersonalesUnicos;

  const toggleSueldoPagado = async (income) => {
    const nuevo = income.sueldo_estado === "Pagado" ? "Sin pagar" : "Pagado";
    const monto = income.amount * 0.35;

    await updateIncomeMutation.mutateAsync({
      id: income.id,
      data: {
        sueldo_estado: nuevo,
        sueldo_fecha_pago: nuevo === "Pagado" ? format(new Date(), 'yyyy-MM-dd') : null
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

  return (
    <AdminLayout activePage="FinanceDashboard">
      <div className="min-h-screen bg-[#0a0a0b]">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-[#0a0a0b]/95 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-[1600px] mx-auto px-3 md:px-6 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white">Contabilidad Pro</h1>
                <p className="text-xs text-gray-600">Weber Studio</p>
              </div>
              
              <div className="flex items-center gap-2">
                <button onClick={() => setSelectedDate(subMonths(selectedDate, 1))} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center">
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
                <div className="text-sm font-medium text-white min-w-[100px] text-center">
                  {format(selectedDate, 'MMM yyyy', { locale: es })}
                </div>
                <button onClick={() => setSelectedDate(addMonths(selectedDate, 1))} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center">
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-3 md:px-6 py-4 space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-xl p-3">
              <div className="text-xs text-emerald-400 mb-1">Ingresos</div>
              <div className="text-xl md:text-2xl font-bold text-white">{totalIngresos.toFixed(0)}€</div>
              <div className="text-xs text-gray-600">{filteredIncomes.length} movimientos</div>
            </div>
            
            <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-xl p-3">
              <div className="text-xs text-red-400 mb-1">Gastos Negocio</div>
              <div className="text-xl md:text-2xl font-bold text-white">{(totalGastosFijos + totalGastosUnicos).toFixed(0)}€</div>
              <div className="text-xs text-gray-600">Fijos + Únicos</div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-3">
              <div className="text-xs text-blue-400 mb-1">Balance</div>
              <div className="text-xl md:text-2xl font-bold text-white">{balance.toFixed(0)}€</div>
              <div className="text-xs text-gray-600">Este mes</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-3">
              <div className="text-xs text-purple-400 mb-1">Sueldo Santi</div>
              <div className="text-xl md:text-2xl font-bold text-white">{sueldoPagado.toFixed(0)}€</div>
              <div className="text-xs text-gray-600">de {sueldoCalculado.toFixed(0)}€</div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-4">
              {/* Ingresos */}
              <div className="bg-[#111113] rounded-xl border border-white/5">
                <div className="p-3 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-semibold text-white">Ingresos</h3>
                  </div>
                  <button onClick={() => setShowModal('income')} className="w-7 h-7 bg-emerald-500 hover:bg-emerald-600 rounded-lg flex items-center justify-center">
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                </div>
                <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
                  {filteredIncomes.map(inc => (
                    <div key={inc.id} onClick={() => toggleSueldoPagado(inc)} className="flex items-center justify-between p-2 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{inc.client_name}</div>
                        <div className="text-xs text-gray-500 truncate">{inc.concept}</div>
                      </div>
                      <div className="text-right ml-2">
                        <div className="text-sm font-bold text-emerald-400">+{inc.amount.toFixed(0)}€</div>
                        <div className="text-xs text-gray-600">{format(parseISO(inc.date), 'dd MMM', { locale: es })}</div>
                      </div>
                      <div className={`ml-2 w-6 h-6 rounded flex items-center justify-center ${inc.sueldo_estado === "Pagado" ? 'bg-emerald-500/20' : 'bg-white/5'}`}>
                        {inc.sueldo_estado === "Pagado" && <Check className="w-3 h-3 text-emerald-400" />}
                      </div>
                    </div>
                  ))}
                  {filteredIncomes.length === 0 && <div className="text-center py-6 text-xs text-gray-600">Sin ingresos</div>}
                </div>
              </div>

              {/* Gastos Fijos Negocio */}
              <div className="bg-[#111113] rounded-xl border border-white/5">
                <div className="p-3 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-semibold text-white">Gastos Fijos</h3>
                    <span className="text-xs text-gray-600">{totalGastosFijos.toFixed(0)}€</span>
                  </div>
                  <button onClick={() => setShowModal('gastoFijo')} className="w-7 h-7 bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center justify-center">
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                </div>
                <div className="p-3 grid grid-cols-2 gap-2">
                  {gastosFijos.slice(0, 4).map(g => (
                    <div key={g.id} className="p-2 bg-white/5 rounded-lg">
                      <div className="text-xs text-gray-400 truncate">{g.nombre}</div>
                      <div className="text-sm font-bold text-white">{g.importe.toFixed(0)}€</div>
                    </div>
                  ))}
                  {gastosFijos.length === 0 && <div className="col-span-2 text-center py-4 text-xs text-gray-600">Sin gastos</div>}
                </div>
              </div>

              {/* Gastos Únicos */}
              <div className="bg-[#111113] rounded-xl border border-white/5">
                <div className="p-3 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-orange-400" />
                    <h3 className="text-sm font-semibold text-white">Gastos Únicos</h3>
                    <span className="text-xs text-gray-600">{totalGastosUnicos.toFixed(0)}€</span>
                  </div>
                  <button onClick={() => setShowModal('gastoUnico')} className="w-7 h-7 bg-orange-500 hover:bg-orange-600 rounded-lg flex items-center justify-center">
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                </div>
                <div className="p-3 space-y-2 max-h-48 overflow-y-auto">
                  {filteredGastosUnicos.map(g => (
                    <div key={g.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white truncate">{g.nombre}</div>
                        <div className="text-xs text-gray-600">{g.categoria}</div>
                      </div>
                      <div className="text-sm font-bold text-red-400">-{g.importe.toFixed(0)}€</div>
                    </div>
                  ))}
                  {filteredGastosUnicos.length === 0 && <div className="text-center py-4 text-xs text-gray-600">Sin gastos</div>}
                </div>
              </div>
            </div>

            {/* Right Column - Personal */}
            <div className="space-y-4">
              {/* Sueldo Santi */}
              <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-semibold text-white">Sueldo Santi</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Calculado (35%)</span>
                    <span className="text-white font-medium">{sueldoCalculado.toFixed(0)}€</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Pagado</span>
                    <span className="text-emerald-400 font-medium">{sueldoPagado.toFixed(0)}€</span>
                  </div>
                  <div className="flex justify-between text-xs pt-2 border-t border-white/10">
                    <span className="text-gray-400">Pendiente</span>
                    <span className="text-orange-400 font-medium">{sueldoPendiente.toFixed(0)}€</span>
                  </div>
                </div>
              </div>

              {/* Gastos Personales Fijos */}
              <div className="bg-[#111113] rounded-xl border border-white/5">
                <div className="p-3 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-pink-400" />
                    <h3 className="text-sm font-semibold text-white">Gastos Fijos Santi</h3>
                  </div>
                  <button onClick={() => setShowModal('gastoPersonalFijo')} className="w-7 h-7 bg-pink-500 hover:bg-pink-600 rounded-lg flex items-center justify-center">
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                </div>
                <div className="p-3 space-y-2">
                  {gastosPersonalesFijos.slice(0, 3).map(g => (
                    <div key={g.id} className="flex justify-between p-2 bg-white/5 rounded-lg">
                      <span className="text-xs text-gray-400 truncate">{g.nombre}</span>
                      <span className="text-xs font-bold text-white">{g.importe.toFixed(0)}€</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-white/10 flex justify-between text-xs">
                    <span className="text-gray-400">Total</span>
                    <span className="text-white font-bold">{totalGastosPersonalesFijos.toFixed(0)}€</span>
                  </div>
                </div>
              </div>

              {/* Gastos Personales Únicos */}
              <div className="bg-[#111113] rounded-xl border border-white/5">
                <div className="p-3 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-yellow-400" />
                    <h3 className="text-sm font-semibold text-white">Gastos Únicos Santi</h3>
                  </div>
                  <button onClick={() => setShowModal('gastoPersonalUnico')} className="w-7 h-7 bg-yellow-500 hover:bg-yellow-600 rounded-lg flex items-center justify-center">
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                </div>
                <div className="p-3 space-y-2 max-h-48 overflow-y-auto">
                  {filteredGastosPersonalesUnicos.slice(0, 5).map(g => (
                    <div key={g.id} className="flex justify-between p-2 bg-white/5 rounded-lg">
                      <span className="text-xs text-gray-400 truncate">{g.nombre}</span>
                      <span className="text-xs font-bold text-red-400">-{g.importe.toFixed(0)}€</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-white/10 flex justify-between text-xs">
                    <span className="text-gray-400">Total</span>
                    <span className="text-white font-bold">{totalGastosPersonalesUnicos.toFixed(0)}€</span>
                  </div>
                </div>
              </div>

              {/* Balance Personal */}
              <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border border-indigo-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-semibold text-white">Balance Personal</h3>
                </div>
                <div className="text-2xl font-bold text-white">{balancePersonal.toFixed(0)}€</div>
                <div className="text-xs text-gray-500 mt-1">Después de gastos</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        {showModal === 'income' && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
            <div className="bg-[#111113] rounded-t-3xl md:rounded-2xl border border-white/10 p-6 w-full md:max-w-md">
              <h3 className="text-lg font-bold text-white mb-4">Nuevo Ingreso</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                createIncomeMutation.mutate({
                  date: fd.get('date'),
                  client_name: fd.get('client_name'),
                  concept: fd.get('concept'),
                  amount: fd.get('amount'),
                  payment_method: fd.get('payment_method')
                });
              }} className="space-y-3">
                <input type="date" name="date" required defaultValue={format(new Date(), 'yyyy-MM-dd')} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" />
                <input type="text" name="client_name" required placeholder="Cliente" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" />
                <input type="text" name="concept" required placeholder="Concepto" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" />
                <input type="number" step="0.01" name="amount" required placeholder="Monto €" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" />
                <select name="payment_method" required className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm">
                  <option value="Efectivo">Efectivo</option>
                  <option value="Wise">Wise</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Bizum">Bizum</option>
                </select>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setShowModal(null)} className="flex-1 px-4 py-2 bg-white/5 rounded-lg text-white text-sm">Cancelar</button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-emerald-500 rounded-lg text-white text-sm">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showModal === 'gastoFijo' && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
            <div className="bg-[#111113] rounded-t-3xl md:rounded-2xl border border-white/10 p-6 w-full md:max-w-md">
              <h3 className="text-lg font-bold text-white mb-4">Nuevo Gasto Fijo</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                createGastoFijoMutation.mutate({
                  nombre: fd.get('nombre'),
                  categoria: fd.get('categoria'),
                  importe: parseFloat(fd.get('importe')),
                  frecuencia: fd.get('frecuencia'),
                  estado: "Pendiente"
                });
              }} className="space-y-3">
                <input type="text" name="nombre" required placeholder="Nombre" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" />
                <select name="categoria" required className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm">
                  <option value="Alquiler">Alquiler</option>
                  <option value="Suscripciones">Suscripciones</option>
                  <option value="Servicios">Servicios</option>
                </select>
                <input type="number" step="0.01" name="importe" required placeholder="Importe €" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" />
                <select name="frecuencia" required className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm">
                  <option value="Mensual">Mensual</option>
                  <option value="Trimestral">Trimestral</option>
                  <option value="Anual">Anual</option>
                </select>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setShowModal(null)} className="flex-1 px-4 py-2 bg-white/5 rounded-lg text-white text-sm">Cancelar</button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-blue-500 rounded-lg text-white text-sm">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showModal === 'gastoUnico' && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
            <div className="bg-[#111113] rounded-t-3xl md:rounded-2xl border border-white/10 p-6 w-full md:max-w-md">
              <h3 className="text-lg font-bold text-white mb-4">Nuevo Gasto Único</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                createGastoUnicoMutation.mutate({
                  fecha: fd.get('fecha'),
                  nombre: fd.get('nombre'),
                  categoria: fd.get('categoria'),
                  importe: parseFloat(fd.get('importe')),
                  estado: "Pagado"
                });
              }} className="space-y-3">
                <input type="date" name="fecha" required defaultValue={format(new Date(), 'yyyy-MM-dd')} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" />
                <input type="text" name="nombre" required placeholder="Nombre" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" />
                <select name="categoria" required className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm">
                  <option value="Equipamiento">Equipamiento</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Formación">Formación</option>
                </select>
                <input type="number" step="0.01" name="importe" required placeholder="Importe €" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" />
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setShowModal(null)} className="flex-1 px-4 py-2 bg-white/5 rounded-lg text-white text-sm">Cancelar</button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-orange-500 rounded-lg text-white text-sm">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showModal === 'gastoPersonalFijo' && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
            <div className="bg-[#111113] rounded-t-3xl md:rounded-2xl border border-white/10 p-6 w-full md:max-w-md">
              <h3 className="text-lg font-bold text-white mb-4">Gasto Personal Fijo</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                createGastoPersonalFijoMutation.mutate({
                  nombre: fd.get('nombre'),
                  categoria: fd.get('categoria'),
                  importe: parseFloat(fd.get('importe')),
                  frecuencia: fd.get('frecuencia'),
                  estado: "Pendiente"
                });
              }} className="space-y-3">
                <input type="text" name="nombre" required placeholder="Nombre" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" />
                <select name="categoria" required className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm">
                  <option value="Vivienda">Vivienda</option>
                  <option value="Transporte">Transporte</option>
                  <option value="Salud">Salud</option>
                  <option value="Gimnasio">Gimnasio</option>
                </select>
                <input type="number" step="0.01" name="importe" required placeholder="Importe €" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" />
                <select name="frecuencia" required className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm">
                  <option value="Mensual">Mensual</option>
                  <option value="Trimestral">Trimestral</option>
                </select>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setShowModal(null)} className="flex-1 px-4 py-2 bg-white/5 rounded-lg text-white text-sm">Cancelar</button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-pink-500 rounded-lg text-white text-sm">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showModal === 'gastoPersonalUnico' && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
            <div className="bg-[#111113] rounded-t-3xl md:rounded-2xl border border-white/10 p-6 w-full md:max-w-md">
              <h3 className="text-lg font-bold text-white mb-4">Gasto Personal Único</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                createGastoPersonalUnicoMutation.mutate({
                  fecha: fd.get('fecha'),
                  nombre: fd.get('nombre'),
                  categoria: fd.get('categoria'),
                  importe: parseFloat(fd.get('importe')),
                  estado: "Pagado"
                });
              }} className="space-y-3">
                <input type="date" name="fecha" required defaultValue={format(new Date(), 'yyyy-MM-dd')} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" />
                <input type="text" name="nombre" required placeholder="Nombre" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" />
                <select name="categoria" required className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm">
                  <option value="Ocio">Ocio</option>
                  <option value="Comida">Comida</option>
                  <option value="Compras">Compras</option>
                  <option value="Viajes">Viajes</option>
                </select>
                <input type="number" step="0.01" name="importe" required placeholder="Importe €" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" />
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setShowModal(null)} className="flex-1 px-4 py-2 bg-white/5 rounded-lg text-white text-sm">Cancelar</button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-yellow-500 rounded-lg text-white text-sm">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}