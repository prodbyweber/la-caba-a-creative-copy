import React from "react";
import { Check } from "lucide-react";
import { STEPS } from "@/lib/reservations";

// Sidebar del wizard: indicador de pasos.
// Desktop: panel lateral izquierdo oscuro con logo, pasos y contacto.
// Mobile: indicador de progreso compacto horizontal.
export default function WizardSidebar({ currentStep, completedSteps }) {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex flex-col w-72 flex-shrink-0 border-r border-white/[0.06] p-7" style={{ background: "#0d0d0e" }}>
        <div className="mb-10">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ff5833]">Cabaña Creative</span>
          <p className="text-white/30 text-xs mt-1.5">Sistema de reservas</p>
        </div>

        <nav className="flex flex-col gap-1.5 flex-1">
          {STEPS.map((step, idx) => {
            const isActive = idx === currentStep;
            const isDone = completedSteps.includes(idx);
            return (
              <div key={step.key} className="flex items-center gap-3 py-1">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all"
                  style={{
                    background: isActive ? "#ff5833" : isDone ? "rgba(255,88,51,0.15)" : "rgba(255,255,255,0.05)",
                    color: isActive ? "#fff" : isDone ? "#ff5833" : "rgba(255,255,255,0.35)",
                    border: isActive ? "none" : `1px solid ${isDone ? "rgba(255,88,51,0.3)" : "rgba(255,255,255,0.08)"}`,
                  }}
                >
                  {isDone ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                </div>
                <span
                  className="text-sm font-medium transition-colors"
                  style={{ color: isActive ? "#fff" : isDone ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.35)" }}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-white/[0.06]">
          <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">¿Dudas?</p>
          <a href="mailto:hola@cabanacreative.es" className="text-sm text-white/60 hover:text-white transition-colors">hola@cabanacreative.es</a>
        </div>
      </aside>

      {/* Mobile: indicador compacto */}
      <div className="md:hidden flex items-center gap-1.5 px-5 py-3.5 border-b border-white/[0.06] overflow-x-auto" style={{ background: "#0d0d0e" }}>
        {STEPS.map((step, idx) => {
          const isActive = idx === currentStep;
          const isDone = completedSteps.includes(idx);
          return (
            <React.Fragment key={step.key}>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                  style={{
                    background: isActive ? "#ff5833" : isDone ? "rgba(255,88,51,0.15)" : "rgba(255,255,255,0.05)",
                    color: isActive ? "#fff" : isDone ? "#ff5833" : "rgba(255,255,255,0.4)",
                  }}
                >
                  {isDone ? <Check className="w-2.5 h-2.5" /> : idx + 1}
                </div>
                <span className="text-[10px] font-medium" style={{ color: isActive ? "#fff" : "rgba(255,255,255,0.4)" }}>{step.short}</span>
              </div>
              {idx < STEPS.length - 1 && <div className="w-3 h-px flex-shrink-0" style={{ background: "rgba(255,255,255,0.1)" }} />}
            </React.Fragment>
          );
        })}
      </div>
    </>
  );
}