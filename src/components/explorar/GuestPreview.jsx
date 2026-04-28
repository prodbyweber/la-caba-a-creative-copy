import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

const PLANS = [
  {
    name: "Basic",
    price: "7",
    features: ["Acceso al contenido exclusivo", "Comunidad privada", "Oportunidades básicas"],
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

// A static, non-interactive cinematic preview strip
function CinematicPreview() {
  return (
    <div className="relative w-full overflow-hidden" style={{ height: "55vh", minHeight: 320 }}>
      {/* Static hero placeholder — feels like the real hero but frozen/blurred */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #111 0%, #1a1a1c 40%, #0d0d0f 100%)",
        }}
      />

      {/* Simulated content cards row — purely decorative */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none select-none">
        <div className="flex gap-4 px-8 w-full overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 rounded-xl bg-white/10"
              style={{ width: 200, height: 112, opacity: 1 - i * 0.12 }}
            />
          ))}
        </div>
      </div>

      {/* Logo mark centered */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center"
        >
          <div
            className="font-black text-white leading-none mb-1"
            style={{
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontSize: "clamp(3.5rem, 12vw, 8rem)",
              letterSpacing: "-0.04em",
              opacity: 0.12,
            }}
          >
            Cabaña
            <span style={{ color: "#ff5833" }}>®</span>
          </div>
        </motion.div>
      </div>

      {/* Strong cinematic gradient fades — top, sides, bottom */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(8,8,8,0.6) 0%, transparent 30%, transparent 50%, rgba(8,8,8,0.85) 85%, #080808 100%)" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(8,8,8,0.5) 0%, transparent 20%, transparent 80%, rgba(8,8,8,0.5) 100%)" }} />

      {/* Blur overlay */}
      <div className="absolute inset-0" style={{ backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }} />

      {/* "Locked" badge */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-black/50 backdrop-blur-sm"
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#ff5833" }} />
        <span className="text-[10px] font-semibold text-white/50 uppercase tracking-widest">Contenido exclusivo</span>
      </motion.div>
    </div>
  );
}

export default function GuestPreview() {
  const { data: config } = useQuery({
    queryKey: ['landingConfig'],
    queryFn: async () => {
      const configs = await base44.entities.LandingConfig.list();
      return configs.length > 0 ? configs[0] : null;
    }
  });

  const handleSignup = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  // Usar valores de config o defaults
  const popupTitle = config?.guest_popup_title || "Accede al universo\nCabaña Creative";
  const popupSubtitle = config?.guest_popup_subtitle || "Descubre, conecta y crea dentro de una red privada de artistas, creadores y marcas";
  const ctaPrimary = config?.guest_popup_cta_primary || "Empieza gratis — 14 días";
  const ctaSecondary = config?.guest_popup_cta_secondary || "Iniciar sesión";
  const badgeText = config?.guest_popup_locked_badge || "Contenido exclusivo";
  const colorPrimary = config?.guest_popup_color_primary || "#ff5833";
  const colorSecondary = config?.guest_popup_color_secondary || "#ffffff";

  return (
    <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden">
      {/* Cinematic blurred preview */}
      <CinematicPreview />

      {/* Paywall section */}
      <div className="relative px-4 sm:px-8 pb-24 pt-12 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <div className="text-[10px] font-semibold text-white/25 uppercase tracking-[0.3em] mb-4">Cabaña Creative</div>
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight whitespace-pre-line"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", letterSpacing: "-0.03em" }}
          >
            {popupTitle}
          </h1>
          <p className="text-white/45 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            {popupSubtitle}
          </p>
        </motion.div>

        {/* Plans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
        >
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className="relative rounded-2xl flex flex-col"
              style={{
                background: plan.highlighted ? `${colorPrimary}14` : "rgba(255,255,255,0.025)",
                border: plan.highlighted ? `1px solid ${colorPrimary}59` : "1px solid rgba(255,255,255,0.07)",
                boxShadow: plan.highlighted ? `0 0 30px ${colorPrimary}1a` : "none",
              }}
            >
              {plan.badge && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
                  style={{ background: `linear-gradient(135deg, ${colorPrimary}, #ff8c00)` }}
                >
                  {plan.badge}
                </div>
              )}
              <div className="p-5 sm:p-6 flex flex-col h-full">
                <div className="mb-4">
                  <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-1">{plan.name}</p>
                  <div className="flex items-baseline gap-1">
                    <span
                      className="text-4xl font-black text-white"
                      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", letterSpacing: "-0.04em" }}
                    >
                      {plan.price}€
                    </span>
                    <span className="text-white/30 text-sm">/mes</span>
                  </div>
                </div>
                <ul className="space-y-2.5 flex-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <Check
                        className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
                        style={{ color: plan.highlighted ? colorPrimary : "rgba(255,255,255,0.35)" }}
                      />
                      <span className="text-xs text-white/55 leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.28, ease: "easeOut" }}
          className="flex flex-col items-center gap-4"
        >
          <button
            onClick={handleSignup}
            className="px-10 py-4 rounded-xl font-black text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: colorSecondary,
              color: colorSecondary === "#ffffff" ? "#000" : "#fff",
              boxShadow: `0 4px 24px ${colorSecondary}26`,
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              letterSpacing: "-0.02em",
            }}
          >
            {ctaPrimary}
          </button>
          <button
            onClick={handleSignup}
            className="text-sm transition-colors underline underline-offset-4"
            style={{ color: "rgba(255,255,255,0.35)" }}
            onMouseEnter={(e) => e.target.style.color = "rgba(255,255,255,0.6)"}
            onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.35)"}
          >
            {ctaSecondary}
          </button>
        </motion.div>
      </div>
    </div>
  );
}