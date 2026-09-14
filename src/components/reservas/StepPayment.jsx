import React, { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, ExternalLink, ShieldCheck } from "lucide-react";
import { calcTotals, formatPrice, PAYMENT_METHOD_LABELS } from "@/lib/reservations";
import ReservationSummary from "@/components/reservas/ReservationSummary";

// Paso 5: Pago / Reserva. Muestra resumen y acción según el método del servicio.
export default function StepPayment({ service, extras, date, startTime, endTime, durationHours, info, onCreate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const totals = calcTotals(service, extras);
  const method = service?.payment_method || "manual";

  const handleCreate = async () => {
    setError("");
    if (!info.customer_name?.trim() || !info.email?.trim()) {
      setError("Faltan datos del cliente (nombre y email).");
      return;
    }
    setLoading(true);
    try {
      await onCreate({
        totals,
        payment_method: method,
      });
    } catch (e) {
      setError(e?.message || "No se pudo crear la reserva.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-1.5" style={{ letterSpacing: "-0.02em" }}>Resumen y reserva</h2>
        <p className="text-white/40 text-sm">Revisa los detalles antes de finalizar.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ReservationSummary service={service} extras={extras} date={date} startTime={startTime} endTime={endTime} durationHours={durationHours} />

        <div className="rounded-xl border border-white/[0.07] p-5" style={{ background: "rgba(255,255,255,0.02)" }}>
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <span className="text-white/50 text-sm">Subtotal</span>
            <span className="text-white/70 text-sm">{formatPrice(totals.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between pt-3">
            <span className="text-white font-semibold">Total</span>
            <span className="text-2xl font-black text-[#ff5833]">{formatPrice(totals.total)}</span>
          </div>

          <div className="mt-4 pt-4 border-t border-white/[0.06]">
            <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Método</p>
            <p className="text-sm text-white/70">{PAYMENT_METHOD_LABELS[method]}</p>
          </div>

          {error && <p className="text-red-400 text-xs mt-3">{error}</p>}

          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full mt-5 flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-sm font-bold transition-all hover:scale-[1.01] disabled:opacity-50"
            style={{ background: "#ff5833", color: "#fff" }}
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creando reserva…</> : method === "online" ? <>RESERVAR Y PAGAR <ExternalLink className="w-4 h-4" /></> : "SOLICITAR RESERVA"}
          </button>

          <p className="flex items-center justify-center gap-1.5 text-[10px] text-white/30 mt-3">
            <ShieldCheck className="w-3 h-3" /> Los precios se calculan desde el catálogo oficial.
          </p>
        </div>
      </div>
    </div>
  );
}