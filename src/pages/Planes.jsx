import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Check, Star, Zap, Crown, Info } from "lucide-react";

const plans = [
  {
    key: "explorador",
    name: "Explorador",
    price: 24,
    priceAnnual: 240,
    description: "Para artistas que quieren ordenar y profesionalizar su catálogo.",
    icon: Star,
    color: "emerald",
    borderColor: "border-white/10",
    cta: "Comenzar",
    popular: false,
    features: [
      { text: "Hasta 5GB de almacenamiento" },
      { text: "Gestión básica de catálogo" },
      { text: "Programación hasta 15 clips mensuales" },
      {
        text: "Métricas esenciales",
        note: "Las métricas esenciales no muestran todas las visualizaciones individuales por plataforma. Solo se muestran datos generales y algunas métricas resumidas."
      },
      { text: "Soporte estándar" },
      { text: "Sin acceso al motor IA", excluded: true }
    ]
  },
  {
    key: "pionero",
    name: "Pionero",
    price: 59,
    priceAnnual: 590,
    description: "Para artistas que buscan automatización y crecimiento constante.",
    icon: Zap,
    color: "purple",
    borderColor: "border-purple-500/50",
    cta: "Elegir Pionero",
    popular: true,
    features: [
      { text: "Hasta 25GB de almacenamiento" },
      { text: "Gestión avanzada de catálogo" },
      { text: "Programación ilimitada de clips" },
      { text: "Motor IA de reclipping automático" },
      {
        text: "Métricas completas por plataforma",
        note: "Incluye visualizaciones individuales detalladas por cada plataforma (Spotify, Instagram, TikTok, YouTube, etc.)."
      },
      { text: "Soporte prioritario" }
    ]
  },
  {
    key: "pro",
    name: "Independiente Pro",
    price: 129,
    priceAnnual: 1290,
    description: "Para artistas comprometidos que quieren entrar en el radar de La Cabaña Creative.",
    icon: Crown,
    color: "orange",
    borderColor: "border-orange-500/30",
    cta: "Acceder a Pro",
    popular: false,
    features: [
      { text: "Hasta 100GB de almacenamiento" },
      { text: "Motor IA completo" },
      { text: "Métricas completas por plataforma" },
      { text: "Perfil destacado dentro del ecosistema" },
      { text: "Revisión estratégica trimestral" },
      {
        text: "Posibilidad de ser contactado por La Cabaña Creative para dirección e impulso del proyecto",
        note: "El acceso a oportunidades internas está sujeto a evaluación del equipo creativo."
      }
    ]
  }
];

const annualPlans = [
  { name: "Explorador", price: "240€/año" },
  { name: "Pionero", price: "590€/año" },
  { name: "Independiente Pro", price: "1.290€/año" }
];

const colorMap = {
  emerald: {
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    icon: "bg-emerald-500/10 text-emerald-400",
    check: "text-emerald-400",
    btn: "bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20",
    glow: "shadow-emerald-500/10"
  },
  purple: {
    badge: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    icon: "bg-purple-500/10 text-purple-400",
    check: "text-purple-400",
    btn: "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/30",
    glow: "shadow-purple-500/20"
  },
  orange: {
    badge: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    icon: "bg-orange-500/10 text-orange-400",
    check: "text-orange-400",
    btn: "bg-orange-500 hover:bg-orange-400 text-black shadow-orange-500/20",
    glow: "shadow-orange-500/10"
  }
};

export default function Planes() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      {/* Nav back */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0b]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to={createPageUrl("Landing")} className="flex items-center gap-3">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6966ddf48947f217e81ea27c/4d692088b_Lacabanacreativelogooficial2026.png"
              alt="La Cabaña Creative"
              className="h-12 w-auto"
            />
            <span className="text-lg font-semibold tracking-tight hidden sm:block">
              Cabaña <span className="text-orange-500">Creative</span>
            </span>
          </Link>
          <Link
            to={createPageUrl("Landing")}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Volver
          </Link>
        </div>
      </div>

      {/* SECTION 1 – HERO */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c0c0e] via-[#0a0a0b] to-[#0a0a0b]" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-[500px] h-[400px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Planes y Precios</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Elige tu nivel dentro de{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-300">
                Cabaña Creative
              </span>
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed max-w-2xl mx-auto">
              Infraestructura profesional, automatización y crecimiento estratégico para artistas que quieren construir un proyecto sólido.
            </p>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2 – PRICING TABLE */}
      <section className="relative z-10 px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {plans.map((plan, i) => {
              const Icon = plan.icon;
              const c = colorMap[plan.color];
              return (
                <motion.div
                  key={plan.key}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`relative rounded-2xl border ${plan.borderColor} bg-[#111113] p-8 flex flex-col gap-6 shadow-2xl ${plan.popular ? `ring-1 ring-purple-500/40 ${c.glow}` : ""}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1.5 rounded-full bg-purple-600 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-purple-500/30">
                        Más Popular
                      </span>
                    </div>
                  )}

                  {/* Plan header */}
                  <div>
                    <div className={`w-10 h-10 rounded-xl ${c.icon} flex items-center justify-center mb-4`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="flex items-end gap-1">
                    <span className="text-5xl font-black text-white">{plan.price}€</span>
                    <span className="text-gray-500 text-sm mb-2">/mes</span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 flex-1">
                    {plan.features.map((feat, fi) => (
                      <li key={fi} className="flex flex-col gap-1">
                        <div className="flex items-start gap-3">
                          {feat.excluded ? (
                            <span className="mt-0.5 w-4 h-4 flex-shrink-0 text-gray-600">✕</span>
                          ) : (
                            <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${c.check}`} />
                          )}
                          <span className={`text-sm leading-snug ${feat.excluded ? "text-gray-600 line-through" : "text-gray-200"}`}>
                            {feat.text}
                          </span>
                        </div>
                        {feat.note && (
                          <div className="ml-7 flex items-start gap-1.5">
                            <Info className="w-3 h-3 text-gray-600 flex-shrink-0 mt-0.5" />
                            <p className="text-[11px] text-gray-500 italic leading-relaxed">{feat.note}</p>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all shadow-lg ${c.btn}`}
                  >
                    {plan.cta}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 3 – ANNUAL OPTION */}
      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-white/10 bg-[#111113] p-8 sm:p-10"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Ahorra con el plan anual</h2>
              <p className="text-sm text-emerald-400 font-medium">Equivalente a 2 meses gratis.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {annualPlans.map((p, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-white/5 border border-white/5 p-5 text-center hover:border-white/10 transition-colors"
                >
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">{p.name}</p>
                  <p className="text-2xl font-black text-white">{p.price}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 4 – FOOTER CTA */}
      <section className="px-6 pb-28 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            ¿Listo para construir un proyecto sólido?
          </h2>
          <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-bold text-base shadow-xl shadow-emerald-500/20 transition-all hover:scale-105">
            Unirme a Cabaña Creative
          </button>
        </motion.div>
      </section>
    </div>
  );
}