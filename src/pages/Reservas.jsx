import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";
import { STEPS, calcTotals, normalizeBeatService, formatPrice, generateReservationCode, sendReservationEmail } from "@/lib/reservations";
import WizardSidebar from "@/components/reservas/WizardSidebar";
import MobileReservas from "@/components/reservas/mobile/MobileReservas";
import BeatPicker from "@/components/reservas/BeatPicker";
import StepService from "@/components/reservas/StepService";
import StepExtras from "@/components/reservas/StepExtras";
import StepDateTime from "@/components/reservas/StepDateTime";
import StepInfo from "@/components/reservas/StepInfo";
import StepPayment from "@/components/reservas/StepPayment";
import StepConfirmation from "@/components/reservas/StepConfirmation";

const LOGO = "https://media.base44.com/images/public/6966ddf48947f217e81ea27c/6b7c4002a_Titulo.png";

export default function Reservas() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [service, setService] = useState(null);
  const [extras, setExtras] = useState([]);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [info, setInfo] = useState({ customer_name: "", customer_last_name: "", email: "", phone: "", artist_project: "", notes: "" });
  const [reservation, setReservation] = useState(null);
  const [beatMode, setBeatMode] = useState(null); // "service" | "extra" | null

  const isStudio = (service?.duration_hours || 0) > 0;
  const durationHours = service?.duration_hours || 0;

  const completedSteps = [];
  if (service) completedSteps.push(0);
  if (service) completedSteps.push(1); // extras siempre completable
  if (date && (!isStudio || startTime)) completedSteps.push(2);
  if (info.customer_name?.trim() && info.email?.trim()) completedSteps.push(3);

  const canProceed = () => {
    if (step === 0) return !!service;
    if (step === 1) return !!service;
    if (step === 2) return isStudio ? !!date && !!startTime : !!date;
    if (step === 3) return !!info.customer_name?.trim() && !!info.email?.trim();
    return true;
  };

  const next = () => { if (canProceed() && step < STEPS.length - 1) setStep(step + 1); };
  const back = () => { if (step > 0) setStep(step - 1); };

  const handlePickBeat = (beat) => {
    if (beatMode === "service") {
      setService(normalizeBeatService(beat));
    } else if (beatMode === "extra") {
      if (!extras.some(e => e.beat_id === beat.id)) {
        setExtras([...extras, {
          extra_id: "beat-" + beat.id,
          name: beat.title,
          type: "beat",
          price: Number(beat.reservation_price) || 75,
          beat_id: beat.id,
        }]);
      }
    }
    setBeatMode(null);
  };

  const handleCreate = async ({ totals, payment_method, payment_status, reservation_status, hold_expires_at, payment_link }) => {
    const code = await generateReservationCode();
    const payload = {
      reservation_code: code,
      customer_name: info.customer_name,
      customer_last_name: info.customer_last_name,
      email: info.email,
      phone: info.phone,
      artist_project: info.artist_project,
      notes: info.notes,
      service_id: service.id,
      service_kind: service.kind || "service",
      service_name: service.name,
      service_price: service.price,
      extras: extras.map(e => ({ name: e.name, type: e.type, beat_id: e.beat_id || null, hours: e.hours || null, price: e.price })),
      beat_id: service.beat_id || extras.find(e => e.type === "beat")?.beat_id || null,
      date,
      start_time: isStudio ? startTime : null,
      end_time: isStudio ? endTime : null,
      duration_hours: durationHours,
      subtotal: totals.subtotal,
      total: totals.total,
      payment_method,
      payment_status: payment_status || "pending",
      reservation_status: reservation_status || "pendiente",
      hold_expires_at: hold_expires_at || null,
      payment_link: payment_link || "",
    };
    const created = await base44.entities.Reservation.create(payload);
    setReservation(created);
    queryClient.invalidateQueries({ queryKey: ["reservations"] });
    // Email al cliente + CC al estudio (contenido adaptado al método)
    sendReservationEmail({ ...created, reservation_code: code }).catch(() => {});
    return { ...created, reservation_code: code };
  };

  // Tarjeta: el usuario confirma "YA HE REALIZADO EL PAGO" → payment_submitted + pending_verification
  const handleCardSubmitted = async (res) => {
    const updated = await base44.entities.Reservation.update(res.id, {
      payment_status: "payment_submitted",
      reservation_status: "pending_verification",
    });
    setReservation({ ...res, ...updated });
    queryClient.invalidateQueries({ queryKey: ["reservations"] });
    setStep(5);
  };

  const handleComplete = () => setStep(5);

  const isMobile = useIsMobile();

  // Layout mobile específico — no afecta al desktop
  if (isMobile) {
    return (
      <MobileReservas
        step={step}
        service={service}
        setService={setService}
        extras={extras}
        setExtras={setExtras}
        date={date}
        setDate={setDate}
        startTime={startTime}
        setStartTime={setStartTime}
        endTime={endTime}
        setEndTime={setEndTime}
        info={info}
        setInfo={setInfo}
        reservation={reservation}
        beatMode={beatMode}
        setBeatMode={setBeatMode}
        canProceed={canProceed}
        next={next}
        back={back}
        handlePickBeat={handlePickBeat}
        handleCreate={handleCreate}
        handleCardSubmitted={handleCardSubmitted}
        handleComplete={handleComplete}
        durationHours={durationHours}
      />
    );
  }

  // ── Layout desktop (sin cambios) ──
  return (
    <div className="flex flex-col" style={{ minHeight: "100dvh", background: "#0a0a0b" }}>
      {/* Top bar (mobile logo) */}
      <div className="md:hidden flex items-center justify-between px-5 py-3 border-b border-white/[0.06]" style={{ background: "#0d0d0e" }}>
        <Link to="/"><img src={LOGO} alt="Cabaña Creative" className="h-7 w-auto opacity-90" /></Link>
        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#ff5833]">Reservas</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <WizardSidebar currentStep={step} completedSteps={completedSteps} />

        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Desktop top bar */}
          <div className="hidden md:flex items-center justify-between px-8 py-4 border-b border-white/[0.06]">
            <Link to="/"><img src={LOGO} alt="Cabaña Creative" className="h-8 w-auto opacity-90" /></Link>
            <span className="text-xs text-white/40">{STEPS[step].label} · Paso {step + 1} de {STEPS.length}</span>
          </div>

          {/* Step content */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-6 sm:py-8 pb-28">
            <div className="max-w-3xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  {step === 0 && <StepService selectedService={service} onSelect={setService} onPickBeat={() => setBeatMode("service")} />}
                  {step === 1 && <StepExtras extras={extras} setExtras={setExtras} onPickBeat={() => setBeatMode("extra")} service={service} />}
                  {step === 2 && (
                    <StepDateTime
                      service={service}
                      date={date}
                      startTime={startTime}
                      onChange={({ date: d, startTime: st, endTime: et }) => { setDate(d); setStartTime(st || ""); setEndTime(et || ""); }}
                    />
                  )}
                  {step === 3 && <StepInfo info={info} onChange={setInfo} />}
                  {step === 4 && (
                    <StepPayment
                      service={service} extras={extras} date={date} startTime={startTime} endTime={endTime}
                      durationHours={durationHours} info={info}
                      onCreate={handleCreate} onComplete={handleComplete} onCardSubmitted={handleCardSubmitted}
                    />
                  )}
                  {step === 5 && (
                    <StepConfirmation
                      reservation={reservation} service={service} extras={extras} date={date}
                      startTime={startTime} endTime={endTime} durationHours={durationHours}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Resumen de selección (pasos Servicio y Extras) */}
              {(step === 0 || step === 1) && service && (
               <div className="mt-8 pt-6 border-t border-white/[0.06]">
                 <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/30 mb-3">Resumen de selección</p>
                 <div className="space-y-2">
                   <div className="flex items-center justify-between text-sm">
                     <span className="text-white/50">Servicio</span>
                     <span className="text-white font-medium">{service.name}</span>
                   </div>
                   {step === 1 && extras.filter(e => e.type === "beat").map(e => (
                     <div key={e.beat_id} className="flex items-center justify-between text-sm">
                       <span className="text-white/50">Beat · {e.name}</span>
                       <span className="text-white/70">{formatPrice(e.price)}</span>
                     </div>
                   ))}
                   {step === 1 && extras.filter(e => e.type === "simple").map(e => (
                     <div key={e.extra_id} className="flex items-center justify-between text-sm">
                       <span className="text-white/50">{e.name}</span>
                       <span className="text-white/70">{formatPrice(e.price)}</span>
                     </div>
                   ))}
                   <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
                     <span className="text-white font-semibold">Total</span>
                     <span className="text-xl font-black text-[#ff5833]">{formatPrice(calcTotals(service, extras).total)}</span>
                   </div>
                 </div>
               </div>
              )}
              </div>
              </div>

          {/* Bottom nav (hidden on confirmation and payment — payment has its own action) */}
          {step < 4 && (
            <div className="border-t border-white/[0.06] px-5 sm:px-8 py-4 flex items-center justify-between" style={{ background: "#0d0d0e" }}>
              <button
                onClick={back}
                disabled={step === 0}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white transition-colors disabled:opacity-30"
              >
                <ArrowLeft className="w-4 h-4" /> Atrás
              </button>
              <button
                onClick={next}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100"
                style={{ background: "#ff5833", color: "#fff" }}
              >
                Siguiente <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
          {step === 4 && (
            <div className="border-t border-white/[0.06] px-5 sm:px-8 py-4 flex items-center justify-start" style={{ background: "#0d0d0e" }}>
              <button
                onClick={back}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Atrás
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Beat picker modal */}
      <BeatPicker
        open={beatMode !== null}
        onClose={() => setBeatMode(null)}
        onSelect={handlePickBeat}
        title={beatMode === "service" ? "Selecciona tu beat" : "Añadir beat a la reserva"}
      />
    </div>
  );
}