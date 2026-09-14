import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { STATUS_LABELS, PAYMENT_METHOD_LABELS, calcTotals, formatPrice } from "@/lib/reservations";

// Creación / edición manual de reserva desde el admin.
export default function ReservationFormModal({ reservation, onClose }) {
  const queryClient = useQueryClient();
  const isEdit = !!reservation;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    customer_name: "", customer_last_name: "", email: "", phone: "", artist_project: "", notes: "",
    service_id: "", date: "", start_time: "", duration_hours: 2, extras: [], total: 0,
    reservation_status: "pendiente", payment_method: "manual", internal_notes: "",
  });

  const { data: services = [] } = useQuery({
    queryKey: ["reservation-services"],
    queryFn: () => base44.entities.ReservationService.filter({ active: true }),
  });

  useEffect(() => {
    if (reservation) {
      setForm({
        customer_name: reservation.customer_name || "", customer_last_name: reservation.customer_last_name || "",
        email: reservation.email || "", phone: reservation.phone || "", artist_project: reservation.artist_project || "",
        notes: reservation.notes || "", service_id: reservation.service_id, date: reservation.date || "",
        start_time: reservation.start_time || "", duration_hours: reservation.duration_hours || 0,
        extras: reservation.extras || [], total: reservation.total || 0,
        reservation_status: reservation.reservation_status, payment_method: reservation.payment_method || "manual",
        internal_notes: reservation.internal_notes || "",
      });
    }
  }, [reservation]);

  const selectedService = services.find(s => s.id === form.service_id);
  const totals = calcTotals(selectedService, form.extras);
  const computedTotal = totals.total;

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSave = async () => {
    if (!form.customer_name?.trim() || !form.email?.trim() || !form.service_id || !form.date) {
      alert("Faltan campos obligatorios: nombre, email, servicio y fecha.");
      return;
    }
    setSaving(true);
    try {
      const svc = services.find(s => s.id === form.service_id);
      const payload = {
        customer_name: form.customer_name, customer_last_name: form.customer_last_name,
        email: form.email, phone: form.phone, artist_project: form.artist_project, notes: form.notes,
        service_id: form.service_id, service_kind: "service", service_name: svc?.name || "",
        service_price: svc?.price || 0, extras: form.extras,
        date: form.date, start_time: form.start_time || null,
        end_time: form.start_time && form.duration_hours ? endTimeCalc(form.start_time, form.duration_hours) : null,
        duration_hours: Number(form.duration_hours) || 0,
        subtotal: computedTotal, total: Number(form.total) || computedTotal,
        payment_method: form.payment_method, payment_status: "pending",
        reservation_status: form.reservation_status, internal_notes: form.internal_notes,
        created_by_admin: !isEdit,
      };
      if (isEdit) {
        await base44.entities.Reservation.update(reservation.id, payload);
      } else {
        await base44.entities.Reservation.create(payload);
      }
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      onClose();
    } catch (e) {
      alert("No se pudo guardar: " + (e?.message || "error"));
    } finally { setSaving(false); }
  };

  function endTimeCalc(st, dur) {
    const [h, m] = st.split(":").map(Number);
    const end = h * 60 + m + dur * 60;
    return `${String(Math.floor(end / 60)).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`;
  }

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
            <h3 className="text-base font-bold text-white">{isEdit ? "Editar reserva" : "Nueva reserva"}</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center"><X className="w-4 h-4 text-white/50" /></button>
          </div>

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nombre *"><input value={form.customer_name} onChange={set("customer_name")} className="inp" /></Field>
              <Field label="Apellidos"><input value={form.customer_last_name} onChange={set("customer_last_name")} className="inp" /></Field>
              <Field label="Email *"><input type="email" value={form.email} onChange={set("email")} className="inp" /></Field>
              <Field label="Teléfono"><input value={form.phone} onChange={set("phone")} className="inp" /></Field>
              <Field label="Proyecto" full><input value={form.artist_project} onChange={set("artist_project")} className="inp" /></Field>
            </div>

            <Field label="Servicio *">
              <select value={form.service_id} onChange={set("service_id")} className="inp">
                <option value="">Selecciona…</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.name} — {formatPrice(s.price)}</option>)}
              </select>
            </Field>

            <div className="grid grid-cols-3 gap-3">
              <Field label="Fecha *"><input type="date" value={form.date} onChange={set("date")} className="inp" style={{ colorScheme: "dark" }} /></Field>
              <Field label="Hora inicio"><input type="time" value={form.start_time} onChange={set("start_time")} className="inp" style={{ colorScheme: "dark" }} /></Field>
              <Field label="Duración (h)"><input type="number" value={form.duration_hours} onChange={set("duration_hours")} className="inp" /></Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Estado">
                <select value={form.reservation_status} onChange={set("reservation_status")} className="inp">
                  {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </Field>
              <Field label="Método de pago">
                <select value={form.payment_method} onChange={set("payment_method")} className="inp">
                  {Object.entries(PAYMENT_METHOD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </Field>
            </div>

            <Field label={`Total (calculado: ${formatPrice(computedTotal)})`}>
              <input type="number" value={form.total} onChange={set("total")} className="inp" />
            </Field>

            <Field label="Notas internas"><textarea value={form.internal_notes} onChange={set("internal_notes")} rows={2} className="inp resize-none" /></Field>

            <div className="flex gap-3 pt-2">
              <button onClick={onClose} className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-sm font-medium">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#ff5833] text-white text-sm font-bold disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {isEdit ? "Guardar" : "Crear reserva"}
              </button>
            </div>
          </div>
        </motion.div>
        <style>{`.inp{width:100%;padding:0.6rem 0.9rem;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:0.7rem;color:white;font-size:0.85rem;outline:none}.inp:focus{border-color:rgba(255,88,51,0.5)}`}</style>
      </motion.div>
    </AnimatePresence>
  );
}

function Field({ label, children, full }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}