import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";

const PLANS = [
  {
    name: "Basic",
    price: "7",
    features: [
      "Acceso al contenido exclusivo",
      "Comunidad privada",
      "Oportunidades básicas",
    ],
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
    ],
    highlighted: false,
  },
];

export default function PricingModal({ onClose }) {
  const handleSignup = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="pricing-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-[800]"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
        onClick={onClose}
      />

      {/* Card — cinematic entrance */}
      <motion.div
        key="pricing-card"
        initial={{ opacity: 0, scale: 0.88, y: 60 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 40 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-[801] flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className="relative w-full max-w-3xl rounded-3xl overflow-hidden pointer-events-auto"
          style={{
            background: "rgba(10,10,11,0.96)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 0 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Top glow line */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px"
            style={{ background: "linear-gradient(to right, transparent, rgba(255,88,51,0.5), transparent)" }}
          />

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <X className="w-4 h-4 text-white/50" />
          </button>

          <div className="px-6 sm:px-10 pt-10 pb-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="text-center mb-8"
            >
              <div className="text-[10px] font-semibold text-white/20 uppercase tracking-[0.3em] mb-3">Cabaña Creative</div>
              <h2
                className="text-3xl sm:text-4xl font-black text-white mb-3"
                style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", letterSpacing: "-0.03em" }}
              >
                Únete al universo
              </h2>
              <p className="text-sm text-white/40 max-w-sm mx-auto leading-relaxed">
                Descubre, conecta y crea dentro de una red privada de artistas, creadores y marcas
              </p>
            </motion.div>

            {/* Plans */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8"
            >
              {PLANS.map((plan, idx) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.07, duration: 0.45 }}
                  className="relative rounded-2xl flex flex-col"
                  style={{
                    background: plan.highlighted ? "rgba(255,88,51,0.07)" : "rgba(255,255,255,0.025)",
                    border: plan.highlighted ? "1px solid rgba(255,88,51,0.35)" : "1px solid rgba(255,255,255,0.06)",
                    boxShadow: plan.highlighted ? "0 0 24px rgba(255,88,51,0.1)" : "none",
                  }}
                >
                  {plan.badge && (
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white whitespace-nowrap"
                      style={{ background: "linear-gradient(135deg, #ff5833, #ff8c00)" }}
                    >
                      {plan.badge}
                    </div>
                  )}
                  <div className="p-4 sm:p-5 flex flex-col h-full">
                    <div className="mb-4">
                      <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-1">{plan.name}</p>
                      <div className="flex items-baseline gap-1">
                        <span
                          className="text-3xl font-black text-white"
                          style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", letterSpacing: "-0.04em" }}
                        >
                          {plan.price}€
                        </span>
                        <span className="text-white/30 text-xs">/mes</span>
                      </div>
                    </div>
                    <ul className="space-y-2 flex-1">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check
                            className="w-3 h-3 mt-0.5 flex-shrink-0"
                            style={{ color: plan.highlighted ? "#ff5833" : "rgba(255,255,255,0.3)" }}
                          />
                          <span className="text-xs text-white/50 leading-relaxed">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.52, duration: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <button
                onClick={handleSignup}
                className="w-full sm:w-auto px-10 py-3.5 rounded-xl font-black text-base text-black transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "white",
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                  letterSpacing: "-0.02em",
                  boxShadow: "0 4px 20px rgba(255,255,255,0.12)",
                }}
              >
                Empieza gratis — 14 días
              </button>
              <button
                onClick={handleSignup}
                className="text-sm text-white/35 hover:text-white/65 transition-colors underline underline-offset-4"
              >
                Iniciar sesión
              </button>
              <button
                onClick={onClose}
                className="text-sm text-white/20 hover:text-white/45 transition-colors"
              >
                Continuar explorando
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}