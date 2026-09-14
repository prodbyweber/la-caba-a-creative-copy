import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Check, Mail } from "lucide-react";
import { formatPrice, formatLongDate, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS } from "@/lib/reservations";

// Paso 6: Confirmación. Premium, con código de reserva, resumen, estado del pago y mensaje por método.
export default function StepConfirmation({ reservation, service, extras, date, startTime, endTime, durationHours }) {
  if (!reservation) return null;
  const method = reservation.payment_method;
  const extrasList = extras || [];

  const statusLabel = (() => {
    if (method === "transfer") return "Pendiente de verificación";
    if (method === "cash") return "Pendiente de confirmación";
    if (method === "card") return "Pago enviado para verificación";
    return PAYMENT_STATUS_LABELS[reservation.payment_status] || "Pendiente";
  })();

  const methodMessage = (() => {
    if (method === "transfer") {
      return (
        <>
          <p className="text-white/55 text-sm leading-relaxed mb-3">
            Te hemos enviado los datos necesarios para realizar la transferencia.
            Mantenemos tu horario reservado temporalmente durante 1 hora para que puedas completar el pago.
          </p>
          <p className="text-white/55 text-sm leading-relaxed mb-3">
            Una vez recibida y corroborada la transferencia, te enviaremos la confirmación definitiva.
          </p>
          <p className="text-white/40 text-xs">Si ya has realizado la transferencia, no necesitas realizar ninguna otra acción.</p>
        </>
      );
    }
    if (method === "cash") {
      return (
        <>
          <p className="text-white/55 text-sm leading-relaxed mb-3">
            Tu solicitud ha sido recibida correctamente.
            Hemos reservado temporalmente el horario seleccionado durante 1 hora mientras coordinamos el pago.
          </p>
          <p className="text-white/55 text-sm leading-relaxed">Te contactaremos para confirmar los detalles.</p>
        </>
      );
    }
    if (method === "card") {
      return (
        <>
          <p className="text-white/55 text-sm leading-relaxed mb-3">
            Has indicado que realizarás el pago mediante tarjeta.
            Completa el pago en la pestaña de pago que abrimos y vuelve a esta página para indicarnos que has finalizado.
          </p>
          <p className="text-white/40 text-xs">No declararemos el pago como confirmado hasta recibir la verificación correspondiente.</p>
        </>
      );
    }
    return <p className="text-white/55 text-sm">Hemos recibido tu solicitud. Te confirmaremos por email en breve.</p>;
  })();

  return (
    <div className="max-w-lg mx-auto py-4">
      {/* Check animado */}
      <div className="flex flex-col items-center text-center mb-7">
        <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-16 h-16 rounded-full bg-[#ff5833]/15 flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-[#ff5833]" />
        </motion.div>
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-1.5" style={{ letterSpacing: "-0.02em" }}>Reserva recibida</h2>
        <p className="text-white/40 text-sm">Reserva #{reservation.reservation_code || "—"}</p>
        <p className="text-white/60 text-sm mt-2">Gracias, {reservation.customer_name}. Hemos recibido correctamente tu solicitud de reserva.</p>
      </div>

      {/* Resumen */}
      <div className="rounded-xl border border-white/[0.07] overflow-hidden mb-5" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="px-5 py-3 border-b border-white/[0.06]">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/30">Tu reserva</p>
        </div>
        <div className="px-5 py-4 space-y-3 text-sm">
          <SummaryRow label="Servicio" value={service?.name} />
          <SummaryRow label="Fecha" value={formatLongDate(date)} />
          <SummaryRow label="Hora" value={startTime ? `${startTime}${endTime ? ` — ${endTime}` : ""}` : "—"} />
          {durationHours > 0 && <SummaryRow label="Duración" value={`${durationHours} horas`} />}
          {extrasList.length > 0 && <SummaryRow label="Extras" value={extrasList.map(e => e.name).join(", ")} />}
          <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
            <span className="text-white font-bold">Total</span>
            <span className="text-2xl font-black text-[#ff5833]">{formatPrice(reservation.total)}</span>
          </div>
        </div>
      </div>

      {/* Estado del pago */}
      <div className="rounded-xl border border-white/[0.07] p-5 mb-5" style={{ background: "rgba(255,255,255,0.02)" }}>
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/30 mb-3">Estado del pago</p>
        <div className="flex items-center gap-2 mb-4">
          <span className="px-2.5 py-1 rounded text-xs font-bold" style={{ background: (PAYMENT_STATUS_COLORS[reservation.payment_status] || "#facc15") + "22", color: PAYMENT_STATUS_COLORS[reservation.payment_status] || "#facc15" }}>
            {statusLabel}
          </span>
          <span className="text-white/40 text-xs">· {PAYMENT_METHOD_LABELS[method]}</span>
        </div>
        {methodMessage}
      </div>

      {/* Contacto */}
      <a href="mailto:hola@cabanacreative.es"
        className="flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-sm font-medium transition-colors mb-3">
        <Mail className="w-4 h-4" /> Contactar con Cabaña Creative
      </a>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/Explorar" className="flex-1 text-center px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-sm font-medium transition-colors">Explorar Cabaña</Link>
        <Link to="/reservas" className="flex-1 text-center px-6 py-3.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.01]" style={{ background: "#ff5833", color: "#fff" }}>Nueva reserva</Link>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[10px] uppercase tracking-wider text-white/30 flex-shrink-0">{label}</span>
      <span className="text-white/80 text-right">{value || "—"}</span>
    </div>
  );
}