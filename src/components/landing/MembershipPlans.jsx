import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Loader } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function MembershipPlans({ config }) {
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: () => base44.entities.Plan.list('order')
  });
  const [loadingPlanId, setLoadingPlanId] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      }
    };
    checkUser();
  }, []);

  const handleCheckout = async (plan) => {
    // Si no hay usuario, redirigir a login
    if (!user) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }

    setLoadingPlanId(plan.id);
    try {
      const res = await base44.functions.invoke('createCheckoutSession', {
        planType: plan.name.toLowerCase().replace(/\s+/g, '_'),
        successUrl: `${window.location.origin}/Pricing?success=true`,
        cancelUrl: window.location.href
      });
      if (res.data?.url) {
        window.open(res.data.url, '_blank', 'noopener,noreferrer');
        setLoadingPlanId(null);
      } else {
        alert('Error al crear sesión de pago');
        setLoadingPlanId(null);
      }
    } catch (error) {
      alert('Error: ' + error.message);
      setLoadingPlanId(null);
    }
  };

  return (
    <section id="pricing" className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0b] via-[#111113] to-[#0a0a0b]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-[150px]" />

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold text-purple-400 mb-4 tracking-widest">PLANES Y PRECIOS</p>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Elige tu nivel dentro de Cabaña Creative
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Infraestructura profesional, automatización y crecimiento estratégico para artistas que quieren construir un proyecto sólido.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-8 h-8 animate-spin text-purple-400" />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative ${plan.highlighted ? 'md:-mt-4 md:mb-4' : ''}`}
              >
                {/* Popular Badge */}
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-xs font-bold z-10">
                    Recomendado
                  </div>
                )}

                <div className={`bg-[#111113] rounded-3xl p-8 border ${plan.highlighted ? 'border-purple-500/30' : 'border-white/5'} hover:border-white/10 transition-all duration-500 h-full flex flex-col`}>
                  {/* Header */}
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-sm text-gray-500">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-gray-400">/mes</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex-1 mb-8">
                    <ul className="space-y-3">
                      {plan.features && plan.features.map((feature, j) => (
                        <li key={j} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-purple-400" />
                          </div>
                          <span className="text-sm text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCheckout(plan)}
                    disabled={loadingPlanId === plan.id}
                    className={`w-full py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 text-sm ${
                      plan.highlighted
                        ? 'bg-white text-black hover:bg-gray-100 disabled:opacity-50'
                        : 'bg-white/10 border border-white/20 text-white hover:bg-white/20 disabled:opacity-50'
                    }`}
                  >
                    {loadingPlanId === plan.id ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Procesando...
                      </>
                    ) : user ? (
                      plan.highlighted ? 'Elegir Pionero' : plan.name === 'Explorador' ? 'Comenzar' : 'Acceder a Pro'
                    ) : (
                      'Iniciar Sesión'
                    )}
                  </motion.button>
                </div>

                {/* Background Glow for Popular */}
                {plan.highlighted && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl blur-2xl -z-10" />
                )}
              </motion.div>
            ))}
          </div>
        )}


      </div>
    </section>
  );
}