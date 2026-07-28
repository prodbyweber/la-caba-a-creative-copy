import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock } from "lucide-react";
import StudioHoursAdmin from "@/components/admin/StudioHoursAdmin";

// Modal del panel de admin para agregar/quitar horas de estudio de un artista.
// Reutiliza StudioHoursAdmin (resumen + ajuste del total + consumo + historial),
// que escribe en Artist.studio_hours_total y StudioHoursLog — la misma fuente
// de verdad que leen el catálogo y el perfil del artista (useStudioHours).
export default function StudioHoursModal({ artist, onClose }) {
  return (
    <AnimatePresence>
      {artist?.id && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10005] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 360, damping: 30 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md max-h-[88vh] overflow-y-auto rounded-2xl"
            style={{ background: "#0d0d0e", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 24px 60px rgba(0,0,0,0.6)" }}
          >
            <div
              className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-white/[0.07]"
              style={{ background: "#0d0d0e" }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(16,185,129,0.12)" }}>
                  <Clock className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">Horas de estudio</p>
                  <p className="text-[11px] text-white/35 truncate">{artist.stageName || "Artista"}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 text-white/55" />
              </button>
            </div>
            <div className="p-5">
              <StudioHoursAdmin artist={artist} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}