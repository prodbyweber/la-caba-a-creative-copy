import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Music2, Clock, Check } from "lucide-react";
import { formatPrice } from "@/lib/reservations";

// Paso 2: Extras. Permite añadir beats del catálogo y horas extra.
export default function StepExtras({ extras, setExtras, onPickBeat, service }) {
  const addBeatExtra = (beat) => {
    // Evitar duplicar el mismo beat
    if (extras.some(e => e.beat_id === beat.id)) return;
    setExtras([...extras, {
      extra_id: "beat-" + beat.id,
      name: beat.title,
      type: "beat",
      price: Number(beat.reservation_price) || 75,
      beat_id: beat.id,
    }]);
  };

  // Horas extra: gestionado como un único extra con cantidad
  const hoursExtra = extras.find(e => e.type === "hours_extra");
  const setHours = (h) => {
    const others = extras.filter(e => e.type !== "hours_extra");
    if (h <= 0) { setExtras(others); return; }
    setExtras([...others, {
      extra_id: "hours-extra",
      name: "Horas extra",
      type: "hours_extra",
      hours: h,
      price: 35 * h,
    }]);
  };

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-1.5" style={{ letterSpacing: "-0.02em" }}>Añade extras</h2>
        <p className="text-white/40 text-sm">Opcional. Personaliza tu reserva con beats u horas extra.</p>
      </div>

      {/* Beat extra */}
      <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#ff5833]/15 flex items-center justify-center"><Music2 className="w-4 h-4 text-[#ff5833]" /></div>
            <div>
              <p className="text-white font-semibold text-sm">Beat</p>
              <p className="text-white/40 text-xs">Desde {formatPrice(75)} · Catálogo Cabaña Creative</p>
            </div>
          </div>
          <button onClick={onPickBeat} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#ff5833] hover:bg-[#ff6b4a] text-white text-xs font-bold transition-colors">
            <Plus className="w-3.5 h-3.5" /> Añadir beat
          </button>
        </div>
        <AnimatePresence>
          {extras.filter(e => e.type === "beat").map(e => (
            <motion.div key={e.beat_id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.05]">
              <span className="text-sm text-white/70">{e.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm text-[#ff5833] font-semibold">{formatPrice(e.price)}</span>
                <button onClick={() => setExtras(extras.filter(x => x.beat_id !== e.beat_id))} className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center">
                  <X className="w-3.5 h-3.5 text-white/40" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Horas extra */}
      <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center"><Clock className="w-4 h-4 text-white/50" /></div>
            <div>
              <p className="text-white font-semibold text-sm">Horas extra</p>
              <p className="text-white/40 text-xs">{formatPrice(35)} / hora</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setHours((hoursExtra?.hours || 0) - 1)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white text-lg flex items-center justify-center">−</button>
            <span className="w-8 text-center text-white font-semibold">{hoursExtra?.hours || 0}</span>
            <button onClick={() => setHours((hoursExtra?.hours || 0) + 1)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white text-lg flex items-center justify-center">+</button>
          </div>
        </div>
        {hoursExtra && (
          <p className="text-sm text-[#ff5833] font-semibold mt-2 pt-2 border-t border-white/[0.05]">{formatPrice(hoursExtra.price)}</p>
        )}
      </div>

      {extras.length === 0 && (
        <p className="text-white/30 text-xs text-center pt-2">No has añadido extras. Puedes continuar.</p>
      )}
    </div>
  );
}