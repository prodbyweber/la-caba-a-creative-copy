import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

export default function PricingModal({ onClose }) {
  const navigate = useNavigate();

  const handleCTA = () => {
    onClose();
    navigate("/pricing");
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        className="fixed inset-0 z-[800] flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(18px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-4xl rounded-3xl overflow-hidden"
          style={{
            background: "rgba(12,12,14,0.92)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 0 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Subtle glow top */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px"
            style={{ background: "linear-gradient(to right, transparent, rgba(255,88,51,0.4), transparent)" }}
          />

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <X className="w-4 h-4 text-white/60" />
          </button>

          <div className="px-6 sm:px-10 pt-10 pb-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h2
                className="text-3xl sm:text-4xl font-black text-white mb-3 tracking-tight"
                style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", letterSpacing: "-0.03em" }}
              >
                Subscríbete
              </h2>
              <p className="text-sm sm:text-base text-white/45 max-w-md mx-auto leading-relaxed">
                Conecta, crea y consigue oportunidades reales dentro de la industria
              </p>
            </div>

            {/* Plans */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className="relative rounded-2xl flex flex-col"
                  style={{
                    background: plan.highlighted
                      ? "rgba(255,88,51,0.07)"
                      : "rgba(255,255,255,0.025)",
                    border: plan.highlighted
                      ? "1px solid rgba(255,88,51,0.35)"
                      : "1px solid rgba(255,255,255,0.07)",
                    boxShadow: plan.highlighted
                      ? "0 0 30px rgba(255,88,51,0.12)"
                      : "none",
                  }}
                >
                  {plan.badge && (
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
                      style={{ background: "linear-gradient(135deg, #ff5833, #ff8c00)" }}
                    >
                      {plan.badge}
                    </div>
                  )}

                  <div className="p-5 sm:p-6 flex flex-col h-full">
                    <div className="mb-5">
                      <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-1">{plan.name}</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-white" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", letterSpacing: "-0.04em" }}>
                          {plan.price}€
                        </span>
                        <span className="text-white/30 text-sm">/mes</span>
                      </div>
                    </div>

                    <ul className="space-y-2.5 flex-1 mb-6">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: plan.highlighted ? "#ff5833" : "rgba(255,255,255,0.4)" }} />
                          <span className="text-xs text-white/55 leading-relaxed">{f}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={handleCTA}
                      className="w-full py-2.5 rounded-xl text-sm font-bold transition-all"
                      style={plan.highlighted
                        ? { background: "#ff5833", color: "white", boxShadow: "0 4px 20px rgba(255,88,51,0.35)" }
                        : { background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.75)", border: "1px solid rgba(255,255,255,0.1)" }
                      }
                    >
                      {plan.cta}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}