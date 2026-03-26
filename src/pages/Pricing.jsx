import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Check, X, Loader, ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";

export default function Pricing() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: () => base44.entities.Plan.list('order')
  });

  useEffect(() => {
    if (searchParams.get('success')) {
      setTimeout(() => {
        alert('¡Suscripción creada exitosamente!');
        navigate('/Pricing');
      }, 500);
    }
    if (searchParams.get('cancelled')) {
      setTimeout(() => {
        alert('Operación cancelada');
        navigate('/Pricing');
      }, 500);
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
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-xl bg-black/20">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link to={createPageUrl("Landing")} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-5 h-5 text-gray-400" />
            <img 
              src="https://media.base44.com/images/public/6966ddf48947f217e81ea27c/6b7c4002a_Titulo.png" 
              alt="La Cabaña Creative"
              className="h-12 w-auto"
            />
            <div style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 900, lineHeight: 1, display: 'flex', flexDirection: 'column' }}>
              <span style={{ letterSpacing: '-0.04em', display: 'inline-flex', alignItems: 'flex-start', lineHeight: 1, color: '#ff5833', fontWeight: 900, fontSize: '1rem' }}>
                Cabaña<sup style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.5rem', fontWeight: 400, lineHeight: 1, marginLeft: '3px', verticalAlign: 'top', position: 'relative', top: '2px' }}>®</sup>
              </span>
              <span style={{ letterSpacing: '-0.04em', display: 'block', lineHeight: 1, color: 'white', fontWeight: 900, fontSize: '1rem' }}>Creative</span>
            </div>
          </Link>
          

        </div>
      </header>

      <main className="pt-0">
        {/* Hero Section */}
        <div className="text-center py-8 sm:py-16 px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-6 bg-gradient-to-b from-white to-white/80 bg-clip-text text-transparent">
              Elige tu nivel
            </h1>
            <p className="text-xl sm:text-2xl font-light text-white/60 mb-2">
              dentro de Cabaña Creative
            </p>
            <p className="text-base sm:text-lg text-white/50 max-w-2xl mx-auto leading-relaxed mt-6">
              Infraestructura profesional, automatización y crecimiento estratégico para artistas que quieren construir un proyecto sólido.
            </p>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader className="w-8 h-8 animate-spin text-[#ff5833]" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16">
              {plans.map((plan, i) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative rounded-3xl border transition-all duration-500 group ${
                    plan.highlighted
                      ? 'border-[#ff5833]/40 bg-gradient-to-br from-[#ff5833]/8 to-transparent ring-1 ring-[#ff5833]/20 sm:lg:scale-105'
                      : 'border-white/8 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]'
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#ff5833] to-orange-500 text-white text-xs font-bold tracking-wide">
                      RECOMENDADO
                    </div>
                  )}

                  <div className="p-6 sm:p-8 flex flex-col h-full">
                    <div className="mb-8">
                      <h3 className="text-2xl sm:text-3xl font-bold mb-3 text-white">{plan.name}</h3>
                      <p className="text-sm text-white/50 mb-6 leading-relaxed">{plan.description}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl sm:text-6xl font-black text-white">{plan.price}</span>
                        <span className="text-white/40 font-light">/mes</span>
                      </div>
                    </div>

                    <button
                      onClick={async () => {
                        const planKey = plan.name.toLowerCase().replace(/\s+/g, '_');
                        try {
                          // Obtener email del usuario autenticado o solicitarlo
                          let userEmail = '';
                          try {
                            const user = await base44.auth.me();
                            userEmail = user?.email || '';
                          } catch (e) {
                            userEmail = prompt('Por favor ingresa tu email para continuar:');
                            if (!userEmail) return;
                          }

                          const res = await base44.functions.invoke('createCheckoutSession', {
                            planType: planKey,
                            email: userEmail,
                            successUrl: `${window.location.origin}/Pricing?success=true`,
                            cancelUrl: window.location.href
                          });
                          if (res.data?.url) {
                            window.open(res.data.url, '_blank', 'noopener,noreferrer');
                          } else {
                            alert('Error: No se pudo obtener la URL de pago');
                          }
                        } catch (error) {
                          alert('Error al crear sesión de pago: ' + (error.response?.data?.error || error.message));
                        }
                      }}
                      className={`w-full py-3.5 px-4 rounded-xl font-semibold mb-8 transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base ${
                        plan.highlighted
                          ? 'bg-[#ff5833] hover:bg-[#ff5833]/90 text-white shadow-lg shadow-[#ff5833]/20 hover:shadow-[#ff5833]/40'
                          : 'border border-white/15 text-white hover:border-[#ff5833]/40 hover:bg-[#ff5833]/5'
                      }`}
                    >
                      Empezar Ahora
                    </button>

                    <div className="space-y-3.5 flex-1">
                      {plan.features && plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-[#ff5833] flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-white/70">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Comparison Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/[0.02] border border-white/8 rounded-3xl overflow-hidden backdrop-blur-sm hidden lg:block"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="text-left px-6 py-4 font-semibold text-white/80">Funcionalidad</th>
                    <th className="text-center px-6 py-4 font-semibold text-white/80">Prueba</th>
                    <th className="text-center px-6 py-4 font-semibold text-white/80">Explorador</th>
                    <th className="text-center px-6 py-4 font-semibold text-white/80">Pionero</th>
                    <th className="text-center px-6 py-4 font-semibold text-white/80">Independiente</th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                      <td className="px-6 py-4 text-white/70">{feature.name}</td>
                      <td className="px-6 py-4 text-center">
                        {feature.free ? (
                          <Check className="w-5 h-5 text-[#ff5833] mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-white/20 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {feature.explorador ? (
                          <Check className="w-5 h-5 text-[#ff5833] mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-white/20 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {feature.pionero ? (
                          <Check className="w-5 h-5 text-[#ff5833] mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-white/20 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {feature.independiente ? (
                          <Check className="w-5 h-5 text-[#ff5833] mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-white/20 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* FAQ */}
          <div className="mt-12 sm:mt-16 max-w-2xl mx-auto px-4 sm:px-0">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12">Preguntas Frecuentes</h2>
            <div className="space-y-3 sm:space-y-4">
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
                  className="bg-white/[0.02] border border-white/8 rounded-2xl p-5 sm:p-6 hover:border-white/15 transition-colors"
                >
                  <h3 className="font-semibold mb-2 text-white">{faq.q}</h3>
                  <p className="text-white/60 text-sm sm:text-base leading-relaxed">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}