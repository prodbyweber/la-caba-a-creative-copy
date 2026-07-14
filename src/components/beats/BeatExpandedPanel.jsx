import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, ShoppingBag, Bookmark, Heart, Clock, Activity } from "lucide-react";
import { formatDuration } from "@/lib/musicConstants";

// Panel de expansión que se abre dentro del grid al pulsar una tarjeta.
// Muestra metadata completa + Descargar Preview + Comprar Beat + Guardar.
// Respeta el lenguaje visual oscuro y cinematográfico existente.
export default function BeatExpandedPanel({
  beat,
  expanded,
  user,
  liked,
  saved,
  onLike,
  onSave,
  onDownload,
  onBuy,
}) {
  const licenses = beat.licenses || [];
  const hasBuy = !!(beat.buy_link || licenses.length > 0);

  return (
    <AnimatePresence initial={false}>
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div
            className="mt-2.5 rounded-2xl p-3 space-y-3"
            style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {/* Metadata grid */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[10px]">
              <MetaRow label="Género" value={(beat.genres || []).join(", ") || "—"} />
              <MetaRow label="BPM" value={beat.bpm ? `${beat.bpm}` : "—"} />
              <MetaRow label="Key" value={beat.key || beat.scale || "—"} />
              <MetaRow label="Mood" value={(beat.moods || []).join(", ") || "—"} />
              <MetaRow
                label="Duración"
                value={beat.duration > 0 ? formatDuration(beat.duration) : "—"}
                icon={Clock}
              />
              <MetaRow
                label="Repros"
                value={`${beat.plays_count || 0}`}
                icon={Activity}
              />
            </div>

            {/* Licencias disponibles */}
            {licenses.length > 0 && (
              <div>
                <p className="text-[9px] font-bold text-white/30 uppercase tracking-wider mb-1.5">Licencias</p>
                <div className="flex flex-wrap gap-1.5">
                  {licenses.map((l, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded-full text-[10px] font-semibold text-white/70"
                      style={{ background: "#1f1f1f", border: "1px solid #2a2a2a" }}
                    >
                      {l.type === "mp3_free" ? "MP3 Free" : l.type === "wav" ? "WAV" : l.type === "wav_premium" ? "WAV Premium" : "Exclusiva"}
                      {l.price != null && l.price > 0 ? ` · ${l.price}€` : ""}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Acciones */}
            <div className="flex items-center gap-2 pt-1">
              {/* Descargar Preview */}
              {beat.free_mp3_url && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDownload(beat); }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold text-white transition-colors hover:bg-white/10"
                  style={{ background: "#1f1f1f", border: "1px solid #2a2a2a" }}
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar Preview
                </button>
              )}

              {/* Comprar Beat */}
              {hasBuy && (
                <button
                  onClick={(e) => { e.stopPropagation(); onBuy(beat); }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold text-white transition-transform hover:scale-[1.03]"
                  style={{ background: "linear-gradient(135deg, #7c4dff, #a78bfa)" }}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Comprar Beat
                </button>
              )}

              <div className="flex-1" />

              {/* Like */}
              {onLike && (
                <button
                  onClick={(e) => { e.stopPropagation(); onLike(beat); }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-white/10"
                  style={{ background: "#1f1f1f", border: "1px solid #2a2a2a" }}
                  title="Me gusta"
                >
                  <Heart className={`w-4 h-4 ${liked ? "fill-[#8b5cf6] text-[#8b5cf6]" : "text-white/60"}`} />
                </button>
              )}
              {/* Save */}
              {onSave && (
                <button
                  onClick={(e) => { e.stopPropagation(); onSave(beat); }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-white/10"
                  style={{ background: "#1f1f1f", border: "1px solid #2a2a2a" }}
                  title="Guardar"
                >
                  <Bookmark className={`w-4 h-4 ${saved ? "fill-[#a78bfa] text-[#a78bfa]" : "text-white/60"}`} />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MetaRow({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-white/30 uppercase tracking-wider font-semibold">{label}</span>
      <span className="text-white/80 font-semibold truncate flex items-center gap-1">
        {Icon && <Icon className="w-2.5 h-2.5 text-white/40" />}
        {value}
      </span>
    </div>
  );
}