import React from "react";
import { motion } from "framer-motion";
import { Check, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const PLANS = [
  {
    name: "Basic",
    price: "7",
    features: [
      "Acceso al contenido exclusivo",
      "Comunidad privada",
      "Oportunidades básicas",
      "Descuentos",
    ],
    cta: "Empezar",
    highlighted: false,
  },
  {
    name: "Creator",
    price: "29",
    badge: "Más popular",
    features: [
      "250 GB almacenamiento",
      "Panel de creador",
      "Gestión de catálogo",
      "Acceso a campañas",
      "Sistema de créditos",
    ],
    cta: "Empezar a crear",
    highlighted: true,
  },
  {
    name: "Pro",
    price: "99",
    features: [
      "1 TB almacenamiento",
      "Prioridad en campañas",
      "Mayor visibilidad",
      "Acceso directo a creadores",
      "Más créditos",
    ],
    cta: "Ir a PRO",
    highlighted: false,
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white overflow-x-hidden">
      {/* Ambient background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,88,51,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Nav */}
      <header className="relative z-10 px-6 sm:px-12 py-6 flex items-center justify-between border-b border-white/[0.04]">
        <Link to="/" className="flex items-center gap-3 text-white/40 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Volver</span>
        </Link>
        <img
          src="https://media.base44.com/images/public/6966ddf48947f217e81ea27c/6b7c4002a_Titulo.png"
          alt="Cabaña Creative"
          className="h-9 w-auto opacity-80"
        />
        <div className="w-16" />
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
        {/* Hero text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16 sm:mb-20"
        >
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.35em] text-white/25 mb-5">
            Membresía
          </p>
          <h1
            className="font-black text-white leading-[0.9] tracking-tight mb-6"
            style={{
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontSize: "clamp(3rem, 10vw, 7rem)",
              letterSpacing: "-0.04em",
            }}
          >
            Subscríbete
          </h1>
          <p className="text-base sm:text-lg text-white/40 max-w-xl mx-auto leading-relaxed">
            Conecta, crea y consigue oportunidades reales dentro de la industria
          </p>
        </motion.div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="relative rounded-3xl flex flex-col"
              style={{
                background: plan.highlighted
                  ? "rgba(255,88,51,0.06)"
                  : "rgba(255,255,255,0.02)",
                border: plan.highlighted
                  ? "1px solid rgba(255,88,51,0.3)"
                  : "1px solid rgba(255,255,255,0.06)",
                boxShadow: plan.highlighted
                  ? "0 0 60px rgba(255,88,51,0.1), inset 0 1px 0 rgba(255,88,51,0.15)"
                  : "inset 0 1px 0 rgba(255,255,255,0.04)",
                transform: plan.highlighted ? "translateY(-6px)" : "none",
              }}
            >
              {plan.badge && (
                <div
                  className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white"
                  style={{ background: "linear-gradient(135deg, #ff5833, #ff8c00)", boxShadow: "0 4px 20px rgba(255,88,51,0.4)" }}
                >
                  {plan.badge}
                </div>
              )}

              <div className="p-7 sm:p-9 flex flex-col h-full">
                {/* Plan name */}
                <div className="mb-8">
                  <p
                    className="text-[11px] font-black uppercase tracking-[0.3em] mb-3"
                    style={{ color: plan.highlighted ? "#ff5833" : "rgba(255,255,255,0.25)" }}
                  >
                    {plan.name}
                  </p>
                  <div className="flex items-baseline gap-1.5">
                    <span
                      className="font-black text-white"
                      style={{
                        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                        fontSize: "clamp(3rem, 8vw, 4.5rem)",
                        letterSpacing: "-0.05em",
                        lineHeight: 1,
                      }}
                    >
                      {plan.price}€
                    </span>
                    <span className="text-white/25 text-sm pb-1">/mes</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-4 flex-1 mb-9">
                  {plan.features.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{
                          background: plan.highlighted ? "rgba(255,88,51,0.15)" : "rgba(255,255,255,0.06)",
                          border: plan.highlighted ? "1px solid rgba(255,88,51,0.3)" : "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        <Check className="w-2.5 h-2.5" style={{ color: plan.highlighted ? "#ff5833" : "rgba(255,255,255,0.4)" }} />
                      </div>
                      <span className="text-sm text-white/55 leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  className="w-full py-3.5 rounded-2xl text-sm font-bold tracking-wide transition-all duration-300"
                  style={plan.highlighted
                    ? {
                        background: "#ff5833",
                        color: "white",
                        boxShadow: "0 8px 32px rgba(255,88,51,0.4)",
                      }
                    : {
                        background: "rgba(255,255,255,0.05)",
                        color: "rgba(255,255,255,0.65)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }
                  }
                  onMouseEnter={e => {
                    if (!plan.highlighted) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.09)";
                      e.currentTarget.style.color = "white";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!plan.highlighted) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                      e.currentTarget.style.color = "rgba(255,255,255,0.65)";
                    }
                  }}
                >
                  {plan.cta}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-white/20 text-xs mt-14"
        >
          Cancela en cualquier momento · Sin permanencia · Acceso inmediato
        </motion.p>
      </main>
    </div>
  );
}