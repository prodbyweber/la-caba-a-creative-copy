import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Check, ChevronUp, ChevronDown } from "lucide-react";

export const DEFAULT_SECTION_ORDER = ["tracks", "projects", "photos"];

const SECTION_META = {
  tracks:   { label: "Soundtracks" },
  projects: { label: "Proyectos" },
  photos:   { label: "Fotos" },
};

export default function CatalogSectionOrder({ order, onChange, onClose, isMobile }) {
  const [items, setItems] = useState(order);
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  const handleDragStart = (idx) => setDragging(idx);
  const handleDragEnter = (idx) => setDragOver(idx);
  const handleDragEnd = () => {
    if (dragging !== null && dragOver !== null && dragging !== dragOver) {
      const next = [...items];
      const [moved] = next.splice(dragging, 1);
      next.splice(dragOver, 0, moved);
      setItems(next);
    }
    setDragging(null);
    setDragOver(null);
  };

  const moveUp = (idx) => {
    if (idx === 0) return;
    const next = [...items];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    setItems(next);
  };

  const moveDown = (idx) => {
    if (idx === items.length - 1) return;
    const next = [...items];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    setItems(next);
  };

  const handleSave = () => {
    onChange(items);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.96 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="absolute right-0 top-full mt-1.5 z-50 rounded-xl border border-white/10 shadow-2xl overflow-hidden"
        style={{
          background: "#161618",
          width: "180px",
          boxShadow: "0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-3 pt-3 pb-1.5 flex items-center justify-between border-b border-white/[0.06]">
          <span className="text-[9px] font-bold text-white/25 uppercase tracking-[0.25em]">Ordenar</span>
          <button onClick={onClose} className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 transition-colors">
            <X className="w-3 h-3 text-white/35" />
          </button>
        </div>

        {/* List */}
        <div className="px-2 py-2 space-y-0.5">
          {items.map((key, idx) => {
            const meta = SECTION_META[key];
            const isDraggingThis = dragging === idx;
            const isDragTarget = dragOver === idx;
            return (
              <div
                key={key}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragEnter={() => handleDragEnter(idx)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                className="flex items-center gap-1.5 rounded-lg transition-all select-none"
                style={{
                  background: isDragTarget ? "rgba(255,255,255,0.08)" : isDraggingThis ? "rgba(255,255,255,0.04)" : "transparent",
                  opacity: isDraggingThis ? 0.5 : 1,
                  padding: "6px 6px",
                  cursor: "grab",
                  border: isDragTarget ? "1px solid rgba(255,255,255,0.1)" : "1px solid transparent",
                }}
              >
                {/* Grip dots */}
                <div className="flex flex-col gap-[2px] flex-shrink-0 opacity-20">
                  {[0,1].map(r => (
                    <div key={r} className="flex gap-[2px]">
                      <div className="w-[2px] h-[2px] rounded-full bg-white" />
                      <div className="w-[2px] h-[2px] rounded-full bg-white" />
                    </div>
                  ))}
                </div>

                <span className="flex-1 text-[11px] font-medium text-white/60" style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>
                  {meta?.label}
                </span>

                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <button onClick={() => moveUp(idx)} disabled={idx === 0}
                    className="w-5 h-5 flex items-center justify-center rounded transition-all active:scale-95"
                    style={{ opacity: idx === 0 ? 0.2 : 0.6, cursor: idx === 0 ? "default" : "pointer" }}>
                    <ChevronUp className="w-3 h-3 text-white" />
                  </button>
                  <button onClick={() => moveDown(idx)} disabled={idx === items.length - 1}
                    className="w-5 h-5 flex items-center justify-center rounded transition-all active:scale-95"
                    style={{ opacity: idx === items.length - 1 ? 0.2 : 0.6, cursor: idx === items.length - 1 ? "default" : "pointer" }}>
                    <ChevronDown className="w-3 h-3 text-white" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-2 pb-2">
          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-1.5 rounded-lg text-[11px] font-bold transition-all active:scale-95"
            style={{ background: "rgba(255,255,255,0.08)", color: "white", padding: "7px 10px", border: "1px solid rgba(255,255,255,0.1)" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.13)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
          >
            <Check className="w-3 h-3" />
            Guardar
          </button>
        </div>
      </motion.div>
    </>
  );
}