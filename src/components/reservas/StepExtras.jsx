import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Check, Music2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { formatPrice } from "@/lib/reservations";

// Paso 2: Extras. Solo se muestran los extras activos del catálogo (Beat + simples).
// Beat → abre el picker del catálogo. Simples → toggle multi-selección.
export default function StepExtras({ extras, setExtras, onPickBeat }) {
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
      setExtras([...extras, {
        extra_id: "extra-" + rec.id,
        name: rec.name,
        type: "simple",
        price: Number(rec.price) || 0,
      }]);
    }
  };

  const removeBeat = (beatId) => setExtras(extras.filter(e => e.beat_id !== beatId));
  const selectedBeats = extras.filter(e => e.type === "beat");

  return (
    <div className="space-y-9">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-1.5" style={{ letterSpacing: "-0.02em" }}>
          Añade extras
        </h2>
        <p className="text-white/40 text-sm">Opcional. Personaliza tu sesión con producción o un beat.</p>
      </div>

      <div className="space-y-2">
        {/* Beat */}
        {beatExtra && (
          <>
            <button
              onClick={onPickBeat}
              className="w-full flex items-center gap-4 px-4 sm:px-5 py-4 rounded-xl text-left transition-all"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,88,51,0.12)" }}>
                <Music2 className="w-4 h-4 text-[#ff5833]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm sm:text-base font-medium">Beat</p>
                <p className="text-white/40 text-xs">Catálogo Cabaña Creative · desde {formatPrice(beatExtra.price)}</p>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#ff5833] flex-shrink-0">
                <Plus className="w-3.5 h-3.5" /> Añadir
              </span>
            </button>

            {/* Beats seleccionados */}
            <AnimatePresence>
              {selectedBeats.map(e => (
                <motion.div
                  key={e.beat_id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-4 px-4 sm:px-5 py-3 rounded-xl"
                  style={{ background: "rgba(255,88,51,0.05)", border: "1px solid rgba(255,88,51,0.25)" }}
                >
                  <Check className="w-4 h-4 text-[#ff5833] flex-shrink-0" />
                  <span className="flex-1 text-white/80 text-sm truncate">{e.name}</span>
                  <span className="text-white font-semibold text-sm">{formatPrice(e.price)}</span>
                  <button onClick={() => removeBeat(e.beat_id)} className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center flex-shrink-0">
                    <X className="w-3.5 h-3.5 text-white/40" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </>
        )}

        {/* Extras simples (Mix, Master, Edición + Mix + Master) */}
        {simpleExtras.map(rec => {
          const selected = isSimpleSelected(rec);
          return (
            <button
              key={rec.id}
              onClick={() => toggleSimple(rec)}
              className="w-full flex items-center gap-4 px-4 sm:px-5 py-4 rounded-xl text-left transition-all"
              style={{
                background: selected ? "rgba(255,88,51,0.06)" : "rgba(255,255,255,0.02)",
                border: selected ? "1.5px solid #ff5833" : "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div
                className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center transition-all"
                style={{
                  background: selected ? "#ff5833" : "transparent",
                  border: selected ? "none" : "1.5px solid rgba(255,255,255,0.2)",
                }}
              >
                {selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </div>
              <span className="flex-1 text-white text-sm sm:text-base font-medium">{rec.name}</span>
              <span className="text-white font-bold text-base sm:text-lg flex-shrink-0 ml-auto">{formatPrice(rec.price)}</span>
            </button>
          );
        })}
      </div>

      {extras.length === 0 && (
        <p className="text-white/30 text-xs text-center pt-1">No has añadido extras. Puedes continuar.</p>
      )}
    </div>
  );
}