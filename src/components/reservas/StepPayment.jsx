import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ExternalLink, ShieldCheck, Building2, Banknote, CreditCard, Check, Clock, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { calcTotals, formatPrice, formatLongDate, getPaymentConfig } from "@/lib/reservations";

// Paso 5: Pago / Reserva.
// Resumen completo + 3 métodos seleccionables (transferencia, efectivo, tarjeta).
// Tarjeta: abre payment link en nueva pestaña + timer 2 min + "YA HE REALIZADO EL PAGO".
export default function StepPayment({ service, extras, date, startTime, endTime, durationHours, info, onCreate, onComplete, onCardSubmitted }) {
  const [method, setMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdRes, setCreatedRes] = useState(null); // reserva temporal creada (tarjeta)
  const [cardPhase, setCardPhase] = useState("select"); // "select" | "waiting"
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [expired, setExpired] = useState(false);
  const timerRef = useRef(null);

  const totals = calcTotals(service, extras);
  const { data: config } = useQuery({
    queryKey: ["payment-config"],
    queryFn: getPaymentConfig,
    staleTime: 60000,
  });

  const methods = [
    { key: "transfer", label: "Transferencia bancaria", icon: Building2, enabled: config?.transfer_enabled !== false },
    { key: "cash", label: "Pago en efectivo", icon: Banknote, enabled: config?.cash_enabled !== false },
    { key: "card", label: "Pago con tarjeta", icon: CreditCard, enabled: config?.card_enabled !== false && (config?.card_payment_link || service?.payment_link) },
  ].filter(m => m.enabled);

  // Timer de tarjeta (2 min)
  useEffect(() => {
    if (cardPhase !== "waiting") return;
    setSecondsLeft(120);
    setExpired(false);
    timerRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          setExpired(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [cardPhase]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  const handleSelect = (key) => {
    if (loading) return;
    setMethod(key);
    setError("");
  };

  const validate = () => {
    if (!info.customer_name?.trim() || !info.email?.trim()) {
      setError("Faltan datos del cliente (nombre y email).");
      return false;
    }
    return true;
  };

  // Transferencia / Efectivo: crear reserva (retención 1h) → confirmación
  const handleRequest = async () => {
    if (!validate() || !method) return;
    setLoading(true);
    setError("");
    try {
      const holdExpires = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      await onCreate({
        totals,
        payment_method: method,
        payment_status: "pending",
        reservation_status: "temporary_hold",
        hold_expires_at: holdExpires,
      });
      onComplete();
    } catch (e) {
      setError(e?.message || "No se pudo crear la reserva.");
    } finally {
      setLoading(false);
    }
  };

  // Tarjeta: crear reserva (retención temporal) → abrir link → waiting
  const handlePayCard = async () => {
    if (!validate()) return;
    setLoading(true);
    setError("");
    try {
      const link = config?.card_payment_link || service?.payment_link;
      if (!link) { setError("No hay payment link configurado."); setLoading(false); return; }
      const holdExpires = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      const res = await onCreate({
        totals,
        payment_method: "card",
        payment_status: "pending",
        reservation_status: "temporary_hold",
        hold_expires_at: holdExpires,
        payment_link: link,
      });
      setCreatedRes(res);
      window.open(link, "_blank", "noopener,noreferrer");
      setCardPhase("waiting");
    } catch (e) {
      setError(e?.message || "No se pudo iniciar el pago.");
    } finally {
      setLoading(false);
    }
  };

  // "YA HE REALIZADO EL PAGO" → payment_submitted + pending_verification
  const handleConfirmPaid = async () => {
    if (!createdRes) return;
    setLoading(true);
    setError("");
    try {
      await onCardSubmitted(createdRes);
    } catch (e) {
      setError(e?.message || "No se pudo actualizar la reserva.");
    } finally {
      setLoading(false);
    }
  };

  const handleExpiredRestart = () => {
    setCardPhase("select");
    setMethod(null);
    setCreatedRes(null);
    setExpired(false);
  };

  const extrasList = extras || [];

  // ── Pantalla de espera (tarjeta) ──
  if (cardPhase === "waiting") {
    return (
      <div className="max-w-lg mx-auto text-center py-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-16 h-16 rounded-full bg-[#ff5833]/15 flex items-center justify-center mx-auto mb-5">
          {expired ? <AlertCircle className="w-8 h-8 text-red-400" /> : <Clock className="w-8 h-8 text-[#ff5833]" />}
        </motion.div>

        <h2 className="text-2xl sm:text-3xl font-black text-white mb-2" style={{ letterSpacing: "-0.02em" }}>
          {expired ? "Tiempo finalizado" : "Pago en proceso"}
        </h2>
        <p className="text-white/50 text-sm max-w-md mx-auto mb-6">
          {expired
            ? "El tiempo reservado para completar el pago ha finalizado. Puedes volver a seleccionar una fecha y hora disponible."
            : "Completa el pago en la nueva pestaña que acabamos de abrir. Cuando hayas terminado, vuelve a esta página para confirmar que has realizado el pago."}
        </p>

        {!expired && (
          <div className="mb-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/30 mb-2">Tiempo reservado para completar el pago</p>
            <div className="inline-flex items-center justify-center px-6 py-4 rounded-2xl font-black text-4xl tabular-nums"
              style={{ background: "rgba(255,88,51,0.08)", border: "1px solid rgba(255,88,51,0.25)", color: "#ff5833", letterSpacing: "0.05em" }}>
              {mm}:{ss}
            </div>
          </div>
        )}

        {expired ? (
          <button onClick={handleExpiredRestart}
            className="px-7 py-3.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02]"
            style={{ background: "#ff5833", color: "#fff" }}>
            Volver a seleccionar horario
          </button>
        ) : (
          <button onClick={handleConfirmPaid} disabled={loading}
            className="px-8 py-4 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center gap-2 mx-auto"
            style={{ background: "#ff5833", color: "#fff" }}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Actualizando…</> : <><Check className="w-4 h-4" /> YA HE REALIZADO EL PAGO</>}
          </button>
        )}

        {error && <p className="text-red-400 text-xs mt-4">{error}</p>}
      </div>
    );
  }

  // ── Pantalla principal de pago ──
  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-1.5" style={{ letterSpacing: "-0.02em" }}>Resumen de tu reserva</h2>
        <p className="text-white/40 text-sm">Revisa los detalles y elige cómo quieres pagar.</p>
      </div>

      {/* Resumen completo */}
      <div className="rounded-xl border border-white/[0.07] overflow-hidden" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/30 mb-3">Tu reserva</p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-white font-medium">{durationHours > 0 ? `${durationHours} horas — ${service?.name}` : service?.name}</span>
            <span className="text-white font-bold">{formatPrice(service?.price)}</span>
          </div>
          {extrasList.length > 0 && (
            <div className="mt-2 pt-2 border-t border-white/[0.05]">
              <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Extras</p>
              {extrasList.map((e, i) => (
                <div key={i} className="flex items-center justify-between text-sm py-1">
                  <span className="text-white/60">{e.name}</span>
                  <span className="text-white/60">{formatPrice(e.price)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="px-5 py-3 border-b border-white/[0.06] grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-[10px] uppercase tracking-wider text-white/30">Fecha</p><p className="text-white/70">{formatLongDate(date)}</p></div>
          <div><p className="text-[10px] uppercase tracking-wider text-white/30">Hora</p><p className="text-white/70">{startTime}{endTime ? ` — ${endTime}` : ""}</p></div>
          {durationHours > 0 && <div><p className="text-[10px] uppercase tracking-wider text-white/30">Duración</p><p className="text-white/70">{durationHours} horas</p></div>}
        </div>
        <div className="px-5 py-4 flex items-center justify-between">
          <span className="text-white font-bold text-lg">Total</span>
          <span className="text-3xl font-black text-[#ff5833]">{formatPrice(totals.total)}</span>
        </div>
      </div>

      {/* Selección de método */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40 mb-3">¿Cómo quieres realizar el pago?</p>
        <div className="space-y-2.5">
          {methods.map(m => {
            const Icon = m.icon;
            const selected = method === m.key;
            return (
              <button key={m.key} onClick={() => handleSelect(m.key)} disabled={loading}
                className="w-full flex items-center gap-4 px-4 sm:px-5 py-4 rounded-xl text-left transition-all disabled:opacity-50"
                style={{
                  background: selected ? "rgba(255,88,51,0.06)" : "rgba(255,255,255,0.02)",
                  border: selected ? "1.5px solid #ff5833" : "1px solid rgba(255,255,255,0.07)",
                }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: selected ? "rgba(255,88,51,0.15)" : "rgba(255,255,255,0.04)" }}>
                  <Icon className="w-5 h-5" style={{ color: selected ? "#ff5833" : "rgba(255,255,255,0.5)" }} />
                </div>
                <span className="flex-1 text-white text-sm sm:text-base font-medium">{m.label}</span>
                <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{ background: selected ? "#ff5833" : "transparent", border: selected ? "none" : "1.5px solid rgba(255,255,255,0.2)" }}>
                  {selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detalle del método seleccionado */}
      <AnimatePresence mode="wait">
        {method === "transfer" && (
          <motion.div key="transfer" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="rounded-xl border border-white/[0.07] p-5" style={{ background: "rgba(255,255,255,0.02)" }}>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#ff5833] mb-3">Pago por transferencia</p>
              <p className="text-white/50 text-sm mb-4">Para confirmar tu reserva, realiza una transferencia bancaria utilizando los siguientes datos:</p>
              <div className="space-y-2 text-sm">
                <BankRow label="Titular" value={config?.account_holder} />
                <BankRow label="Banco" value={config?.bank_name} />
                <BankRow label="IBAN" value={config?.iban} mono />
                <BankRow label="BIC/SWIFT" value={config?.bic_swift} mono />
                <BankRow label="Concepto" value={`${info.customer_name || ""} / ${createdRes?.reservation_code || "—"}`} />
              </div>
              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                <p className="text-white/45 text-xs leading-relaxed">
                  Hemos reservado temporalmente este horario para ti durante 1 hora mientras realizas la transferencia.
                  Dispones de 1 hora para completar el pago y enviarnos la transferencia. Una vez recibido y corroborado el pago, confirmaremos definitivamente tu reserva.
                  Si transcurrido este plazo no hemos podido verificar el pago, el horario podrá volver a quedar disponible.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {method === "cash" && (
          <motion.div key="cash" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="rounded-xl border border-white/[0.07] p-5" style={{ background: "rgba(255,255,255,0.02)" }}>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#ff5833] mb-3">Pago en efectivo</p>
              <p className="text-white/50 text-sm leading-relaxed">
                Tu horario quedará reservado temporalmente durante 1 hora mientras coordinamos el pago.
                Una vez confirmado el método de pago, recibirás la confirmación definitiva de tu reserva.
                Si necesitas cualquier aclaración, puedes contactar con Cabaña Creative.
              </p>
            </div>
          </motion.div>
        )}

        {method === "card" && (
          <motion.div key="card" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="rounded-xl border border-white/[0.07] p-5" style={{ background: "rgba(255,255,255,0.02)" }}>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#ff5833] mb-3">Pago con tarjeta</p>
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/50 text-sm">Total a pagar</span>
                <span className="text-2xl font-black text-[#ff5833]">{formatPrice(totals.total)}</span>
              </div>
              <p className="text-white/50 text-sm mb-4">Serás redirigido a nuestra plataforma de pago segura para completar el pago.</p>
              <button onClick={handlePayCard} disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-sm font-bold transition-all hover:scale-[1.01] disabled:opacity-50"
                style={{ background: "#ff5833", color: "#fff" }}>
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Iniciando…</> : <>PAGAR CON TARJETA <ExternalLink className="w-4 h-4" /></>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      {/* Acción principal (transferencia / efectivo) */}
      {method && method !== "card" && (
        <button onClick={handleRequest} disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-sm font-bold transition-all hover:scale-[1.01] disabled:opacity-50"
          style={{ background: "#ff5833", color: "#fff" }}>
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creando reserva…</> : "SOLICITAR RESERVA"}
        </button>
      )}

      <p className="flex items-center justify-center gap-1.5 text-[10px] text-white/30">
        <ShieldCheck className="w-3 h-3" /> Los precios se calculan desde el catálogo oficial.
      </p>
    </div>
  );
}

function BankRow({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 border-b border-white/[0.04]">
      <span className="text-[10px] uppercase tracking-wider text-white/30 flex-shrink-0">{label}</span>
      <span className="text-white/80 text-right" style={mono ? { fontFamily: "ui-monospace, monospace", letterSpacing: "0.02em" } : {}}>{value || "—"}</span>
    </div>
  );
}