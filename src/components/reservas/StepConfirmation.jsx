import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Check, ExternalLink } from "lucide-react";
import { formatPrice, PAYMENT_METHOD_LABELS } from "@/lib/reservations";
import ReservationSummary from "@/components/reservas/ReservationSummary";

// Paso 6: Confirmación.
export default function StepConfirmation({ reservation, service, extras, date, startTime, endTime, durationHours }) {
  if (!reservation) return null;
  const isOnline = reservation.payment_method === "online" && reservation.payment_link;

  return (
    <div className="flex flex-col items-center text-center py-6">
      <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-16 h-16 rounded-full bg-[#ff5833]/15 flex items-center justify-center mb-5">
        <Check className="w-8 h-8 text-[#ff5833]" />
      </motion.div>

      <h2 className="text-2xl sm:text-3xl font-black text-white mb-2" style={{ letterSpacing: "-0.02em" }}>
        {isOnline ? "Reserva creada" : "¡Reserva solicitada!"}
      </h2>
      <p className="text-white/50 text-sm max-w-md mb-6">
        {isOnline
          ? "Tu reserva está pendiente de pago. Completa el pago para confirmarla."
          : "Hemos recibido tu solicitud. Te confirmaremos por email en breve."}
      </p>

      <div className="w-full max-w-md mb-6">
        <ReservationSummary service={service} extras={extras} date={date} startTime={startTime} endTime={endTime} durationHours={durationHours} />
      </div>

      {isOnline && (
        <a href={reservation.payment_link} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-bold mb-4 transition-all hover:scale-[1.02]"
          style={{ background: "#ff5833", color: "#fff" }}>
          PAGAR AHORA <ExternalLink className="w-4 h-4" />
        </a>
      )}

      <p className="text-white/40 text-xs mb-6">
        Método: {PAYMENT_METHOD_LABELS[reservation.payment_method]} · Total: {formatPrice(reservation.total)}
      </p>

      <div className="flex gap-3">
        <Link to="/Explorar" className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-sm font-medium transition-colors">Explorar Cabaña</Link>
        <Link to="/reservas" className="px-6 py-3 rounded-xl bg-white/[0.04] hover:bg-white/10 text-white/70 text-sm font-medium transition-colors">Nueva reserva</Link>
      </div>
    </div>
  );
}