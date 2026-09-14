import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Check, Ban, Save, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { STATUS_LABELS, STATUS_COLORS, PAYMENT_METHOD_LABELS, formatPrice, sendReservationEmail } from "@/lib/reservations";

// Detalle de reserva: ver datos, cambiar estado, notas internas, confirmar/cancelar, reenviar email.
export default function ReservationDetailModal({ reservation, onClose }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState(reservation.reservation_status);
  const [internalNotes, setInternalNotes] = useState(reservation.internal_notes || "");
  const [saving, setSaving] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailResult, setEmailResult] = useState("");

  const update = async (data) => {
    setSaving(true);
    try {
      await base44.entities.Reservation.update(reservation.id, data);
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
    } finally { setSaving(false); }
  };

  const handleSave = () => update({ reservation_status: status, internal_notes: internalNotes });

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await base44.entities.Reservation.update(reservation.id, { reservation_status: "confirmada", internal_notes: internalNotes });
      setStatus("confirmada");
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      // Enviar email de confirmación
      setEmailSending(true);
      const updated = { ...reservation, reservation_status: "confirmada", internal_notes: internalNotes };
      const res = await sendReservationEmail(updated);
      setEmailResult(res.toClient ? "Email enviado al cliente + copia al estudio" : "Reserva confirmada (email no enviado)");
      setEmailSending(false);
    } finally { setSaving(false); }
  };

  const handleCancel = async () => {
    if (!confirm("¿Cancelar esta reserva? El horario se liberará.")) return;
    await update({ reservation_status: "cancelada" });
    setStatus("cancelada");
  };

  const handleResendEmail = async () => {
    setEmailSending(true);
    const res = await sendReservationEmail({ ...reservation, reservation_status: "confirmada" });
    setEmailResult(res.toClient ? "Email reenviado" : "No se pudo enviar el email");
    setEmailSending(false);
  };

  const Row = ({ label, value }) => (
    <div className="flex justify-between gap-4 py-2 border-b border-white/[0.05]">
      <span className="text-[10px] uppercase tracking-wider text-white/30 w-28 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-white/70 text-right flex-1">{value || "—"}</span>
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose} />
        <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
          onClick={e => e.stopPropagation()}
          className="relative w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
          style={{ background: "#141414", maxHeight: "88vh", overflowY: "auto" }}>
          <div className="p-5 border-b border-white/[0.07] flex items-center justify-between sticky top-0 z-10" style={{ background: "#141414" }}>
            <div>
              <h3 className="text-base font-bold text-white">Reserva</h3>
              <p className="text-xs text-white/40">{reservation.customer_name} · {reservation.date}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center"><X className="w-4 h-4 text-white/50" /></button>
          </div>

          <div className="p-5 space-y-5">
            {/* Estado badge */}
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded text-xs font-bold" style={{ background: (STATUS_COLORS[status] || "#999") + "22", color: STATUS_COLORS[status] || "#999" }}>
                {STATUS_LABELS[status] || status}
              </span>
              <span className="text-xs text-white/40">· {PAYMENT_METHOD_LABELS[reservation.payment_method]}</span>
            </div>

            {/* Cliente */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-1">Cliente</p>
              <Row label="Nombre" value={`${reservation.customer_name} ${reservation.customer_last_name || ""}`} />
              <Row label="Email" value={reservation.email} />
              <Row label="Teléfono" value={reservation.phone} />
              <Row label="Proyecto" value={reservation.artist_project} />
            </div>

            {/* Reserva */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-1">Reserva</p>
              <Row label="Servicio" value={reservation.service_name} />
              <Row label="Fecha" value={reservation.date} />
              <Row label="Hora" value={reservation.start_time ? `${reservation.start_time}–${reservation.end_time}` : "—"} />
              <Row label="Duración" value={reservation.duration_hours ? `${reservation.duration_hours}h` : "—"} />
              <Row label="Extras" value={(reservation.extras || []).map(e => `${e.name}${e.hours ? ` (${e.hours}h)` : ""}`).join(", ") || "—"} />
            </div>

            {/* Pago */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-1">Pago</p>
              <Row label="Subtotal" value={formatPrice(reservation.subtotal)} />
              <Row label="Total" value={formatPrice(reservation.total)} />
              <Row label="Método" value={PAYMENT_METHOD_LABELS[reservation.payment_method]} />
              <Row label="Estado pago" value={reservation.payment_status} />
              {reservation.payment_link && <Row label="Payment link" value={<a href={reservation.payment_link} target="_blank" rel="noreferrer" className="text-[#ff5833] underline text-xs">Abrir</a>} />}
            </div>

            {/* Estado + notas internas */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Estado de la reserva</label>
                <select value={status} onChange={e => setStatus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#ff5833]/50">
                  {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Notas internas (solo admin)</label>
                <textarea value={internalNotes} onChange={e => setInternalNotes(e.target.value)} rows={3}
                  className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#ff5833]/50 resize-none" />
              </div>
            </div>

            {emailResult && <p className="text-xs text-[#ff5833]">{emailResult}</p>}

            {/* Acciones */}
            <div className="flex flex-wrap gap-2 pt-2">
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-colors">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Guardar
              </button>
              <button onClick={handleConfirm} disabled={saving || status === "confirmada"} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-bold transition-colors disabled:opacity-40">
                <Check className="w-3.5 h-3.5" /> Confirmar + email
              </button>
              <button onClick={handleResendEmail} disabled={emailSending} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs font-bold transition-colors">
                {emailSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />} Reenviar email
              </button>
              <button onClick={handleCancel} disabled={status === "cancelada"} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-colors disabled:opacity-40">
                <Ban className="w-3.5 h-3.5" /> Cancelar
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}