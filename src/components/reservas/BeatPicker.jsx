import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, Music2, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { formatPrice } from "@/lib/reservations";

// Modal para seleccionar un beat del catálogo existente de Cabaña Creative.
// Solo muestra beats marcados como disponibles para reservas.
export default function BeatPicker({ open, onClose, onSelect, title = "Selecciona un beat" }) {
  const [playingId, setPlayingId] = useState(null);
  const audioRef = useRef(null);

  const { data: beats = [], isLoading } = useQuery({
    queryKey: ["reservation-beats"],
    queryFn: () => base44.entities.Beat.filter({ reservation_available: true }),
    enabled: open,
  });

  const togglePlay = (beat, e) => {
    e?.stopPropagation();
    if (playingId === beat.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    const el = new Audio(beat.preview_mp3_url);
    audioRef.current = el;
    el.play().then(() => setPlayingId(beat.id)).catch(() => {});
    el.onended = () => setPlayingId(null);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
            style={{ background: "#141414", maxHeight: "85vh", display: "flex", flexDirection: "column" }}
          >
            <div className="p-5 border-b border-white/[0.07] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#ff5833]/15 flex items-center justify-center">
                  <Music2 className="w-4 h-4 text-[#ff5833]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{title}</h3>
                  <p className="text-xs text-white/40">Catálogo de Cabaña Creative</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center">
                <X className="w-4 h-4 text-white/50" />
              </button>
            </div>

            <div className="overflow-y-auto p-4 space-y-2">
              {isLoading && <p className="text-white/40 text-sm text-center py-8">Cargando beats…</p>}
              {!isLoading && beats.length === 0 && (
                <p className="text-white/40 text-sm text-center py-8">No hay beats disponibles para reservas todavía.</p>
              )}
              {beats.map(beat => (
                <div key={beat.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
                  <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-white/5 relative">
                    {beat.cover_url ? (
                      <img src={beat.cover_url} alt={beat.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Music2 className="w-5 h-5 text-white/20" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{beat.title}</p>
                    <p className="text-xs text-white/40 truncate">{beat.producer || "Cabaña Creative"}</p>
                    <p className="text-sm font-bold text-[#ff5833] mt-0.5">{formatPrice(beat.reservation_price || 75)}</p>
                  </div>
                  {beat.preview_mp3_url && (
                    <button onClick={(e) => togglePlay(beat, e)} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center flex-shrink-0">
                      {playingId === beat.id ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-0.5" />}
                    </button>
                  )}
                  <button
                    onClick={() => { onSelect(beat); onClose(); }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#ff5833] hover:bg-[#ff6b4a] text-white text-xs font-bold transition-colors flex-shrink-0"
                  >
                    <Check className="w-3.5 h-3.5" /> Seleccionar
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}