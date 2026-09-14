import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Check, Mail } from "lucide-react";
import { formatPrice, formatLongDate, PAYMENT_METHOD_LABELS } from "@/lib/reservations";

// Paso 6 mobile: Confirmación. Layout específico (corrige el bug de pantalla negra).
export default function MobileStepConfirmation({ reservation, service, extras, date, startTime, endTime, durationHours }) {
  if (!reservation) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <Check className="w-6 h-6 text-white/30" />
        </div>
        <p className="text-white/40 text-sm">Cargando confirmación…</p>
      </div>
    );
  }

  const method = reservation.payment_method;
  const extrasList = extras || [];

  const statusLabel = (() => {
    if (method === "transfer") return "Pendiente de verificación";
    if (method === "cash") return "Pendiente de confirmación";
    if (method === "card") return "Pago enviado para verificación";
    return "Pendiente";
  })();

  const methodMessage = (() => {
    if (method === "transfer") return "Te hemos enviado los datos para la transferencia. Mantenemos tu horario reservado durante 1 hora. Una vez verificada, te enviaremos la confirmación definitiva.";
    if (method === "cash") return "Tu solicitud ha sido recibida. Hemos reservado el horario durante 1 hora mientras coordinamos el pago. Te contactaremos para confirmar.";
    if (method === "card") return "Completa el pago en la pestaña de pago que abrimos. No declararemos el pago como confirmado hasta recibir la verificación.";
    return "Hemos recibido tu solicitud. Te confirmaremos por email en breve.";
  })();

  return (
    <div className="py-4">
      {/* Check animado */}
      <div className="flex flex-col items-center text-center mb-7">
        <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-16 h-16 rounded-full bg-[#ff5833]/15 flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-[#ff5833]" />
        </motion.div>
        <h2 className="text-[28px] font-black text-white mb-1" style={{ letterSpacing: "-0.02em" }}>Reserva recibida</h2>
        <p className="text-white/40 text-sm">Reserva #{reservation.reservation_code || "—"}</p>
        <p className="text-white/60 text-sm mt-2 px-4">Gracias, {reservation.customer_name}. Hemos recibido correctamente tu solicitud.</p>
      </div>

      {/* Resumen */}
      <div className="rounded-2xl border border-white/[0.08] overflow-hidden mb-4" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="px-5 py-3 border-b border-white/[0.06]">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/30">Tu reserva</p>
        </div>
        <div className="px-5 py-4 space-y-3 text-sm">
          <Row label="Servicio" value={service?.name} />
          <Row label="Fecha" value={formatLongDate(date)} />
          <Row label="Hora" value={startTime ? `${startTime}${endTime ? ` — ${endTime}` : ""}` : "—"} />
          {durationHours > 0 && <Row label="Duración" value={`${durationHours} horas`} />}
          {extrasList.length > 0 && <Row label="Extras" value={extrasList.map(e => e.name).join(", ")} />}
          <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
            <span className="text-white font-bold">Total</span>
            <span className="text-2xl font-black text-[#ff5833]">{formatPrice(reservation.total)}</span>
          </div>
        </div>
      </div>

      {/* Estado */}
      <div className="rounded-2xl border border-white/[0.08] p-5 mb-5" style={{ background: "rgba(255,255,255,0.02)" }}>
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/30 mb-2">Estado</p>
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2.5 py-1 rounded text-xs font-bold" style={{ background: "rgba(250,204,21,0.15)", color: "#facc15" }}>{statusLabel}</span>
          <span className="text-white/40 text-xs">· {PAYMENT_METHOD_LABELS[method]}</span>
        </div>
        <p className="text-white/55 text-sm leading-relaxed">{methodMessage}</p>
      </div>

      {/* Acciones */}
      <a href="mailto:hola@cabanacreative.es"
        className="flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl bg-white/5 text-white/70 text-sm font-medium mb-3">
        <Mail className="w-4 h-4" /> Contactar con Cabaña Creative
      </a>
      <Link to="/reservas" className="block w-full text-center px-6 py-3.5 rounded-xl text-sm font-bold"
        style={{ background: "#ff5833", color: "#fff" }}>
        Nueva reserva
      </Link>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[10px] uppercase tracking-wider text-white/30 flex-shrink-0">{label}</span>
      <span className="text-white/80 text-right">{value || "—"}</span>
    </div>
  );
}