import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Loader } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function PlansModal({ isOpen, onClose, selectedPlanId }) {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-select plan if passed from parent
  useEffect(() => {
    if (selectedPlanId && isOpen) {
      const planMap = {
        'explorador': 'explorador',
        'pionero': 'pionero',
        'independiente': 'independiente'
      };
      setSelectedPlan(planMap[selectedPlanId]);
    }
  }, [selectedPlanId, isOpen]);

  const plans = [
    {
      id: 'free_trial',
      name: 'Prueba Gratuita',
      price: '€0',
      period: '14 días',
      description: 'Acceso completo durante 2 semanas',
      features: [
        'Gestión de artistas',
        'Calendario de sesiones',
        'Proyectos y tracks',
        'Clips y contenido',
        'Análisis básicos'
      ],
      cta: 'Comenzar',
      highlighted: false,
      disabled: true
    },
    {
      id: 'explorador',
      name: 'Explorador',
      price: 'Consultar',
      period: '/mes',
      description: 'Plan básico para empezar',
      features: [
        'Gestión de artistas',
        'Proyectos y tracks',
        'Calendario básico',
        'Soporte por email'
      ],
      cta: 'Empezar Ahora',
      highlighted: false,
      disabled: false
    },
    {
      id: 'pionero',
      name: 'Pionero',
      price: 'Consultar',
      period: '/mes',
      description: 'Plan intermedio con funcionalidades avanzadas',
      features: [
        'Todo de Explorador',
        'Sincronización Google Calendar',
        'Clips y contenido',
        'Análisis avanzados',
        'Soporte prioritario'
      ],
      cta: 'Empezar Ahora',
      highlighted: true,
      disabled: false
    },
    {
      id: 'independiente',
      name: 'Independiente',
      price: 'Consultar',
      period: '/mes',
      description: 'Plan profesional completo',
      features: [
        'Todo de Pionero',
        'Usuarios ilimitados',
        'API personalizada',
        'Integraciones custom',
        'Soporte 24/7',
        'Reportes personalizados'
      ],
      cta: 'Empezar Ahora',
      highlighted: false,
      disabled: false
    }
  ];

  const handleSelectPlan = async (planId) => {
    if (planId === 'free_trial') return;

    setSelectedPlan(planId);
    setIsLoading(true);

    try {
      const currentUrl = window.location.href;
      const res = await base44.functions.invoke('createCheckoutSession', {
        planType: planId,
        successUrl: `${window.location.origin}/Pricing?success=true`,
        cancelUrl: currentUrl
      });

      if (res.data?.url) {
        // Redirige a Stripe - usar target="_blank" para seguridad
        window.open(res.data.url, '_blank', 'noopener,noreferrer');
        setIsLoading(false);
        setSelectedPlan(null);
      } else {
        console.error('Response data:', res.data);
        throw new Error('No se recibió URL de Stripe');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      setIsLoading(false);
      setSelectedPlan(null);
      alert('Error: ' + (error.message || 'No se pudo crear la sesión de pago'));
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-[#141414] rounded-2xl border border-white/10"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/5 sticky top-0 bg-[#141414] z-10">
            <h2 className="text-2xl font-bold text-white">Planes de Suscripción</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Plans */}
          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan, i) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative rounded-2xl p-6 border transition-all ${
                    plan.highlighted
                      ? 'border-emerald-500/50 bg-emerald-500/5 ring-1 ring-emerald-500/20'
                      : 'border-white/10 bg-white/[0.02]'
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold">
                      RECOMENDADO
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-sm text-gray-400 mb-4">{plan.description}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-white">{plan.price}</span>
                      <span className="text-sm text-gray-400">{plan.period}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={plan.disabled || isLoading}
                    className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all mb-6 ${
                      plan.disabled
                        ? 'bg-white/5 text-white/30 cursor-not-allowed'
                        : plan.highlighted
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    {isLoading && selectedPlan === plan.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader className="w-4 h-4 animate-spin" />
                        Procesando...
                      </span>
                    ) : (
                      plan.cta
                    )}
                  </button>

                  <div className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-white/5 p-6 bg-white/[0.01]">
            <p className="text-sm text-center text-gray-400">
              Todos los planes incluyen una <strong>prueba gratuita de 14 días</strong>. Sin necesidad de tarjeta de crédito.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}