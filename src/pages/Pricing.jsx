import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Check, X } from "lucide-react";
import PlansModal from "@/components/subscription/PlansModal";
import DashboardNav from "@/components/dashboard/DashboardNav";

export default function Pricing() {
  const [showModal, setShowModal] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.get('success')) {
      alert('¡Suscripción creada exitosamente!');
      navigate('/pricing');
    }
    if (searchParams.get('cancelled')) {
      alert('Operación cancelada');
      navigate('/pricing');
    }
  }, [searchParams, navigate]);

  const features = [
    { name: 'Gestión de Artistas', free: true, explorador: true, pionero: true, independiente: true },
    { name: 'Proyectos y Tracks', free: true, explorador: true, pionero: true, independiente: true },
    { name: 'Calendario de Sesiones', free: true, explorador: true, pionero: true, independiente: true },
    { name: 'Sincronización Google Calendar', free: false, explorador: false, pionero: true, independiente: true },
    { name: 'Clip Management', free: false, explorador: false, pionero: true, independiente: true },
    { name: 'Análisis Avanzados', free: false, explorador: false, pionero: true, independiente: true },
    { name: 'Integración Stripe', free: false, explorador: false, pionero: true, independiente: true },
    { name: 'Usuarios Ilimitados', free: false, explorador: false, pionero: false, independiente: true },
    { name: 'API Personalizada', free: false, explorador: false, pionero: false, independiente: true },
    { name: 'Soporte 24/7', free: false, explorador: false, pionero: false, independiente: true },
    { name: 'Integraciones Custom', free: false, explorador: false, pionero: false, independiente: true },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <DashboardNav />

      <main className="pt-14">
        {/* Hero */}
        <div className="text-center py-12 px-6">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Planes Simples y Transparentes
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400 max-w-2xl mx-auto"
          >
            Comienza con 14 días gratis. Sin tarjeta de crédito. Cancela en cualquier momento.
          </motion.p>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                name: 'Prueba Gratuita',
                price: '€0',
                period: '14 días',
                description: 'Acceso completo sin costo',
                cta: 'Comenzar Ahora',
                highlight: false,
                features: ['Todas las funcionalidades básicas', 'Acceso 14 días', 'Soporte por email']
              },
              {
                name: 'Explorador',
                price: 'Consultar',
                period: '/mes',
                description: 'Plan básico para empezar',
                cta: 'Empezar Ahora',
                highlight: false,
                features: ['Gestión de artistas', 'Proyectos y tracks', 'Calendario básico', 'Soporte por email']
              },
              {
                name: 'Pionero',
                price: 'Consultar',
                period: '/mes',
                description: 'Plan intermedio con funcionalidades avanzadas',
                cta: 'Empezar Ahora',
                highlight: true,
                features: ['Todo de Explorador', 'Google Calendar Sync', 'Clips y contenido', 'Análisis avanzados']
              },
              {
                name: 'Independiente',
                price: 'Consultar',
                period: '/mes',
                description: 'Plan profesional completo',
                cta: 'Empezar Ahora',
                highlight: false,
                features: ['Todo de Pionero', 'Usuarios ilimitados', 'API personalizada', 'Soporte 24/7']
              }
            ].map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl p-8 border transition-all ${
                  plan.highlight
                    ? 'border-emerald-500/50 bg-emerald-500/5 ring-1 ring-emerald-500/20 scale-105'
                    : 'border-white/10 bg-white/[0.02]'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-500 text-white text-sm font-bold">
                    RECOMENDADO
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-sm text-gray-400 mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-400">{plan.period}</span>
                  </div>
                </div>

                <button
                   onClick={() => plan.name !== 'Prueba Gratuita' && setShowModal(true)}
                   className={`w-full py-3 rounded-lg font-medium mb-6 transition-all ${
                     plan.name === 'Prueba Gratuita' 
                       ? 'bg-white/5 text-white/30 cursor-not-allowed'
                       : plan.highlight
                       ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                       : 'bg-white/10 hover:bg-white/20 text-white'
                   }`}
                   disabled={plan.name === 'Prueba Gratuita'}
                 >
                   {plan.cta}
                 </button>

                <div className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Comparison Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-6 py-4 font-semibold">Funcionalidad</th>
                    <th className="text-center px-6 py-4 font-semibold">Prueba</th>
                    <th className="text-center px-6 py-4 font-semibold">Explorador</th>
                    <th className="text-center px-6 py-4 font-semibold">Pionero</th>
                    <th className="text-center px-6 py-4 font-semibold">Independiente</th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-gray-300">{feature.name}</td>
                      <td className="px-6 py-4 text-center">
                        {feature.free ? (
                          <Check className="w-5 h-5 text-emerald-400 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-600 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {feature.explorador ? (
                          <Check className="w-5 h-5 text-emerald-400 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-600 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {feature.pionero ? (
                          <Check className="w-5 h-5 text-emerald-400 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-600 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {feature.independiente ? (
                          <Check className="w-5 h-5 text-emerald-400 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-600 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* FAQ */}
          <div className="mt-16 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Preguntas Frecuentes</h2>
            <div className="space-y-4">
              {[
                {
                  q: '¿Necesito tarjeta de crédito para empezar?',
                  a: 'No, la prueba gratuita de 14 días no requiere información de pago.'
                },
                {
                  q: '¿Puedo cancelar en cualquier momento?',
                  a: 'Sí, cancela tu suscripción sin penalidades en cualquier momento.'
                },
                {
                  q: '¿Qué sucede después de la prueba gratuita?',
                  a: 'Se te pedirá que selecciones un plan de pago. Si no lo haces, tu acceso se limitará a funciones básicas.'
                },
                {
                  q: '¿Hay descuento por pago anual?',
                  a: 'Contáctanos para obtener precios especiales de facturación anual en planes Pro y Enterprise.'
                }
              ].map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white/[0.02] border border-white/10 rounded-lg p-4"
                >
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-gray-400">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Plans Modal */}
      <PlansModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}