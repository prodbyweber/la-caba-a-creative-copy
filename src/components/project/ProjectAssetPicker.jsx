import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Music2, Film, Image as ImageIcon, Check, Search } from "lucide-react";

/**
 * Modal para seleccionar assets ya subidos por el usuario:
 * mode: "tracks" | "videos" | "photos"
 */
export default function ProjectAssetPicker({ mode, items, selectedIds, onConfirm, onClose }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(new Set(selectedIds || []));

  const filtered = items.filter((item) => {
    const label = item.title || item.name || "";
    return label.toLowerCase().includes(search.toLowerCase());
  });

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const ModeIcon = mode === "tracks" ? Music2 : mode === "videos" ? Film : ImageIcon;
  const modeLabel =
    mode === "tracks" ? "Tracks" : mode === "videos" ? "Videos" : "Fotos";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[600] bg-black/85 backdrop-blur-xl flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col"
        style={{
          background: "#0e0e0f",
          border: "1px solid rgba(255,255,255,0.07)",
          maxHeight: "85svh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 flex-shrink-0 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <ModeIcon className="w-4 h-4 text-white/40" />
            <p
              className="text-sm font-black text-white"
              style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", letterSpacing: "-0.02em" }}
            >
              Añadir {modeLabel}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-3.5 h-3.5 text-white/50" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Buscar ${modeLabel.toLowerCase()}...`}
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-1.5" style={{ scrollbarWidth: "none" }}>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <ModeIcon className="w-10 h-10 text-white/10" />
              <p className="text-xs text-white/25">No hay {modeLabel.toLowerCase()} disponibles</p>
            </div>
          ) : (
            filtered.map((item) => {
              const isSelected = selected.has(item.id);
              const thumb = item.thumbnail_url || item.cover_url || item.url;
              const label = item.title || item.name || "Sin título";

              return (
                <button
                  key={item.id}
                  onClick={() => toggle(item.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
                  style={{
                    background: isSelected ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
                    border: isSelected ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  {/* Thumb */}
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.06)" }}>
                    {thumb ? (
                      mode === "tracks" ? (
                        <Music2 className="w-4 h-4 text-white/30" />
                      ) : (
                        <img src={thumb} alt={label} className="w-full h-full object-cover" />
                      )
                    ) : (
                      <ModeIcon className="w-4 h-4 text-white/20" />
                    )}
                  </div>

                  <span className="flex-1 text-sm text-white/80 truncate"
                    style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
                    {label}
                  </span>

                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    isSelected ? "bg-white" : "border border-white/15"
                  }`}>
                    {isSelected && <Check className="w-3 h-3 text-black" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-6 pt-3 flex-shrink-0 border-t border-white/[0.06]">
          <button
            onClick={() => onConfirm(Array.from(selected))}
            className="w-full py-3 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2"
            style={{
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              background: "white",
              color: "black",
            }}
          >
            <Check className="w-4 h-4" />
            Confirmar selección ({selected.size})
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}