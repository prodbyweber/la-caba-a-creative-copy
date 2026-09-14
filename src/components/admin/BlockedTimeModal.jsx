import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";

// CRUD de horarios bloqueados.
export default function BlockedTimeModal({ block, onClose }) {
  const queryClient = useQueryClient();
  const isEdit = !!block;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ date: "", start_time: "", end_time: "", reason: "", active: true });

  useEffect(() => { if (block) setForm({ date: block.date || "", start_time: block.start_time || "", end_time: block.end_time || "", reason: block.reason || "", active: block.active !== false }); }, [block]);
  const set = (f) => (e) => setForm(s => ({ ...s, [f]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const handleSave = async () => {
    if (!form.date || !form.start_time || !form.end_time) { alert("Fecha, inicio y fin son obligatorios"); return; }
    setSaving(true);
    try {
      if (isEdit) await base44.entities.BlockedTime.update(block.id, form);
      else await base44.entities.BlockedTime.create(form);
      queryClient.invalidateQueries({ queryKey: ["blocked-times"] });
      onClose();
    } catch (e) { alert("Error: " + (e?.message || "")); } finally { setSaving(false); }
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose} />
        <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
          onClick={e => e.stopPropagation()} className="relative w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden" style={{ background: "#141414" }}>
          <div className="p-5 border-b border-white/[0.07] flex items-center justify-between">
            <h3 className="text-base font-bold text-white">{isEdit ? "Editar bloqueo" : "Bloquear horario"}</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center"><X className="w-4 h-4 text-white/50" /></button>
          </div>
          <div className="p-5 space-y-4">
            <div><label className="lbl">Fecha *</label><input type="date" value={form.date} onChange={set("date")} className="inp" style={{ colorScheme: "dark" }} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="lbl">Inicio *</label><input type="time" value={form.start_time} onChange={set("start_time")} className="inp" style={{ colorScheme: "dark" }} /></div>
              <div><label className="lbl">Fin *</label><input type="time" value={form.end_time} onChange={set("end_time")} className="inp" style={{ colorScheme: "dark" }} /></div>
            </div>
            <div><label className="lbl">Motivo</label><input value={form.reason} onChange={set("reason")} className="inp" /></div>
            <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={set("active")} className="accent-[#ff5833]" /> Activo
            </label>
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