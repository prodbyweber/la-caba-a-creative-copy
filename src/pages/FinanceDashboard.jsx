import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  Shield
} from "lucide-react";

export default function FinanceDashboard() {
  const [selectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear] = useState(new Date().getFullYear());

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

  return (
    <AdminLayout activePage="FinanceDashboard">
      <div className="max-w-[1800px] mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Panel de Contabilidad</h1>
          <p className="text-gray-400">La Cabaña Creative · Gestión Financiera Completa</p>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-white/5 transition-colors">
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
                  </tr>
                ))}
                {clients.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                      No hay clientes registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5️⃣ GASTOS DEL NEGOCIO */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#111113] rounded-2xl border border-white/5 p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-red-400" />
              Gastos Fijos del Estudio
            </h3>
            <div className="space-y-2">
              {expenses.filter(e => ['Alquiler', 'Software', 'Servicios'].includes(e.concept)).map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300 text-sm">{expense.concept}</span>
                  <span className="text-white font-semibold">€{expense.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#111113] rounded-2xl border border-white/5 p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-orange-400" />
              Gastos Variables del Negocio
            </h3>
            <div className="space-y-2">
              {expenses.filter(e => !['Alquiler', 'Software', 'Servicios'].includes(e.concept)).slice(0, 5).map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300 text-sm">{expense.concept}</span>
                  <span className="text-white font-semibold">€{expense.amount.toLocaleString()}</span>
                </div>
              ))}
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
            <div className="px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-300 font-medium">Privado · No afecta al estudio</span>
              </div>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {personalExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-lg bg-purple-500/10 text-purple-400 text-xs font-medium">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">{expense.concept}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{new Date(expense.date).toLocaleDateString('es-ES')}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-white">€{expense.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{expense.payment_method}</td>
                  </tr>
                ))}
                {personalExpenses.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
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
    </AdminLayout>
  );
}