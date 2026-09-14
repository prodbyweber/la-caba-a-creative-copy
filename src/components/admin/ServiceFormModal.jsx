import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { PAYMENT_METHOD_LABELS } from "@/lib/reservations";

// CRUD de servicios de reserva + payment link.
export default function ServiceFormModal({ service, onClose }) {
  const queryClient = useQueryClient();
  const isEdit = !!service;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", category: "estudio", subcategory: "", description: "",
    duration_hours: 0, price: 0, active: true, payment_method: "manual", payment_link: "", is_beat_picker: false, sort_order: 0,
  });

  useEffect(() => {
    if (service) setForm({ ...service, duration_hours: service.duration_hours || 0, price: service.price || 0, sort_order: service.sort_order || 0 });
  }, [service]);

  const set = (f) => (e) => setForm(s => ({ ...s, [f]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const setNum = (f) => (e) => setForm(s => ({ ...s, [f]: Number(e.target.value) || 0 }));

  const handleSave = async () => {
    if (!form.name?.trim()) { alert("El nombre es obligatorio"); return; }
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price) || 0, duration_hours: Number(form.duration_hours) || 0, sort_order: Number(form.sort_order) || 0 };
      if (isEdit) await base44.entities.ReservationService.update(service.id, payload);
      else await base44.entities.ReservationService.create(payload);
      queryClient.invalidateQueries({ queryKey: ["reservation-services"] });
      queryClient.invalidateQueries({ queryKey: ["reservation-services-admin"] });
      onClose();
    } catch (e) { alert("Error: " + (e?.message || "")); } finally { setSaving(false); }
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose} />
        <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
          onClick={e => e.stopPropagation()} className="relative w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
          style={{ background: "#141414", maxHeight: "88vh", overflowY: "auto" }}>
          <div className="p-5 border-b border-white/[0.07] flex items-center justify-between sticky top-0" style={{ background: "#141414" }}>
            <h3 className="text-base font-bold text-white">{isEdit ? "Editar servicio" : "Nuevo servicio"}</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center"><X className="w-4 h-4 text-white/50" /></button>
          </div>
          <div className="p-5 space-y-4">
            <div><label className="lbl">Nombre *</label><input value={form.name} onChange={set("name")} className="inp" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="lbl">Categoría</label>
                <select value={form.category} onChange={set("category")} className="inp">
                  <option value="estudio">Estudio</option><option value="mix_master">Mix & Master</option><option value="digital">Digital</option>
                </select>
              </div>
              <div><label className="lbl">Subcategoría</label><input value={form.subcategory} onChange={set("subcategory")} className="inp" /></div>
            </div>
            <div><label className="lbl">Descripción</label><textarea value={form.description} onChange={set("description")} rows={2} className="inp resize-none" /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="lbl">Duración (h)</label><input type="number" value={form.duration_hours} onChange={setNum("duration_hours")} className="inp" /></div>
              <div><label className="lbl">Precio (€)</label><input type="number" value={form.price} onChange={setNum("price")} className="inp" /></div>
              <div><label className="lbl">Orden</label><input type="number" value={form.sort_order} onChange={setNum("sort_order")} className="inp" /></div>
            </div>
            <div><label className="lbl">Método de pago</label>
              <select value={form.payment_method} onChange={set("payment_method")} className="inp">
                {Object.entries(PAYMENT_METHOD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div><label className="lbl">Payment link (pago online)</label><input value={form.payment_link} onChange={set("payment_link")} placeholder="https://..." className="inp" /></div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
                <input type="checkbox" checked={form.active} onChange={set("active")} className="accent-[#ff5833]" /> Activo
              </label>
              <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
                <input type="checkbox" checked={form.is_beat_picker} onChange={set("is_beat_picker")} className="accent-[#ff5833]" /> Selección de beat
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={onClose} className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-sm font-medium">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#ff5833] text-white text-sm font-bold disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Guardar
              </button>
            </div>
          </div>
          <style>{`.inp{width:100%;padding:0.6rem 0.9rem;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:0.7rem;color:white;font-size:0.85rem;outline:none}.inp:focus{border-color:rgba(255,88,51,0.5)}.lbl{display:block;font-size:0.7rem;font-weight:600;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.4rem}`}</style>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}