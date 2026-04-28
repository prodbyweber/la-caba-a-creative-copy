import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Lock } from "lucide-react";
import { base44 } from "@/api/base44Client";

const PLANS = [
  {
    name: "Basic",
    price: "7",
    features: ["Contenido exclusivo", "Comunidad privada", "Oportunidades"],
    highlighted: false,
  },
  {
    name: "Creator",
    price: "29",
    badge: "Más popular",
    features: ["250 GB", "Panel creador", "Catálogo", "Campañas", "Créditos"],
    highlighted: true,
  },
  {
    name: "Pro",
    price: "99",
    features: ["1 TB", "Prioridad campañas", "Mayor visibilidad", "Red directa"],
    highlighted: false,
  },
];

export default function PricingModal({ onClose }) {
  const handleSignup = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  return (
    <AnimatePresence>
      {/* Backdrop — no clickable to dismiss */}
      <motion.div
        key="pricing-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-[800]"
        style={{
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      />

      {/* Modal card */}
      <motion.div
        key="pricing-card"
        initial={{ opacity: 0, scale: 0.85, y: 80 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 60 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-[801] flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className="relative w-full max-w-2xl rounded-2xl overflow-hidden pointer-events-auto"
          style={{
            background: "rgba(8,8,9,0.97)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 0 100px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          {/* Top accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(to right, transparent 5%, rgba(255,88,51,0.6) 50%, transparent 95%)" }}
          />

          {/* Lock icon top */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center pt-6 pb-1"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,88,51,0.12)", border: "1px solid rgba(255,88,51,0.3)" }}
            >
              <Lock className="w-4 h-4" style={{ color: "#ff5833" }} />
            </div>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center px-6 pt-3 pb-5"
          >
            <h2
              className="text-2xl sm:text-3xl font-black text-white mb-1.5"
              style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", letterSpacing: "-0.03em" }}
            >
              Accede al universo Cabaña
            </h2>
            <p className="text-white/40 text-xs sm:text-sm max-w-xs mx-auto">
              Regístrate para descubrir, conectar y crear dentro de la red
            </p>
          </motion.div>

          {/* Plans — horizontal compact */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.5 }}
            className="grid grid-cols-3 gap-2 px-4 pb-5"
          >
            {PLANS.map((plan, idx) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38 + idx * 0.07 }}
                className="relative rounded-xl p-3 flex flex-col"
                style={{
                  background: plan.highlighted ? "rgba(255,88,51,0.08)" : "rgba(255,255,255,0.03)",
                  border: plan.highlighted ? "1px solid rgba(255,88,51,0.4)" : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {plan.badge && (
                  <div
                    className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide text-white whitespace-nowrap"
                    style={{ background: "linear-gradient(135deg, #ff5833, #ff8c00)" }}
                  >
                    {plan.badge}
                  </div>
                )}
                {/* Price row */}
                <div className="flex items-baseline gap-0.5 mb-2">
                  <span
                    className="text-xl font-black text-white"
                    style={{ fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "-0.04em" }}
                  >
                    {plan.price}€
                  </span>
                  <span className="text-white/25 text-[10px]">/mes</span>
                </div>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">{plan.name}</p>
                <ul className="space-y-1 flex-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <Check
                        className="w-2.5 h-2.5 mt-0.5 flex-shrink-0"
                        style={{ color: plan.highlighted ? "#ff5833" : "rgba(255,255,255,0.25)" }}
                      />
                      <span className="text-[10px] text-white/45 leading-snug">{f}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center gap-2.5 px-4 pb-6"
          >
            <button
              onClick={handleSignup}
              className="w-full sm:flex-1 py-3 rounded-xl font-black text-sm text-black transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "white",
                fontFamily: "'Helvetica Neue', sans-serif",
                letterSpacing: "-0.02em",
                boxShadow: "0 4px 20px rgba(255,255,255,0.1)",
              }}
            >
              Empieza gratis — 14 días
            </button>
            <button
              onClick={handleSignup}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-sm text-white/60 hover:text-white transition-colors"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              Iniciar sesión
            </button>
            <button
              onClick={onClose}
              className="text-xs text-white/20 hover:text-white/40 transition-colors underline underline-offset-4 pt-1 sm:pt-0"
            >
              Ver contenido
            </button>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}