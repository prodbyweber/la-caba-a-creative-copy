import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ExternalLink, ShieldCheck, Building2, Banknote, CreditCard, Check, Clock, AlertCircle, Copy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { calcTotals, formatPrice, formatLongDate, getPaymentConfig } from "@/lib/reservations";

// Paso 5 mobile: Pago / Reserva. Resumen + 3 métodos + copy buttons para IBAN/Concepto.
export default function MobileStepPayment({ service, extras, date, startTime, endTime, durationHours, info, onCreate, onComplete, onCardSubmitted }) {
  const [method, setMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdRes, setCreatedRes] = useState(null);
  const [cardPhase, setCardPhase] = useState("select");
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [expired, setExpired] = useState(false);
  const [copied, setCopied] = useState("");
  const timerRef = useRef(null);

  const totals = calcTotals(service, extras);
  const { data: config } = useQuery({ queryKey: ["payment-config"], queryFn: getPaymentConfig, staleTime: 60000 });

  const methods = [
    { key: "transfer", label: "Transferencia bancaria", icon: Building2, enabled: config?.transfer_enabled !== false },
    { key: "cash", label: "Pago en efectivo", icon: Banknote, enabled: config?.cash_enabled !== false },
    { key: "card", label: "Pago con tarjeta", icon: CreditCard, enabled: config?.card_enabled !== false && (config?.card_payment_link || service?.payment_link) },
  ].filter(m => m.enabled);

  useEffect(() => {
    if (cardPhase !== "waiting") return;
    setSecondsLeft(120);
    setExpired(false);
    timerRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) { clearInterval(timerRef.current); setExpired(true); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [cardPhase]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  const handleSelect = (key) => { if (loading) return; setMethod(key); setError(""); };
  const validate = () => {
    if (!info.customer_name?.trim() || !info.email?.trim()) { setError("Faltan datos del cliente (nombre y email)."); return false; }
    return true;
  };
  const copyToClipboard = (text, label) => {
    if (!text) return;
    navigator.clipboard?.writeText(text).then(() => { setCopied(label); setTimeout(() => setCopied(""), 2000); }).catch(() => {});
  };

  const handleRequest = async () => {
    if (!validate() || !method) return;
    setLoading(true); setError("");
    try {
      const holdExpires = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      await onCreate({ totals, payment_method: method, payment_status: "pending", reservation_status: "temporary_hold", hold_expires_at: holdExpires });
      onComplete();
    } catch (e) { setError(e?.message || "No se pudo crear la reserva."); } finally { setLoading(false); }
  };

  const handlePayCard = async () => {
    if (!validate()) return;
    setLoading(true); setError("");
    try {
      const link = config?.card_payment_link || service?.payment_link;
      if (!link) { setError("No hay payment link configurado."); setLoading(false); return; }
      const holdExpires = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      const res = await onCreate({ totals, payment_method: "card", payment_status: "pending", reservation_status: "temporary_hold", hold_expires_at: holdExpires, payment_link: link });
      setCreatedRes(res);
      window.open(link, "_blank", "noopener,noreferrer");
      setCardPhase("waiting");
    } catch (e) { setError(e?.message || "No se pudo iniciar el pago."); } finally { setLoading(false); }
  };

  const handleConfirmPaid = async () => {
    if (!createdRes) return;
    setLoading(true); setError("");
    try { await onCardSubmitted(createdRes); } catch (e) { setError(e?.message || "No se pudo actualizar la reserva."); } finally { setLoading(false); }
  };

  const handleExpiredRestart = () => { setCardPhase("select"); setMethod(null); setCreatedRes(null); setExpired(false); };
  const extrasList = extras || [];

  // ── Pantalla de espera (tarjeta) ──
  if (cardPhase === "waiting") {
    return (
      <div className="text-center py-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-16 h-16 rounded-full bg-[#ff5833]/15 flex items-center justify-center mx-auto mb-5">
          {expired ? <AlertCircle className="w-8 h-8 text-red-400" /> : <Clock className="w-8 h-8 text-[#ff5833]" />}
        </motion.div>
        <h2 className="text-2xl font-black text-white mb-2" style={{ letterSpacing: "-0.02em" }}>
          {expired ? "Tiempo finalizado" : "Pago en proceso"}
        </h2>
        <p className="text-white/50 text-sm mb-6 px-4">
          {expired
            ? "El tiempo reservado para completar el pago ha finalizado. Puedes volver a seleccionar una fecha y hora disponible."
            : "Completa el pago en la nueva pestaña. Cuando termines, vuelve aquí para confirmar."}
        </p>
        {!expired && (
          <div className="mb-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/30 mb-2">Tiempo restante</p>
            <div className="inline-flex items-center justify-center px-6 py-4 rounded-2xl font-black text-4xl tabular-nums"
              style={{ background: "rgba(255,88,51,0.08)", border: "1px solid rgba(255,88,51,0.25)", color: "#ff5833" }}>
              {mm}:{ss}
            </div>
          </div>
        )}
        {expired ? (
          <button onClick={handleExpiredRestart} className="px-7 py-3.5 rounded-xl text-sm font-bold" style={{ background: "#ff5833", color: "#fff" }}>
            Volver a seleccionar horario
          </button>
        ) : (
          <button onClick={handleConfirmPaid} disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-sm font-bold disabled:opacity-50"
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
    <div className="space-y-6">
      <div>
        <h2 className="text-[28px] font-black text-white mb-1.5" style={{ letterSpacing: "-0.02em" }}>Resumen y pago</h2>
        <p className="text-white/40 text-sm">Revisa los detalles y elige cómo pagar.</p>
      </div>

      {/* Resumen */}
      <div className="rounded-2xl border border-white/[0.08] overflow-hidden" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/30 mb-3">Tu reserva</p>
          <div className="flex items-center justify-between">
            <span className="text-white font-medium text-sm">{durationHours > 0 ? `${durationHours}h — ${service?.name}` : service?.name}</span>
            <span className="text-white font-bold">{formatPrice(service?.price)}</span>
          </div>
          {extrasList.length > 0 && (
            <div className="mt-2 pt-2 border-t border-white/[0.05] space-y-1">
              {extrasList.map((e, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-white/60">{e.name}</span>
                  <span className="text-white/60">{formatPrice(e.price)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between text-sm">
          <div><p className="text-[10px] uppercase tracking-wider text-white/30">Fecha</p><p className="text-white/70">{formatLongDate(date)}</p></div>
          <div className="text-right"><p className="text-[10px] uppercase tracking-wider text-white/30">Hora</p><p className="text-white/70">{startTime}{endTime ? ` — ${endTime}` : ""}</p></div>
        </div>
        <div className="px-5 py-4 flex items-center justify-between">
          <span className="text-white font-bold text-lg">Total</span>
          <span className="text-3xl font-black text-[#ff5833]">{formatPrice(totals.total)}</span>
        </div>
      </div>

      {/* Selección de método */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40 mb-3">¿Cómo quieres pagar?</p>
        <div className="space-y-3">
          {methods.map(m => {
            const Icon = m.icon;
            const selected = method === m.key;
            return (
              <button key={m.key} onClick={() => handleSelect(m.key)} disabled={loading}
                className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all disabled:opacity-50"
                style={{ background: selected ? "rgba(255,88,51,0.06)" : "rgba(255,255,255,0.02)", border: selected ? "1.5px solid #ff5833" : "1px solid rgba(255,255,255,0.08)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: selected ? "rgba(255,88,51,0.15)" : "rgba(255,255,255,0.04)" }}>
                  <Icon className="w-5 h-5" style={{ color: selected ? "#ff5833" : "rgba(255,255,255,0.5)" }} />
                </div>
                <span className="flex-1 text-white text-base font-medium">{m.label}</span>
                <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: selected ? "#ff5833" : "transparent", border: selected ? "none" : "1.5px solid rgba(255,255,255,0.2)" }}>
                  {selected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detalle del método */}
      <AnimatePresence mode="wait">
        {method === "transfer" && (
          <motion.div key="transfer" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="rounded-2xl border border-white/[0.08] p-5" style={{ background: "rgba(255,255,255,0.02)" }}>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#ff5833] mb-3">Pago por transferencia</p>
              <div className="space-y-1">
                <BankRow label="Titular" value={config?.account_holder} />
                <BankRow label="Banco" value={config?.bank_name} />
                <BankRow label="IBAN" value={config?.iban} mono onCopy={() => copyToClipboard(config?.iban, "IBAN")} copied={copied === "IBAN"} />
                <BankRow label="BIC/SWIFT" value={config?.bic_swift} mono />
                <BankRow label="Concepto" value={`${info.customer_name || ""} / ${createdRes?.reservation_code || "—"}`} onCopy={() => copyToClipboard(`${info.customer_name || ""} / ${createdRes?.reservation_code || ""}`, "Concepto")} copied={copied === "Concepto"} />
              </div>
              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                <p className="text-white/45 text-xs leading-relaxed">
                  Dispones de 1 hora para realizar la transferencia y permitirnos corroborar el pago. Una vez recibido y verificado el importe, confirmaremos definitivamente tu reserva. Si transcurrido este plazo no podemos verificar el pago, el horario podrá volver a quedar disponible.
                </p>
              </div>
            </div>
          </motion.div>
        )}
        {method === "cash" && (
          <motion.div key="cash" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="rounded-2xl border border-white/[0.08] p-5" style={{ background: "rgba(255,255,255,0.02)" }}>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#ff5833] mb-3">Pago en efectivo</p>
              <p className="text-white/50 text-sm leading-relaxed">
                Tu horario queda reservado temporalmente durante 1 hora mientras coordinamos el pago. Una vez confirmado, recibirás la confirmación definitiva de tu reserva.
              </p>
            </div>
          </motion.div>
        )}
        {method === "card" && (
          <motion.div key="card" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="rounded-2xl border border-white/[0.08] p-5" style={{ background: "rgba(255,255,255,0.02)" }}>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#ff5833] mb-3">Pago con tarjeta</p>
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/50 text-sm">Total a pagar</span>
                <span className="text-2xl font-black text-[#ff5833]">{formatPrice(totals.total)}</span>
              </div>
              <p className="text-white/50 text-sm mb-4">Serás redirigido a nuestra plataforma de pago segura.</p>
              <button onClick={handlePayCard} disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-sm font-bold disabled:opacity-50"
                style={{ background: "#ff5833", color: "#fff" }}>
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Iniciando…</> : <>PAGAR CON TARJETA <ExternalLink className="w-4 h-4" /></>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      {method && method !== "card" && (
        <button onClick={handleRequest} disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-sm font-bold disabled:opacity-50"
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

function BankRow({ label, value, mono, onCopy, copied }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-white/[0.04]">
      <span className="text-[10px] uppercase tracking-wider text-white/30 flex-shrink-0">{label}</span>
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-white/80 text-right truncate" style={mono ? { fontFamily: "ui-monospace, monospace", letterSpacing: "0.02em" } : {}}>
          {value || "—"}
        </span>
        {onCopy && value && (
          <button onClick={onCopy} className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: copied ? "rgba(255,88,51,0.15)" : "rgba(255,255,255,0.05)" }}>
            {copied ? <Check className="w-3.5 h-3.5 text-[#ff5833]" /> : <Copy className="w-3.5 h-3.5 text-white/40" />}
          </button>
        )}
      </div>
    </div>
  );
}