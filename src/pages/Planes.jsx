import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Check, X, Info, Zap } from "lucide-react";

const plans = [
  {
    key: "explorador",
    name: "Explorador",
    price: 24,
    priceAnnual: 240,
    description: "Para artistas que quieren ordenar y profesionalizar su catálogo.",
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
      { text: "Motor IA", excluded: true }
    ]
  },
  {
    key: "pionero",
    name: "Pionero",
    price: 59,
    priceAnnual: 590,
    description: "Para artistas que buscan automatización y crecimiento constante.",
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
    cta: "Acceder a Pro",
    popular: false,
    features: [
      { text: "Hasta 100GB de almacenamiento" },
      { text: "Motor IA completo" },
      { text: "Métricas completas por plataforma" },
      { text: "Perfil destacado en el ecosistema" },
      { text: "Revisión estratégica trimestral" },
      {
        text: "Contacto directo con La Cabaña Creative",
        note: "El acceso a oportunidades internas está sujeto a evaluación del equipo creativo."
      }
    ]
  }
];

export default function Planes() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#09090b]/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to={createPageUrl("Landing")} className="flex items-center gap-3">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6966ddf48947f217e81ea27c/4d692088b_Lacabanacreativelogooficial2026.png"
              alt="La Cabaña Creative"
              className="h-10 w-auto"
            />
          </Link>
          <Link to={createPageUrl("Landing")} className="text-sm text-white/40 hover:text-white/80 transition-colors">
            ← Volver
          </Link>
        </div>
      </div>

      {/* HERO */}
      <section className="pt-20 pb-8 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.08),transparent)]" />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-2xl mx-auto"
        >
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-[0.2em] mb-5">
            Planes y Precios
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight mb-5">
            Elige tu nivel dentro de<br />Cabaña Creative
          </h1>
          <p className="text-base text-white/40 leading-relaxed">
            Infraestructura profesional, automatización y crecimiento estratégico para artistas que quieren construir un proyecto sólido.
          </p>

          {/* Toggle */}
          <div className="mt-10 inline-flex items-center gap-4 bg-white/[0.04] border border-white/[0.08] rounded-full px-2 py-1.5">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${!annual ? "bg-emerald-500 text-black" : "text-white/40 hover:text-white"}`}
            >
              Mensual
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${annual ? "bg-emerald-500 text-black" : "text-white/40 hover:text-white"}`}
            >
              Anual
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                −2 meses
              </span>
            </button>
          </div>
        </motion.div>
      </section>

      {/* PRICING TABLE */}
      <section className="px-6 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.key}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={`relative flex flex-col rounded-2xl border p-7 transition-all ${
                  plan.popular
                    ? "bg-[#0f1a14] border-emerald-500/40 shadow-[0_0_60px_rgba(16,185,129,0.08)]"
                    : "bg-[#0e0e10] border-white/[0.07] hover:border-white/[0.12]"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/80 to-transparent" />
                )}
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-black text-[11px] font-bold uppercase tracking-wider">
                      <Zap className="w-2.5 h-2.5" />
                      Más Popular
                    </span>
                  </div>
                )}

                {/* Plan name */}
                <div className="mb-6">
                  <p className={`text-xs font-semibold uppercase tracking-[0.15em] mb-2 ${plan.popular ? "text-emerald-400" : "text-white/30"}`}>
                    {plan.name}
                  </p>
                  <div className="flex items-baseline gap-1.5 mb-3">
                    <span className="text-4xl font-black tracking-tight">
                      {annual ? Math.round(plan.priceAnnual / 12) : plan.price}€
                    </span>
                    <span className="text-white/30 text-sm">/mes</span>
                  </div>
                  {annual && (
                    <p className="text-xs text-white/30">
                      {plan.priceAnnual.toLocaleString("es-ES")}€ facturado anualmente
                    </p>
                  )}
                  <p className="text-sm text-white/40 mt-3 leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                {/* CTA */}
                <button
                  className={`w-full py-3 rounded-xl text-sm font-semibold transition-all mb-7 ${
                    plan.popular
                      ? "bg-emerald-500 text-black hover:bg-emerald-400"
                      : "bg-white/[0.06] text-white hover:bg-white/[0.1] border border-white/[0.08]"
                  }`}
                >
                  {plan.cta}
                </button>

                {/* Divider */}
                <div className="border-t border-white/[0.06] mb-6" />

                {/* Features */}
                <ul className="space-y-3.5 flex-1">
                  {plan.features.map((feat, fi) => (
                    <li key={fi} className="flex flex-col gap-1.5">
                      <div className="flex items-start gap-3">
                        {feat.excluded ? (
                          <X className="w-4 h-4 flex-shrink-0 mt-0.5 text-white/20" />
                        ) : (
                          <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.popular ? "text-emerald-400" : "text-white/50"}`} />
                        )}
                        <span className={`text-sm leading-snug ${feat.excluded ? "text-white/20" : "text-white/70"}`}>
                          {feat.text}
                        </span>
                      </div>
                      {feat.note && (
                        <div className="ml-7 flex items-start gap-2">
                          <Info className="w-3 h-3 text-white/20 flex-shrink-0 mt-0.5" />
                          <p className="text-[11px] text-white/25 italic leading-relaxed">
                            {feat.note}
                          </p>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-xl mx-auto text-center"
        >
          <div className="border border-white/[0.07] bg-[#0e0e10] rounded-2xl px-8 py-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight">
              ¿Listo para construir<br />un proyecto sólido?
            </h2>
            <p className="text-white/35 text-sm mb-8">Únete a los artistas que ya están creciendo con Cabaña Creative.</p>
            <button className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition-all hover:scale-[1.02]">
              Unirme a Cabaña Creative
            </button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}