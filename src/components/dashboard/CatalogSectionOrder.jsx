import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Check, ChevronUp, ChevronDown } from "lucide-react";

export const DEFAULT_SECTION_ORDER = ["tracks", "video", "shorts", "projects", "photos"];

const SECTION_META = {
  tracks:   { label: "Soundtracks", emoji: "🎵" },
  video:    { label: "Films", emoji: "🎬" },
  shorts:   { label: "Shorts", emoji: "⚡" },
  projects: { label: "Proyectos", emoji: "📁" },
  photos:   { label: "Fotos", emoji: "📷" },
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
        className="absolute right-0 top-full mt-2 z-50 rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
        style={{
          background: "#161618",
          width: isMobile ? "220px" : "240px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-2 flex items-center justify-between border-b border-white/[0.06]">
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.25em]">Ordenar secciones</span>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-white/40" />
          </button>
        </div>

        {/* List */}
        <div className="px-3 py-3 space-y-1.5">
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
                className="flex items-center gap-2 rounded-xl transition-all select-none"
                style={{
                  background: isDragTarget ? "rgba(255,255,255,0.08)" : isDraggingThis ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.03)",
                  opacity: isDraggingThis ? 0.5 : 1,
                  padding: "10px 10px",
                  cursor: "grab",
                  border: isDragTarget ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent",
                }}
              >
                {/* Grip dots */}
                <div className="flex flex-col gap-[3px] flex-shrink-0 opacity-25">
                  {[0,1,2].map(r => (
                    <div key={r} className="flex gap-[3px]">
                      <div className="w-[3px] h-[3px] rounded-full bg-white" />
                      <div className="w-[3px] h-[3px] rounded-full bg-white" />
                    </div>
                  ))}
                </div>

                <span className="text-base leading-none">{meta?.emoji}</span>
                <span className="flex-1 text-xs font-medium text-white/70" style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>
                  {meta?.label}
                </span>

                {/* Up / Down buttons — large touch targets */}
                <div className="flex flex-col gap-0.5 flex-shrink-0">
                  <button
                    onClick={() => moveUp(idx)}
                    disabled={idx === 0}
                    className="w-8 h-7 flex items-center justify-center rounded-lg transition-all active:scale-95"
                    style={{
                      background: idx === 0 ? "transparent" : "rgba(255,255,255,0.06)",
                      opacity: idx === 0 ? 0.2 : 1,
                      cursor: idx === 0 ? "default" : "pointer",
                    }}
                  >
                    <ChevronUp className="w-3.5 h-3.5 text-white/70" />
                  </button>
                  <button
                    onClick={() => moveDown(idx)}
                    disabled={idx === items.length - 1}
                    className="w-8 h-7 flex items-center justify-center rounded-lg transition-all active:scale-95"
                    style={{
                      background: idx === items.length - 1 ? "transparent" : "rgba(255,255,255,0.06)",
                      opacity: idx === items.length - 1 ? 0.2 : 1,
                      cursor: idx === items.length - 1 ? "default" : "pointer",
                    }}
                  >
                    <ChevronDown className="w-3.5 h-3.5 text-white/70" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-3 pb-3">
          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all active:scale-95"
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "white",
              padding: "11px 16px",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
          >
            <Check className="w-3.5 h-3.5" />
            Guardar orden
          </button>
        </div>
      </motion.div>
    </>
  );
}