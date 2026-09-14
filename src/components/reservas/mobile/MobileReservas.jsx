import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { STEPS } from "@/lib/reservations";
import MobileStepService from "./MobileStepService";
import MobileStepExtras from "./MobileStepExtras";
import MobileStepDateTime from "./MobileStepDateTime";
import MobileStepInfo from "./MobileStepInfo";
import MobileStepPayment from "./MobileStepPayment";
import MobileStepConfirmation from "./MobileStepConfirmation";
import BeatPicker from "@/components/reservas/BeatPicker";

const LOGO = "https://media.base44.com/images/public/6966ddf48947f217e81ea27c/6b7c4002a_Titulo.png";

// Layout mobile específico para /reservas. No afecta al layout desktop.
export default function MobileReservas({
  step, service, setService, extras, setExtras,
  date, setDate, startTime, setStartTime, endTime, setEndTime,
  info, setInfo, reservation, beatMode, setBeatMode,
  canProceed, next, back, handlePickBeat, handleCreate,
  handleCardSubmitted, handleComplete, durationHours,
}) {
  const current = STEPS[step];
  const showBottomNav = step < 5;
  const showNext = step < 4;

  return (
    <div className="flex flex-col" style={{ minHeight: "100dvh", background: "#0a0a0b" }}>
      {/* Header mobile */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-5 py-3 border-b border-white/[0.06]"
        style={{ background: "#0d0d0e", paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <Link to="/"><img src={LOGO} alt="Cabaña Creative" className="h-6 w-auto opacity-90" /></Link>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
            {String(step + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
          </p>
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#ff5833]">{current.label}</p>
        </div>
      </header>

      {/* Barra de progreso */}
      {step < 5 && (
        <div className="flex items-center px-5 py-2.5 gap-1.5 border-b border-white/[0.04]" style={{ background: "#0d0d0e" }}>
          {STEPS.map((s, idx) => (
            <div
              key={s.key}
              className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{ background: idx <= step ? "#ff5833" : "rgba(255,255,255,0.08)" }}
            />
          ))}
        </div>
      )}

      {/* Contenido */}
      <main
        className="flex-1 overflow-y-auto px-5 py-5"
        style={{ paddingBottom: showBottomNav ? "6rem" : "2rem" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {step === 0 && <MobileStepService selectedService={service} onSelect={setService} onPickBeat={() => setBeatMode("service")} />}
            {step === 1 && <MobileStepExtras extras={extras} setExtras={setExtras} onPickBeat={() => setBeatMode("extra")} service={service} />}
            {step === 2 && (
              <MobileStepDateTime
                service={service}
                date={date}
                startTime={startTime}
                onChange={({ date: d, startTime: st, endTime: et }) => { setDate(d); setStartTime(st || ""); setEndTime(et || ""); }}
              />
            )}
            {step === 3 && <MobileStepInfo info={info} onChange={setInfo} />}
            {step === 4 && (
              <MobileStepPayment
                service={service} extras={extras} date={date} startTime={startTime} endTime={endTime}
                durationHours={durationHours} info={info}
                onCreate={handleCreate} onComplete={handleComplete} onCardSubmitted={handleCardSubmitted}
              />
            )}
            {step === 5 && (
              <MobileStepConfirmation
                reservation={reservation} service={service} extras={extras} date={date}
                startTime={startTime} endTime={endTime} durationHours={durationHours}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Navegación inferior fija */}
      {showBottomNav && (
        <div
          className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/[0.06] px-5 py-3 flex items-center justify-between"
          style={{ background: "#0d0d0e", paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <button
            onClick={back}
            disabled={step === 0}
            className="flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-medium text-white/60 transition-colors disabled:opacity-30"
          >
            <ArrowLeft className="w-4 h-4" /> Atrás
          </button>
          {showNext && (
            <button
              onClick={next}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
              style={{ background: "#ff5833", color: "#fff" }}
            >
              Siguiente <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Beat picker (bottom sheet en mobile) */}
      <BeatPicker
        open={beatMode !== null}
        onClose={() => setBeatMode(null)}
        onSelect={handlePickBeat}
        title={beatMode === "service" ? "Selecciona tu beat" : "Añadir beat a la reserva"}
      />
    </div>
  );
}