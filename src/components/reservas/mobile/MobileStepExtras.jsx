import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Check, Music2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { formatPrice, calcTotals } from "@/lib/reservations";

// Paso 2 mobile: Extras. Filas verticales táctiles + resumen de total.
export default function MobileStepExtras({ extras, setExtras, onPickBeat, service }) {
  const { data: catalog = [] } = useQuery({
    queryKey: ["reservation-extras"],
    queryFn: () => base44.entities.ReservationExtra.filter({ active: true }),
  });
  const sorted = [...catalog].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const simpleExtras = sorted.filter(e => e.type === "simple");
  const beatExtra = sorted.find(e => e.type === "beat");

  const isSimpleSelected = (rec) => extras.some(e => e.extra_id === "extra-" + rec.id);
  const toggleSimple = (rec) => {
    if (isSimpleSelected(rec)) {
      setExtras(extras.filter(e => e.extra_id !== "extra-" + rec.id));
    } else {
      setExtras([...extras, { extra_id: "extra-" + rec.id, name: rec.name, type: "simple", price: Number(rec.price) || 0 }]);
    }
  };
  const removeBeat = (beatId) => setExtras(extras.filter(e => e.beat_id !== beatId));
  const selectedBeats = extras.filter(e => e.type === "beat");
  const totals = calcTotals(service, extras);

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-[28px] font-black text-white mb-1.5" style={{ letterSpacing: "-0.02em" }}>Añade extras</h2>
        <p className="text-white/40 text-sm">Opcional. Personaliza tu sesión.</p>
      </div>

      <div className="space-y-3">
        {beatExtra && (
          <>
            <button
              onClick={onPickBeat}
              className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,88,51,0.12)" }}>
                <Music2 className="w-5 h-5 text-[#ff5833]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-base font-semibold">Beat</p>
                <p className="text-white/40 text-xs">Catálogo · desde {formatPrice(beatExtra.price)}</p>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#ff5833] flex-shrink-0">
                <Plus className="w-4 h-4" /> Añadir
              </span>
            </button>

            <AnimatePresence>
              {selectedBeats.map(e => (
                <motion.div
                  key={e.beat_id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-4 px-5 py-3.5 rounded-2xl"
                  style={{ background: "rgba(255,88,51,0.05)", border: "1px solid rgba(255,88,51,0.25)" }}
                >
                  <Check className="w-4 h-4 text-[#ff5833] flex-shrink-0" />
                  <span className="flex-1 text-white/80 text-sm truncate">{e.name}</span>
                  <span className="text-white font-semibold text-sm">{formatPrice(e.price)}</span>
                  <button onClick={() => removeBeat(e.beat_id)} className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center flex-shrink-0">
                    <X className="w-4 h-4 text-white/40" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </>
        )}

        {simpleExtras.map(rec => {
          const selected = isSimpleSelected(rec);
          return (
            <button
              key={rec.id}
              onClick={() => toggleSimple(rec)}
              className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all"
              style={{
                background: selected ? "rgba(255,88,51,0.06)" : "rgba(255,255,255,0.02)",
                border: selected ? "1.5px solid #ff5833" : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div
                className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center transition-all"
                style={{
                  background: selected ? "#ff5833" : "transparent",
                  border: selected ? "none" : "1.5px solid rgba(255,255,255,0.2)",
                }}
              >
                {selected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
              </div>
              <span className="flex-1 text-white text-base font-medium">{rec.name}</span>
              <span className="text-white font-black text-lg flex-shrink-0">{formatPrice(rec.price)}</span>
            </button>
          );
        })}
      </div>

      {/* Resumen de total */}
      <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
        <span className="text-white/50 text-sm font-medium">Total</span>
        <span className="text-2xl font-black text-[#ff5833]">{formatPrice(totals.total)}</span>
      </div>
    </div>
  );
}